'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';
import { api } from '@/lib/api';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: string;
  year: number;
  month: number;
  onSuccess: () => void;
}

interface ImportPreview {
  department: string;
  parsedEntries: Array<{
    userName: string;
    date: string;
    shiftCode: string;
    periodA?: string;
    periodB?: string;
    periodC?: string;
  }>;
  totalEntries: number;
  uniqueNames: string[];
}

export function ImportDialog({
  open,
  onOpenChange,
  department,
  year,
  month,
  onSuccess,
}: ImportDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await api<ImportPreview>(
        `/scheduling/import?department=${department}`,
        {
          method: 'POST',
          body: formData,
          headers: {}, // Let browser set content-type for FormData
        },
      );

      setPreview(result);
      toast({ title: `解析完成，共 ${result.totalEntries} 筆排班資料` });
    } catch (error: any) {
      toast({ title: error.message || '上傳失敗', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!preview) return;
    // TODO: Map userName to userId and call bulk upsert
    toast({ title: '匯入功能開發中', variant: 'destructive' });
    onOpenChange(false);
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>匯入 Excel 排班表</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              選擇檔案
            </Button>
            <span className="text-sm text-muted-foreground">
              {file ? file.name : '尚未選擇檔案'}
            </span>
          </div>

          {file && !preview && (
            <Button onClick={handleUpload} disabled={uploading}>
              {uploading ? '解析中...' : '上傳並預覽'}
            </Button>
          )}

          {preview && (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 rounded-md text-sm">
                <p>解析結果：</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>共 {preview.totalEntries} 筆排班資料</li>
                  <li>人員：{preview.uniqueNames.join('、')}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose}>
            取消
          </Button>
          {preview && (
            <Button onClick={handleConfirmImport}>確認匯入</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
