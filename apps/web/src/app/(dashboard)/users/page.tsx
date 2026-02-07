'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Users, Mail, Shield, Plus, Edit, Trash2, X, KeyRound, Settings, Loader2 } from 'lucide-react';
import { Role, RoleLabels } from '@/shared';
import {
  Permission,
  PermissionLabels,
  PermissionCategories
} from '@/shared/enums/permission.enum';
import { Position, PositionLabels } from '@/shared/enums/position.enum';
import { DefaultPermissionsByPosition } from '@/shared/types/permission.types';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  position?: string;
  isActive: boolean;
  createdAt: string;
}

interface UserPermissionData {
  userId: string;
  position: Position;
  defaultPermissions: Permission[];
  customPermissions: {
    permission: Permission;
    granted: boolean;
  }[];
  effectivePermissions: Permission[];
}

export default function UsersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissionData, setPermissionData] = useState<UserPermissionData | null>(null);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [savingPermission, setSavingPermission] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'STAFF',
    position: 'RECEPTIONIST',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
    position: '',
    isActive: true,
  });

  const fetchUsers = async () => {
    try {
      const result = await apiGet<User[]>('/users');
      setUsers(result);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({ title: '載入失敗', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async () => {
    if (!createForm.email || !createForm.name || !createForm.password) {
      toast({ title: '請填寫必填欄位', variant: 'destructive' });
      return;
    }
    try {
      await apiPost('/users', createForm);
      toast({ title: '使用者建立成功' });
      setShowCreateModal(false);
      setCreateForm({ email: '', name: '', password: '', role: 'STAFF', position: 'RECEPTIONIST' });
      fetchUsers();
    } catch (error: any) {
      toast({ title: error.message || '建立失敗', variant: 'destructive' });
    }
  };

  const handleEdit = async () => {
    if (!selectedUser) return;
    try {
      await apiPatch(`/users/${selectedUser.id}`, editForm);
      toast({ title: '使用者更新成功' });
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({ title: error.message || '更新失敗', variant: 'destructive' });
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      await apiDelete(`/users/${userId}`);
      toast({ title: '使用者已停用' });
      setShowDeleteConfirm(null);
      fetchUsers();
    } catch (error: any) {
      toast({ title: error.message || '停用失敗', variant: 'destructive' });
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await apiPost(`/users/${userId}/reset-password`, {});
      toast({ title: '密碼重設成功，新密碼已發送至用戶信箱' });
    } catch (error: any) {
      toast({ title: error.message || '密碼重設失敗', variant: 'destructive' });
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      role: user.role,
      position: user.position || 'RECEPTIONIST',
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

  const openPermissionModal = async (user: User) => {
    setSelectedUser(user);
    setShowPermissionModal(true);
    setPermissionLoading(true);

    try {
      const data = await apiGet<UserPermissionData>(`/permissions/users/${user.id}`);
      setPermissionData(data);
    } catch (error) {
      console.error('Failed to load permissions:', error);
      // 如果 API 失敗，使用預設權限
      const userPosition = (user.position || 'RECEPTIONIST') as Position;
      const defaultPerms = DefaultPermissionsByPosition[userPosition] || [];
      setPermissionData({
        userId: user.id,
        position: userPosition,
        defaultPermissions: defaultPerms,
        customPermissions: [],
        effectivePermissions: defaultPerms,
      });
    } finally {
      setPermissionLoading(false);
    }
  };

  const handlePermissionChange = async (permission: Permission, checked: boolean) => {
    if (!selectedUser || !permissionData) return;

    setSavingPermission(permission);

    try {
      if (checked) {
        // 授予權限
        await apiPost(`/permissions/users/${selectedUser.id}/grant`, {
          permission,
          reason: '管理員手動授予',
        });
      } else {
        // 撤銷權限
        await apiPost(`/permissions/users/${selectedUser.id}/revoke`, {
          permission,
          reason: '管理員手動撤銷',
        });
      }

      // 更新本地狀態
      const newEffectivePermissions = checked
        ? [...permissionData.effectivePermissions, permission]
        : permissionData.effectivePermissions.filter(p => p !== permission);

      setPermissionData({
        ...permissionData,
        effectivePermissions: newEffectivePermissions,
      });

      toast({ title: checked ? '權限已授予' : '權限已撤銷' });
    } catch (error: any) {
      console.error('Failed to update permission:', error);
      toast({ title: error.message || '權限更新失敗', variant: 'destructive' });
    } finally {
      setSavingPermission(null);
    }
  };

  const isPermissionChecked = useCallback((permission: Permission): boolean => {
    if (!permissionData) return false;
    return permissionData.effectivePermissions.includes(permission);
  }, [permissionData]);

  const isDefaultPermission = useCallback((permission: Permission): boolean => {
    if (!permissionData) return false;
    return permissionData.defaultPermissions.includes(permission);
  }, [permissionData]);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'danger';
      case 'SUPERVISOR':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getPositionBadgeVariant = (position: string) => {
    switch (position) {
      case 'ADMIN':
        return 'danger';
      case 'MANAGER':
        return 'warning';
      case 'DOCTOR':
        return 'default';
      default:
        return 'secondary';
    }
  };

  if (session?.user?.role !== Role.ADMIN) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">您沒有權限存取此頁面</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">使用者管理</h1>
          <p className="text-muted-foreground">管理系統使用者帳號與權限</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新增使用者
        </Button>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>新增使用者</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowCreateModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label>姓名 *</Label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="姓名"
                />
              </div>
              <div>
                <Label>密碼 *</Label>
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="密碼"
                />
              </div>
              <div>
                <Label>職位</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={createForm.position}
                  onChange={(e) => setCreateForm({ ...createForm, position: e.target.value })}
                >
                  {Object.values(Position).map((pos) => (
                    <option key={pos} value={pos}>{PositionLabels[pos]}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>角色</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                >
                  <option value="STAFF">員工</option>
                  <option value="SUPERVISOR">主管</option>
                  <option value="ADMIN">管理員</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>
                  取消
                </Button>
                <Button className="flex-1" onClick={handleCreate}>
                  新增
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>編輯使用者</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowEditModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={selectedUser.email} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>姓名</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label>職位</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={editForm.position}
                  onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                >
                  {Object.values(Position).map((pos) => (
                    <option key={pos} value={pos}>{PositionLabels[pos]}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>角色</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="STAFF">員工</option>
                  <option value="SUPERVISOR">主管</option>
                  <option value="ADMIN">管理員</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                />
                <Label htmlFor="isActive">啟用帳號</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                  取消
                </Button>
                <Button className="flex-1" onClick={handleEdit}>
                  儲存
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b shrink-0">
              <div>
                <CardTitle>權限設定</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedUser.name} - {PositionLabels[(selectedUser.position || 'RECEPTIONIST') as Position]}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => {
                setShowPermissionModal(false);
                setPermissionData(null);
              }}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1 py-4">
              {permissionLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">載入權限中...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <strong>提示：</strong>藍色標籤表示該權限為職位預設權限，取消勾選會撤銷此預設權限。
                  </div>

                  {Object.entries(PermissionCategories).map(([key, category]) => (
                    <div key={key} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        {category.label}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.permissions.map((permission) => {
                          const isChecked = isPermissionChecked(permission);
                          const isDefault = isDefaultPermission(permission);
                          const isSaving = savingPermission === permission;

                          return (
                            <div
                              key={permission}
                              className={`flex items-center gap-3 p-2 rounded-md ${
                                isDefault ? 'bg-blue-50' : 'bg-gray-50'
                              } ${isSaving ? 'opacity-50' : ''}`}
                            >
                              <Checkbox
                                id={permission}
                                checked={isChecked}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(permission, checked as boolean)
                                }
                                disabled={isSaving}
                              />
                              <div className="flex-1">
                                <label
                                  htmlFor={permission}
                                  className="text-sm font-medium cursor-pointer"
                                >
                                  {PermissionLabels[permission]}
                                </label>
                                {isDefault && (
                                  <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700">
                                    預設
                                  </Badge>
                                )}
                              </div>
                              {isSaving && (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <div className="border-t p-4 shrink-0">
              <Button
                className="w-full"
                onClick={() => {
                  setShowPermissionModal(false);
                  setPermissionData(null);
                }}
              >
                完成
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>確認停用</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                確定要停用此使用者嗎？停用後使用者將無法登入系統。
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowDeleteConfirm(null)}>
                  取消
                </Button>
                <Button variant="destructive" className="flex-1" onClick={() => handleDelete(showDeleteConfirm)}>
                  確認停用
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">載入中...</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Card key={user.id} className={!user.isActive ? 'opacity-60' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{user.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    {user.position && (
                      <Badge variant={getPositionBadgeVariant(user.position)}>
                        {PositionLabels[user.position as Position] || user.position}
                      </Badge>
                    )}
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {RoleLabels[user.role as Role]}
                    </Badge>
                    {!user.isActive && (
                      <Badge variant="outline" className="text-gray-500">已停用</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openPermissionModal(user)}
                      title="設定權限"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleResetPassword(user.id)}
                      title="重設密碼"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditModal(user)}
                      title="編輯"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {user.id !== session?.user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowDeleteConfirm(user.id)}
                        title="停用"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && users.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">沒有使用者資料</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
