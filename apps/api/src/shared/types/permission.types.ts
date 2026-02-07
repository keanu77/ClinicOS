import { Permission, PermissionRequestStatus } from "../enums/permission.enum";
import { Position } from "../enums/position.enum";

// 職位預設權限矩陣
export const DefaultPermissionsByPosition: Record<Position, Permission[]> = {
  [Position.DOCTOR]: [
    // 交班
    Permission.HANDOVER_VIEW,
    Permission.HANDOVER_CREATE,
    Permission.HANDOVER_EDIT_OWN,
    // 庫存
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_TRANSACTION,
    // 排班
    Permission.SCHEDULING_VIEW,
    // 設備
    Permission.ASSETS_VIEW,
    Permission.ASSETS_REPORT_FAULT,
    // 採購
    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_REQUEST,
    // 品質
    Permission.QUALITY_VIEW,
    Permission.QUALITY_REPORT,
    // 文件
    Permission.DOCUMENTS_VIEW,
  ],
  [Position.NURSE]: [
    // 交班
    Permission.HANDOVER_VIEW,
    Permission.HANDOVER_CREATE,
    Permission.HANDOVER_EDIT_OWN,
    // 庫存
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_TRANSACTION,
    // 排班
    Permission.SCHEDULING_VIEW,
    // 設備
    Permission.ASSETS_VIEW,
    Permission.ASSETS_REPORT_FAULT,
    // 採購
    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_REQUEST,
    // 品質
    Permission.QUALITY_VIEW,
    Permission.QUALITY_REPORT,
    // 文件
    Permission.DOCUMENTS_VIEW,
  ],
  [Position.SPORTS_THERAPIST]: [
    // 交班
    Permission.HANDOVER_VIEW,
    Permission.HANDOVER_CREATE,
    Permission.HANDOVER_EDIT_OWN,
    // 庫存
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_TRANSACTION,
    // 排班
    Permission.SCHEDULING_VIEW,
    // 設備
    Permission.ASSETS_VIEW,
    Permission.ASSETS_REPORT_FAULT,
    // 採購
    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_REQUEST,
    // 品質
    Permission.QUALITY_VIEW,
    Permission.QUALITY_REPORT,
    // 文件
    Permission.DOCUMENTS_VIEW,
  ],
  [Position.RECEPTIONIST]: [
    // 交班
    Permission.HANDOVER_VIEW,
    Permission.HANDOVER_CREATE,
    Permission.HANDOVER_EDIT_OWN,
    // 庫存 - 只能查看
    Permission.INVENTORY_VIEW,
    // 排班
    Permission.SCHEDULING_VIEW,
    // 設備
    Permission.ASSETS_VIEW,
    Permission.ASSETS_REPORT_FAULT,
    // 採購
    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_REQUEST,
    // 文件
    Permission.DOCUMENTS_VIEW,
  ],
  [Position.MANAGER]: [
    // 交班
    Permission.HANDOVER_VIEW,
    Permission.HANDOVER_CREATE,
    Permission.HANDOVER_EDIT_OWN,
    Permission.HANDOVER_EDIT_ALL,
    Permission.HANDOVER_DELETE,
    // 庫存
    Permission.INVENTORY_VIEW,
    Permission.INVENTORY_TRANSACTION,
    Permission.INVENTORY_MANAGE,
    // 排班
    Permission.SCHEDULING_VIEW,
    Permission.SCHEDULING_MANAGE,
    // 人員
    Permission.HR_VIEW,
    Permission.HR_MANAGE,
    // 設備
    Permission.ASSETS_VIEW,
    Permission.ASSETS_REPORT_FAULT,
    Permission.ASSETS_MANAGE,
    // 採購
    Permission.PROCUREMENT_VIEW,
    Permission.PROCUREMENT_REQUEST,
    Permission.PROCUREMENT_APPROVE,
    // 品質
    Permission.QUALITY_VIEW,
    Permission.QUALITY_REPORT,
    Permission.QUALITY_MANAGE,
    // 文件
    Permission.DOCUMENTS_VIEW,
    Permission.DOCUMENTS_MANAGE,
    // 財務
    Permission.FINANCE_VIEW,
    // 使用者
    Permission.USERS_VIEW,
  ],
  [Position.ADMIN]: [
    // 所有權限
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

// 權限申請 DTO
export interface CreatePermissionRequestDto {
  permission: Permission;
  reason: string;
}

export interface ReviewPermissionRequestDto {
  approved: boolean;
  reviewNote?: string;
}

// 權限授予 DTO
export interface GrantPermissionDto {
  permission: Permission;
  reason?: string;
  expiresAt?: Date;
}

export interface RevokePermissionDto {
  permission: Permission;
  reason?: string;
}

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
