'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiGet } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRelativeTime } from '@/lib/utils';
import { getPriorityBadgeVariant, getStatusBadgeVariant } from '@/lib/badge-variants';
import { Plus, Filter, MessageSquare, Archive, List, Calendar, CalendarDays, Clock } from 'lucide-react';
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
  dueDate?: string | null;
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

type ViewMode = 'list' | 'week' | 'month';

// 輔助函數：獲取週的開始和結束日期
function getWeekDates(date: Date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.push(d);
  }
  return weekDays;
}

// 輔助函數：獲取月份的所有日期
function getMonthDates(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dates: (Date | null)[] = [];

  // 填充月初空白
  const startDayOfWeek = firstDay.getDay() || 7;
  for (let i = 1; i < startDayOfWeek; i++) {
    dates.push(null);
  }

  // 填充日期
  for (let d = 1; d <= lastDay.getDate(); d++) {
    dates.push(new Date(year, month, d));
  }

  return dates;
}

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export default function HandoverListPage() {
  const searchParams = useSearchParams();
  const [allData, setAllData] = useState<Handover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const { hasPermission } = usePermissions();
  const canViewArchives = hasPermission(Permission.HANDOVER_DELETE);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = { limit: 500 };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;

      const result = await apiGet<HandoverListResponse>('/handovers', params);
      setAllData(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '載入交班資料失敗';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter]);

  // 排序：已完成的放最下方
  const sortedData = useMemo(() => {
    return [...allData].sort((a, b) => {
      const aCompleted = a.status === HandoverStatus.COMPLETED || a.status === HandoverStatus.CANCELLED;
      const bCompleted = b.status === HandoverStatus.COMPLETED || b.status === HandoverStatus.CANCELLED;

      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;

      // 未完成的按優先度和日期排序
      const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 2;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [allData]);

  // 按截止日期分組
  const handoversByDueDate = useMemo(() => {
    const map = new Map<string, Handover[]>();
    allData.forEach((h) => {
      if (h.dueDate) {
        const dateKey = new Date(h.dueDate).toISOString().split('T')[0];
        if (!map.has(dateKey)) map.set(dateKey, []);
        map.get(dateKey)!.push(h);
      }
    });
    return map;
  }, [allData]);

  const weekDates = useMemo(() => getWeekDates(new Date(currentDate)), [currentDate]);
  const monthDates = useMemo(() => {
    return getMonthDates(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];
  const isToday = (date: Date) => formatDateKey(date) === formatDateKey(new Date());

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderHandoverCard = (handover: Handover, compact = false) => {
    const isCompleted = handover.status === HandoverStatus.COMPLETED;
    const isCancelled = handover.status === HandoverStatus.CANCELLED;
    const isBlocked = handover.status === HandoverStatus.BLOCKED;
    const isDimmed = isCompleted || isCancelled;

    return (
      <Link key={handover.id} href={`/handover/${handover.id}`}>
        <Card className={`transition-colors cursor-pointer mb-2 ${
          isDimmed
            ? 'bg-gray-100 opacity-60 hover:opacity-80'
            : isBlocked
            ? 'border-red-200 bg-red-50 hover:bg-red-100'
            : 'hover:bg-gray-50'
        }`}>
          <CardContent className={compact ? 'py-2 px-3' : 'py-4'}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-1 flex-wrap">
                  <Badge
                    variant={getPriorityBadgeVariant(handover.priority)}
                    className={`text-xs ${isDimmed ? 'opacity-50' : ''}`}
                  >
                    {HandoverPriorityLabels[handover.priority as HandoverPriority]}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(handover.status)} className="text-xs">
                    {HandoverStatusLabels[handover.status as HandoverStatus]}
                  </Badge>
                </div>
                <h3 className={`font-semibold ${compact ? 'text-sm' : 'text-lg'} truncate ${
                  isDimmed ? 'text-gray-500 line-through' : ''
                }`}>
                  {handover.title}
                </h3>
                {!compact && (
                  <>
                    <p className={`text-sm line-clamp-2 mt-1 ${
                      isDimmed ? 'text-gray-400' : 'text-muted-foreground'
                    }`}>
                      {handover.content}
                    </p>
                    <div className={`flex items-center gap-4 mt-3 text-sm ${
                      isDimmed ? 'text-gray-400' : 'text-muted-foreground'
                    }`}>
                      <span>建立者：{handover.createdBy.name}</span>
                      {handover.assignee && (
                        <span>指派給：{handover.assignee.name}</span>
                      )}
                      {handover.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          截止：{new Date(handover.dueDate).toLocaleDateString('zh-TW')}
                        </span>
                      )}
                      <span>{formatRelativeTime(handover.createdAt)}</span>
                      {handover._count.comments > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {handover._count.comments}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  const renderListView = () => (
    <div className="space-y-2">
      {sortedData.map((handover) => renderHandoverCard(handover))}
    </div>
  );

  const renderWeekView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
          上一週
        </Button>
        <span className="font-medium">
          {weekDates[0].toLocaleDateString('zh-TW')} - {weekDates[6].toLocaleDateString('zh-TW')}
        </span>
        <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
          下一週
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((day, i) => (
          <div key={day} className="text-center">
            <div className="text-sm font-medium text-muted-foreground mb-1">{day}</div>
            <div className={`p-2 rounded-lg min-h-[150px] ${
              isToday(weekDates[i]) ? 'bg-primary/10 border-2 border-primary' : 'bg-gray-50'
            }`}>
              <div className={`text-sm mb-2 ${isToday(weekDates[i]) ? 'font-bold text-primary' : ''}`}>
                {weekDates[i].getDate()}
              </div>
              <div className="space-y-1">
                {(handoversByDueDate.get(formatDateKey(weekDates[i])) || []).map((h) => (
                  <Link key={h.id} href={`/handover/${h.id}`}>
                    <div className={`text-xs p-1 rounded truncate cursor-pointer ${
                      h.status === HandoverStatus.COMPLETED
                        ? 'bg-gray-200 text-gray-500 line-through'
                        : h.status === HandoverStatus.BLOCKED
                        ? 'bg-red-200 text-red-800'
                        : h.priority === 'URGENT'
                        ? 'bg-red-100 text-red-800'
                        : h.priority === 'HIGH'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {h.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMonthView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
          上個月
        </Button>
        <span className="font-medium text-lg">
          {currentDate.getFullYear()} 年 {MONTH_NAMES[currentDate.getMonth()]}
        </span>
        <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
          下個月
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
        {monthDates.map((date, i) => (
          <div
            key={i}
            className={`min-h-[100px] p-1 rounded border ${
              date && isToday(date)
                ? 'bg-primary/10 border-primary'
                : date
                ? 'bg-white border-gray-200'
                : 'bg-gray-50 border-transparent'
            }`}
          >
            {date && (
              <>
                <div className={`text-xs mb-1 ${isToday(date) ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                  {date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {(handoversByDueDate.get(formatDateKey(date)) || []).slice(0, 3).map((h) => (
                    <Link key={h.id} href={`/handover/${h.id}`}>
                      <div className={`text-xs p-0.5 rounded truncate cursor-pointer ${
                        h.status === HandoverStatus.COMPLETED
                          ? 'bg-gray-200 text-gray-500'
                          : h.status === HandoverStatus.BLOCKED
                          ? 'bg-red-200 text-red-800'
                          : h.priority === 'URGENT'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {h.title}
                      </div>
                    </Link>
                  ))}
                  {(handoversByDueDate.get(formatDateKey(date)) || []).length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{(handoversByDueDate.get(formatDateKey(date)) || []).length - 3} 更多
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

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

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
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

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-1"
              >
                <List className="h-4 w-4" />
                列表
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
                className="gap-1"
              >
                <CalendarDays className="h-4 w-4" />
                週
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
                className="gap-1"
              >
                <Calendar className="h-4 w-4" />
                月
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {loading ? (
        <ListSkeleton items={5} />
      ) : error ? (
        <ErrorState error={error} onRetry={fetchData} title="載入失敗" />
      ) : allData.length > 0 ? (
        <>
          {viewMode === 'list' && renderListView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </>
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
