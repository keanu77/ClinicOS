'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wrench, AlertTriangle, Calendar, Plus } from 'lucide-react';

interface Asset {
  id: string;
  assetNo: string;
  name: string;
  model?: string;
  location?: string;
  status: string;
  condition: string;
  warrantyExpiry?: string;
}

interface Maintenance {
  id: string;
  description: string;
  nextDue: string;
  asset: {
    name: string;
    assetNo: string;
  };
}

interface Fault {
  id: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
  asset: {
    name: string;
    assetNo: string;
  };
}

const statusColors: Record<string, string> = {
  IN_USE: 'bg-green-100 text-green-800',
  AVAILABLE: 'bg-blue-100 text-blue-800',
  UNDER_REPAIR: 'bg-yellow-100 text-yellow-800',
  RETIRED: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  IN_USE: '使用中',
  AVAILABLE: '可用',
  UNDER_REPAIR: '維修中',
  RETIRED: '已報廢',
};

const severityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<Maintenance[]>([]);
  const [openFaults, setOpenFaults] = useState<Fault[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assetsRes, maintenanceRes, faultsRes] = await Promise.all([
          apiGet<{ data: Asset[] }>('/assets'),
          apiGet<Maintenance[]>('/maintenance/upcoming'),
          apiGet<{ data: Fault[] }>('/faults', { status: 'OPEN' }),
        ]);
        setAssets(assetsRes.data || []);
        setUpcomingMaintenance(maintenanceRes || []);
        setOpenFaults(faultsRes.data || []);
      } catch (error) {
        console.error('Failed to load assets data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">設備管理</h1>
          <p className="text-muted-foreground">管理設備資產、保養排程與故障回報</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          回報故障
        </Button>
      </div>

      {/* Alerts */}
      {(openFaults.length > 0 || upcomingMaintenance.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {openFaults.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">
                    {openFaults.length} 個待處理故障
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
          {upcomingMaintenance.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">
                    {upcomingMaintenance.length} 項即將到期保養
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">設備清單</TabsTrigger>
          <TabsTrigger value="maintenance">保養排程</TabsTrigger>
          <TabsTrigger value="faults">故障回報</TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">載入中...</div>
            </div>
          ) : assets.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => (
                <Card key={asset.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-muted-foreground" />
                        <span className="font-semibold">{asset.name}</span>
                      </div>
                      <Badge className={statusColors[asset.status]}>
                        {statusLabels[asset.status]}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>編號: {asset.assetNo}</div>
                      {asset.model && <div>型號: {asset.model}</div>}
                      {asset.location && <div>位置: {asset.location}</div>}
                      {asset.warrantyExpiry && (
                        <div>
                          保固到期:{' '}
                          {new Date(asset.warrantyExpiry).toLocaleDateString('zh-TW')}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">目前沒有設備資料</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="maintenance">
          {upcomingMaintenance.length > 0 ? (
            <div className="space-y-4">
              {upcomingMaintenance.map((m) => (
                <Card key={m.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{m.asset.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {m.asset.assetNo} · {m.description}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">下次保養</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(m.nextDue).toLocaleDateString('zh-TW')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">沒有即將到期的保養項目</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="faults">
          {openFaults.length > 0 ? (
            <div className="space-y-4">
              {openFaults.map((fault) => (
                <Card key={fault.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{fault.asset.name}</span>
                          <Badge className={severityColors[fault.severity]}>
                            {fault.severity}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {fault.description}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(fault.createdAt).toLocaleDateString('zh-TW')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">沒有待處理的故障</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
