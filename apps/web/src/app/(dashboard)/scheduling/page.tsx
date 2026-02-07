'use client';

import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import {
  ShiftType,
  ShiftTypeLabels,
} from '@/shared';
import { ScheduleSkeleton } from '@/components/ui/skeleton';

interface User {
  id: string;
  name: string;
}

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
  const [users, setUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [shiftForm, setShiftForm] = useState({
    userId: '',
    date: '',
    type: 'MORNING' as string,
    notes: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    shiftId: string | null;
  }>({ open: false, shiftId: null });
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

  const fetchUsers = async () => {
    try {
      const result = await apiGet<User[]>('/users');
      setUsers(result || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  useEffect(() => {
    fetchSchedule();
    fetchUsers();
  }, [currentWeekStart]);

  const handleAddShift = async () => {
    if (!shiftForm.userId || !shiftForm.date || !shiftForm.type) {
      toast({ title: '請填寫必填欄位', variant: 'destructive' });
      return;
    }
    try {
      await apiPost('/scheduling/shifts', shiftForm);
      toast({ title: '班次新增成功' });
      setShowAddModal(false);
      setShiftForm({ userId: '', date: '', type: 'MORNING', notes: '' });
      fetchSchedule();
    } catch (error) {
      toast({ title: '新增失敗', variant: 'destructive' });
    }
  };

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

  const handleDeleteShift = async () => {
    if (!deleteConfirm.shiftId) return;

    try {
      await apiDelete(`/scheduling/shifts/${deleteConfirm.shiftId}`);
      toast({ title: '班次已刪除' });
      await fetchSchedule();
    } catch (error) {
      toast({
        title: '刪除失敗',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirm({ open: false, shiftId: null });
    }
  };

  const openDeleteConfirm = (shiftId: string) => {
    setDeleteConfirm({ open: true, shiftId });
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
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新增班次
        </Button>
      </div>

      {/* Add Shift Dialog */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增班次</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="shift-user">選擇人員 *</Label>
              <select
                id="shift-user"
                className="w-full mt-1 p-2 border rounded-md"
                value={shiftForm.userId}
                onChange={(e) => setShiftForm({ ...shiftForm, userId: e.target.value })}
              >
                <option value="">請選擇人員</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="shift-date">日期 *</Label>
              <Input
                id="shift-date"
                type="date"
                value={shiftForm.date}
                onChange={(e) => setShiftForm({ ...shiftForm, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="shift-type">班別 *</Label>
              <select
                id="shift-type"
                className="w-full mt-1 p-2 border rounded-md"
                value={shiftForm.type}
                onChange={(e) => setShiftForm({ ...shiftForm, type: e.target.value })}
              >
                {Object.values(ShiftType).map((type) => (
                  <option key={type} value={type}>{ShiftTypeLabels[type]}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="shift-notes">備註</Label>
              <Input
                id="shift-notes"
                value={shiftForm.notes}
                onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
                placeholder="選填"
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              取消
            </Button>
            <Button onClick={handleAddShift}>
              新增
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="確定要刪除此班次嗎？"
        description="此操作無法復原。"
        confirmText="刪除"
        cancelText="取消"
        variant="destructive"
        onConfirm={handleDeleteShift}
      />

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
        <Card>
          <CardContent className="p-6">
            <ScheduleSkeleton />
          </CardContent>
        </Card>
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
                                    onClick={() => openDeleteConfirm(shift.id)}
                                    aria-label="刪除班次"
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
