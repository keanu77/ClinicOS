// ============================================
// 排班系統 - 班別代碼
// ============================================

export enum ShiftCode {
  GM = 'GM',   // 全日班
  BX = 'BX',   // 早晚班
  BE = 'BE',   // 櫃台班
  OF = 'OF',   // 公休
  ZZ = 'ZZ',   // 休假
  QQ = 'QQ',   // 假日
  NN = 'NN',   // 國假
}

export const ShiftCodeLabels: Record<ShiftCode, string> = {
  [ShiftCode.GM]: '全日班',
  [ShiftCode.BX]: '早晚班',
  [ShiftCode.BE]: '櫃台班',
  [ShiftCode.OF]: '公休',
  [ShiftCode.ZZ]: '休假',
  [ShiftCode.QQ]: '假日',
  [ShiftCode.NN]: '國假',
};

export const ShiftCodeColors: Record<ShiftCode, string> = {
  [ShiftCode.GM]: '#3B82F6', // blue
  [ShiftCode.BX]: '#F59E0B', // amber
  [ShiftCode.BE]: '#10B981', // emerald
  [ShiftCode.OF]: '#9CA3AF', // gray
  [ShiftCode.ZZ]: '#D1D5DB', // light gray
  [ShiftCode.QQ]: '#E5E7EB', // lighter gray
  [ShiftCode.NN]: '#FCA5A5', // red light
};

/** 非上班班別 — 選擇後自動清空活動欄 */
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
  SPORTS = 'SPORTS',           // 運
  ELECTRO = 'ELECTRO',         // 電
  NURSING = 'NURSING',         // 護
  ASSISTANT = 'ASSISTANT',     // 助
  RECEPTION = 'RECEPTION',     // 櫃
  ADMIN_WORK = 'ADMIN_WORK',   // 行
  NAT_HOLIDAY = 'NAT_HOLIDAY', // 國
  HOLIDAY = 'HOLIDAY',         // 假
  DAY_OFF = 'DAY_OFF',         // 休
}

export const ActivityTypeLabels: Record<ActivityType, string> = {
  [ActivityType.SPORTS]: '運',
  [ActivityType.ELECTRO]: '電',
  [ActivityType.NURSING]: '護',
  [ActivityType.ASSISTANT]: '助',
  [ActivityType.RECEPTION]: '櫃',
  [ActivityType.ADMIN_WORK]: '行',
  [ActivityType.NAT_HOLIDAY]: '國',
  [ActivityType.HOLIDAY]: '假',
  [ActivityType.DAY_OFF]: '休',
};

export const ActivityTypeFullLabels: Record<ActivityType, string> = {
  [ActivityType.SPORTS]: '運醫',
  [ActivityType.ELECTRO]: '電療',
  [ActivityType.NURSING]: '護理',
  [ActivityType.ASSISTANT]: '助理',
  [ActivityType.RECEPTION]: '櫃檯',
  [ActivityType.ADMIN_WORK]: '行政',
  [ActivityType.NAT_HOLIDAY]: '國假',
  [ActivityType.HOLIDAY]: '假日',
  [ActivityType.DAY_OFF]: '休假',
};

export const ActivityTypeColors: Record<ActivityType, string> = {
  [ActivityType.SPORTS]: '#3B82F6',     // blue
  [ActivityType.ELECTRO]: '#8B5CF6',    // violet
  [ActivityType.NURSING]: '#EC4899',    // pink
  [ActivityType.ASSISTANT]: '#F59E0B',  // amber
  [ActivityType.RECEPTION]: '#10B981',  // emerald
  [ActivityType.ADMIN_WORK]: '#6366F1', // indigo
  [ActivityType.NAT_HOLIDAY]: '#EF4444',// red
  [ActivityType.HOLIDAY]: '#9CA3AF',    // gray
  [ActivityType.DAY_OFF]: '#D1D5DB',    // light gray
};

/** 上班時可選的活動類型 */
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
  SPORTS_MEDICINE = 'SPORTS_MEDICINE', // 運醫
  CLINIC = 'CLINIC',                   // 診所
}

export const ScheduleDepartmentLabels: Record<ScheduleDepartment, string> = {
  [ScheduleDepartment.SPORTS_MEDICINE]: '運醫',
  [ScheduleDepartment.CLINIC]: '診所',
};
