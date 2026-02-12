'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScheduleCell } from './schedule-cell';
import {
  ShiftCode,
  ShiftCodeLabels,
  ShiftCodeColors,
  NON_WORKING_SHIFT_CODES,
  ActivityTypeLabels,
  ActivityType,
} from '@/shared';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

interface ScheduleEntry {
  id: string;
  date: string;
  department: string;
  shiftCode: string;
  periodA: string | null;
  periodB: string | null;
  periodC: string | null;
  notes: string | null;
  userId: string;
  user: { id: string; name: string; position: string };
}

// Local state for a single cell's data
export interface CellData {
  shiftCode: string | null;
  periodA: string | null;
  periodB: string | null;
  periodC: string | null;
}

// key = `${userId}_${day}`
export type GridState = Record<string, CellData>;

interface ScheduleGridProps {
  year: number;
  month: number;
  entries: ScheduleEntry[];
  users: Array<{ id: string; name: string; position: string }>;
  gridState: GridState;
  onCellChange: (userId: string, day: number, field: keyof CellData, value: string | null) => void;
  loading: boolean;
}

export function ScheduleGrid({
  year,
  month,
  entries,
  users,
  gridState,
  onCellChange,
  loading,
}: ScheduleGridProps) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();
  const todayStr = today.getFullYear() === year && today.getMonth() + 1 === month
    ? today.getDate()
    : -1;

  const days = useMemo(() => {
    const result: { day: number; weekday: string; isWeekend: boolean }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month - 1, d);
      const dayOfWeek = date.getDay();
      result.push({
        day: d,
        weekday: WEEKDAYS[dayOfWeek],
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      });
    }
    return result;
  }, [year, month, daysInMonth]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-64 bg-gray-100 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="border-collapse text-xs" style={{ minWidth: `${80 + daysInMonth * 48}px` }}>
            <thead>
              <tr className="border-b">
                <th className="p-1 text-left font-medium w-20 sticky left-0 bg-white z-20 border-r">
                  人員
                </th>
                {days.map(({ day, weekday, isWeekend }) => (
                  <th
                    key={day}
                    className={`p-1 text-center font-medium min-w-[48px] ${
                      isWeekend ? 'bg-gray-100' : ''
                    } ${day === todayStr ? 'bg-blue-50' : ''}`}
                  >
                    <div className={`text-[10px] ${isWeekend ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {weekday}
                    </div>
                    <div className={`${day === todayStr ? 'text-blue-600 font-bold' : ''}`}>
                      {day}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                return (
                  <UserRows
                    key={user.id}
                    user={user}
                    days={days}
                    todayStr={todayStr}
                    gridState={gridState}
                    onCellChange={onCellChange}
                  />
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={daysInMonth + 1}
                    className="p-8 text-center text-muted-foreground"
                  >
                    此部門暫無員工資料
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function UserRows({
  user,
  days,
  todayStr,
  gridState,
  onCellChange,
}: {
  user: { id: string; name: string; position: string };
  days: { day: number; weekday: string; isWeekend: boolean }[];
  todayStr: number;
  gridState: GridState;
  onCellChange: (userId: string, day: number, field: keyof CellData, value: string | null) => void;
}) {
  return (
    <>
      {/* Row 1: Name + ShiftCode */}
      <tr className="border-b border-gray-200">
        <td
          className="p-1 font-medium sticky left-0 bg-white z-10 border-r"
          rowSpan={4}
        >
          <div className="text-sm font-semibold">{user.name}</div>
        </td>
        {days.map(({ day, isWeekend }) => {
          const key = `${user.id}_${day}`;
          const cell = gridState[key];
          const isNonWorking = cell?.shiftCode
            ? NON_WORKING_SHIFT_CODES.includes(cell.shiftCode as ShiftCode)
            : false;

          return (
            <td
              key={`sc-${day}`}
              className={`p-0 ${isWeekend ? 'bg-gray-50' : ''} ${day === todayStr ? 'bg-blue-50' : ''}`}
            >
              <ScheduleCell
                type="shiftCode"
                value={cell?.shiftCode || null}
                onChange={(v) => onCellChange(user.id, day, 'shiftCode', v)}
              />
            </td>
          );
        })}
      </tr>
      {/* Row 2: Period A (上午) */}
      <tr className="border-b border-gray-100">
        {days.map(({ day, isWeekend }) => {
          const key = `${user.id}_${day}`;
          const cell = gridState[key];
          const isNonWorking = cell?.shiftCode
            ? NON_WORKING_SHIFT_CODES.includes(cell.shiftCode as ShiftCode)
            : false;

          return (
            <td
              key={`a-${day}`}
              className={`p-0 ${isWeekend ? 'bg-gray-50' : ''} ${day === todayStr ? 'bg-blue-50' : ''}`}
            >
              <ScheduleCell
                type="activity"
                value={cell?.periodA || null}
                onChange={(v) => onCellChange(user.id, day, 'periodA', v)}
                disabled={isNonWorking}
              />
            </td>
          );
        })}
      </tr>
      {/* Row 3: Period B (下午) */}
      <tr className="border-b border-gray-100">
        {days.map(({ day, isWeekend }) => {
          const key = `${user.id}_${day}`;
          const cell = gridState[key];
          const isNonWorking = cell?.shiftCode
            ? NON_WORKING_SHIFT_CODES.includes(cell.shiftCode as ShiftCode)
            : false;

          return (
            <td
              key={`b-${day}`}
              className={`p-0 ${isWeekend ? 'bg-gray-50' : ''} ${day === todayStr ? 'bg-blue-50' : ''}`}
            >
              <ScheduleCell
                type="activity"
                value={cell?.periodB || null}
                onChange={(v) => onCellChange(user.id, day, 'periodB', v)}
                disabled={isNonWorking}
              />
            </td>
          );
        })}
      </tr>
      {/* Row 4: Period C (晚上) */}
      <tr className="border-b border-gray-300">
        {days.map(({ day, isWeekend }) => {
          const key = `${user.id}_${day}`;
          const cell = gridState[key];
          const isNonWorking = cell?.shiftCode
            ? NON_WORKING_SHIFT_CODES.includes(cell.shiftCode as ShiftCode)
            : false;

          return (
            <td
              key={`c-${day}`}
              className={`p-0 ${isWeekend ? 'bg-gray-50' : ''} ${day === todayStr ? 'bg-blue-50' : ''}`}
            >
              <ScheduleCell
                type="activity"
                value={cell?.periodC || null}
                onChange={(v) => onCellChange(user.id, day, 'periodC', v)}
                disabled={isNonWorking}
              />
            </td>
          );
        })}
      </tr>
    </>
  );
}
