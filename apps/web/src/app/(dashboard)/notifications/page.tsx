'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { formatRelativeTime } from '@/lib/utils';
import { Bell, Check, CheckCheck, Trash2, Mail, MailOpen } from 'lucide-react';
import { NotificationTypeLabels, NotificationType } from '@clinic-os/shared';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: string;
  createdAt: string;
}

interface NotificationListResponse {
  data: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const [data, setData] = useState<NotificationListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | boolean> = { limit: 50 };
      if (filter === 'unread') params.isRead = false;

      const result = await apiGet<NotificationListResponse>(
        '/notifications',
        params
      );
      setData(result);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await apiPost(`/notifications/${id}/read`);
      await fetchNotifications();
    } catch (error) {
      toast({
        title: '操作失敗',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiPost('/notifications/read-all');
      toast({ title: '已全部標記為已讀' });
      await fetchNotifications();
    } catch (error) {
      toast({
        title: '操作失敗',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDelete(`/notifications/${id}`);
      await fetchNotifications();
    } catch (error) {
      toast({
        title: '刪除失敗',
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'HANDOVER_ASSIGNED':
      case 'HANDOVER_COMMENTED':
      case 'HANDOVER_STATUS_CHANGED':
        return 'bg-blue-100 text-blue-600';
      case 'INVENTORY_LOW_STOCK':
        return 'bg-orange-100 text-orange-600';
      case 'SHIFT_ASSIGNED':
      case 'SHIFT_CHANGED':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">通知中心</h1>
          <p className="text-muted-foreground">
            {data?.unreadCount
              ? `您有 ${data.unreadCount} 則未讀通知`
              : '所有通知都已讀取'}
          </p>
        </div>
        {data?.unreadCount ? (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            全部標為已讀
          </Button>
        ) : null}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          全部
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          未讀
          {data?.unreadCount ? (
            <Badge variant="secondary" className="ml-2">
              {data.unreadCount}
            </Badge>
          ) : null}
        </Button>
      </div>

      {/* Notification List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">載入中...</div>
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="space-y-2">
          {data.data.map((notification) => (
            <Card
              key={notification.id}
              className={notification.isRead ? 'bg-gray-50' : 'bg-white'}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-full ${getNotificationIcon(
                      notification.type
                    )}`}
                  >
                    {notification.isRead ? (
                      <MailOpen className="h-4 w-4" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{notification.title}</span>
                      {!notification.isRead && (
                        <Badge variant="default" className="text-xs">
                          新
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {NotificationTypeLabels[notification.type as NotificationType]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleMarkAsRead(notification.id)}
                        title="標為已讀"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(notification.id)}
                      title="刪除"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
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
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {filter === 'unread' ? '沒有未讀通知' : '沒有通知'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
