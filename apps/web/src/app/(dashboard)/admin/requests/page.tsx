'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { apiGet, apiPost } from '@/lib/api';
import { usePermissions } from '@/lib/hooks';
import {
  Permission,
  PermissionLabels,
  PermissionRequestStatus,
  PermissionRequestStatusLabels,
  Position,
  PositionLabels,
} from '@/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';

interface PermissionRequest {
  id: string;
  requesterId: string;
  requester: {
    id: string;
    name: string;
    email: string;
    position: string;
  };
  permission: Permission;
  reason: string;
  status: PermissionRequestStatus;
  reviewer?: {
    id: string;
    name: string;
  };
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function PermissionRequestsPage() {
  const { data: session } = useSession();
  const { hasPermission } = usePermissions();
  const [requests, setRequests] = useState<PermissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('PENDING');
  const [selectedRequest, setSelectedRequest] = useState<PermissionRequest | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { limit: 50 };
      if (activeTab !== 'ALL') {
        params.status = activeTab;
      }
      const data = await apiGet<PaginatedResponse<PermissionRequest>>(
        '/permissions/requests',
        params
      );
      setRequests(data.items);
    } catch (error) {
      console.error('Failed to fetch permission requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (request: PermissionRequest) => {
    setSelectedRequest(request);
    setReviewNote('');
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async (approved: boolean) => {
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      await apiPost(`/permissions/requests/${selectedRequest.id}/review`, {
        approved,
        reviewNote: reviewNote || undefined,
      });
      setReviewDialogOpen(false);
      fetchRequests();
    } catch (error) {
      console.error('Failed to review request:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: PermissionRequestStatus) => {
    switch (status) {
      case PermissionRequestStatus.PENDING:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />待審核</Badge>;
      case PermissionRequestStatus.APPROVED:
        return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />已核准</Badge>;
      case PermissionRequestStatus.REJECTED:
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />已駁回</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = requests.filter(
    (r) => r.status === PermissionRequestStatus.PENDING
  ).length;

  if (!hasPermission(Permission.PERMISSIONS_MANAGE)) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground">無權限存取</h2>
        <p className="text-sm text-muted-foreground mt-2">
          您沒有權限審核權限申請。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">權限申請審核</h1>
          <p className="text-muted-foreground">
            審核使用者的權限申請
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {pendingCount} 件待審核
          </Badge>
        )}
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v)}
      >
        <TabsList>
          <TabsTrigger value="PENDING">
            待審核
            {activeTab !== 'PENDING' && pendingCount > 0 && (
              <Badge variant="secondary" className="ml-2">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="APPROVED">已核准</TabsTrigger>
          <TabsTrigger value="REJECTED">已駁回</TabsTrigger>
          <TabsTrigger value="ALL">全部</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>目前沒有申請紀錄</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>申請人</TableHead>
                      <TableHead>申請權限</TableHead>
                      <TableHead>申請原因</TableHead>
                      <TableHead>申請時間</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{request.requester.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {PositionLabels[request.requester.position as Position] ||
                                request.requester.position}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {PermissionLabels[request.permission] || request.permission}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {request.permission}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {request.reason}
                        </TableCell>
                        <TableCell>
                          {format(new Date(request.createdAt), 'yyyy/MM/dd HH:mm', {
                            locale: zhTW,
                          })}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell className="text-right">
                          {request.status === PermissionRequestStatus.PENDING ? (
                            <Button
                              size="sm"
                              onClick={() => handleReview(request)}
                            >
                              審核
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReview(request)}
                            >
                              查看
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRequest?.status === PermissionRequestStatus.PENDING
                ? '審核權限申請'
                : '申請詳情'}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.requester.name} 的權限申請
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>申請人</Label>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="font-medium">{selectedRequest.requester.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedRequest.requester.email}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>申請權限</Label>
                <div className="p-3 rounded-lg bg-muted">
                  <div className="font-medium">
                    {PermissionLabels[selectedRequest.permission]}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedRequest.permission}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>申請原因</Label>
                <div className="p-3 rounded-lg bg-muted whitespace-pre-wrap">
                  {selectedRequest.reason}
                </div>
              </div>

              {selectedRequest.status === PermissionRequestStatus.PENDING ? (
                <div className="grid gap-2">
                  <Label htmlFor="reviewNote">審核備註（選填）</Label>
                  <Textarea
                    id="reviewNote"
                    value={reviewNote}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReviewNote(e.target.value)}
                    placeholder="輸入審核備註..."
                    rows={3}
                  />
                </div>
              ) : (
                <>
                  {selectedRequest.reviewer && (
                    <div className="grid gap-2">
                      <Label>審核人</Label>
                      <div className="p-3 rounded-lg bg-muted">
                        {selectedRequest.reviewer.name}
                      </div>
                    </div>
                  )}
                  {selectedRequest.reviewNote && (
                    <div className="grid gap-2">
                      <Label>審核備註</Label>
                      <div className="p-3 rounded-lg bg-muted whitespace-pre-wrap">
                        {selectedRequest.reviewNote}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedRequest?.status === PermissionRequestStatus.PENDING ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setReviewDialogOpen(false)}
                  disabled={submitting}
                >
                  取消
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleSubmitReview(false)}
                  disabled={submitting}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  駁回
                </Button>
                <Button
                  onClick={() => handleSubmitReview(true)}
                  disabled={submitting}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  核准
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                關閉
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
