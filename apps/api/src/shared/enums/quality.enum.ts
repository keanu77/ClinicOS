// Quality & Risk Module Enums

export enum IncidentSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export enum IncidentStatus {
  REPORTED = "REPORTED",
  INVESTIGATING = "INVESTIGATING",
  ACTION_REQUIRED = "ACTION_REQUIRED",
  CLOSED = "CLOSED",
}

export enum ComplaintSource {
  PATIENT = "PATIENT",
  FAMILY = "FAMILY",
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
}

export enum ComplaintStatus {
  RECEIVED = "RECEIVED",
  INVESTIGATING = "INVESTIGATING",
  RESOLVED = "RESOLVED",
  CLOSED = "CLOSED",
}
