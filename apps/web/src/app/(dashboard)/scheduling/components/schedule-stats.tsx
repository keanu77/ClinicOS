'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ActivityType,
  ActivityTypeLabels,
  ActivityTypeFullLabels,
  ActivityTypeColors,
  ShiftCode,
  ShiftCodeLabels,
} from '@/shared';

interface UserStat {
  userId: string;
  userName: string;
  position: string;
  stats: Record<string, number>;
  workingDays: number;
  offDays: number;
  totalDays: number;
}

interface ScheduleStatsProps {
  stats: UserStat[] | null;
  loading: boolean;
}

const ACTIVITY_COLUMNS: { key: string; label: string; color: string }[] = [
  { key: ActivityType.SPORTS, label: ActivityTypeLabels[ActivityType.SPORTS], color: ActivityTypeColors[ActivityType.SPORTS] },
  { key: ActivityType.ELECTRO, label: ActivityTypeLabels[ActivityType.ELECTRO], color: ActivityTypeColors[ActivityType.ELECTRO] },
  { key: ActivityType.NURSING, label: ActivityTypeLabels[ActivityType.NURSING], color: ActivityTypeColors[ActivityType.NURSING] },
  { key: ActivityType.ASSISTANT, label: ActivityTypeLabels[ActivityType.ASSISTANT], color: ActivityTypeColors[ActivityType.ASSISTANT] },
  { key: ActivityType.RECEPTION, label: ActivityTypeLabels[ActivityType.RECEPTION], color: ActivityTypeColors[ActivityType.RECEPTION] },
  { key: ActivityType.ADMIN_WORK, label: ActivityTypeLabels[ActivityType.ADMIN_WORK], color: ActivityTypeColors[ActivityType.ADMIN_WORK] },
];

const OFF_COLUMNS: { key: string; label: string }[] = [
  { key: ShiftCode.OF, label: ShiftCodeLabels[ShiftCode.OF] },
  { key: ShiftCode.ZZ, label: ShiftCodeLabels[ShiftCode.ZZ] },
  { key: ShiftCode.QQ, label: ShiftCodeLabels[ShiftCode.QQ] },
  { key: ShiftCode.NN, label: ShiftCodeLabels[ShiftCode.NN] },
];

export function ScheduleStats({ stats, loading }: ScheduleStatsProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-32 bg-gray-100 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          暫無統計資料
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">月統計</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-2 text-left font-medium sticky left-0 bg-gray-50 z-10">人員</th>
                <th className="p-2 text-center font-medium">上班</th>
                {ACTIVITY_COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className="p-2 text-center font-medium"
                    style={{ color: col.color }}
                  >
                    {col.label}
                  </th>
                ))}
                {OFF_COLUMNS.map((col) => (
                  <th key={col.key} className="p-2 text-center font-medium text-gray-500">
                    {col.label}
                  </th>
                ))}
                <th className="p-2 text-center font-medium">休假</th>
                <th className="p-2 text-center font-medium">合計</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((user) => (
                <tr key={user.userId} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium sticky left-0 bg-white z-10">
                    {user.userName}
                  </td>
                  <td className="p-2 text-center font-semibold text-blue-600">
                    {user.workingDays}
                  </td>
                  {ACTIVITY_COLUMNS.map((col) => (
                    <td
                      key={col.key}
                      className="p-2 text-center"
                      style={{ color: col.color }}
                    >
                      {user.stats[col.key] || 0}
                    </td>
                  ))}
                  {OFF_COLUMNS.map((col) => (
                    <td key={col.key} className="p-2 text-center text-gray-500">
                      {user.stats[col.key] || 0}
                    </td>
                  ))}
                  <td className="p-2 text-center text-gray-600">
                    {user.offDays}
                  </td>
                  <td className="p-2 text-center font-semibold">
                    {user.totalDays}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
