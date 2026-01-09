import { ShiftType } from '../enums/shift.enum';
import { UserWithoutPassword } from './user.types';

export interface Shift {
  id: string;
  date: Date;
  type: ShiftType;
  userId: string;
  user?: UserWithoutPassword;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateShiftDto {
  date: string;
  type: ShiftType;
  userId: string;
  notes?: string;
}

export interface UpdateShiftDto {
  date?: string;
  type?: ShiftType;
  userId?: string;
  notes?: string | null;
}

export interface ShiftQueryDto {
  start?: string;
  end?: string;
  userId?: string;
  type?: ShiftType;
}

export interface WeeklySchedule {
  date: string;
  shifts: {
    [key in ShiftType]?: Shift[];
  };
}

export interface ShiftCalendarResponse {
  startDate: string;
  endDate: string;
  schedule: WeeklySchedule[];
}
