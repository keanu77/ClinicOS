'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/lib/hooks';
import { navigationGroups, type NavItem } from '@/lib/navigation';

interface SidebarProps {
  user: {
    name: string;
    role: string;
    position?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
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
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-gray-200 px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <h1 className="text-xl font-bold text-primary">Clinic OS</h1>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-5">
            {loading ? (
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <li key={i} className="animate-pulse">
                      <div className="flex gap-x-3 rounded-md p-2">
                        <div className="h-6 w-6 rounded bg-gray-200" />
                        <div className="h-6 w-24 rounded bg-gray-200" />
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              navigationGroups.map((group) => {
                const filtered = filterItems(group.items);
                if (filtered.length === 0) return null;
                return (
                  <li key={group.label}>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      {group.label}
                    </div>
                    <ul role="list" className="-mx-2 space-y-1">
                      {filtered.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                          <li key={item.name}>
                            <Link
                              href={item.href}
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
                              />
                              {item.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                );
              })
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
}
