'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ClinicType,
  ClinicTypeLabels,
  ClinicPeriod,
  ClinicPeriodLabels,
  DayOfWeekLabels,
} from '@/shared';
import type { ClinicSlot } from './clinic-cell';

interface SlotEditorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  slot?: ClinicSlot | null;
  defaultClinicType?: ClinicType;
}

export function SlotEditorDialog({
  open,
  onClose,
  onSave,
  onDelete,
  slot,
  defaultClinicType,
}: SlotEditorDialogProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clinicType: defaultClinicType || ClinicType.SPORTS_MEDICINE,
    dayOfWeek: 1,
    period: ClinicPeriod.MORNING as string,
    doctorName: '',
    specialtyName: '',
    startTime: '',
    endTime: '',
    registrationCutoff: '',
    maxPatients: '',
    clinicStartTime: '',
    isAppointmentOnly: false,
    specificDates: '',
    notes: '',
  });

  useEffect(() => {
    if (slot) {
      const dates = slot.specificDates
        ? (() => {
            try { return JSON.parse(slot.specificDates).join(', '); } catch { return ''; }
          })()
        : '';
      setForm({
        clinicType: slot.clinicType as ClinicType,
        dayOfWeek: slot.dayOfWeek,
        period: slot.period,
        doctorName: slot.doctorName,
        specialtyName: slot.specialtyName || '',
        startTime: slot.startTime || '',
        endTime: slot.endTime || '',
        registrationCutoff: slot.registrationCutoff || '',
        maxPatients: slot.maxPatients?.toString() || '',
        clinicStartTime: slot.clinicStartTime || '',
        isAppointmentOnly: slot.isAppointmentOnly,
        specificDates: dates,
        notes: slot.notes || '',
      });
    } else {
      setForm({
        clinicType: defaultClinicType || ClinicType.SPORTS_MEDICINE,
        dayOfWeek: 1,
        period: ClinicPeriod.MORNING,
        doctorName: '',
        specialtyName: '',
        startTime: '',
        endTime: '',
        registrationCutoff: '',
        maxPatients: '',
        clinicStartTime: '',
        isAppointmentOnly: false,
        specificDates: '',
        notes: '',
      });
    }
  }, [slot, defaultClinicType]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const dates = form.specificDates.trim()
        ? JSON.stringify(form.specificDates.split(/[,、]/).map((d) => d.trim()).filter(Boolean))
        : null;

      await onSave({
        clinicType: form.clinicType,
        dayOfWeek: form.dayOfWeek,
        period: form.period,
        doctorName: form.doctorName,
        specialtyName: form.specialtyName || null,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        registrationCutoff: form.registrationCutoff || null,
        maxPatients: form.maxPatients ? parseInt(form.maxPatients, 10) : null,
        clinicStartTime: form.clinicStartTime || null,
        isAppointmentOnly: form.isAppointmentOnly,
        specificDates: dates,
        notes: form.notes || null,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!slot || !onDelete) return;
    if (!confirm('確定要刪除此門診時段嗎？')) return;
    setLoading(true);
    try {
      await onDelete(slot.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{slot ? '編輯門診時段' : '新增門診時段'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>門診類型</Label>
              <Select
                value={form.clinicType}
                onValueChange={(v) => setForm({ ...form, clinicType: v as ClinicType })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ClinicTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>時段</Label>
              <Select
                value={form.period}
                onValueChange={(v) => setForm({ ...form, period: v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ClinicPeriodLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>星期</Label>
              <Select
                value={form.dayOfWeek.toString()}
                onValueChange={(v) => setForm({ ...form, dayOfWeek: parseInt(v, 10) })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DayOfWeekLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>醫師姓名 *</Label>
              <Input
                value={form.doctorName}
                onChange={(e) => setForm({ ...form, doctorName: e.target.value })}
                placeholder="醫師姓名"
              />
            </div>
          </div>

          {form.clinicType === ClinicType.SPECIAL && (
            <div>
              <Label>特別門診名稱</Label>
              <Input
                value={form.specialtyName}
                onChange={(e) => setForm({ ...form, specialtyName: e.target.value })}
                placeholder="例：脊椎特別門診"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>起始時間</Label>
              <Input
                value={form.startTime}
                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                placeholder="08:30"
              />
            </div>
            <div>
              <Label>結束時間</Label>
              <Input
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                placeholder="11:30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>報到截止時間</Label>
              <Input
                value={form.registrationCutoff}
                onChange={(e) => setForm({ ...form, registrationCutoff: e.target.value })}
                placeholder="11:00"
              />
            </div>
            <div>
              <Label>限掛人數</Label>
              <Input
                type="number"
                value={form.maxPatients}
                onChange={(e) => setForm({ ...form, maxPatients: e.target.value })}
                placeholder="不限"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>開診時間</Label>
              <Input
                value={form.clinicStartTime}
                onChange={(e) => setForm({ ...form, clinicStartTime: e.target.value })}
                placeholder="14:30"
              />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isAppointmentOnly}
                  onChange={(e) => setForm({ ...form, isAppointmentOnly: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300"
                />
                預約制
              </label>
            </div>
          </div>

          <div>
            <Label>特定日期（逗號分隔）</Label>
            <Input
              value={form.specificDates}
              onChange={(e) => setForm({ ...form, specificDates: e.target.value })}
              placeholder="3/7, 3/21"
            />
          </div>

          <div>
            <Label>備註</Label>
            <Input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="備註"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {slot && onDelete && (
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                刪除
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={loading || !form.doctorName}>
              {loading ? '儲存中...' : '儲存'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
