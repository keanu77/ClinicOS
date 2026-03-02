'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CopyMonthDialogProps {
  open: boolean;
  onClose: () => void;
  onCopy: (sourceYear: number, sourceMonth: number, targetYear: number, targetMonth: number) => Promise<void>;
  targetYear: number;
  targetMonth: number;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function yearOptions(center: number) {
  return [center - 1, center, center + 1];
}

export function CopyMonthDialog({
  open,
  onClose,
  onCopy,
  targetYear,
  targetMonth,
}: CopyMonthDialogProps) {
  const [loading, setLoading] = useState(false);
  const [sourceYear, setSourceYear] = useState(targetYear);
  const [sourceMonth, setSourceMonth] = useState(
    targetMonth === 1 ? 12 : targetMonth - 1,
  );

  const handleCopy = async () => {
    setLoading(true);
    try {
      await onCopy(sourceYear, sourceMonth, targetYear, targetMonth);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const years = yearOptions(targetYear);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>複製月份門診</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
            將來源月份的門診排班複製到 <strong>{targetYear}年{targetMonth}月</strong>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>來源年份</Label>
              <Select
                value={sourceYear.toString()}
                onValueChange={(v) => setSourceYear(parseInt(v, 10))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={y.toString()}>{y}年</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>來源月份</Label>
              <Select
                value={sourceMonth.toString()}
                onValueChange={(v) => setSourceMonth(parseInt(v, 10))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m.toString()}>{m}月</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {sourceYear === targetYear && sourceMonth === targetMonth && (
            <div className="text-sm text-red-600">
              來源月份不能與目標月份相同
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            取消
          </Button>
          <Button
            onClick={handleCopy}
            disabled={loading || (sourceYear === targetYear && sourceMonth === targetMonth)}
          >
            {loading ? '複製中...' : '確認複製'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
