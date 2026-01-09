'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import {
  ShiftType,
  ShiftTypeLabels,
  ShiftTypeColors,
} from '@clinic-os/shared';

interface Shift {
  id: string;
  date: string;
  type: string;
  user: { id: string; name: string };
  notes?: string;
}

interface WeeklySchedule {
  startDate: string;
  endDate: string;
  schedule: Array<{
    date: string;
    shifts: Record<string, Shift[]>;
  }>;
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function SchedulingPage() {
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek;
    return new Date(today.setDate(diff));
  });

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const startStr = currentWeekStart.toISOString().split('T')[0];
      const result = await apiGet<WeeklySchedule>(
        `/scheduling/shifts/weekly?start=${startStr}`
      );
      setSchedule(result);
    } catch (error) {
      console.error('Failed to load schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [currentWeekStart]);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek;
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!confirm('確定要刪除此班次嗎？')) return;

    try {
      await apiDelete(`/scheduling/shifts/${shiftId}`);
      toast({ title: '班次已刪除' });
      await fetchSchedule();
    } catch (error) {
      toast({
        title: '刪除失敗',
        variant: 'destructive',
      });
    }
  };

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekday = WEEKDAYS[date.getDay()];
    return { month, day, weekday };
  };

  const isToday = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const getShiftBadgeColor = (type: string) => {
    switch (type) {
      case 'MORNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'AFTERNOON':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'NIGHT':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">排班系統</h1>
          <p className="text-muted-foreground">管理人員班表</p>
        </div>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-4">
              <span className="font-medium">
                {schedule?.startDate
                  ? new Date(schedule.startDate).toLocaleDateString('zh-TW')
                  : ''}{' '}
                -{' '}
                {schedule?.endDate
                  ? new Date(schedule.endDate).toLocaleDateString('zh-TW')
                  : ''}
              </span>
              <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
                本週
              </Button>
            </div>
            <Button variant="outline" size="icon" onClick={goToNextWeek}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">載入中...</div>
        </div>
      ) : schedule ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium w-24">班別</th>
                    {schedule.schedule.map((day) => {
                      const { month, day: d, weekday } = formatDateHeader(day.date);
                      const today = isToday(day.date);
                      return (
                        <th
                          key={day.date}
                          className={`p-3 text-center font-medium ${
                            today ? 'bg-primary/10' : ''
                          }`}
                        >
                          <div className="text-xs text-muted-foreground">
                            週{weekday}
                          </div>
                          <div className={today ? 'text-primary font-bold' : ''}>
                            {month}/{d}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Object.values(ShiftType).map((shiftType) => (
                    <tr key={shiftType} className="border-b">
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={getShiftBadgeColor(shiftType)}
                        >
                          {ShiftTypeLabels[shiftType]}
                        </Badge>
                      </td>
                      {schedule.schedule.map((day) => {
                        const shifts = day.shifts[shiftType] || [];
                        const today = isToday(day.date);
                        return (
                          <td
                            key={`${day.date}-${shiftType}`}
                            className={`p-2 min-w-[120px] ${
                              today ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="space-y-1">
                              {shifts.map((shift) => (
                                <div
                                  key={shift.id}
                                  className="flex items-center justify-between group p-1 rounded hover:bg-gray-100"
                                >
                                  <span className="text-sm">
                                    {shift.user.name}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                    onClick={() => handleDeleteShift(shift.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                              {shifts.length === 0 && (
                                <div className="text-xs text-muted-foreground text-center py-1">
                                  -
                                </div>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Legend */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted-foreground">班別說明：</span>
            {Object.values(ShiftType).map((type) => (
              <div key={type} className="flex items-center gap-2">
                <Badge variant="outline" className={getShiftBadgeColor(type)}>
                  {ShiftTypeLabels[type]}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
