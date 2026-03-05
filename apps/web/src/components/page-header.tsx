import { type LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  icon: Icon,
  iconColor = 'text-cyan-700',
  iconBg = 'bg-cyan-100',
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
