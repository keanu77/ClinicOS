// Asset Module Enums

export enum AssetStatus {
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
  DISPOSED = 'DISPOSED',
}

export const AssetStatusLabels: Record<AssetStatus, string> = {
  [AssetStatus.IN_USE]: '使用中',
  [AssetStatus.MAINTENANCE]: '維修中',
  [AssetStatus.RETIRED]: '已報廢',
  [AssetStatus.DISPOSED]: '已處置',
};

export const AssetStatusColors: Record<AssetStatus, string> = {
  [AssetStatus.IN_USE]: 'green',
  [AssetStatus.MAINTENANCE]: 'orange',
  [AssetStatus.RETIRED]: 'gray',
  [AssetStatus.DISPOSED]: 'red',
};

export enum AssetCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export const AssetConditionLabels: Record<AssetCondition, string> = {
  [AssetCondition.EXCELLENT]: '優良',
  [AssetCondition.GOOD]: '良好',
  [AssetCondition.FAIR]: '尚可',
  [AssetCondition.POOR]: '不佳',
};

export enum MaintenanceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export const MaintenanceFrequencyLabels: Record<MaintenanceFrequency, string> = {
  [MaintenanceFrequency.DAILY]: '每日',
  [MaintenanceFrequency.WEEKLY]: '每週',
  [MaintenanceFrequency.MONTHLY]: '每月',
  [MaintenanceFrequency.QUARTERLY]: '每季',
  [MaintenanceFrequency.YEARLY]: '每年',
};

export enum MaintenanceType {
  SCHEDULED = 'SCHEDULED',
  UNSCHEDULED = 'UNSCHEDULED',
  REPAIR = 'REPAIR',
}

export const MaintenanceTypeLabels: Record<MaintenanceType, string> = {
  [MaintenanceType.SCHEDULED]: '定期保養',
  [MaintenanceType.UNSCHEDULED]: '臨時保養',
  [MaintenanceType.REPAIR]: '維修',
};

export enum FaultSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export const FaultSeverityLabels: Record<FaultSeverity, string> = {
  [FaultSeverity.LOW]: '低',
  [FaultSeverity.MEDIUM]: '中',
  [FaultSeverity.HIGH]: '高',
  [FaultSeverity.CRITICAL]: '緊急',
};

export const FaultSeverityColors: Record<FaultSeverity, string> = {
  [FaultSeverity.LOW]: 'gray',
  [FaultSeverity.MEDIUM]: 'blue',
  [FaultSeverity.HIGH]: 'orange',
  [FaultSeverity.CRITICAL]: 'red',
};

export enum FaultStatus {
  REPORTED = 'REPORTED',
  INVESTIGATING = 'INVESTIGATING',
  IN_REPAIR = 'IN_REPAIR',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export const FaultStatusLabels: Record<FaultStatus, string> = {
  [FaultStatus.REPORTED]: '已回報',
  [FaultStatus.INVESTIGATING]: '調查中',
  [FaultStatus.IN_REPAIR]: '維修中',
  [FaultStatus.RESOLVED]: '已解決',
  [FaultStatus.CLOSED]: '已結案',
};

export const FaultStatusColors: Record<FaultStatus, string> = {
  [FaultStatus.REPORTED]: 'red',
  [FaultStatus.INVESTIGATING]: 'orange',
  [FaultStatus.IN_REPAIR]: 'yellow',
  [FaultStatus.RESOLVED]: 'green',
  [FaultStatus.CLOSED]: 'gray',
};
