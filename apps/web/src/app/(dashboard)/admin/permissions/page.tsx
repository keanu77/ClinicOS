'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost } from '@/lib/api';
import { usePermissions } from '@/lib/hooks';
import {
  Permission,
  PermissionLabels,
  PermissionCategories,
  Position,
  PositionLabels,
} from '@/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X, Shield, Search, Users, KeyRound } from 'lucide-react';

interface UserPermissionMatrix {
  userId: string;
  name: string;
  email: string;
  position: Position;
  permissions: Permission[];
  customPermissionCount: number;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function PermissionsPage() {
  const { data: session } = useSession();
  const { hasPermission } = usePermissions();
  const [matrix, setMatrix] = useState<UserPermissionMatrix[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserPermissionMatrix | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [saving, setSaving] = useState(false);
  const [userPermissionDetails, setUserPermissionDetails] = useState<{
    effectivePermissions: Permission[];
    customPermissions: { permission: Permission; granted: boolean }[];
  } | null>(null);

  useEffect(() => {
    fetchMatrix();
  }, []);

  const fetchMatrix = async () => {
    try {
      setLoading(true);
      const data = await apiGet<PaginatedResponse<UserPermissionMatrix>>(
        '/permissions/matrix',
        { limit: 100 }
      );
      setMatrix(data.items);
    } catch (error) {
      console.error('Failed to fetch permission matrix:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (user: UserPermissionMatrix) => {
    setSelectedUser(user);
    try {
      const details = await apiGet<{
        effectivePermissions: Permission[];
        customPermissions: { permission: Permission; granted: boolean }[];
      }>(`/permissions/users/${user.userId}`);
      setUserPermissionDetails(details);
      setEditDialogOpen(true);
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
    }
  };

  const handleGrantPermission = async (permission: Permission) => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await apiPost(`/permissions/users/${selectedUser.userId}/grant`, {
        permission,
        reason: '管理者手動授予',
      });
      // 重新載入使用者權限
      const details = await apiGet<{
        effectivePermissions: Permission[];
        customPermissions: { permission: Permission; granted: boolean }[];
      }>(`/permissions/users/${selectedUser.userId}`);
      setUserPermissionDetails(details);
      fetchMatrix();
    } catch (error) {
      console.error('Failed to grant permission:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleRevokePermission = async (permission: Permission) => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      await apiPost(`/permissions/users/${selectedUser.userId}/revoke`, {
        permission,
        reason: '管理者手動撤銷',
      });
      const details = await apiGet<{
        effectivePermissions: Permission[];
        customPermissions: { permission: Permission; granted: boolean }[];
      }>(`/permissions/users/${selectedUser.userId}`);
      setUserPermissionDetails(details);
      fetchMatrix();
    } catch (error) {
      console.error('Failed to revoke permission:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredMatrix = matrix.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allPermissions = Object.values(Permission);
  const filteredPermissions =
    selectedCategory === 'all'
      ? allPermissions
      : PermissionCategories[selectedCategory]?.permissions || [];

  if (!hasPermission(Permission.PERMISSIONS_MANAGE)) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Shield className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground">無權限存取</h2>
        <p className="text-sm text-muted-foreground mt-2">
          您沒有權限管理權限。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">權限管理</h1>
          <p className="text-muted-foreground">
            管理使用者權限與存取控制
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">使用者總數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matrix.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">權限類別</CardTitle>
            <KeyRound className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(PermissionCategories).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總權限數</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allPermissions.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>使用者權限一覽</CardTitle>
          <CardDescription>
            點擊使用者以編輯其權限
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜尋使用者..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>使用者</TableHead>
                  <TableHead>職位</TableHead>
                  <TableHead>自定義權限</TableHead>
                  <TableHead>有效權限數</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMatrix.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {PositionLabels[user.position] || user.position}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.customPermissionCount > 0 ? (
                        <Badge variant="secondary">
                          {user.customPermissionCount} 項自定義
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{user.permissions.length}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        編輯權限
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              編輯權限 - {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              職位：{selectedUser && PositionLabels[selectedUser.position]}
              {' | '}
              {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>權限類別</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {Object.entries(PermissionCategories).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      {value.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              {filteredPermissions.map((permission) => {
                const hasIt = userPermissionDetails?.effectivePermissions.includes(permission);
                const customPerm = userPermissionDetails?.customPermissions.find(
                  (cp) => cp.permission === permission
                );

                return (
                  <div
                    key={permission}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      {hasIt ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <div className="font-medium">
                          {PermissionLabels[permission] || permission}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {permission}
                          {customPerm && (
                            <Badge variant="outline" className="ml-2">
                              {customPerm.granted ? '已授予' : '已撤銷'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!hasIt && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGrantPermission(permission)}
                          disabled={saving}
                        >
                          授予
                        </Button>
                      )}
                      {hasIt && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokePermission(permission)}
                          disabled={saving}
                        >
                          撤銷
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              關閉
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
