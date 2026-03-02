export enum ClinicType {
  SPORTS_MEDICINE = 'SPORTS_MEDICINE',
  SPECIAL = 'SPECIAL',
}

export const ClinicTypeLabels: Record<ClinicType, string> = {
  [ClinicType.SPORTS_MEDICINE]: '運動醫學門診',
  [ClinicType.SPECIAL]: '特別門診',
};

export enum ClinicPeriod {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
}

export const ClinicPeriodLabels: Record<ClinicPeriod, string> = {
  [ClinicPeriod.MORNING]: '早診',
  [ClinicPeriod.AFTERNOON]: '午診',
  [ClinicPeriod.EVENING]: '晚診',
};

export const ClinicPeriodTimeRanges: Record<ClinicPeriod, { start: string; end: string }> = {
  [ClinicPeriod.MORNING]: { start: '08:30', end: '11:30' },
  [ClinicPeriod.AFTERNOON]: { start: '14:30', end: '17:30' },
  [ClinicPeriod.EVENING]: { start: '18:00', end: '21:30' },
};

export const DayOfWeekLabels: Record<number, string> = {
  1: '週一',
  2: '週二',
  3: '週三',
  4: '週四',
  5: '週五',
  6: '週六',
};
