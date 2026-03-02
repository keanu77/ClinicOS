'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Stethoscope } from 'lucide-react';
import { ClinicType, ClinicTypeLabels, Role } from '@/shared';
import { ClinicGrid } from './components/clinic-grid';
import { SlotEditorDialog } from './components/slot-editor-dialog';
import type { ClinicSlot } from './components/clinic-cell';

export default function ClinicSchedulePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [slots, setSlots] = useState<ClinicSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ClinicType>(ClinicType.SPORTS_MEDICINE);

  // Editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ClinicSlot | null>(null);

  const canManage =
    session?.user?.role === Role.SUPERVISOR || session?.user?.role === Role.ADMIN;

  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiGet<ClinicSlot[]>('/clinic-schedule/slots');
      setSlots(data);
    } catch {
      toast({ title: '載入失敗', description: '無法載入門診資料', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  const sportsSlots = slots.filter((s) => s.clinicType === ClinicType.SPORTS_MEDICINE);
  const specialSlots = slots.filter((s) => s.clinicType === ClinicType.SPECIAL);

  const handleEdit = (slot: ClinicSlot) => {
    if (!canManage) return;
    setEditingSlot(slot);
    setEditorOpen(true);
  };

  const handleAdd = () => {
    setEditingSlot(null);
    setEditorOpen(true);
  };

  const handleSave = async (data: Record<string, unknown>) => {
    if (editingSlot) {
      await apiPatch(`/clinic-schedule/slots/${editingSlot.id}`, data);
      toast({ title: '已更新', description: '門診時段已更新' });
    } else {
      await apiPost('/clinic-schedule/slots', data);
      toast({ title: '已新增', description: '門診時段已新增' });
    }
    fetchSlots();
  };

  const handleDelete = async (id: string) => {
    await apiDelete(`/clinic-schedule/slots/${id}`);
    toast({ title: '已刪除', description: '門診時段已刪除' });
    fetchSlots();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Stethoscope className="h-5 w-5 text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">門診時刻</h1>
            <p className="text-sm text-slate-500">查看各門診時段與醫師排班</p>
          </div>
        </div>
        {canManage && (
          <Button onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" />
            新增門診時段
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as ClinicType)}
          >
            <TabsList className="mb-4">
              <TabsTrigger value={ClinicType.SPORTS_MEDICINE}>
                {ClinicTypeLabels[ClinicType.SPORTS_MEDICINE]}
              </TabsTrigger>
              <TabsTrigger value={ClinicType.SPECIAL}>
                {ClinicTypeLabels[ClinicType.SPECIAL]}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={ClinicType.SPORTS_MEDICINE}>
              {loading ? (
                <div className="text-center py-12 text-slate-500">載入中...</div>
              ) : (
                <ClinicGrid
                  slots={sportsSlots}
                  onEdit={canManage ? handleEdit : undefined}
                />
              )}
            </TabsContent>

            <TabsContent value={ClinicType.SPECIAL}>
              {loading ? (
                <div className="text-center py-12 text-slate-500">載入中...</div>
              ) : (
                <ClinicGrid
                  slots={specialSlots}
                  onEdit={canManage ? handleEdit : undefined}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {canManage && (
        <SlotEditorDialog
          open={editorOpen}
          onClose={() => {
            setEditorOpen(false);
            setEditingSlot(null);
          }}
          onSave={handleSave}
          onDelete={handleDelete}
          slot={editingSlot}
          defaultClinicType={activeTab}
        />
      )}
    </div>
  );
}
