import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

export function Spinner({ className, size = 'md' }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)}
    />
  );
}

export function LoadingSpinner({ message = '載入中...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Spinner />
        <span>{message}</span>
      </div>
    </div>
  );
}
