// Quality & Risk Module Enums

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export const IncidentSeverityLabels: Record<IncidentSeverity, string> = {
  [IncidentSeverity.LOW]: '低',
  [IncidentSeverity.MEDIUM]: '中',
  [IncidentSeverity.HIGH]: '高',
  [IncidentSeverity.CRITICAL]: '嚴重',
};

export const IncidentSeverityColors: Record<IncidentSeverity, string> = {
  [IncidentSeverity.LOW]: 'gray',
  [IncidentSeverity.MEDIUM]: 'blue',
  [IncidentSeverity.HIGH]: 'orange',
  [IncidentSeverity.CRITICAL]: 'red',
};

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  INVESTIGATING = 'INVESTIGATING',
  ACTION_REQUIRED = 'ACTION_REQUIRED',
  CLOSED = 'CLOSED',
}

export const IncidentStatusLabels: Record<IncidentStatus, string> = {
  [IncidentStatus.REPORTED]: '已通報',
  [IncidentStatus.INVESTIGATING]: '調查中',
  [IncidentStatus.ACTION_REQUIRED]: '需採取行動',
  [IncidentStatus.CLOSED]: '已結案',
};

export const IncidentStatusColors: Record<IncidentStatus, string> = {
  [IncidentStatus.REPORTED]: 'red',
  [IncidentStatus.INVESTIGATING]: 'orange',
  [IncidentStatus.ACTION_REQUIRED]: 'yellow',
  [IncidentStatus.CLOSED]: 'green',
};

export enum ComplaintSource {
  PATIENT = 'PATIENT',
  FAMILY = 'FAMILY',
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
}

export const ComplaintSourceLabels: Record<ComplaintSource, string> = {
  [ComplaintSource.PATIENT]: '病患',
  [ComplaintSource.FAMILY]: '家屬',
  [ComplaintSource.INTERNAL]: '內部',
  [ComplaintSource.EXTERNAL]: '外部',
};

export enum ComplaintStatus {
  RECEIVED = 'RECEIVED',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export const ComplaintStatusLabels: Record<ComplaintStatus, string> = {
  [ComplaintStatus.RECEIVED]: '已收到',
  [ComplaintStatus.INVESTIGATING]: '調查中',
  [ComplaintStatus.RESOLVED]: '已解決',
  [ComplaintStatus.CLOSED]: '已結案',
};

export const ComplaintStatusColors: Record<ComplaintStatus, string> = {
  [ComplaintStatus.RECEIVED]: 'red',
  [ComplaintStatus.INVESTIGATING]: 'orange',
  [ComplaintStatus.RESOLVED]: 'green',
  [ComplaintStatus.CLOSED]: 'gray',
};
