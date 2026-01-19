export enum HandoverStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export const HandoverStatusLabels: Record<HandoverStatus, string> = {
  [HandoverStatus.PENDING]: '待處理',
  [HandoverStatus.IN_PROGRESS]: '處理中',
  [HandoverStatus.BLOCKED]: '卡關',
  [HandoverStatus.COMPLETED]: '已完成',
  [HandoverStatus.CANCELLED]: '已取消',
};

export const HandoverStatusColors: Record<HandoverStatus, string> = {
  [HandoverStatus.PENDING]: 'gray',
  [HandoverStatus.IN_PROGRESS]: 'blue',
  [HandoverStatus.BLOCKED]: 'red',
  [HandoverStatus.COMPLETED]: 'green',
  [HandoverStatus.CANCELLED]: 'gray',
};

export enum HandoverPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const HandoverPriorityLabels: Record<HandoverPriority, string> = {
  [HandoverPriority.LOW]: '低',
  [HandoverPriority.MEDIUM]: '中',
  [HandoverPriority.HIGH]: '高',
  [HandoverPriority.URGENT]: '緊急',
};

export const HandoverPriorityColors: Record<HandoverPriority, string> = {
  [HandoverPriority.LOW]: 'gray',
  [HandoverPriority.MEDIUM]: 'blue',
  [HandoverPriority.HIGH]: 'orange',
  [HandoverPriority.URGENT]: 'red',
};
