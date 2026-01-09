'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import { ArrowLeft, Send, User, Clock, CheckCircle } from 'lucide-react';
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

  const fetchHandover = async () => {
    try {
      const result = await apiGet<Handover>(`/handovers/${params.id}`);
      setHandover(result);
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
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await apiPost(`/handovers/${params.id}/comments`, {
        content: newComment,
      });
      setNewComment('');
      await fetchHandover();
      toast({ title: '註記已新增' });
    } catch (error) {
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

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'danger';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'default';
      case 'CANCELLED':
        return 'secondary';
      default:
        return 'outline';
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
      </div>

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
