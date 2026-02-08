'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTime } from '@/lib/utils';
import {
  ArrowLeft,
  ShoppingCart,
  User,
  Clock,
  CheckCircle,
  XCircle,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import { Role } from '@/shared';

interface PurchaseRequestItem {
  id: string;
  description?: string;
  quantity: number;
  unit: string;
  estimatedPrice?: number;
  inventoryItem?: {
    id: string;
    name: string;
  };
}

interface PurchaseRequest {
  id: string;
  requestNo: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  totalAmount: number;
  dueDate?: string;
  notes?: string;
  rejectReason?: string;
  createdAt: string;
  approvedAt?: string;
  requester: {
    id: string;
    name: string;
    email: string;
  };
  approver?: {
    id: string;
    name: string;
  };
  items: PurchaseRequestItem[];
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  ORDERED: 'bg-blue-100 text-blue-800',
};

const statusLabels: Record<string, string> = {
  PENDING: '待審核',
  APPROVED: '已核准',
  REJECTED: '已駁回',
  ORDERED: '已下單',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const priorityLabels: Record<string, string> = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  URGENT: '緊急',
};

export default function PurchaseRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [request, setRequest] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const fetchRequest = async () => {
    try {
      const result = await apiGet<PurchaseRequest>(`/procurement/requests/${params.id}`);
      setRequest(result);
    } catch (error) {
      console.error('Failed to load request:', error);
      toast({
        title: '載入失敗',
        description: '無法載入採購申請詳情',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const handleApprove = async () => {
    try {
      await apiPost(`/procurement/requests/${params.id}/approve`, { approved: 'true' });
      toast({ title: '採購申請已核准' });
      fetchRequest();
    } catch (error) {
      toast({ title: '核准失敗', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast({ title: '請填寫駁回原因', variant: 'destructive' });
      return;
    }
    try {
      await apiPost(`/procurement/requests/${params.id}/approve`, {
        approved: 'false',
        rejectReason,
      });
      toast({ title: '採購申請已駁回' });
      setShowRejectForm(false);
      fetchRequest();
    } catch (error) {
      toast({ title: '駁回失敗', variant: 'destructive' });
    }
  };

  const userRole = session?.user?.role;
  const canApprove = (userRole === Role.SUPERVISOR || userRole === Role.ADMIN) &&
    request?.status === 'PENDING';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">載入中...</div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">找不到此採購申請</p>
        <Link href="/procurement">
          <Button className="mt-4">返回列表</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/procurement">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">{request.requestNo}</span>
            <Badge className={statusColors[request.status]}>
              {statusLabels[request.status]}
            </Badge>
            <Badge className={priorityColors[request.priority]}>
              {priorityLabels[request.priority]}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
        </div>
      </div>

      {/* Request Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            申請資訊
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm">
            {request.description && (
              <div>
                <span className="text-muted-foreground">說明：</span>
                <p className="mt-1">{request.description}</p>
              </div>
            )}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>申請人：{request.requester.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>申請時間：{formatDateTime(request.createdAt)}</span>
            </div>
            {request.dueDate && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>需求日期：{formatDateTime(request.dueDate)}</span>
              </div>
            )}
            {request.approver && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>審核人：{request.approver.name}</span>
              </div>
            )}
            {request.approvedAt && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>審核時間：{formatDateTime(request.approvedAt)}</span>
              </div>
            )}
            {request.rejectReason && (
              <div className="p-3 bg-red-50 rounded-md">
                <span className="text-red-700 font-medium">駁回原因：</span>
                <p className="text-red-600 mt-1">{request.rejectReason}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Package className="h-4 w-4" />
            申請品項
          </CardTitle>
        </CardHeader>
        <CardContent>
          {request.items.length > 0 ? (
            <div className="space-y-3">
              {request.items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">
                      {item.inventoryItem?.name || item.description || `品項 ${index + 1}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {item.quantity} {item.unit}
                    </div>
                    {item.estimatedPrice && (
                      <div className="text-sm text-muted-foreground">
                        預估單價：${item.estimatedPrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t font-medium">
                <span>總金額</span>
                <span>${request.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">無品項資料</p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {request.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">備註</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{request.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Approval Actions */}
      {canApprove && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">審核作業</CardTitle>
          </CardHeader>
          <CardContent>
            {!showRejectForm ? (
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleApprove}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  核准
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRejectForm(true)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  駁回
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label>駁回原因</Label>
                  <Input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="請填寫駁回原因"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleReject}>
                    確認駁回
                  </Button>
                  <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                    取消
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
