'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, MessageSquare, Plus, BarChart3 } from 'lucide-react';

interface Incident {
  id: string;
  incidentNo: string;
  title: string;
  severity: string;
  status: string;
  occurredAt: string;
  type: {
    name: string;
    category: string;
  };
  reportedBy: {
    name: string;
  };
}

interface Complaint {
  id: string;
  subject: string;
  source: string;
  status: string;
  receivedAt: string;
}

interface QualityStats {
  totalIncidents: number;
  openIncidents: number;
  monthlyIncidents: number;
  pendingComplaints: number;
}

const severityColors: Record<string, string> = {
  MINOR: 'bg-gray-100 text-gray-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  MAJOR: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const severityLabels: Record<string, string> = {
  MINOR: '輕微',
  MODERATE: '中度',
  MAJOR: '重大',
  CRITICAL: '嚴重',
};

const statusColors: Record<string, string> = {
  REPORTED: 'bg-yellow-100 text-yellow-800',
  INVESTIGATING: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const statusLabels: Record<string, string> = {
  REPORTED: '已回報',
  INVESTIGATING: '調查中',
  RESOLVED: '已解決',
  CLOSED: '已結案',
};

const complaintStatusColors: Record<string, string> = {
  NEW: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const complaintStatusLabels: Record<string, string> = {
  NEW: '新案件',
  PROCESSING: '處理中',
  RESOLVED: '已解決',
  CLOSED: '已結案',
};

export default function QualityPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<QualityStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incidentsRes, complaintsRes, statsRes] = await Promise.all([
          apiGet<{ data: Incident[] }>('/quality/incidents'),
          apiGet<{ data: Complaint[] }>('/quality/complaints'),
          apiGet<QualityStats>('/quality/stats'),
        ]);
        setIncidents(incidentsRes.data || []);
        setComplaints(complaintsRes.data || []);
        setStats(statsRes);
      } catch (error) {
        console.error('Failed to load quality data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openIncidents = incidents.filter(
    (i) => i.status === 'REPORTED' || i.status === 'INVESTIGATING'
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">醫療品質</h1>
          <p className="text-muted-foreground">異常事件回報與投訴管理</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          回報事件
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">本月事件</span>
              </div>
              <div className="text-2xl font-bold mt-2">{stats.monthlyIncidents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-muted-foreground">未結案事件</span>
              </div>
              <div className="text-2xl font-bold mt-2">{stats.openIncidents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">待處理投訴</span>
              </div>
              <div className="text-2xl font-bold mt-2">{stats.pendingComplaints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">累計事件</span>
              </div>
              <div className="text-2xl font-bold mt-2">{stats.totalIncidents}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">異常事件</TabsTrigger>
          <TabsTrigger value="complaints">投訴紀錄</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">載入中...</div>
            </div>
          ) : incidents.length > 0 ? (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <Card key={incident.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{incident.incidentNo}</span>
                          <Badge className={severityColors[incident.severity]}>
                            {severityLabels[incident.severity]}
                          </Badge>
                          <Badge className={statusColors[incident.status]}>
                            {statusLabels[incident.status]}
                          </Badge>
                        </div>
                        <div className="text-sm mt-1">{incident.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {incident.type.category} · {incident.type.name}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          回報人: {incident.reportedBy.name} ·{' '}
                          {new Date(incident.occurredAt).toLocaleDateString('zh-TW')}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        檢視
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">目前沒有異常事件紀錄</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="complaints">
          {complaints.length > 0 ? (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <Card key={complaint.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium">{complaint.subject}</span>
                          <Badge className={complaintStatusColors[complaint.status]}>
                            {complaintStatusLabels[complaint.status]}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          來源: {complaint.source} ·{' '}
                          {new Date(complaint.receivedAt).toLocaleDateString('zh-TW')}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        檢視
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">目前沒有投訴紀錄</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
