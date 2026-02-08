'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import { getPriorityBadgeVariant, getStatusBadgeVariant } from '@/lib/badge-variants';
import { ArrowLeft, Send, User, Clock, CheckCircle, Edit, X, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
  HandoverStatus,
  HandoverStatusLabels,
  HandoverPriority,
  HandoverPriorityLabels,
  Role,
} from '@/shared';

interface Handover {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  createdBy: { id: string; name: string; role: string };
  assignee?: { id: string; name: string } | null;
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; name: string; role: string };
  }>;
}

export default function HandoverDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [handover, setHandover] = useState<Handover | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    priority: '',
    dueDate: '',
    status: '',
  });

  const fetchHandover = async () => {
    try {
      const result = await apiGet<Handover>(`/handovers/${params.id}`);
      setHandover(result);
      setEditForm({
        title: result.title,
        content: result.content,
        priority: result.priority,
        dueDate: result.dueDate ? result.dueDate.slice(0, 16) : '',
        status: result.status,
      });
    } catch (error) {
      console.error('Failed to load handover:', error);
      toast({
        title: '載入失敗',
        description: '無法載入交班詳情',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHandover();
  }, [params.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !handover || !session?.user) return;

    const commentContent = newComment.trim();
    setNewComment('');
    setSubmitting(true);

    // 樂觀更新：立即在 UI 顯示新註記
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content: commentContent,
      createdAt: new Date().toISOString(),
      author: {
        id: session.user.id,
        name: session.user.name || '',
        role: session.user.role || '',
      },
    };

    setHandover((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        comments: [...prev.comments, optimisticComment],
      };
    });

    try {
      const newCommentData = await apiPost<{
        id: string;
        content: string;
        createdAt: string;
        author: { id: string; name: string; role: string };
      }>(`/handovers/${params.id}/comments`, {
        content: commentContent,
      });

      // 用實際數據替換樂觀更新的數據
      setHandover((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.map((c) =>
            c.id === optimisticComment.id ? newCommentData : c
          ),
        };
      });

      toast({ title: '註記已新增' });
    } catch (error) {
      // 失敗時回滾樂觀更新
      setHandover((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.filter((c) => c.id !== optimisticComment.id),
        };
      });
      setNewComment(commentContent); // 恢復輸入內容
      toast({
        title: '新增失敗',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (status: HandoverStatus) => {
    try {
      await apiPatch(`/handovers/${params.id}`, { status });
      await fetchHandover();
      toast({ title: '狀態已更新' });
    } catch (error) {
      toast({
        title: '更新失敗',
        variant: 'destructive',
      });
    }
  };

  const handleSaveEdit = async () => {
    try {
      const updateData: Record<string, unknown> = {
        title: editForm.title,
        content: editForm.content,
        priority: editForm.priority,
        status: editForm.status,
      };
      // 處理截止日期：空字串表示清除，否則傳送日期
      if (editForm.dueDate) {
        updateData.dueDate = new Date(editForm.dueDate).toISOString();
      } else {
        updateData.dueDate = null;
      }
      await apiPatch(`/handovers/${params.id}`, updateData);
      await fetchHandover();
      setIsEditing(false);
      toast({ title: '已更新' });
    } catch (error) {
      toast({
        title: '更新失敗',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm('確定要刪除此交班事項嗎？此操作無法復原。')) {
      return;
    }
    try {
      await apiDelete(`/handovers/${params.id}`);
      toast({ title: '已刪除' });
      router.push('/handover');
    } catch (error) {
      toast({
        title: '刪除失敗',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">載入中...</div>
      </div>
    );
  }

  if (!handover) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">找不到此交班事項</p>
        <Link href="/handover">
          <Button className="mt-4">返回列表</Button>
        </Link>
      </div>
    );
  }

  const canChangeStatus =
    session?.user?.id === handover.createdBy.id ||
    session?.user?.id === handover.assignee?.id ||
    session?.user?.role === Role.SUPERVISOR ||
    session?.user?.role === Role.ADMIN;

  // 允許創建者或主管/管理員編輯（包括已完成的任務，可將狀態改回）
  const canEdit =
    session?.user?.id === handover.createdBy.id ||
    session?.user?.role === Role.SUPERVISOR ||
    session?.user?.role === Role.ADMIN;

  // 只有主管或管理員可以刪除
  const canDelete =
    session?.user?.role === Role.SUPERVISOR ||
    session?.user?.role === Role.ADMIN;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/handover">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={getPriorityBadgeVariant(handover.priority)}>
              {HandoverPriorityLabels[handover.priority as HandoverPriority]}
            </Badge>
            <Badge variant={getStatusBadgeVariant(handover.status)}>
              {HandoverStatusLabels[handover.status as HandoverStatus]}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{handover.title}</h1>
        </div>
        {canEdit && !isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            編輯
          </Button>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>編輯交班事項</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>標題</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label>內容</Label>
                <textarea
                  className="w-full mt-1 p-3 border rounded-md min-h-[150px]"
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>優先級</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    value={editForm.priority}
                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                  >
                    <option value="LOW">低</option>
                    <option value="MEDIUM">中</option>
                    <option value="HIGH">高</option>
                    <option value="URGENT">緊急</option>
                  </select>
                </div>
                <div>
                  <Label>狀態</Label>
                  <select
                    className="w-full mt-1 p-2 border rounded-md"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="PENDING">待處理</option>
                    <option value="IN_PROGRESS">處理中</option>
                    <option value="BLOCKED">卡關</option>
                    <option value="COMPLETED">已完成</option>
                    <option value="CANCELLED">已取消</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>截止日期</Label>
                <Input
                  type="datetime-local"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                  取消
                </Button>
                <Button className="flex-1" onClick={handleSaveEdit}>
                  儲存
                </Button>
              </div>
              {canDelete && (
                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    刪除此任務
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{handover.content}</p>
          </div>

          <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>建立者：{handover.createdBy.name}</span>
            </div>
            {handover.assignee && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>指派給：{handover.assignee.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>建立於 {formatDateTime(handover.createdAt)}</span>
            </div>
            {handover.dueDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>截止：{formatDateTime(handover.dueDate)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Actions */}
      {canChangeStatus && handover.status !== HandoverStatus.COMPLETED && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">更新狀態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {handover.status === HandoverStatus.PENDING && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange(HandoverStatus.IN_PROGRESS)}
                >
                  開始處理
                </Button>
              )}
              <Button
                variant="default"
                onClick={() => handleStatusChange(HandoverStatus.COMPLETED)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                標記完成
              </Button>
              {session?.user?.role !== Role.STAFF && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange(HandoverStatus.CANCELLED)}
                >
                  取消
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            註記 ({handover.comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {handover.comments.length > 0 ? (
            <div className="space-y-4">
              {handover.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-lg bg-gray-50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{comment.author.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              尚無註記
            </p>
          )}

          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="flex gap-2 pt-4 border-t">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="新增註記..."
              disabled={submitting}
            />
            <Button type="submit" disabled={submitting || !newComment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
