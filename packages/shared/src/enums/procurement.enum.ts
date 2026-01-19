// Procurement Module Enums

export enum PurchaseRequestStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ORDERED = 'ORDERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const PurchaseRequestStatusLabels: Record<PurchaseRequestStatus, string> = {
  [PurchaseRequestStatus.DRAFT]: '草稿',
  [PurchaseRequestStatus.PENDING]: '待審核',
  [PurchaseRequestStatus.APPROVED]: '已核准',
  [PurchaseRequestStatus.REJECTED]: '已駁回',
  [PurchaseRequestStatus.ORDERED]: '已下單',
  [PurchaseRequestStatus.COMPLETED]: '已完成',
  [PurchaseRequestStatus.CANCELLED]: '已取消',
};

export const PurchaseRequestStatusColors: Record<PurchaseRequestStatus, string> = {
  [PurchaseRequestStatus.DRAFT]: 'gray',
  [PurchaseRequestStatus.PENDING]: 'yellow',
  [PurchaseRequestStatus.APPROVED]: 'green',
  [PurchaseRequestStatus.REJECTED]: 'red',
  [PurchaseRequestStatus.ORDERED]: 'blue',
  [PurchaseRequestStatus.COMPLETED]: 'green',
  [PurchaseRequestStatus.CANCELLED]: 'gray',
};

export enum PurchaseOrderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  CONFIRMED = 'CONFIRMED',
  PARTIAL_RECEIVED = 'PARTIAL_RECEIVED',
  RECEIVED = 'RECEIVED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const PurchaseOrderStatusLabels: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.PENDING]: '待處理',
  [PurchaseOrderStatus.SENT]: '已送出',
  [PurchaseOrderStatus.CONFIRMED]: '已確認',
  [PurchaseOrderStatus.PARTIAL_RECEIVED]: '部分收貨',
  [PurchaseOrderStatus.RECEIVED]: '已收貨',
  [PurchaseOrderStatus.COMPLETED]: '已完成',
  [PurchaseOrderStatus.CANCELLED]: '已取消',
};

export const PurchaseOrderStatusColors: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.PENDING]: 'gray',
  [PurchaseOrderStatus.SENT]: 'blue',
  [PurchaseOrderStatus.CONFIRMED]: 'blue',
  [PurchaseOrderStatus.PARTIAL_RECEIVED]: 'orange',
  [PurchaseOrderStatus.RECEIVED]: 'green',
  [PurchaseOrderStatus.COMPLETED]: 'green',
  [PurchaseOrderStatus.CANCELLED]: 'gray',
};

export enum PurchasePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const PurchasePriorityLabels: Record<PurchasePriority, string> = {
  [PurchasePriority.LOW]: '低',
  [PurchasePriority.MEDIUM]: '中',
  [PurchasePriority.HIGH]: '高',
  [PurchasePriority.URGENT]: '緊急',
};

export const PurchasePriorityColors: Record<PurchasePriority, string> = {
  [PurchasePriority.LOW]: 'gray',
  [PurchasePriority.MEDIUM]: 'blue',
  [PurchasePriority.HIGH]: 'orange',
  [PurchasePriority.URGENT]: 'red',
};
