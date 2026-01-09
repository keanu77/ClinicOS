export enum NotificationType {
  HANDOVER_ASSIGNED = 'HANDOVER_ASSIGNED',
  HANDOVER_COMMENTED = 'HANDOVER_COMMENTED',
  HANDOVER_STATUS_CHANGED = 'HANDOVER_STATUS_CHANGED',
  INVENTORY_LOW_STOCK = 'INVENTORY_LOW_STOCK',
  SHIFT_ASSIGNED = 'SHIFT_ASSIGNED',
  SHIFT_CHANGED = 'SHIFT_CHANGED',
  SYSTEM = 'SYSTEM',
}

export const NotificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.HANDOVER_ASSIGNED]: '交班指派',
  [NotificationType.HANDOVER_COMMENTED]: '交班註記',
  [NotificationType.HANDOVER_STATUS_CHANGED]: '交班狀態變更',
  [NotificationType.INVENTORY_LOW_STOCK]: '低庫存警示',
  [NotificationType.SHIFT_ASSIGNED]: '班表指派',
  [NotificationType.SHIFT_CHANGED]: '班表變更',
  [NotificationType.SYSTEM]: '系統通知',
};

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
  userId: string;
  createdAt: Date;
}

export interface NotificationQueryDto {
  isRead?: boolean;
  type?: NotificationType;
  page?: number;
  limit?: number;
}

export interface NotificationListResponse {
  data: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}
