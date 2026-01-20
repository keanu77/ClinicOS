'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { apiGet, apiPost } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { formatRelativeTime } from '@/lib/utils';
import { UserCog, Award, Calendar, AlertTriangle, Plus, X } from 'lucide-react';
import { Role } from '@/shared';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
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
    expiresAt: string;
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

interface Certification {
  id: string;
  name: string;
  certNo: string;
  expiresAt: string;
  status: string;
  user: {
    name: string;
  };
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

export default function HRPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [expiringCerts, setExpiringCerts] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [certForm, setCertForm] = useState({
    name: '',
    certNo: '',
    issuingOrg: '',
    issueDate: '',
    expiryDate: '',
  });

  const fetchData = async () => {
    try {
      const [employeesRes, certsRes] = await Promise.all([
        apiGet<{ data: Employee[] }>('/hr/employees'),
        apiGet<Certification[]>('/hr/certifications/expiring'),
      ]);
      setEmployees(employeesRes.data || []);
      setExpiringCerts(certsRes || []);
    } catch (error) {
      console.error('Failed to load HR data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCert = async () => {
    if (!selectedEmployee || !certForm.name || !certForm.certNo) {
      toast({ title: '請填寫必填欄位', variant: 'destructive' });
      return;
    }
    try {
      await apiPost('/hr/certifications', {
        userId: selectedEmployee,
        ...certForm,
      });
      toast({ title: '證照新增成功' });
      setShowCertModal(false);
      setCertForm({ name: '', certNo: '', issuingOrg: '', issueDate: '', expiryDate: '' });
      setSelectedEmployee('');
      fetchData();
    } catch (error) {
      toast({ title: '新增失敗', variant: 'destructive' });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">人員管理</h1>
          <p className="text-muted-foreground">管理員工資料、證照與技能</p>
        </div>
        <Button onClick={() => setShowCertModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          新增證照
        </Button>
      </div>

      {/* Add Certification Modal */}
      {showCertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>新增證照</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowCertModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>選擇員工 *</Label>
                <select
                  className="w-full mt-1 p-2 border rounded-md"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">請選擇員工</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>證照名稱 *</Label>
                <Input
                  value={certForm.name}
                  onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                  placeholder="例：護理師執照"
                />
              </div>
              <div>
                <Label>證照編號 *</Label>
                <Input
                  value={certForm.certNo}
                  onChange={(e) => setCertForm({ ...certForm, certNo: e.target.value })}
                  placeholder="證照編號"
                />
              </div>
              <div>
                <Label>發照機構</Label>
                <Input
                  value={certForm.issuingOrg}
                  onChange={(e) => setCertForm({ ...certForm, issuingOrg: e.target.value })}
                  placeholder="例：衛生福利部"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>發照日期</Label>
                  <Input
                    type="date"
                    value={certForm.issueDate}
                    onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>到期日期</Label>
                  <Input
                    type="date"
                    value={certForm.expiryDate}
                    onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowCertModal(false)}>
                  取消
                </Button>
                <Button className="flex-1" onClick={handleAddCert}>
                  新增
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alert for expiring certifications */}
      {expiringCerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                有 {expiringCerts.length} 張證照即將到期
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">員工列表</TabsTrigger>
          <TabsTrigger value="certifications">證照管理</TabsTrigger>
        </TabsList>

        <TabsContent value="employees">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-muted-foreground">載入中...</div>
            </div>
          ) : employees.length > 0 ? (
            <div className="grid gap-4">
              {employees.map((employee) => (
                <Card key={employee.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserCog className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{employee.name}</h3>
                            <Badge variant="outline">{employee.role}</Badge>
                          </div>
                          {employee.profile && (
                            <div className="text-sm text-muted-foreground mt-1">
                              <span>{employee.profile.department}</span>
                              <span className="mx-2">·</span>
                              <span>{employee.profile.position}</span>
                              <span className="mx-2">·</span>
                              <span>{employee.profile.employeeNo}</span>
                            </div>
                          )}
                          {employee.skills && employee.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {employee.skills.slice(0, 4).map((skill) => (
                                <Badge
                                  key={skill.id}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {skill.skill.name} ({levelLabels[skill.level]})
                                </Badge>
                              ))}
                              {employee.skills.length > 4 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{employee.skills.length - 4}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/hr/${employee.id}`)}
                      >
                        檢視
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <UserCog className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">目前沒有員工資料</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="certifications">
          {expiringCerts.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">即將到期證照</h3>
              {expiringCerts.map((cert) => (
                <Card key={cert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{cert.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {cert.user.name} · {cert.certNo}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={statusColors[cert.status]}>
                          {cert.status === 'EXPIRING' ? '即將到期' : cert.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(cert.expiresAt).toLocaleDateString('zh-TW')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">沒有即將到期的證照</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
