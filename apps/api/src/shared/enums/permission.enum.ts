export enum Permission {
  // 交班系統
  HANDOVER_VIEW = "HANDOVER_VIEW",
  HANDOVER_CREATE = "HANDOVER_CREATE",
  HANDOVER_EDIT_OWN = "HANDOVER_EDIT_OWN",
  HANDOVER_EDIT_ALL = "HANDOVER_EDIT_ALL",
  HANDOVER_DELETE = "HANDOVER_DELETE",

  // 庫存管理
  INVENTORY_VIEW = "INVENTORY_VIEW",
  INVENTORY_TRANSACTION = "INVENTORY_TRANSACTION",
  INVENTORY_MANAGE = "INVENTORY_MANAGE",

  // 排班系統
  SCHEDULING_VIEW = "SCHEDULING_VIEW",
  SCHEDULING_MANAGE = "SCHEDULING_MANAGE",

  // 人員管理
  HR_VIEW = "HR_VIEW",
  HR_MANAGE = "HR_MANAGE",

  // 設備管理
  ASSETS_VIEW = "ASSETS_VIEW",
  ASSETS_REPORT_FAULT = "ASSETS_REPORT_FAULT",
  ASSETS_MANAGE = "ASSETS_MANAGE",

  // 採購管理
  PROCUREMENT_VIEW = "PROCUREMENT_VIEW",
  PROCUREMENT_REQUEST = "PROCUREMENT_REQUEST",
  PROCUREMENT_APPROVE = "PROCUREMENT_APPROVE",

  // 醫療品質
  QUALITY_VIEW = "QUALITY_VIEW",
  QUALITY_REPORT = "QUALITY_REPORT",
  QUALITY_MANAGE = "QUALITY_MANAGE",

  // 文件制度
  DOCUMENTS_VIEW = "DOCUMENTS_VIEW",
  DOCUMENTS_MANAGE = "DOCUMENTS_MANAGE",

  // 成本分析
  FINANCE_VIEW = "FINANCE_VIEW",
  FINANCE_MANAGE = "FINANCE_MANAGE",

  // 系統管理
  USERS_VIEW = "USERS_VIEW",
  USERS_MANAGE = "USERS_MANAGE",
  AUDIT_VIEW = "AUDIT_VIEW",
  PERMISSIONS_MANAGE = "PERMISSIONS_MANAGE",
}

export const PermissionLabels: Record<Permission, string> = {
  // 交班系統
  [Permission.HANDOVER_VIEW]: "查看交班",
  [Permission.HANDOVER_CREATE]: "建立交班",
  [Permission.HANDOVER_EDIT_OWN]: "編輯自己的交班",
  [Permission.HANDOVER_EDIT_ALL]: "編輯所有交班",
  [Permission.HANDOVER_DELETE]: "刪除交班",

  // 庫存管理
  [Permission.INVENTORY_VIEW]: "查看庫存",
  [Permission.INVENTORY_TRANSACTION]: "庫存異動",
  [Permission.INVENTORY_MANAGE]: "管理庫存品項",

  // 排班系統
  [Permission.SCHEDULING_VIEW]: "查看排班",
  [Permission.SCHEDULING_MANAGE]: "管理排班",

  // 人員管理
  [Permission.HR_VIEW]: "查看人員資料",
  [Permission.HR_MANAGE]: "管理人員資料",

  // 設備管理
  [Permission.ASSETS_VIEW]: "查看設備",
  [Permission.ASSETS_REPORT_FAULT]: "回報設備故障",
  [Permission.ASSETS_MANAGE]: "管理設備",

  // 採購管理
  [Permission.PROCUREMENT_VIEW]: "查看採購",
  [Permission.PROCUREMENT_REQUEST]: "申請採購",
  [Permission.PROCUREMENT_APPROVE]: "審核採購",

  // 醫療品質
  [Permission.QUALITY_VIEW]: "查看醫療品質",
  [Permission.QUALITY_REPORT]: "通報品質事件",
  [Permission.QUALITY_MANAGE]: "管理醫療品質",

  // 文件制度
  [Permission.DOCUMENTS_VIEW]: "查看文件",
  [Permission.DOCUMENTS_MANAGE]: "管理文件",

  // 成本分析
  [Permission.FINANCE_VIEW]: "查看財務報表",
  [Permission.FINANCE_MANAGE]: "管理財務",

  // 系統管理
  [Permission.USERS_VIEW]: "查看使用者",
  [Permission.USERS_MANAGE]: "管理使用者",
  [Permission.AUDIT_VIEW]: "查看稽核紀錄",
  [Permission.PERMISSIONS_MANAGE]: "管理權限",
};

// 權限分類
export const PermissionCategories: Record<
  string,
  { label: string; permissions: Permission[] }
> = {
  handover: {
    label: "交班系統",
    permissions: [
      Permission.HANDOVER_VIEW,
      Permission.HANDOVER_CREATE,
      Permission.HANDOVER_EDIT_OWN,
      Permission.HANDOVER_EDIT_ALL,
      Permission.HANDOVER_DELETE,
    ],
  },
  inventory: {
    label: "庫存管理",
    permissions: [
      Permission.INVENTORY_VIEW,
      Permission.INVENTORY_TRANSACTION,
      Permission.INVENTORY_MANAGE,
    ],
  },
  scheduling: {
    label: "排班系統",
    permissions: [Permission.SCHEDULING_VIEW, Permission.SCHEDULING_MANAGE],
  },
  hr: {
    label: "人員管理",
    permissions: [Permission.HR_VIEW, Permission.HR_MANAGE],
  },
  assets: {
    label: "設備管理",
    permissions: [
      Permission.ASSETS_VIEW,
      Permission.ASSETS_REPORT_FAULT,
      Permission.ASSETS_MANAGE,
    ],
  },
  procurement: {
    label: "採購管理",
    permissions: [
      Permission.PROCUREMENT_VIEW,
      Permission.PROCUREMENT_REQUEST,
      Permission.PROCUREMENT_APPROVE,
    ],
  },
  quality: {
    label: "醫療品質",
    permissions: [
      Permission.QUALITY_VIEW,
      Permission.QUALITY_REPORT,
      Permission.QUALITY_MANAGE,
    ],
  },
  documents: {
    label: "文件制度",
    permissions: [Permission.DOCUMENTS_VIEW, Permission.DOCUMENTS_MANAGE],
  },
  finance: {
    label: "成本分析",
    permissions: [Permission.FINANCE_VIEW, Permission.FINANCE_MANAGE],
  },
  system: {
    label: "系統管理",
    permissions: [
      Permission.USERS_VIEW,
      Permission.USERS_MANAGE,
      Permission.AUDIT_VIEW,
      Permission.PERMISSIONS_MANAGE,
    ],
  },
};

// 權限申請狀態
export enum PermissionRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export const PermissionRequestStatusLabels: Record<
  PermissionRequestStatus,
  string
> = {
  [PermissionRequestStatus.PENDING]: "待審核",
  [PermissionRequestStatus.APPROVED]: "已核准",
  [PermissionRequestStatus.REJECTED]: "已駁回",
};
