'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiGet } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import {
  ClipboardList,
  Package,
  Calendar,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';
import Link from 'next/link';
import {
  HandoverPriorityLabels,
  HandoverPriorityColors,
  HandoverPriority,
  ShiftTypeLabels,
  ShiftType,
} from '@/shared';

interface DashboardData {
  todayShifts: Array<{
    id: string;
    type: string;
    user: { id: string; name: string };
  }>;
  myHandovers: Array<{
    id: string;
    title: string;
    priority: string;
    createdAt: string;
  }>;
  pendingHandoversCount: number;
  lowStockCount: number;
  urgentHandovers?: Array<{
    id: string;
    title: string;
    priority: string;
    createdBy: { name: string };
  }>;
  lowStockItems?: Array<{
    id: string;
    name: string;
    quantity: number;
    minStock: number;
  }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiGet<DashboardData>('/dashboard/summary');
        setData(result);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">載入中...</div>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          歡迎回來，{session?.user?.name}
        </h1>
        <p className="text-muted-foreground">這是您的工作概覽</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待處理交班</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.pendingHandoversCount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              包含緊急與高優先度事項
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">低庫存警示</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.lowStockCount || 0}</div>
            <p className="text-xs text-muted-foreground">需要補貨的品項</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">我的待辦</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.myHandovers?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">指派給我的交班事項</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日值班</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.todayShifts?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">班次安排</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              我的待辦
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.myHandovers && data.myHandovers.length > 0 ? (
              <div className="space-y-3">
                {data.myHandovers.slice(0, 5).map((handover) => (
                  <Link
                    key={handover.id}
                    href={`/handover/${handover.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{handover.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeTime(handover.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={getPriorityBadgeVariant(handover.priority)}
                    >
                      {HandoverPriorityLabels[handover.priority as HandoverPriority]}
                    </Badge>
                  </Link>
                ))}
                <Link
                  href="/handover?assignee=me"
                  className="block text-center text-sm text-primary hover:underline"
                >
                  查看全部
                </Link>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                目前沒有待辦事項
              </p>
            )}
          </CardContent>
        </Card>

        {/* Today's Shifts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              今日排班
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.todayShifts && data.todayShifts.length > 0 ? (
              <div className="space-y-3">
                {data.todayShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {ShiftTypeLabels[shift.type as ShiftType]}
                      </Badge>
                      <span className="font-medium">{shift.user.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                今日無排班資料
              </p>
            )}
          </CardContent>
        </Card>

        {/* Urgent Handovers (Supervisor+) */}
        {data?.urgentHandovers && data.urgentHandovers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                緊急交班事項
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.urgentHandovers.slice(0, 5).map((handover) => (
                  <Link
                    key={handover.id}
                    href={`/handover/${handover.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{handover.title}</p>
                      <p className="text-sm text-muted-foreground">
                        建立者：{handover.createdBy.name}
                      </p>
                    </div>
                    <Badge variant="danger">
                      {HandoverPriorityLabels[handover.priority as HandoverPriority]}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Low Stock Items (Supervisor+) */}
        {data?.lowStockItems && data.lowStockItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Package className="h-5 w-5" />
                低庫存警示
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.lowStockItems.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    href={`/inventory/${item.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        目前：{item.quantity} / 最低：{item.minStock}
                      </p>
                    </div>
                    <Badge variant="warning">缺貨</Badge>
                  </Link>
                ))}
                <Link
                  href="/inventory?lowStock=true"
                  className="block text-center text-sm text-primary hover:underline"
                >
                  查看全部
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
