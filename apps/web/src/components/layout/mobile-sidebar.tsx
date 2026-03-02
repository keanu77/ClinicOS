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
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-xl font-bold text-primary">
            Clinic OS
          </SheetTitle>
        </SheetHeader>
        <nav className="flex-1 overflow-y-auto px-4 py-4">
          {loading ? (
            <ul role="list" className="space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="animate-pulse">
                  <div className="flex gap-x-3 rounded-md p-2">
                    <div className="h-6 w-6 rounded bg-gray-200" />
                    <div className="h-6 w-24 rounded bg-gray-200" />
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
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
                      {group.label}
                    </div>
                    <ul role="list" className="space-y-1">
                      {filtered.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={() => onOpenChange(false)}
                              className={cn(
                                isActive
                                  ? 'bg-gray-100 text-primary'
                                  : 'text-gray-700 hover:text-primary hover:bg-gray-50',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                              )}
                            >
                              <item.icon
                                className={cn(
                                  isActive
                                    ? 'text-primary'
                                    : 'text-gray-400 group-hover:text-primary',
                                  'h-6 w-6 shrink-0'
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
