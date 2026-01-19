// Asset Module Enums

export enum AssetStatus {
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
  DISPOSED = 'DISPOSED',
}

export enum AssetCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

export enum MaintenanceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum MaintenanceType {
  SCHEDULED = 'SCHEDULED',
  UNSCHEDULED = 'UNSCHEDULED',
  REPAIR = 'REPAIR',
}

export enum FaultSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum FaultStatus {
  REPORTED = 'REPORTED',
  INVESTIGATING = 'INVESTIGATING',
  IN_REPAIR = 'IN_REPAIR',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}
