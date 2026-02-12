'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { getSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';

function getApiUrl(): string {
  if (typeof window !== 'undefined' && (window as any).__ENV?.NEXT_PUBLIC_API_URL) {
    return (window as any).__ENV.NEXT_PUBLIC_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
}

interface ExportButtonProps {
  year: number;
  month: number;
  department?: string;
}

export function ExportButton({ year, month, department }: ExportButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const session = await getSession();
      const token = session?.accessToken;

      let url = `${getApiUrl()}/api/scheduling/export.xlsx?year=${year}&month=${month}`;
      if (department) {
        url += `&department=${department}`;
      }

      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) {
        throw new Error('匯出失敗');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `schedule_${year}_${month}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast({ title: '匯出成功' });
    } catch (error: any) {
      toast({ title: error.message || '匯出失敗', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      <Download className="h-4 w-4 mr-2" />
      {loading ? '匯出中...' : '匯出 Excel'}
    </Button>
  );
}
