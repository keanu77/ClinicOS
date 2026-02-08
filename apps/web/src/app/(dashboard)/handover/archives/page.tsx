'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Archive, Calendar, ChevronRight, Play } from 'lucide-react';
import { ListSkeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/error-boundary';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { Permission } from '@/shared';

interface ArchiveRecord {
  id: string;
  year: number;
  month: number;
  archivedCount: number;
  archivedAt: string;
}

const MONTH_NAMES = [
  '', '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月',
];

export default function ArchivesPage() {
  const [archives, setArchives] = useState<ArchiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(Permission.HANDOVER_DELETE);

  const fetchArchives = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<ArchiveRecord[]>('/handovers/archives');
      setArchives(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '載入封存記錄失敗';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const handleAutoArchive = async () => {
    if (!confirm('確定要封存上個月的已完成任務嗎？此操作無法復原。')) {
      return;
    }

    setArchiving(true);
    try {
      const result = await apiPost<{ archivedCount: number; message: string }>(
        '/handovers/archives/auto',
      );
      alert(result.message);
      fetchArchives();
    } catch (err) {
      const message = err instanceof Error ? err.message : '封存失敗';
      alert(message);
    } finally {
      setArchiving(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">封存任務</h1>
          <p className="text-muted-foreground">查看歷史已完成任務的月度封存</p>
        </div>
        {canManage && (
          <Button onClick={handleAutoArchive} disabled={archiving}>
            <Play className="h-4 w-4 mr-2" />
            {archiving ? '封存中...' : '封存上月任務'}
          </Button>
        )}
      </div>

      {loading ? (
        <ListSkeleton items={3} />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchArchives} title="載入失敗" />
      ) : archives.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {archives.map((archive) => (
            <Link key={archive.id} href={`/handover/archives/${archive.id}`}>
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    {archive.year} 年 {MONTH_NAMES[archive.month]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {archive.archivedCount} 個任務
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        封存於 {formatDate(archive.archivedAt)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">目前沒有封存記錄</p>
            {canManage && (
              <Button className="mt-4" onClick={handleAutoArchive}>
                <Play className="h-4 w-4 mr-2" />
                封存上月任務
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
