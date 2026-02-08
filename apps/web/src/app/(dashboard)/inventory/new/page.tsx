'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { InventoryCategory, InventoryCategoryLabels } from '@/shared';

interface CreateItemForm {
  name: string;
  description: string;
  category: string;
  unit: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  location: string;
  expiryDate: string;
}

export default function NewInventoryItemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<CreateItemForm>({
    name: '',
    description: '',
    category: InventoryCategory.OTHER,
    unit: '個',
    quantity: 0,
    minStock: 10,
    maxStock: 100,
    location: '',
    expiryDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast({
        title: '請填寫必填欄位',
        description: '品項名稱為必填',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        category: form.category,
        unit: form.unit || '個',
        quantity: form.quantity,
        minStock: form.minStock,
        maxStock: form.maxStock,
      };

      if (form.description.trim()) {
        payload.description = form.description.trim();
      }
      if (form.location.trim()) {
        payload.location = form.location.trim();
      }
      if (form.expiryDate) {
        payload.expiryDate = new Date(form.expiryDate).toISOString();
      }

      await apiPost('/inventory/items', payload);
      toast({ title: '品項已新增' });
      router.push('/inventory');
    } catch (error) {
      toast({
        title: '新增失敗',
        description: error instanceof Error ? error.message : '請稍後再試',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">新增庫存品項</h1>
          <p className="text-muted-foreground">填寫品項資訊</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>品項資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">品項名稱 *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例：生理食鹽水"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">分類 *</Label>
                <select
                  id="category"
                  className="w-full mt-1 p-2 border rounded-md"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {Object.values(InventoryCategory).map((cat) => (
                    <option key={cat} value={cat}>
                      {InventoryCategoryLabels[cat]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="unit">單位</Label>
                <Input
                  id="unit"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="例：個、瓶、盒"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">描述</Label>
              <textarea
                id="description"
                className="w-full mt-1 p-3 border rounded-md min-h-[80px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="品項描述..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity">初始數量</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minStock">最低存量警示</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={form.minStock}
                  onChange={(e) => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="maxStock">最高存量</Label>
                <Input
                  id="maxStock"
                  type="number"
                  min="0"
                  value={form.maxStock}
                  onChange={(e) => setForm({ ...form, maxStock: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">存放位置</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="例：藥櫃 A-1"
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">有效期限</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Link href="/inventory" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  取消
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? '新增中...' : '新增品項'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
