'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatRelativeTime } from '@/lib/utils';
import { getPriorityBadgeVariant, getStatusBadgeVariant } from '@/lib/badge-variants';
import { Plus, Search, Filter, MessageSquare, Archive } from 'lucide-react';
import { ErrorState } from '@/components/error-boundary';
import { Pagination } from '@/components/pagination';
import {
  HandoverStatus,
  HandoverStatusLabels,
  HandoverPriority,
  HandoverPriorityLabels,
  Permission,
} from '@/shared';
import { ListSkeleton } from '@/components/ui/skeleton';
import { usePermissions } from '@/lib/hooks/usePermissions';

interface Handover {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  createdAt: string;
  createdBy: { id: string; name: string };
  assignee?: { id: string; name: string } | null;
  _count: { comments: number };
}

interface HandoverListResponse {
  data: Handover[];
  total: number;
  page: number;
  totalPages: number;
}

export default function HandoverListPage() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<HandoverListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const { hasPermission } = usePermissions();
  const canViewArchives = hasPermission(Permission.HANDOVER_DELETE);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { limit: 20, page };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const result = await apiGet<HandoverListResponse>('/handovers', params);
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '載入交班資料失敗';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter, page]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">交班系統</h1>
          <p className="text-muted-foreground">管理交班事項與追蹤狀態</p>
        </div>
        <div className="flex items-center gap-2">
          {canViewArchives && (
            <Link href="/handover/archives">
              <Button variant="outline">
                <Archive className="h-4 w-4 mr-2" />
                封存記錄
              </Button>
            </Link>
          )}
          <Link href="/handover/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新增交班
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">篩選：</span>
            </div>
            <select
              className="border rounded-md px-3 py-1.5 text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">全部狀態</option>
              {Object.values(HandoverStatus).map((status) => (
                <option key={status} value={status}>
                  {HandoverStatusLabels[status]}
                </option>
              ))}
            </select>
            <select
              className="border rounded-md px-3 py-1.5 text-sm"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">全部優先度</option>
              {Object.values(HandoverPriority).map((priority) => (
                <option key={priority} value={priority}>
                  {HandoverPriorityLabels[priority]}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Handover List */}
      {loading ? (
        <ListSkeleton items={5} />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchData} title="載入失敗" />
      ) : data?.data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((handover) => {
            const isCompleted = handover.status === HandoverStatus.COMPLETED;
            return (
              <Link key={handover.id} href={`/handover/${handover.id}`}>
                <Card className={`transition-colors cursor-pointer ${
                  isCompleted
                    ? 'bg-gray-100 opacity-60 hover:opacity-80'
                    : 'hover:bg-gray-50'
                }`}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={getPriorityBadgeVariant(handover.priority)}
                            className={isCompleted ? 'opacity-50' : ''}
                          >
                            {HandoverPriorityLabels[handover.priority as HandoverPriority]}
                          </Badge>
                          <Badge variant={getStatusBadgeVariant(handover.status)}>
                            {HandoverStatusLabels[handover.status as HandoverStatus]}
                          </Badge>
                        </div>
                        <h3 className={`font-semibold text-lg truncate ${
                          isCompleted ? 'text-gray-500 line-through' : ''
                        }`}>
                          {handover.title}
                        </h3>
                        <p className={`text-sm line-clamp-2 mt-1 ${
                          isCompleted ? 'text-gray-400' : 'text-muted-foreground'
                        }`}>
                          {handover.content}
                        </p>
                        <div className={`flex items-center gap-4 mt-3 text-sm ${
                          isCompleted ? 'text-gray-400' : 'text-muted-foreground'
                        }`}>
                          <span>建立者：{handover.createdBy.name}</span>
                          {handover.assignee && (
                            <span>指派給：{handover.assignee.name}</span>
                          )}
                          <span>{formatRelativeTime(handover.createdAt)}</span>
                          {handover._count.comments > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {handover._count.comments}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}

          {/* Pagination */}
          <Pagination
            pagination={{
              page: data.page,
              limit: 20,
              total: data.total,
              totalPages: data.totalPages,
            }}
            onPageChange={handlePageChange}
          />
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">目前沒有交班事項</p>
            <Link href="/handover/new">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                新增第一個交班
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
