// Document & SOP Module Enums

export enum DocumentStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export const DocumentStatusLabels: Record<DocumentStatus, string> = {
  [DocumentStatus.DRAFT]: '草稿',
  [DocumentStatus.REVIEW]: '審核中',
  [DocumentStatus.PUBLISHED]: '已發布',
  [DocumentStatus.ARCHIVED]: '已封存',
};

export const DocumentStatusColors: Record<DocumentStatus, string> = {
  [DocumentStatus.DRAFT]: 'gray',
  [DocumentStatus.REVIEW]: 'yellow',
  [DocumentStatus.PUBLISHED]: 'green',
  [DocumentStatus.ARCHIVED]: 'gray',
};

export enum AnnouncementPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export const AnnouncementPriorityLabels: Record<AnnouncementPriority, string> = {
  [AnnouncementPriority.LOW]: '低',
  [AnnouncementPriority.NORMAL]: '一般',
  [AnnouncementPriority.HIGH]: '高',
  [AnnouncementPriority.URGENT]: '緊急',
};

export const AnnouncementPriorityColors: Record<AnnouncementPriority, string> = {
  [AnnouncementPriority.LOW]: 'gray',
  [AnnouncementPriority.NORMAL]: 'blue',
  [AnnouncementPriority.HIGH]: 'orange',
  [AnnouncementPriority.URGENT]: 'red',
};
