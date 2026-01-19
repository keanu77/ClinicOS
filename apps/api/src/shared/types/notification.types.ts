export enum NotificationType {
  // Handover / Task
  HANDOVER_ASSIGNED = "HANDOVER_ASSIGNED",
  HANDOVER_COMMENTED = "HANDOVER_COMMENTED",
  HANDOVER_STATUS_CHANGED = "HANDOVER_STATUS_CHANGED",

  // Inventory
  INVENTORY_LOW_STOCK = "INVENTORY_LOW_STOCK",

  // Scheduling
  SHIFT_ASSIGNED = "SHIFT_ASSIGNED",
  SHIFT_CHANGED = "SHIFT_CHANGED",

  // HR
  LEAVE_REQUEST = "LEAVE_REQUEST",
  LEAVE_APPROVED = "LEAVE_APPROVED",
  CERTIFICATION_EXPIRING = "CERTIFICATION_EXPIRING",

  // Asset
  ASSET_FAULT_REPORTED = "ASSET_FAULT_REPORTED",
  MAINTENANCE_DUE = "MAINTENANCE_DUE",
  WARRANTY_EXPIRING = "WARRANTY_EXPIRING",

  // Procurement
  PR_PENDING_APPROVAL = "PR_PENDING_APPROVAL",
  PR_APPROVED = "PR_APPROVED",
  PO_RECEIVED = "PO_RECEIVED",

  // Quality
  INCIDENT_REPORTED = "INCIDENT_REPORTED",
  INCIDENT_ASSIGNED = "INCIDENT_ASSIGNED",
  COMPLAINT_RECEIVED = "COMPLAINT_RECEIVED",

  // Documents
  DOCUMENT_PUBLISHED = "DOCUMENT_PUBLISHED",
  ANNOUNCEMENT_NEW = "ANNOUNCEMENT_NEW",

  // System
  SYSTEM = "SYSTEM",
}

export const NotificationTypeLabels: Record<NotificationType, string> = {
  [NotificationType.HANDOVER_ASSIGNED]: "交班指派",
  [NotificationType.HANDOVER_COMMENTED]: "交班註記",
  [NotificationType.HANDOVER_STATUS_CHANGED]: "交班狀態變更",
  [NotificationType.INVENTORY_LOW_STOCK]: "低庫存警示",
  [NotificationType.SHIFT_ASSIGNED]: "班表指派",
  [NotificationType.SHIFT_CHANGED]: "班表變更",
  [NotificationType.LEAVE_REQUEST]: "請假申請",
  [NotificationType.LEAVE_APPROVED]: "請假審核",
  [NotificationType.CERTIFICATION_EXPIRING]: "證照即將到期",
  [NotificationType.ASSET_FAULT_REPORTED]: "設備故障回報",
  [NotificationType.MAINTENANCE_DUE]: "保養到期提醒",
  [NotificationType.WARRANTY_EXPIRING]: "保固即將到期",
  [NotificationType.PR_PENDING_APPROVAL]: "採購待審核",
  [NotificationType.PR_APPROVED]: "採購已核准",
  [NotificationType.PO_RECEIVED]: "採購收貨",
  [NotificationType.INCIDENT_REPORTED]: "事件通報",
  [NotificationType.INCIDENT_ASSIGNED]: "事件指派",
  [NotificationType.COMPLAINT_RECEIVED]: "投訴收到",
  [NotificationType.DOCUMENT_PUBLISHED]: "文件發布",
  [NotificationType.ANNOUNCEMENT_NEW]: "新公告",
  [NotificationType.SYSTEM]: "系統通知",
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
