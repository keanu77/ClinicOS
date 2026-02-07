export enum Position {
  DOCTOR = "DOCTOR",
  NURSE = "NURSE",
  SPORTS_THERAPIST = "SPORTS_THERAPIST",
  RECEPTIONIST = "RECEPTIONIST",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export const PositionLabels: Record<Position, string> = {
  [Position.DOCTOR]: "醫師",
  [Position.NURSE]: "護理師",
  [Position.SPORTS_THERAPIST]: "運醫老師",
  [Position.RECEPTIONIST]: "櫃檯",
  [Position.MANAGER]: "經理",
  [Position.ADMIN]: "管理者",
};

export const PositionHierarchy: Record<Position, number> = {
  [Position.RECEPTIONIST]: 1,
  [Position.SPORTS_THERAPIST]: 2,
  [Position.NURSE]: 3,
  [Position.DOCTOR]: 4,
  [Position.MANAGER]: 5,
  [Position.ADMIN]: 6,
};
