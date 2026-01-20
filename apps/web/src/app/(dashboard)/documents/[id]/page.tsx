'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTime } from '@/lib/utils';
import {
  ArrowLeft,
  FileText,
  Edit,
  CheckCircle,
  User,
  Clock,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import { Role } from '@/shared';

interface Document {
  id: string;
  docNo: string;
  title: string;
  content: string;
  status: string;
  version: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
}

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  ARCHIVED: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  DRAFT: '草稿',
  PENDING_REVIEW: '待審核',
  PUBLISHED: '已發布',
  ARCHIVED: '已封存',
};

export default function DocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
  });

  const fetchDocument = async () => {
    try {
      const result = await apiGet<Document>(`/documents/${params.id}`);
      setDocument(result);
      setEditForm({
        title: result.title,
        content: result.content || '',
      });
    } catch (error) {
      console.error('Failed to load document:', error);
      toast({
        title: '載入失敗',
        description: '無法載入文件詳情',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocument();
  }, [params.id]);

  const handleSave = async () => {
    try {
      await apiPatch(`/documents/${params.id}`, editForm);
      toast({ title: '更新成功' });
      setIsEditing(false);
      fetchDocument();
    } catch (error) {
      toast({ title: '更新失敗', variant: 'destructive' });
    }
  };

  const handleConfirmRead = async () => {
    try {
      await apiPost(`/documents/${params.id}/confirm-read`, {});
      toast({ title: '已確認閱讀' });
    } catch (error) {
      toast({ title: '確認失敗', variant: 'destructive' });
    }
  };

  const handlePublish = async () => {
    try {
      await apiPatch(`/documents/${params.id}`, { status: 'PUBLISHED' });
      toast({ title: '文件已發布' });
      fetchDocument();
    } catch (error) {
      toast({ title: '發布失敗', variant: 'destructive' });
    }
  };

  const userRole = session?.user?.role;
  const canEdit = userRole === Role.SUPERVISOR || userRole === Role.ADMIN;
  const canPublish = (userRole === Role.SUPERVISOR || userRole === Role.ADMIN) &&
    document?.status === 'PENDING_REVIEW';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">載入中...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">找不到此文件</p>
        <Link href="/documents">
          <Button className="mt-4">返回列表</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/documents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">{document.docNo}</span>
            <Badge className={statusColors[document.status]}>
              {statusLabels[document.status]}
            </Badge>
            <Badge variant="outline">v{document.version}</Badge>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
        </div>
        <div className="flex gap-2">
          {canPublish && (
            <Button onClick={handlePublish}>
              <Send className="h-4 w-4 mr-2" />
              發布
            </Button>
          )}
          {canEdit && !isEditing && document.status !== 'PUBLISHED' && (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              編輯
            </Button>
          )}
        </div>
      </div>

      {/* Document Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            文件內容
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
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
                  className="w-full mt-1 p-3 border rounded-md min-h-[200px]"
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>儲存</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{document.content || '（無內容）'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">文件資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm">
            {document.category && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">分類：</span>
                <span>{document.category.name}</span>
              </div>
            )}
            {document.createdBy && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>建立者：{document.createdBy.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>建立時間：{formatDateTime(document.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>更新時間：{formatDateTime(document.updatedAt)}</span>
            </div>
            {document.publishedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>發布時間：{formatDateTime(document.publishedAt)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirm Read Button */}
      {document.status === 'PUBLISHED' && (
        <Card>
          <CardContent className="py-4">
            <Button className="w-full" onClick={handleConfirmRead}>
              <CheckCircle className="h-4 w-4 mr-2" />
              確認閱讀
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
