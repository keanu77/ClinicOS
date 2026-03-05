"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/empty-state";
import { Plus, Search, Download, AlertTriangle, Package } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Role, InventoryCategory, InventoryCategoryLabels } from "@/shared";
import { CardSkeleton } from "@/components/ui/skeleton";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  minStock: number;
  location?: string;
}

interface InventoryListResponse {
  data: InventoryItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function InventoryListPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<InventoryListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("__all__");
  const [showLowStock, setShowLowStock] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | boolean> = {};
        if (search) params.search = search;
        if (categoryFilter && categoryFilter !== "__all__")
          params.category = categoryFilter;
        if (showLowStock) params.lowStock = true;

        const result = await apiGet<InventoryListResponse>(
          "/inventory/items",
          params,
        );
        setData(result);
      } catch (error) {
        console.error("Failed to load inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchData, 300);
    return () => clearTimeout(debounce);
  }, [search, categoryFilter, showLowStock]);

  const handleExport = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/api/inventory/export.csv`,
      "_blank",
    );
  };

  const isAdmin = session?.user?.role === Role.ADMIN;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Package}
        title="庫存管理"
        subtitle="管理藥品與物資庫存"
        iconColor="text-orange-600"
        iconBg="bg-orange-100"
        actions={
          <>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              匯出 CSV
            </Button>
            {isAdmin && (
              <Link href="/inventory/new">
                <Button className="btn-lift">
                  <Plus className="h-4 w-4 mr-2" />
                  新增品項
                </Button>
              </Link>
            )}
          </>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="搜尋品項名稱..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="全部分類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">全部分類</SelectItem>
                {Object.values(InventoryCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {InventoryCategoryLabels[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              低庫存
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.data.map((item) => {
            const isLowStock = item.quantity <= item.minStock;
            return (
              <Link key={item.id} href={`/inventory/${item.id}`}>
                <Card
                  className={`hover:bg-gray-50 transition-colors cursor-pointer ${
                    isLowStock ? "border-orange-300" : ""
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <Badge variant="outline" className="text-xs">
                          {InventoryCategoryLabels[
                            item.category as InventoryCategory
                          ] || "其他"}
                        </Badge>
                      </div>
                      {isLowStock && (
                        <Badge variant="warning">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          低庫存
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span
                        className={`text-2xl font-bold ${
                          isLowStock ? "text-orange-600" : ""
                        }`}
                      >
                        {item.quantity}
                      </span>
                      <span className="text-muted-foreground">{item.unit}</span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      最低存量：{item.minStock} {item.unit}
                    </div>
                    {item.location && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        位置：{item.location}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title={
            search || categoryFilter !== "__all__" || showLowStock
              ? "沒有符合條件的品項"
              : "目前沒有庫存品項"
          }
          action={
            isAdmin &&
            !search &&
            categoryFilter === "__all__" &&
            !showLowStock ? (
              <Link href="/inventory/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  新增第一個品項
                </Button>
              </Link>
            ) : undefined
          }
        />
      )}

      {data && data.total > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          顯示 {data.data.length} 筆，共 {data.total} 筆
        </div>
      )}
    </div>
  );
}
