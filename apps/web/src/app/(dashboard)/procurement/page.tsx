'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Plus, Package, Building2 } from 'lucide-react';

interface PurchaseRequest {
  id: string;
  prNo: string;
  title: string;
  status: string;
  priority: string;
  totalAmount: number;
  createdAt: string;
  requestedBy: {
    name: string;
  };
}

interface PurchaseOrder {
  id: string;
  poNo: string;
  status: string;
  totalAmount: number;
  expectedDelivery?: string;
  vendor: {
    name: string;
  };
}

interface Vendor {
  id: string;
  name: string;
  code: string;
  contactPerson?: string;
  phone?: string;
}

const prStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  ORDERED: 'bg-blue-100 text-blue-800',
};

const prStatusLabels: Record<string, string> = {
  DRAFT: '草稿',
  PENDING: '待審核',
  APPROVED: '已核准',
  REJECTED: '已駁回',
  ORDERED: '已下單',
};

const poStatusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SENT: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  PARTIAL: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const poStatusLabels: Record<string, string> = {
  DRAFT: '草稿',
  SENT: '已送出',
  CONFIRMED: '已確認',
  PARTIAL: '部分收貨',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
};

export default function ProcurementPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, ordersRes, vendorsRes] = await Promise.all([
          apiGet<{ data: PurchaseRequest[] }>('/procurement/requests'),
          apiGet<{ data: PurchaseOrder[] }>('/procurement/orders'),
          apiGet<{ data: Vendor[] }>('/procurement/vendors'),
        ]);
        setRequests(requestsRes.data || []);
        setOrders(ordersRes.data || []);
        setVendors(vendorsRes.data || []);
      } catch (error) {
        console.error('Failed to load procurement data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">採購管理</h1>
          <p className="text-muted-foreground">管理採購申請、訂單與供應商</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          新增採購申請
        </Button>
      </div>

      {/* Pending Requests Alert */}
      {pendingRequests.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-medium">
                {pendingRequests.length} 筆採購申請待審核
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">採購申請</TabsTrigger>
          <TabsTrigger value="orders">採購訂單</TabsTrigger>
          <TabsTrigger value="vendors">供應商</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">載入中...</div>
            </div>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{request.prNo}</span>
                          <Badge className={prStatusColors[request.status]}>
                            {prStatusLabels[request.status]}
                          </Badge>
                        </div>
                        <div className="text-sm mt-1">{request.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          申請人: {request.requestedBy.name} ·{' '}
                          {new Date(request.createdAt).toLocaleDateString('zh-TW')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ${request.totalAmount.toLocaleString()}
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                          檢視
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">目前沒有採購申請</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders">
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <span className="font-semibold">{order.poNo}</span>
                          <Badge className={poStatusColors[order.status]}>
                            {poStatusLabels[order.status]}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          供應商: {order.vendor.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ${order.totalAmount.toLocaleString()}
                        </div>
                        {order.expectedDelivery && (
                          <div className="text-sm text-muted-foreground">
                            預計到貨:{' '}
                            {new Date(order.expectedDelivery).toLocaleDateString(
                              'zh-TW'
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">目前沒有採購訂單</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="vendors">
          {vendors.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vendors.map((vendor) => (
                <Card key={vendor.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <div className="font-semibold">{vendor.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {vendor.code}
                        </div>
                        {vendor.contactPerson && (
                          <div className="text-sm text-muted-foreground mt-2">
                            聯絡人: {vendor.contactPerson}
                            {vendor.phone && ` · ${vendor.phone}`}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">目前沒有供應商資料</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
