'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, User, MessageSquare } from 'lucide-react';
import { ListSkeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/error-boundary';
import { Pagination } from '@/components/pagination';
import { getPriorityBadgeVariant } from '@/lib/badge-variants';
import {
  HandoverPriority,
  HandoverPriorityLabels,
} from '@/shared';

interface ArchivedHandover {
  id: string;
  originalId: string;
  title: string;
  content: string;
  priority: string;
  createdByName: string;
  assigneeName: string | null;
  createdAt: string;
  completedAt: string | null;
  commentsCount: number;
}

interface ArchiveResponse {
  data: ArchivedHandover[];
  total: number;
  page: number;
  totalPages: number;
}

export default function ArchiveDetailPage() {
  const params = useParams();
  const archiveId = params.id as string;
  const [data, setData] = useState<ArchiveResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiGet<ArchiveResponse>(
        `/handovers/archives/${archiveId}`,
        { page, limit: 20 },
      );
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : '載入封存任務失敗';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [archiveId, page]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/handover/archives">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">封存任務詳情</h1>
          <p className="text-muted-foreground">
            共 {data?.total || 0} 個已封存任務
          </p>
        </div>
      </div>

      {loading ? (
        <ListSkeleton items={5} />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchData} title="載入失敗" />
      ) : data?.data && data.data.length > 0 ? (
        <div className="space-y-4">
          {data.data.map((item) => (
            <Card
              key={item.id}
              className="bg-gray-100 opacity-70"
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={getPriorityBadgeVariant(item.priority)}
                        className="opacity-60"
                      >
                        {HandoverPriorityLabels[item.priority as HandoverPriority]}
                      </Badge>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        已完成
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-600 line-through">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mt-1">
                      {item.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        建立者：{item.createdByName}
                      </span>
                      {item.assigneeName && (
                        <span>指派給：{item.assigneeName}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        完成於 {item.completedAt ? formatDate(item.completedAt) : '-'}
                      </span>
                      {item.commentsCount > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {item.commentsCount} 則註記
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Pagination
            pagination={{
              page: data.page,
              limit: 20,
              total: data.total,
              totalPages: data.totalPages,
            }}
            onPageChange={setPage}
          />
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">此封存記錄中沒有任務</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
