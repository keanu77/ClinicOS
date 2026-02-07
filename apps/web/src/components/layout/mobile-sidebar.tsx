'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/lib/hooks';
import { Permission } from '@/shared';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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

interface MobileSidebarProps {
  user: {
    name: string;
    role: string;
    position?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function MobileSidebar({ user, open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  const filteredNavigation = navigation.filter((item) => {
    if (!item.permission && !item.permissions) {
      return true;
    }
    if (item.permission) {
      return hasPermission(item.permission);
    }
    if (item.permissions && item.permissions.length > 0) {
      if (item.permissionMode === 'any') {
        return hasAnyPermission(...item.permissions);
      }
      return hasAllPermissions(...item.permissions);
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
          <ul role="list" className="space-y-1">
            {loading ? (
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
              })
            )}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
