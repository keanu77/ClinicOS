// Procurement Module Enums

export enum PurchaseRequestStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ORDERED = "ORDERED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PurchaseOrderStatus {
  PENDING = "PENDING",
  SENT = "SENT",
  CONFIRMED = "CONFIRMED",
  PARTIAL_RECEIVED = "PARTIAL_RECEIVED",
  RECEIVED = "RECEIVED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PurchasePriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}
