"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { apiGet, apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Calendar,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Role } from "@/shared";

interface FinanceSummary {
  totalRevenue: number;
  totalCost: number;
  fixedCosts: number;
  variableCosts: number;
  grossProfit: number;
  grossMargin: number;
}

interface CostBreakdown {
  category: {
    id: string;
    name: string;
    type: string;
  };
  amount: number;
}

interface DoctorRevenue {
  doctor: {
    id: string;
    name: string;
  };
  revenue: number;
  transactionCount: number;
}

interface MonthlyMargin {
  month: number;
  year: number;
  revenue: number;
  cost: number;
  profit: number;
  margin: number;
}

interface CostCategory {
  id: string;
  name: string;
  type: string;
}

export default function FinancePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [breakdown, setBreakdown] = useState<CostBreakdown[]>([]);
  const [doctorRevenue, setDoctorRevenue] = useState<DoctorRevenue[]>([]);
  const [monthlyMargin, setMonthlyMargin] = useState<MonthlyMargin[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CostCategory[]>([]);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [costForm, setCostForm] = useState({
    categoryId: "__none__",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [revenueForm, setRevenueForm] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    doctorId: "__none__",
  });

  const fetchData = async () => {
    try {
      const [summaryRes, breakdownRes, doctorRes, marginRes, catsRes] =
        await Promise.all([
          apiGet<FinanceSummary>("/finance/reports/summary"),
          apiGet<CostBreakdown[]>("/finance/reports/breakdown"),
          apiGet<DoctorRevenue[]>("/finance/reports/by-doctor"),
          apiGet<MonthlyMargin[]>("/finance/reports/margin"),
          apiGet<CostCategory[]>("/finance/categories"),
        ]);
      setSummary(summaryRes);
      setBreakdown(breakdownRes || []);
      setDoctorRevenue(doctorRes || []);
      setMonthlyMargin(marginRes || []);
      setCategories(catsRes || []);
    } catch (error) {
      console.error("Failed to load finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCost = async () => {
    if (
      !costForm.categoryId ||
      costForm.categoryId === "__none__" ||
      !costForm.amount
    ) {
      toast({ title: "請填寫必填欄位", variant: "destructive" });
      return;
    }
    try {
      await apiPost("/finance/costs", {
        ...costForm,
        amount: parseFloat(costForm.amount),
      });
      toast({ title: "成本新增成功" });
      setShowCostModal(false);
      setCostForm({
        categoryId: "__none__",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      fetchData();
    } catch (error) {
      toast({ title: "新增失敗", variant: "destructive" });
    }
  };

  const handleAddRevenue = async () => {
    if (!revenueForm.amount) {
      toast({ title: "請填寫必填欄位", variant: "destructive" });
      return;
    }
    try {
      await apiPost("/finance/revenues", {
        ...revenueForm,
        amount: parseFloat(revenueForm.amount),
        doctorId:
          revenueForm.doctorId !== "__none__"
            ? revenueForm.doctorId
            : undefined,
      });
      toast({ title: "收入新增成功" });
      setShowRevenueModal(false);
      setRevenueForm({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        doctorId: "__none__",
      });
      fetchData();
    } catch (error) {
      toast({ title: "新增失敗", variant: "destructive" });
    }
  };

  const userRole = session?.user?.role;
  if (userRole !== Role.SUPERVISOR && userRole !== Role.ADMIN) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">您沒有權限存取此頁面</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const monthNames = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ];

  const canManage = userRole === Role.ADMIN;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={TrendingUp}
        title="成本分析"
        subtitle="營運成本與收入分析"
        iconColor="text-green-700"
        iconBg="bg-green-100"
        actions={
          canManage ? (
            <>
              <Button
                variant="outline"
                onClick={() => setShowRevenueModal(true)}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                新增收入
              </Button>
              <Button
                className="btn-lift"
                onClick={() => setShowCostModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                新增成本
              </Button>
            </>
          ) : undefined
        }
      />

      <Dialog open={showCostModal} onOpenChange={setShowCostModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增成本</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>成本類別 *</Label>
              <Select
                value={costForm.categoryId}
                onValueChange={(v) =>
                  setCostForm({ ...costForm, categoryId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="請選擇類別" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">請選擇類別</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} ({cat.type === "FIXED" ? "固定" : "變動"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>金額 *</Label>
              <Input
                type="number"
                value={costForm.amount}
                onChange={(e) =>
                  setCostForm({ ...costForm, amount: e.target.value })
                }
                placeholder="例：10000"
              />
            </div>
            <div>
              <Label>日期</Label>
              <Input
                type="date"
                value={costForm.date}
                onChange={(e) =>
                  setCostForm({ ...costForm, date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>說明</Label>
              <Input
                value={costForm.description}
                onChange={(e) =>
                  setCostForm({ ...costForm, description: e.target.value })
                }
                placeholder="成本說明（選填）"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCostModal(false)}>
              取消
            </Button>
            <Button onClick={handleAddCost}>新增</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showRevenueModal} onOpenChange={setShowRevenueModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增收入</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>金額 *</Label>
              <Input
                type="number"
                value={revenueForm.amount}
                onChange={(e) =>
                  setRevenueForm({ ...revenueForm, amount: e.target.value })
                }
                placeholder="例：50000"
              />
            </div>
            <div>
              <Label>日期</Label>
              <Input
                type="date"
                value={revenueForm.date}
                onChange={(e) =>
                  setRevenueForm({ ...revenueForm, date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>關聯醫師</Label>
              <Select
                value={revenueForm.doctorId}
                onValueChange={(v) =>
                  setRevenueForm({ ...revenueForm, doctorId: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="無（選填）" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">無（選填）</SelectItem>
                  {doctorRevenue.map((dr) => (
                    <SelectItem key={dr.doctor.id} value={dr.doctor.id}>
                      {dr.doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>說明</Label>
              <Input
                value={revenueForm.description}
                onChange={(e) =>
                  setRevenueForm({
                    ...revenueForm,
                    description: e.target.value,
                  })
                }
                placeholder="收入說明（選填）"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRevenueModal(false)}
            >
              取消
            </Button>
            <Button onClick={handleAddRevenue}>新增</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-muted-foreground">
                      總收入
                    </span>
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    {formatCurrency(summary.totalRevenue)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-muted-foreground">
                      總成本
                    </span>
                  </div>
                  <div className="text-2xl font-bold mt-2">
                    {formatCurrency(summary.totalCost)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-muted-foreground">毛利</span>
                  </div>
                  <div
                    className={`text-2xl font-bold mt-2 ${
                      summary.grossProfit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(summary.grossProfit)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-500" />
                    <span className="text-sm text-muted-foreground">
                      毛利率
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold mt-2 ${
                      summary.grossMargin >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {summary.grossMargin}%
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="breakdown" className="space-y-4">
            <TabsList>
              <TabsTrigger value="breakdown">成本分析</TabsTrigger>
              <TabsTrigger value="doctor">醫師業績</TabsTrigger>
              <TabsTrigger value="trend">月度趨勢</TabsTrigger>
            </TabsList>

            <TabsContent value="breakdown">
              {breakdown.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">成本類別分析</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {breakdown.map((item) => {
                        const percentage =
                          summary && summary.totalCost > 0
                            ? (item.amount / summary.totalCost) * 100
                            : 0;
                        return (
                          <div key={item.category.id}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {item.category.name}
                                </span>
                                <Badge variant="outline">
                                  {item.category.type === "FIXED"
                                    ? "固定"
                                    : "變動"}
                                </Badge>
                              </div>
                              <span className="font-semibold">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">目前沒有成本資料</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="doctor">
              {doctorRevenue.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">醫師業績排行</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {doctorRevenue.map((item, index) => (
                        <div
                          key={item.doctor.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0
                                  ? "bg-yellow-500"
                                  : index === 1
                                    ? "bg-gray-400"
                                    : index === 2
                                      ? "bg-amber-600"
                                      : "bg-gray-300"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium">
                                {item.doctor.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {item.transactionCount} 筆交易
                              </div>
                            </div>
                          </div>
                          <div className="font-semibold">
                            {formatCurrency(item.revenue)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      目前沒有醫師業績資料
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="trend">
              {monthlyMargin.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">月度財務趨勢</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {monthlyMargin.map((item) => (
                        <div
                          key={`${item.year}-${item.month}`}
                          className="p-3 rounded-lg border"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {item.year} 年 {monthNames[item.month - 1]}
                              </span>
                            </div>
                            <Badge
                              className={
                                item.profit >= 0
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              毛利率: {item.margin}%
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">收入</div>
                              <div className="font-semibold text-green-600">
                                {formatCurrency(item.revenue)}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">成本</div>
                              <div className="font-semibold text-red-600">
                                {formatCurrency(item.cost)}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">毛利</div>
                              <div
                                className={`font-semibold ${
                                  item.profit >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {formatCurrency(item.profit)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">目前沒有月度資料</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
