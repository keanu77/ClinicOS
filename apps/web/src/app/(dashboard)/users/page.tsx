'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Users, Mail, Shield, Plus, Edit, Trash2, X, KeyRound } from 'lucide-react';
import { Role, RoleLabels } from '@/shared';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [createForm, setCreateForm] = useState({
    email: '',
    name: '',
    password: '',
    role: 'STAFF',
  });

  const [editForm, setEditForm] = useState({
    name: '',
    role: '',
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
      setCreateForm({ email: '', name: '', password: '', role: 'STAFF' });
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
      isActive: user.isActive,
    });
    setShowEditModal(true);
  };

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
          <p className="text-muted-foreground">管理系統使用者帳號</p>
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
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
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
