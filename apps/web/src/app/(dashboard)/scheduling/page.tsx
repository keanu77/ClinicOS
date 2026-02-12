'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Save, Upload, Download } from 'lucide-react';
import {
  ScheduleDepartment,
  ScheduleDepartmentLabels,
  NON_WORKING_SHIFT_CODES,
  ShiftCode,
  ShiftCodeLabels,
  ActivityTypeLabels,
  ActivityType,
} from '@/shared';
import { MonthNavigator } from './components/month-navigator';
import { ScheduleGrid, type GridState, type CellData } from './components/schedule-grid';
import { ScheduleStats } from './components/schedule-stats';
import { ImportDialog } from './components/import-dialog';
import { ExportButton } from './components/export-button';

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

interface UserStat {
  userId: string;
  userName: string;
  position: string;
  stats: Record<string, number>;
  workingDays: number;
  offDays: number;
  totalDays: number;
}

interface StaffUser {
  id: string;
  name: string;
  position: string;
  role: string;
}

export default function SchedulingPage() {
  const { toast } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [department, setDepartment] = useState<string>(ScheduleDepartment.SPORTS_MEDICINE);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [stats, setStats] = useState<UserStat[] | null>(null);
  const [gridState, setGridState] = useState<GridState>({});
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Track original state to detect changes
  const [originalGridState, setOriginalGridState] = useState<GridState>({});

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiGet<{
        year: number;
        month: number;
        entries: ScheduleEntry[];
      }>('/scheduling/monthly', {
        year,
        month,
        department,
      });

      setEntries(result.entries);

      // Build grid state from entries
      const state: GridState = {};
      for (const entry of result.entries) {
        const day = new Date(entry.date).getDate();
        const key = `${entry.userId}_${day}`;
        state[key] = {
          shiftCode: entry.shiftCode,
          periodA: entry.periodA,
          periodB: entry.periodB,
          periodC: entry.periodC,
        };
      }
      setGridState(state);
      setOriginalGridState(JSON.parse(JSON.stringify(state)));
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  }, [year, month, department]);

  const fetchUsers = useCallback(async () => {
    try {
      const result = await apiGet<StaffUser[] | Record<string, StaffUser[]>>(
        '/scheduling/departments/staff',
        { department },
      );

      if (Array.isArray(result)) {
        setUsers(result);
      } else {
        // Grouped response
        setUsers((result as any)[department] || []);
      }
    } catch (error) {
      console.error('Failed to load staff:', error);
    }
  }, [department]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const result = await apiGet<{
        year: number;
        month: number;
        userStats: UserStat[];
      }>('/scheduling/monthly/stats', {
        year,
        month,
        department,
      });
      setStats(result.userStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [year, month, department]);

  useEffect(() => {
    fetchSchedule();
    fetchUsers();
    fetchStats();
  }, [fetchSchedule, fetchUsers, fetchStats]);

  const handleNavigate = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  const handleCellChange = (
    userId: string,
    day: number,
    field: keyof CellData,
    value: string | null,
  ) => {
    setGridState((prev) => {
      const key = `${userId}_${day}`;
      const current = prev[key] || {
        shiftCode: null,
        periodA: null,
        periodB: null,
        periodC: null,
      };

      const updated = { ...current, [field]: value };

      // If shiftCode changed to a non-working code, clear activities
      if (field === 'shiftCode' && value && NON_WORKING_SHIFT_CODES.includes(value as ShiftCode)) {
        updated.periodA = null;
        updated.periodB = null;
        updated.periodC = null;
      }

      return { ...prev, [key]: updated };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Collect all cells that have data
      const entriesToSave: Array<{
        date: string;
        department: string;
        shiftCode: string;
        periodA?: string;
        periodB?: string;
        periodC?: string;
        userId: string;
      }> = [];

      for (const [key, cell] of Object.entries(gridState)) {
        if (!cell.shiftCode) continue; // Skip empty cells

        const [userId, dayStr] = key.split('_');
        const day = parseInt(dayStr, 10);
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        entriesToSave.push({
          date: dateStr,
          department,
          shiftCode: cell.shiftCode,
          periodA: cell.periodA || undefined,
          periodB: cell.periodB || undefined,
          periodC: cell.periodC || undefined,
          userId,
        });
      }

      if (entriesToSave.length === 0) {
        toast({ title: '沒有需要儲存的排班資料' });
        setSaving(false);
        return;
      }

      await apiPost('/scheduling/monthly/bulk', { entries: entriesToSave });
      toast({ title: `已儲存 ${entriesToSave.length} 筆排班資料` });
      setHasChanges(false);
      setOriginalGridState(JSON.parse(JSON.stringify(gridState)));

      // Refresh stats
      fetchStats();
    } catch (error: any) {
      toast({ title: error.message || '儲存失敗', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDepartmentChange = (dept: string) => {
    setDepartment(dept);
  };

  // Legend items
  const shiftLegend = (Object.values(ShiftCode) as ShiftCode[]).map((code) => ({
    code,
    label: ShiftCodeLabels[code],
  }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">排班系統</h1>
          <p className="text-muted-foreground">月班表管理</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-2" />
            匯入
          </Button>
          <ExportButton year={year} month={month} department={department} />
          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? '儲存中...' : '儲存'}
          </Button>
        </div>
      </div>

      {/* Month Navigator */}
      <Card>
        <CardContent className="py-3">
          <MonthNavigator year={year} month={month} onNavigate={handleNavigate} />
        </CardContent>
      </Card>

      {/* Department Tabs */}
      <Tabs value={department} onValueChange={handleDepartmentChange}>
        <TabsList>
          {(Object.values(ScheduleDepartment) as ScheduleDepartment[]).map((dept) => (
            <TabsTrigger key={dept} value={dept}>
              {ScheduleDepartmentLabels[dept]}
            </TabsTrigger>
          ))}
        </TabsList>

        {(Object.values(ScheduleDepartment) as ScheduleDepartment[]).map((dept) => (
          <TabsContent key={dept} value={dept} className="space-y-4">
            {/* Schedule Grid */}
            <ScheduleGrid
              year={year}
              month={month}
              entries={entries.filter((e) => e.department === dept)}
              users={users}
              gridState={gridState}
              onCellChange={handleCellChange}
              loading={loading}
            />

            {/* Stats Panel */}
            <ScheduleStats stats={stats} loading={statsLoading} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Legend */}
      <Card>
        <CardContent className="py-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-muted-foreground font-medium">班別：</span>
              {shiftLegend.map(({ code, label }) => (
                <span key={code} className="px-1.5 py-0.5 rounded bg-gray-100">
                  <span className="font-semibold">{code}</span> {label}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="text-muted-foreground font-medium">活動：</span>
              {(Object.values(ActivityType) as ActivityType[]).map((at) => (
                <span key={at} className="px-1.5 py-0.5 rounded bg-gray-100">
                  {ActivityTypeLabels[at]}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Dialog */}
      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        department={department}
        year={year}
        month={month}
        onSuccess={() => {
          fetchSchedule();
          fetchStats();
        }}
      />
    </div>
  );
}
