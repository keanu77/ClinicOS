'use client';

import {
  ShiftCode,
  ShiftCodeLabels,
  ShiftCodeColors,
  NON_WORKING_SHIFT_CODES,
  ActivityType,
  ActivityTypeLabels,
  ActivityTypeColors,
  WORKING_ACTIVITY_TYPES,
} from '@/shared';

interface ScheduleCellProps {
  type: 'shiftCode' | 'activity';
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

export function ScheduleCell({ type, value, onChange, disabled }: ScheduleCellProps) {
  if (type === 'shiftCode') {
    return (
      <ShiftCodeCell value={value} onChange={onChange} disabled={disabled} />
    );
  }
  return (
    <ActivityCell value={value} onChange={onChange} disabled={disabled} />
  );
}

function ShiftCodeCell({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  disabled?: boolean;
}) {
  const bgColor = value
    ? ShiftCodeColors[value as ShiftCode] || '#F3F4F6'
    : undefined;
  const isNonWorking = value
    ? NON_WORKING_SHIFT_CODES.includes(value as ShiftCode)
    : false;

  return (
    <select
      className={`
        w-full h-8 text-xs text-center rounded cursor-pointer font-semibold
        appearance-auto
        border border-gray-200 hover:border-blue-400
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
        transition-colors
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${!value ? 'text-gray-400' : ''}
      `}
      style={{
        backgroundColor: bgColor ? `${bgColor}25` : '#FAFAFA',
        color: value
          ? (isNonWorking ? '#9CA3AF' : bgColor || '#374151')
          : '#9CA3AF',
      }}
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled}
    >
      <option value="">-</option>
      {(Object.values(ShiftCode) as ShiftCode[]).map((code) => (
        <option key={code} value={code}>
          {code} {ShiftCodeLabels[code]}
        </option>
      ))}
    </select>
  );
}

function ActivityCell({
  value,
  onChange,
  disabled,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  disabled?: boolean;
}) {
  const color = value
    ? ActivityTypeColors[value as ActivityType] || '#6B7280'
    : undefined;

  return (
    <select
      className={`
        w-full h-7 text-xs text-center rounded cursor-pointer
        appearance-auto
        border border-gray-100 hover:border-blue-300
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
        transition-colors
        ${disabled ? 'opacity-40 cursor-not-allowed bg-gray-50' : ''}
        ${!value ? 'text-gray-400' : ''}
      `}
      style={{
        backgroundColor: disabled
          ? undefined
          : (color ? `${color}15` : '#FDFDFD'),
        color: value && !disabled ? color : '#C0C0C0',
      }}
      value={value || ''}
      onChange={(e) => onChange(e.target.value || null)}
      disabled={disabled}
    >
      <option value="">-</option>
      {WORKING_ACTIVITY_TYPES.map((at: ActivityType) => (
        <option key={at} value={at}>
          {ActivityTypeLabels[at]}
        </option>
      ))}
      <option value={ActivityType.NAT_HOLIDAY}>
        {ActivityTypeLabels[ActivityType.NAT_HOLIDAY]}
      </option>
      <option value={ActivityType.HOLIDAY}>
        {ActivityTypeLabels[ActivityType.HOLIDAY]}
      </option>
      <option value={ActivityType.DAY_OFF}>
        {ActivityTypeLabels[ActivityType.DAY_OFF]}
      </option>
    </select>
  );
}
