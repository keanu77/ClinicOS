import { type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/**
 * 通用空狀態元件
 * 用於顯示列表為空時的提示訊息
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="py-12 text-center">
        {Icon && (
          <Icon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        )}
        <p className="text-muted-foreground font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  );
}

/**
 * 載入中狀態元件
 */
export function LoadingState({ message = '載入中...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-muted-foreground">{message}</div>
    </div>
  );
}

/**
 * 錯誤狀態元件
 */
export function ErrorState({
  message = '載入失敗',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="text-destructive">{message}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-primary hover:underline"
        >
          重試
        </button>
      )}
    </div>
  );
}
