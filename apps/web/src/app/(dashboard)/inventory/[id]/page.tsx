'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost, apiPatch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTime } from '@/lib/utils';
import { getTxnBadgeVariant } from '@/lib/badge-variants';
import {
  ArrowLeft,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  Package,
  Edit,
  X,
} from 'lucide-react';
import Link from 'next/link';
import {
  InventoryTxnType,
  InventoryTxnTypeLabels,
  InventoryTxnTypeColors,
  Role,
} from '@/shared';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  unit: string;
  quantity: number;
  minStock: number;
  maxStock?: number;
  location?: string;
  expiryDate?: string;
  transactions: Array<{
    id: string;
    type: string;
    quantity: number;
    note?: string;
    createdAt: string;
    performedBy: { id: string; name: string };
  }>;
}

export default function InventoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [item, setItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Transaction form
  const [showTxnForm, setShowTxnForm] = useState(false);
  const [txnType, setTxnType] = useState<InventoryTxnType>(InventoryTxnType.IN);
  const [txnQuantity, setTxnQuantity] = useState('');
  const [txnNote, setTxnNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit form
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    minStock: 0,
    maxStock: 0,
    location: '',
  });

  const fetchItem = async () => {
    try {
      const result = await apiGet<InventoryItem>(`/inventory/items/${params.id}`);
      setItem(result);
      setEditForm({
        name: result.name,
        description: result.description || '',
        minStock: result.minStock,
        maxStock: result.maxStock || 0,
        location: result.location || '',
      });
    } catch (error) {
      console.error('Failed to load item:', error);
      toast({
        title: '載入失敗',
        description: '無法載入品項詳情',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [params.id]);

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(txnQuantity);
    if (!qty || qty <= 0) {
      toast({ title: '請輸入有效數量', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await apiPost('/inventory/txns', {
        itemId: params.id,
        type: txnType,
        quantity: qty,
        note: txnNote || undefined,
      });

      toast({ title: '異動已記錄' });
      setShowTxnForm(false);
      setTxnQuantity('');
      setTxnNote('');
      await fetchItem();
    } catch (error: any) {
      toast({
        title: '異動失敗',
        description: error.message || '無法完成異動',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await apiPatch(`/inventory/items/${params.id}`, editForm);
      toast({ title: '品項已更新' });
      setIsEditing(false);
      await fetchItem();
    } catch (error) {
      toast({
        title: '更新失敗',
        variant: 'destructive',
      });
    }
  };

  const isAdmin = session?.user?.role === Role.ADMIN;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">載入中...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">找不到此品項</p>
        <Link href="/inventory">
          <Button className="mt-4">返回列表</Button>
        </Link>
      </div>
    );
  }

  const isLowStock = item.quantity <= item.minStock;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/inventory">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground">{item.sku}</span>
            {isLowStock && (
              <Badge variant="warning">
                <AlertTriangle className="h-3 w-3 mr-1" />
                低庫存
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
        </div>
        {isAdmin && !isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            編輯
          </Button>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>編輯品項</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>品項名稱</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>說明</Label>
                <textarea
                  className="w-full mt-1 p-3 border rounded-md min-h-[80px]"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>最低存量</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.minStock}
                    onChange={(e) => setEditForm({ ...editForm, minStock: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>最高存量</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.maxStock}
                    onChange={(e) => setEditForm({ ...editForm, maxStock: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <Label>儲存位置</Label>
                <Input
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                  取消
                </Button>
                <Button className="flex-1" onClick={handleSaveEdit}>
                  儲存
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Item Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <div
                className={`text-5xl font-bold ${
                  isLowStock ? 'text-orange-600' : 'text-primary'
                }`}
              >
                {item.quantity}
              </div>
              <div className="text-muted-foreground mt-1">{item.unit}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">最低存量：</span>
              <span className="font-medium">
                {item.minStock} {item.unit}
              </span>
            </div>
            {item.maxStock && (
              <div>
                <span className="text-muted-foreground">最高存量：</span>
                <span className="font-medium">
                  {item.maxStock} {item.unit}
                </span>
              </div>
            )}
            {item.location && (
              <div>
                <span className="text-muted-foreground">位置：</span>
                <span className="font-medium">{item.location}</span>
              </div>
            )}
            {item.expiryDate && (
              <div>
                <span className="text-muted-foreground">有效期限：</span>
                <span className="font-medium">
                  {formatDateTime(item.expiryDate)}
                </span>
              </div>
            )}
          </div>

          {item.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">庫存異動</CardTitle>
        </CardHeader>
        <CardContent>
          {!showTxnForm ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setTxnType(InventoryTxnType.IN);
                  setShowTxnForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                入庫
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setTxnType(InventoryTxnType.OUT);
                  setShowTxnForm(true);
                }}
              >
                <Minus className="h-4 w-4 mr-2" />
                出庫
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setTxnType(InventoryTxnType.ADJUST);
                  setShowTxnForm(true);
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                調整
              </Button>
            </div>
          ) : (
            <form onSubmit={handleTransaction} className="space-y-4">
              <div className="flex gap-2">
                {Object.values(InventoryTxnType).map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={txnType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTxnType(type)}
                  >
                    {InventoryTxnTypeLabels[type]}
                  </Button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>數量</Label>
                  <Input
                    type="number"
                    min="1"
                    value={txnQuantity}
                    onChange={(e) => setTxnQuantity(e.target.value)}
                    placeholder="輸入數量"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>備註（選填）</Label>
                  <Input
                    value={txnNote}
                    onChange={(e) => setTxnNote(e.target.value)}
                    placeholder="異動原因..."
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? '處理中...' : '確認異動'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTxnForm(false)}
                >
                  取消
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">異動紀錄</CardTitle>
        </CardHeader>
        <CardContent>
          {item.transactions && item.transactions.length > 0 ? (
            <div className="space-y-3">
              {item.transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={getTxnBadgeVariant(txn.type)}>
                      {InventoryTxnTypeLabels[txn.type as InventoryTxnType]}
                    </Badge>
                    <span
                      className={`font-medium ${
                        txn.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {txn.quantity > 0 ? '+' : ''}
                      {txn.quantity}
                    </span>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-muted-foreground">
                      {txn.performedBy.name}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {formatDateTime(txn.createdAt)}
                    </div>
                    {txn.note && (
                      <div className="text-xs mt-1">{txn.note}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              尚無異動紀錄
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
