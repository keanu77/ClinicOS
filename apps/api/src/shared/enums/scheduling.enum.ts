// ============================================
// 排班系統 - 班別代碼
// ============================================

export enum ShiftCode {
  GM = "GM",
  BX = "BX",
  BE = "BE",
  OF = "OF",
  ZZ = "ZZ",
  QQ = "QQ",
  NN = "NN",
}

export const ShiftCodeLabels: Record<ShiftCode, string> = {
  [ShiftCode.GM]: "全日班",
  [ShiftCode.BX]: "早晚班",
  [ShiftCode.BE]: "櫃台班",
  [ShiftCode.OF]: "公休",
  [ShiftCode.ZZ]: "休假",
  [ShiftCode.QQ]: "假日",
  [ShiftCode.NN]: "國假",
};

export const ShiftCodeColors: Record<ShiftCode, string> = {
  [ShiftCode.GM]: "#3B82F6",
  [ShiftCode.BX]: "#F59E0B",
  [ShiftCode.BE]: "#10B981",
  [ShiftCode.OF]: "#9CA3AF",
  [ShiftCode.ZZ]: "#D1D5DB",
  [ShiftCode.QQ]: "#E5E7EB",
  [ShiftCode.NN]: "#FCA5A5",
};

export const NON_WORKING_SHIFT_CODES: ShiftCode[] = [
  ShiftCode.OF,
  ShiftCode.ZZ,
  ShiftCode.QQ,
  ShiftCode.NN,
];

// ============================================
// 排班系統 - 活動類型
// ============================================

export enum ActivityType {
  SPORTS = "SPORTS",
  ELECTRO = "ELECTRO",
  NURSING = "NURSING",
  ASSISTANT = "ASSISTANT",
  RECEPTION = "RECEPTION",
  ADMIN_WORK = "ADMIN_WORK",
  NAT_HOLIDAY = "NAT_HOLIDAY",
  HOLIDAY = "HOLIDAY",
  DAY_OFF = "DAY_OFF",
}

export const ActivityTypeLabels: Record<ActivityType, string> = {
  [ActivityType.SPORTS]: "運",
  [ActivityType.ELECTRO]: "電",
  [ActivityType.NURSING]: "護",
  [ActivityType.ASSISTANT]: "助",
  [ActivityType.RECEPTION]: "櫃",
  [ActivityType.ADMIN_WORK]: "行",
  [ActivityType.NAT_HOLIDAY]: "國",
  [ActivityType.HOLIDAY]: "假",
  [ActivityType.DAY_OFF]: "休",
};

export const ActivityTypeFullLabels: Record<ActivityType, string> = {
  [ActivityType.SPORTS]: "運醫",
  [ActivityType.ELECTRO]: "電療",
  [ActivityType.NURSING]: "護理",
  [ActivityType.ASSISTANT]: "助理",
  [ActivityType.RECEPTION]: "櫃檯",
  [ActivityType.ADMIN_WORK]: "行政",
  [ActivityType.NAT_HOLIDAY]: "國假",
  [ActivityType.HOLIDAY]: "假日",
  [ActivityType.DAY_OFF]: "休假",
};

export const ActivityTypeColors: Record<ActivityType, string> = {
  [ActivityType.SPORTS]: "#3B82F6",
  [ActivityType.ELECTRO]: "#8B5CF6",
  [ActivityType.NURSING]: "#EC4899",
  [ActivityType.ASSISTANT]: "#F59E0B",
  [ActivityType.RECEPTION]: "#10B981",
  [ActivityType.ADMIN_WORK]: "#6366F1",
  [ActivityType.NAT_HOLIDAY]: "#EF4444",
  [ActivityType.HOLIDAY]: "#9CA3AF",
  [ActivityType.DAY_OFF]: "#D1D5DB",
};

export const WORKING_ACTIVITY_TYPES: ActivityType[] = [
  ActivityType.SPORTS,
  ActivityType.ELECTRO,
  ActivityType.NURSING,
  ActivityType.ASSISTANT,
  ActivityType.RECEPTION,
  ActivityType.ADMIN_WORK,
];

// ============================================
// 排班系統 - 部門
// ============================================

export enum ScheduleDepartment {
  SPORTS_MEDICINE = "SPORTS_MEDICINE",
  CLINIC = "CLINIC",
}

export const ScheduleDepartmentLabels: Record<ScheduleDepartment, string> = {
  [ScheduleDepartment.SPORTS_MEDICINE]: "運醫",
  [ScheduleDepartment.CLINIC]: "診所",
};
