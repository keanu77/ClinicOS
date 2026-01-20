'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { apiGet, apiPatch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { formatDateTime } from '@/lib/utils';
import {
  ArrowLeft,
  UserCog,
  Award,
  Briefcase,
  Mail,
  Phone,
  Calendar,
  Edit,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { Role } from '@/shared';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  profile?: {
    employeeNo: string;
    department: string;
    position: string;
    phone?: string;
    hireDate?: string;
  };
  certifications?: {
    id: string;
    name: string;
    certNo: string;
    issuingOrg?: string;
    issueDate?: string;
    expiresAt?: string;
    status: string;
  }[];
  skills?: {
    id: string;
    level: string;
    skill: {
      name: string;
      category: string;
    };
  }[];
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRING: 'bg-yellow-100 text-yellow-800',
  EXPIRED: 'bg-red-100 text-red-800',
};

const levelLabels: Record<string, string> = {
  BEGINNER: '初級',
  INTERMEDIATE: '中級',
  ADVANCED: '高級',
  CERTIFIED: '認證',
};

const roleLabels: Record<string, string> = {
  ADMIN: '管理員',
  SUPERVISOR: '主管',
  STAFF: '員工',
};

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    department: '',
    position: '',
    phone: '',
  });

  const fetchEmployee = async () => {
    try {
      const result = await apiGet<Employee>(`/hr/employees/${params.id}`);
      setEmployee(result);
      if (result.profile) {
        setEditForm({
          department: result.profile.department || '',
          position: result.profile.position || '',
          phone: result.profile.phone || '',
        });
      }
    } catch (error) {
      console.error('Failed to load employee:', error);
      toast({
        title: '載入失敗',
        description: '無法載入員工詳情',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [params.id]);

  const handleSave = async () => {
    try {
      await apiPatch(`/hr/employees/${params.id}/profile`, editForm);
      toast({ title: '更新成功' });
      setIsEditing(false);
      fetchEmployee();
    } catch (error) {
      toast({ title: '更新失敗', variant: 'destructive' });
    }
  };

  const userRole = session?.user?.role;
  if (userRole !== Role.SUPERVISOR && userRole !== Role.ADMIN) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">您沒有權限存取此頁面</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">載入中...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">找不到此員工</p>
        <Link href="/hr">
          <Button className="mt-4">返回列表</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/hr">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline">{roleLabels[employee.role] || employee.role}</Badge>
            {employee.profile?.employeeNo && (
              <span className="text-sm text-muted-foreground">
                {employee.profile.employeeNo}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{employee.name}</h1>
        </div>
        {userRole === Role.ADMIN && !isEditing && (
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            編輯
          </Button>
        )}
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            基本資料
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>部門</Label>
                  <Input
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm({ ...editForm, department: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>職位</Label>
                  <Input
                    value={editForm.position}
                    onChange={(e) =>
                      setEditForm({ ...editForm, position: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>電話</Label>
                  <Input
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave}>儲存</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  取消
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{employee.email}</span>
              </div>
              {employee.profile?.department && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {employee.profile.department} · {employee.profile.position}
                  </span>
                </div>
              )}
              {employee.profile?.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{employee.profile.phone}</span>
                </div>
              )}
              {employee.profile?.hireDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    到職日：{new Date(employee.profile.hireDate).toLocaleDateString('zh-TW')}
                  </span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="h-4 w-4" />
            證照資訊
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employee.certifications && employee.certifications.length > 0 ? (
            <div className="space-y-3">
              {employee.certifications.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <div className="font-medium">{cert.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {cert.certNo}
                      {cert.issuingOrg && ` · ${cert.issuingOrg}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={statusColors[cert.status]}>
                      {cert.status === 'ACTIVE'
                        ? '有效'
                        : cert.status === 'EXPIRING'
                        ? '即將到期'
                        : '已過期'}
                    </Badge>
                    {cert.expiresAt && (
                      <div className="text-xs text-muted-foreground mt-1">
                        到期：{new Date(cert.expiresAt).toLocaleDateString('zh-TW')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">尚無證照資訊</p>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      {employee.skills && employee.skills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">技能專長</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {employee.skills.map((skill) => (
                <Badge key={skill.id} variant="secondary">
                  {skill.skill.name} ({levelLabels[skill.level]})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
