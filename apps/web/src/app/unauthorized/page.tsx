import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <ShieldAlert className="h-16 w-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            權限不足
          </h1>
          <p className="text-muted-foreground mb-6">
            您沒有權限存取此頁面。請聯繫管理員以取得適當的權限。
          </p>
          <Link href="/dashboard">
            <Button>返回儀表板</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
