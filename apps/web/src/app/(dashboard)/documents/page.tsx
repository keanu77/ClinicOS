"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { apiGet, apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import {
  BookOpen,
  FileText,
  Bell,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Role } from "@/shared";

interface Category {
  id: string;
  name: string;
}

interface Document {
  id: string;
  docNo: string;
  title: string;
  status: string;
  version: number;
  publishedAt?: string;
  category?: {
    name: string;
  };
}

interface Announcement {
  id: string;
  title: string;
  priority: string;
  isPinned: boolean;
  publishAt: string;
  isRead: boolean;
}

interface UnreadDoc {
  id: string;
  docNo: string;
  title: string;
  version: number;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  DRAFT: "草稿",
  PENDING_REVIEW: "待審核",
  PUBLISHED: "已發布",
  ARCHIVED: "已封存",
};

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  NORMAL: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

const priorityLabels: Record<string, string> = {
  LOW: "一般",
  NORMAL: "普通",
  HIGH: "重要",
  URGENT: "緊急",
};

export default function DocumentsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadDocs, setUnreadDocs] = useState<UnreadDoc[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showAnnModal, setShowAnnModal] = useState(false);
  const [docForm, setDocForm] = useState({
    docNo: "",
    title: "",
    categoryId: "",
    content: "",
  });
  const [annForm, setAnnForm] = useState({
    title: "",
    content: "",
    priority: "NORMAL",
  });

  const fetchData = async () => {
    try {
      const [docsRes, announcementsRes, unreadRes, catsRes] = await Promise.all(
        [
          apiGet<{ data: Document[] }>("/documents"),
          apiGet<{ data: Announcement[] }>("/documents/announcements/list"),
          apiGet<UnreadDoc[]>("/documents/my-unread"),
          apiGet<Category[]>("/documents/categories"),
        ],
      );
      setDocuments(docsRes.data || []);
      setAnnouncements(announcementsRes.data || []);
      setUnreadDocs(unreadRes || []);
      setCategories(catsRes || []);
    } catch (error) {
      console.error("Failed to load documents data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddDoc = async () => {
    if (!docForm.docNo || !docForm.title) {
      toast({ title: "請填寫必填欄位", variant: "destructive" });
      return;
    }
    try {
      await apiPost("/documents", docForm);
      toast({ title: "文件新增成功" });
      setShowDocModal(false);
      setDocForm({ docNo: "", title: "", categoryId: "", content: "" });
      fetchData();
    } catch (error) {
      toast({ title: "新增失敗", variant: "destructive" });
    }
  };

  const handleAddAnn = async () => {
    if (!annForm.title || !annForm.content) {
      toast({ title: "請填寫必填欄位", variant: "destructive" });
      return;
    }
    try {
      await apiPost("/documents/announcements", annForm);
      toast({ title: "公告新增成功" });
      setShowAnnModal(false);
      setAnnForm({ title: "", content: "", priority: "NORMAL" });
      fetchData();
    } catch (error) {
      toast({ title: "新增失敗", variant: "destructive" });
    }
  };

  const userRole = session?.user?.role;
  const canManage = userRole === Role.SUPERVISOR || userRole === Role.ADMIN;

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BookOpen}
        title="文件制度"
        subtitle="SOP 文件管理與公告發布"
        iconColor="text-sky-700"
        iconBg="bg-sky-100"
        actions={
          canManage ? (
            <>
              <Button variant="outline" onClick={() => setShowAnnModal(true)}>
                <Bell className="h-4 w-4 mr-2" />
                新增公告
              </Button>
              <Button
                className="btn-lift"
                onClick={() => setShowDocModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                新增文件
              </Button>
            </>
          ) : undefined
        }
      />

      <Dialog open={showDocModal} onOpenChange={setShowDocModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增文件</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>文件編號 *</Label>
              <Input
                value={docForm.docNo}
                onChange={(e) =>
                  setDocForm({ ...docForm, docNo: e.target.value })
                }
                placeholder="例：SOP-001"
              />
            </div>
            <div>
              <Label>文件標題 *</Label>
              <Input
                value={docForm.title}
                onChange={(e) =>
                  setDocForm({ ...docForm, title: e.target.value })
                }
                placeholder="文件標題"
              />
            </div>
            <div>
              <Label>分類</Label>
              <Select
                value={docForm.categoryId || "__none__"}
                onValueChange={(v) =>
                  setDocForm({
                    ...docForm,
                    categoryId: v === "__none__" ? "" : v,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="請選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">請選擇分類</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>內容</Label>
              <Textarea
                value={docForm.content}
                onChange={(e) =>
                  setDocForm({ ...docForm, content: e.target.value })
                }
                placeholder="文件內容..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDocModal(false)}>
              取消
            </Button>
            <Button onClick={handleAddDoc}>新增</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAnnModal} onOpenChange={setShowAnnModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新增公告</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>公告標題 *</Label>
              <Input
                value={annForm.title}
                onChange={(e) =>
                  setAnnForm({ ...annForm, title: e.target.value })
                }
                placeholder="公告標題"
              />
            </div>
            <div>
              <Label>優先級</Label>
              <Select
                value={annForm.priority}
                onValueChange={(v) => setAnnForm({ ...annForm, priority: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">一般</SelectItem>
                  <SelectItem value="NORMAL">普通</SelectItem>
                  <SelectItem value="HIGH">重要</SelectItem>
                  <SelectItem value="URGENT">緊急</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>內容 *</Label>
              <Textarea
                value={annForm.content}
                onChange={(e) =>
                  setAnnForm({ ...annForm, content: e.target.value })
                }
                placeholder="公告內容..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAnnModal(false)}>
              取消
            </Button>
            <Button onClick={handleAddAnn}>新增</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unread Documents Alert */}
      {unreadDocs.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">
                您有 {unreadDocs.length} 份文件尚未確認閱讀
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">文件列表</TabsTrigger>
          <TabsTrigger value="announcements">公告</TabsTrigger>
          <TabsTrigger value="unread">待確認閱讀</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          {loading ? (
            <LoadingSpinner />
          ) : documents.length > 0 ? (
            <div className="space-y-4">
              {documents.map((doc) => (
                <Card key={doc.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{doc.docNo}</span>
                            <Badge className={statusColors[doc.status]}>
                              {statusLabels[doc.status]}
                            </Badge>
                            <Badge variant="outline">v{doc.version}</Badge>
                          </div>
                          <div className="text-sm mt-1">{doc.title}</div>
                          {doc.category && (
                            <div className="text-sm text-muted-foreground mt-1">
                              分類: {doc.category.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/documents/${doc.id}`)}
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
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">目前沒有文件</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="announcements">
          {announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <Card
                  key={announcement.id}
                  className={announcement.isPinned ? "border-primary" : ""}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <Bell
                          className={`h-5 w-5 mt-0.5 ${
                            announcement.isPinned
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {announcement.title}
                            </span>
                            <Badge
                              className={priorityColors[announcement.priority]}
                            >
                              {priorityLabels[announcement.priority]}
                            </Badge>
                            {announcement.isPinned && (
                              <Badge variant="outline">置頂</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {new Date(
                              announcement.publishAt,
                            ).toLocaleDateString("zh-TW")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {announcement.isRead && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(
                              `/documents/announcements/${announcement.id}`,
                            )
                          }
                        >
                          檢視
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">目前沒有公告</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread">
          {unreadDocs.length > 0 ? (
            <div className="space-y-4">
              {unreadDocs.map((doc) => (
                <Card key={doc.id} className="border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{doc.docNo}</span>
                            <Badge variant="outline">v{doc.version}</Badge>
                          </div>
                          <div className="text-sm mt-1">{doc.title}</div>
                        </div>
                      </div>
                      <Button size="sm">確認閱讀</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <p className="text-muted-foreground">您已閱讀所有文件</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
