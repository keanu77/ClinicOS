export enum ShiftType {
  MORNING = "MORNING",
  AFTERNOON = "AFTERNOON",
  NIGHT = "NIGHT",
}

export const ShiftTypeLabels: Record<ShiftType, string> = {
  [ShiftType.MORNING]: "早班",
  [ShiftType.AFTERNOON]: "午班",
  [ShiftType.NIGHT]: "晚班",
};

export const ShiftTypeColors: Record<ShiftType, string> = {
  [ShiftType.MORNING]: "yellow",
  [ShiftType.AFTERNOON]: "blue",
  [ShiftType.NIGHT]: "purple",
};

export const ShiftTimeRanges: Record<
  ShiftType,
  { start: string; end: string }
> = {
  [ShiftType.MORNING]: { start: "08:00", end: "16:00" },
  [ShiftType.AFTERNOON]: { start: "16:00", end: "24:00" },
  [ShiftType.NIGHT]: { start: "00:00", end: "08:00" },
};
