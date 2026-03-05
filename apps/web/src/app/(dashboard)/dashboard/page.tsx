"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { formatRelativeTime } from "@/lib/utils";
import { getPriorityBadgeVariant } from "@/lib/badge-variants";
import {
  ClipboardList,
  Package,
  Calendar,
  AlertTriangle,
  Clock,
  User,
  Plus,
  Stethoscope,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  HandoverPriorityLabels,
  HandoverPriority,
  ShiftTypeLabels,
  ShiftType,
} from "@/shared";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";

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
        const result = await apiGet<DashboardData>("/dashboard/summary");
        setData(result);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title={`歡迎回來，${session?.user?.name}`}
        subtitle="這是您的工作概覽"
      />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 to-transparent" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">待處理交班</p>
                <p className="text-3xl font-bold mt-1">{data?.pendingHandoversCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">包含緊急與高優先度事項</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-100">
                <ClipboardList className="h-6 w-6 text-cyan-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">低庫存警示</p>
                <p className="text-3xl font-bold mt-1">{data?.lowStockCount || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">需要補貨的品項</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                <Package className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 to-transparent" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">我的待辦</p>
                <p className="text-3xl font-bold mt-1">{data?.myHandovers?.length || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">指派給我的交班事項</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
                <Clock className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">今日值班</p>
                <p className="text-3xl font-bold mt-1">{data?.todayShifts?.length || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">班次安排</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                <Calendar className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">快速操作</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/handover/new">
              <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5 hover:border-cyan-300 hover:bg-cyan-50 transition-colors">
                <Plus className="h-5 w-5 text-cyan-600" />
                <span className="text-xs">新增交班</span>
              </Button>
            </Link>
            <Link href="/clinic-schedule">
              <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5 hover:border-teal-300 hover:bg-teal-50 transition-colors">
                <Stethoscope className="h-5 w-5 text-teal-600" />
                <span className="text-xs">今日門診</span>
              </Button>
            </Link>
            <Link href="/inventory">
              <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5 hover:border-orange-300 hover:bg-orange-50 transition-colors">
                <Package className="h-5 w-5 text-orange-600" />
                <span className="text-xs">庫存盤點</span>
              </Button>
            </Link>
            <Link href="/scheduling">
              <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1.5 hover:border-violet-300 hover:bg-violet-50 transition-colors">
                <Calendar className="h-5 w-5 text-violet-600" />
                <span className="text-xs">查看排班</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-cyan-600" />
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
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{handover.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatRelativeTime(handover.createdAt)}
                      </p>
                    </div>
                    <Badge variant={getPriorityBadgeVariant(handover.priority)}>
                      {
                        HandoverPriorityLabels[
                          handover.priority as HandoverPriority
                        ]
                      }
                    </Badge>
                  </Link>
                ))}
                <Link
                  href="/handover?assignee=me"
                  className="flex items-center justify-center gap-1 text-sm text-primary hover:underline pt-1"
                >
                  查看全部
                  <ArrowRight className="h-3.5 w-3.5" />
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
              <Calendar className="h-5 w-5 text-emerald-600" />
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
              <CardTitle className="flex items-center gap-2 text-destructive">
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
                      {
                        HandoverPriorityLabels[
                          handover.priority as HandoverPriority
                        ]
                      }
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
                  className="flex items-center justify-center gap-1 text-sm text-primary hover:underline pt-1"
                >
                  查看全部
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
