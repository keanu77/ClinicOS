import { Permission, PermissionRequestStatus } from '../enums/permission.enum';
import { Position } from '../enums/position.enum';

// 職位預設權限矩陣
export const DefaultPermissionsByPosition: Record<Position, Permission[]> = {
  [Position.DOCTOR]: [
    Permission.HANDOVER_VIEW,
    Permission.HANDOVER_CREATE,
    Permission.HANDOVER_EDIT_OWN,
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_TRANSACTION,
    Permission.SCHEDULING_VIEW,
    Permission.ASSETS_VIEW,
    Permission.ASSETS_REPORT_FAULT,
    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_REQUEST,
    Permission.QUALITY_VIEW,
    Permission.QUALITY_REPORT,
    Permission.DOCUMENTS_VIEW,
  ],
  [Position.NURSE]: [
    Permission.HANDOVER_VIEW,
    Permission.HANDOVER_CREATE,
    Permission.HANDOVER_EDIT_OWN,
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_TRANSACTION,
    Permission.SCHEDULING_VIEW,
    Permission.ASSETS_VIEW,
    Permission.ASSETS_REPORT_FAULT,
    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_REQUEST,
    Permission.QUALITY_VIEW,
    Permission.QUALITY_REPORT,
    Permission.DOCUMENTS_VIEW,
  ],
  [Position.SPORTS_THERAPIST]: [
    Permission.HANDOVER_VIEW,
    Permission.HANDOVER_CREATE,
    Permission.HANDOVER_EDIT_OWN,
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_TRANSACTION,
    Permission.SCHEDULING_VIEW,
    Permission.ASSETS_VIEW,
    Permission.ASSETS_REPORT_FAULT,
    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_REQUEST,
    Permission.QUALITY_VIEW,
    Permission.QUALITY_REPORT,
    Permission.DOCUMENTS_VIEW,
  ],
  [Position.RECEPTIONIST]: [
    Permission.HANDOVER_VIEW,
    Permission.HANDOVER_CREATE,
    Permission.HANDOVER_EDIT_OWN,
    Permission.INVENTORY_VIEW,
    Permission.SCHEDULING_VIEW,
    Permission.ASSETS_VIEW,
    Permission.ASSETS_REPORT_FAULT,
    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_REQUEST,
    Permission.DOCUMENTS_VIEW,
  ],
  [Position.MANAGER]: [
    Permission.HANDOVER_VIEW,
    Permission.HANDOVER_CREATE,
    Permission.HANDOVER_EDIT_OWN,
    Permission.HANDOVER_EDIT_ALL,
    Permission.HANDOVER_DELETE,
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_TRANSACTION,
    Permission.INVENTORY_MANAGE,
    Permission.SCHEDULING_VIEW,
    Permission.SCHEDULING_MANAGE,
    Permission.HR_VIEW,
    Permission.HR_MANAGE,
    Permission.ASSETS_VIEW,
    Permission.ASSETS_REPORT_FAULT,
    Permission.ASSETS_MANAGE,
    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_REQUEST,
    Permission.PROCUREMENT_APPROVE,
    Permission.QUALITY_VIEW,
    Permission.QUALITY_REPORT,
    Permission.QUALITY_MANAGE,
    Permission.DOCUMENTS_VIEW,
    Permission.DOCUMENTS_MANAGE,
    Permission.FINANCE_VIEW,
    Permission.USERS_VIEW,
  ],
  [Position.ADMIN]: [
    Permission.HANDOVER_VIEW,
    Permission.HANDOVER_CREATE,
    Permission.HANDOVER_EDIT_OWN,
    Permission.HANDOVER_EDIT_ALL,
    Permission.HANDOVER_DELETE,
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_TRANSACTION,
    Permission.INVENTORY_MANAGE,
    Permission.SCHEDULING_VIEW,
    Permission.SCHEDULING_MANAGE,
    Permission.HR_VIEW,
    Permission.HR_MANAGE,
    Permission.ASSETS_VIEW,
    Permission.ASSETS_REPORT_FAULT,
    Permission.ASSETS_MANAGE,
    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_REQUEST,
    Permission.PROCUREMENT_APPROVE,
    Permission.QUALITY_VIEW,
    Permission.QUALITY_REPORT,
    Permission.QUALITY_MANAGE,
    Permission.DOCUMENTS_VIEW,
    Permission.DOCUMENTS_MANAGE,
    Permission.FINANCE_VIEW,
    Permission.FINANCE_MANAGE,
    Permission.USERS_VIEW,
    Permission.USERS_MANAGE,
    Permission.AUDIT_VIEW,
    Permission.PERMISSIONS_MANAGE,
  ],
};

// 使用者權限回應
export interface UserPermissionResponse {
  userId: string;
  position: Position;
  defaultPermissions: Permission[];
  customPermissions: {
    permission: Permission;
    granted: boolean;
    grantedAt: Date;
    expiresAt?: Date;
    reason?: string;
  }[];
  effectivePermissions: Permission[];
}

// 權限申請回應
export interface PermissionRequestResponse {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterPosition: Position;
  permission: Permission;
  reason: string;
  status: PermissionRequestStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewedAt?: Date;
  reviewNote?: string;
  createdAt: Date;
}
