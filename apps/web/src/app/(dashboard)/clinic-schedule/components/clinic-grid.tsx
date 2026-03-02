'use client';

import {
  ClinicPeriod,
  ClinicPeriodLabels,
  ClinicPeriodTimeRanges,
  DayOfWeekLabels,
} from '@/shared';
import { ClinicCell, type ClinicSlot } from './clinic-cell';

interface ClinicGridProps {
  slots: ClinicSlot[];
  onEdit?: (slot: ClinicSlot) => void;
}

const PERIODS = [ClinicPeriod.MORNING, ClinicPeriod.AFTERNOON, ClinicPeriod.EVENING];
const DAYS = [1, 2, 3, 4, 5, 6];

export function ClinicGrid({ slots, onEdit }: ClinicGridProps) {
  const getSlots = (dayOfWeek: number, period: ClinicPeriod): ClinicSlot[] => {
    return slots
      .filter((s) => s.dayOfWeek === dayOfWeek && s.period === period)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border border-slate-200 bg-slate-50 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 w-28">
              時段
            </th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="border border-slate-200 bg-slate-50 px-3 py-2.5 text-center text-sm font-semibold text-slate-700"
              >
                {DayOfWeekLabels[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period) => {
            const timeRange = ClinicPeriodTimeRanges[period];
            return (
              <tr key={period}>
                <td className="border border-slate-200 bg-slate-50 px-3 py-2 align-top">
                  <div className="font-semibold text-sm text-slate-700">
                    {ClinicPeriodLabels[period]}
                  </div>
                  <div className="text-xs text-slate-500">
                    {timeRange.start}-{timeRange.end}
                  </div>
                </td>
                {DAYS.map((day) => {
                  const cellSlots = getSlots(day, period);
                  return (
                    <td
                      key={day}
                      className="border border-slate-200 px-2 py-1 align-top min-w-[120px]"
                    >
                      <ClinicCell slots={cellSlots} period={period} onEdit={onEdit} />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
