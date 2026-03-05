'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/lib/hooks';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { navigationGroups, type NavItem } from '@/lib/navigation';
import { Activity } from 'lucide-react';

interface MobileSidebarProps {
  user: {
    name: string;
    role: string;
    position?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ user, open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  const filterItems = (items: NavItem[]) =>
    items.filter((item) => {
      if (!item.permission && !item.permissions) return true;
      if (item.permission) return hasPermission(item.permission);
      if (item.permissions && item.permissions.length > 0) {
        return item.permissionMode === 'any'
          ? hasAnyPermission(...item.permissions)
          : hasAllPermissions(...item.permissions);
      }
      return true;
    });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-teal-900 to-teal-800 border-r-0">
        <SheetHeader className="px-5 py-4 border-b border-white/10">
          <SheetTitle className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Clinic OS</span>
              <p className="text-[10px] text-teal-300 -mt-0.5 text-left">聯新運動醫學科</p>
            </div>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <ul role="list" className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="animate-pulse">
                  <div className="flex gap-x-3 rounded-lg p-2">
                    <div className="h-6 w-6 rounded bg-white/10" />
                    <div className="h-6 w-24 rounded bg-white/10" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-5">
              {navigationGroups.map((group) => {
                const filtered = filterItems(group.items);
                if (filtered.length === 0) return null;
                return (
                  <div key={group.label}>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-400 mb-2 px-2">
                      {group.label}
                    </div>
                    <ul role="list" className="space-y-0.5">
                      {filtered.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => onOpenChange(false)}
                              className={cn(
                                isActive
                                  ? 'bg-white/15 text-white border-l-2 border-orange-400'
                                  : 'text-teal-100 hover:bg-white/10 hover:text-white border-l-2 border-transparent',
                                'group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-medium transition-colors'
                              )}
                            >
                              <item.icon
                                className={cn(
                                  isActive
                                    ? 'text-orange-400'
                                    : 'text-teal-300 group-hover:text-white',
                                  'h-5 w-5 shrink-0'
                                )}
                                aria-hidden="true"
                              />
                              {item.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
