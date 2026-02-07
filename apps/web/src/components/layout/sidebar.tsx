'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/lib/hooks';
import { Permission } from '@/shared';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Calendar,
  Bell,
  Users,
  FileText,
  UserCog,
  Wrench,
  ShoppingCart,
  Shield,
  BookOpen,
  TrendingUp,
  KeyRound,
  LucideIcon,
} from 'lucide-react';

interface SidebarProps {
  user: {
    name: string;
    role: string;
    position?: string;
  };
}

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  permissions?: Permission[];
  permissionMode?: 'any' | 'all';
}

const navigation: NavItem[] = [
  { name: '儀表板', href: '/dashboard', icon: LayoutDashboard },
  { name: '任務系統', href: '/handover', icon: ClipboardList, permission: Permission.HANDOVER_VIEW },
  { name: '庫存管理', href: '/inventory', icon: Package, permission: Permission.INVENTORY_VIEW },
  { name: '排班系統', href: '/scheduling', icon: Calendar, permission: Permission.SCHEDULING_VIEW },
  { name: '人員管理', href: '/hr', icon: UserCog, permission: Permission.HR_VIEW },
  { name: '設備管理', href: '/assets', icon: Wrench, permission: Permission.ASSETS_VIEW },
  { name: '採購管理', href: '/procurement', icon: ShoppingCart, permission: Permission.PROCUREMENT_VIEW },
  { name: '醫療品質', href: '/quality', icon: Shield, permission: Permission.QUALITY_VIEW },
  { name: '文件制度', href: '/documents', icon: BookOpen, permission: Permission.DOCUMENTS_VIEW },
  { name: '成本分析', href: '/finance', icon: TrendingUp, permission: Permission.FINANCE_VIEW },
  { name: '通知中心', href: '/notifications', icon: Bell },
  { name: '使用者管理', href: '/users', icon: Users, permission: Permission.USERS_MANAGE },
  { name: '權限管理', href: '/admin/permissions', icon: KeyRound, permission: Permission.PERMISSIONS_MANAGE },
  { name: '稽核紀錄', href: '/audit', icon: FileText, permission: Permission.AUDIT_VIEW },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  const filteredNavigation = navigation.filter((item) => {
    // 沒有權限限制的項目，所有人可見
    if (!item.permission && !item.permissions) {
      return true;
    }

    // 單一權限檢查
    if (item.permission) {
      return hasPermission(item.permission);
    }

    // 多權限檢查
    if (item.permissions && item.permissions.length > 0) {
      if (item.permissionMode === 'any') {
        return hasAnyPermission(...item.permissions);
      }
      return hasAllPermissions(...item.permissions);
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
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {loading ? (
                  // 載入中顯示骨架
                  Array.from({ length: 5 }).map((_, i) => (
                    <li key={i} className="animate-pulse">
                      <div className="flex gap-x-3 rounded-md p-2">
                        <div className="h-6 w-6 rounded bg-gray-200" />
                        <div className="h-6 w-24 rounded bg-gray-200" />
                      </div>
                    </li>
                  ))
                ) : (
                  filteredNavigation.map((item) => {
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
                  })
                )}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
