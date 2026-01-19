// HR Module Enums

export enum CertificationStatus {
  VALID = 'VALID',
  EXPIRING_SOON = 'EXPIRING_SOON',
  EXPIRED = 'EXPIRED',
}

export const CertificationStatusLabels: Record<CertificationStatus, string> = {
  [CertificationStatus.VALID]: '有效',
  [CertificationStatus.EXPIRING_SOON]: '即將到期',
  [CertificationStatus.EXPIRED]: '已過期',
};

export const CertificationStatusColors: Record<CertificationStatus, string> = {
  [CertificationStatus.VALID]: 'green',
  [CertificationStatus.EXPIRING_SOON]: 'orange',
  [CertificationStatus.EXPIRED]: 'red',
};

export enum SkillLevel {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export const SkillLevelLabels: Record<SkillLevel, string> = {
  [SkillLevel.BASIC]: '基礎',
  [SkillLevel.INTERMEDIATE]: '中級',
  [SkillLevel.ADVANCED]: '進階',
};

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  PERSONAL = 'PERSONAL',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  MARRIAGE = 'MARRIAGE',
  BEREAVEMENT = 'BEREAVEMENT',
  UNPAID = 'UNPAID',
}

export const LeaveTypeLabels: Record<LeaveType, string> = {
  [LeaveType.ANNUAL]: '特休',
  [LeaveType.SICK]: '病假',
  [LeaveType.PERSONAL]: '事假',
  [LeaveType.MATERNITY]: '產假',
  [LeaveType.PATERNITY]: '陪產假',
  [LeaveType.MARRIAGE]: '婚假',
  [LeaveType.BEREAVEMENT]: '喪假',
  [LeaveType.UNPAID]: '留職停薪',
};

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export const LeaveStatusLabels: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: '待審核',
  [LeaveStatus.APPROVED]: '已核准',
  [LeaveStatus.REJECTED]: '已駁回',
  [LeaveStatus.CANCELLED]: '已取消',
};

export const LeaveStatusColors: Record<LeaveStatus, string> = {
  [LeaveStatus.PENDING]: 'yellow',
  [LeaveStatus.APPROVED]: 'green',
  [LeaveStatus.REJECTED]: 'red',
  [LeaveStatus.CANCELLED]: 'gray',
};
