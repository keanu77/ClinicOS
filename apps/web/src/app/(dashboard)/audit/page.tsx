'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiGet } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/lib/utils';
import { History, User, FileText } from 'lucide-react';
import { Role } from '@/shared';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface AuditListResponse {
  data: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}

const actionLabels: Record<string, string> = {
  CREATE: '建立',
  UPDATE: '更新',
  DELETE: '刪除',
  STATUS_CHANGE: '狀態變更',
  LOGIN: '登入',
  LOGOUT: '登出',
};

const entityLabels: Record<string, string> = {
  HANDOVER: '交班',
  INVENTORY: '庫存',
  SHIFT: '排班',
  USER: '使用者',
  NOTIFICATION: '通知',
};

export default function AuditPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<AuditListResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const result = await apiGet<AuditListResponse>('/audit/logs', {
          limit: 50,
        });
        setData(result);
      } catch (error) {
        console.error('Failed to load audit logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'success';
      case 'DELETE':
        return 'danger';
      case 'UPDATE':
      case 'STATUS_CHANGE':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  if (session?.user?.role !== Role.ADMIN) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">您沒有權限存取此頁面</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">稽核紀錄</h1>
        <p className="text-muted-foreground">檢視系統操作紀錄</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">載入中...</div>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {data.data.map((log) => (
                <div key={log.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mt-1">
                        <History className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {actionLabels[log.action] || log.action}
                          </Badge>
                          <Badge variant="outline">
                            {entityLabels[log.entityType] || log.entityType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{log.user.name}</span>
                          <span className="text-muted-foreground">
                            {log.user.email}
                          </span>
                        </div>
                        {log.details && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1">
                            <FileText className="h-3 w-3 mt-0.5" />
                            <span>{log.details}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatRelativeTime(log.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">目前沒有稽核紀錄</p>
          </CardContent>
        </Card>
      )}

      {data && data.total > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          顯示 {data.data.length} 筆，共 {data.total} 筆
        </div>
      )}
    </div>
  );
}
