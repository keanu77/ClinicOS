"use client";

import { ClinicPeriodTimeRanges, type ClinicPeriod } from "@/shared";

export interface ClinicSlot {
  id: string;
  clinicType: string;
  year: number;
  month: number;
  dayOfWeek: number;
  period: string;
  doctorName: string;
  doctorId?: string | null;
  specialtyName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  registrationCutoff?: string | null;
  maxPatients?: number | null;
  clinicStartTime?: string | null;
  isAppointmentOnly: boolean;
  specificDates?: string | null;
  sortOrder: number;
  notes?: string | null;
}

interface ClinicCellProps {
  slots: ClinicSlot[];
  period: ClinicPeriod;
  onEdit?: (slot: ClinicSlot) => void;
}

function parseSpecificDates(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function SlotContent({
  slot,
  period,
  onEdit,
}: {
  slot: ClinicSlot;
  period: ClinicPeriod;
  onEdit?: (slot: ClinicSlot) => void;
}) {
  const defaultRange = ClinicPeriodTimeRanges[period];
  const startTime = slot.startTime || defaultRange.start;
  const endTime = slot.endTime || defaultRange.end;
  const specificDates = parseSpecificDates(slot.specificDates);

  return (
    <div
      className={`py-1.5 ${onEdit ? "cursor-pointer hover:bg-slate-50 rounded px-1 -mx-1" : ""}`}
      onClick={onEdit ? () => onEdit(slot) : undefined}
    >
      {slot.specialtyName && (
        <div className="font-bold text-blue-800 text-sm leading-tight">
          {slot.specialtyName}
        </div>
      )}
      <div className="font-bold text-slate-800 text-sm">{slot.doctorName}</div>
      {(slot.startTime || slot.endTime) && (
        <div className="text-xs text-slate-500">
          {startTime}-{endTime}
        </div>
      )}
      {slot.registrationCutoff && (
        <div className="text-xs text-red-600 font-medium">
          報到截止 {slot.registrationCutoff}
        </div>
      )}
      {slot.maxPatients && (
        <div className="text-xs text-red-600 font-medium">
          限掛{slot.maxPatients}名
        </div>
      )}
      {slot.clinicStartTime && (
        <div className="text-xs text-red-600 font-medium">
          {slot.clinicStartTime}開診
        </div>
      )}
      {slot.isAppointmentOnly && (
        <div className="text-xs text-red-600 font-medium">預約制</div>
      )}
      {slot.notes === "醫師約診" && (
        <div className="text-xs text-red-600 font-medium">醫師約診</div>
      )}
      {specificDates.length > 0 && (
        <div className="text-xs text-slate-500">
          ({specificDates.join("、")})
        </div>
      )}
    </div>
  );
}

export function ClinicCell({ slots, period, onEdit }: ClinicCellProps) {
  if (slots.length === 0) {
    return <div className="text-center text-slate-400 py-3">--</div>;
  }

  if (slots.length === 1) {
    return <SlotContent slot={slots[0]} period={period} onEdit={onEdit} />;
  }

  return (
    <div className="divide-y divide-slate-200">
      {slots.map((slot) => (
        <SlotContent
          key={slot.id}
          slot={slot}
          period={period}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
