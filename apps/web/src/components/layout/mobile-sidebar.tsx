'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
} from 'lucide-react';

interface MobileSidebarProps {
  user: {
    name: string;
    role: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const navigation = [
  { name: '儀表板', href: '/dashboard', icon: LayoutDashboard, roles: ['STAFF', 'SUPERVISOR', 'ADMIN'] },
  { name: '任務系統', href: '/handover', icon: ClipboardList, roles: ['STAFF', 'SUPERVISOR', 'ADMIN'] },
  { name: '庫存管理', href: '/inventory', icon: Package, roles: ['STAFF', 'SUPERVISOR', 'ADMIN'] },
  { name: '排班系統', href: '/scheduling', icon: Calendar, roles: ['SUPERVISOR', 'ADMIN'] },
  { name: '人員管理', href: '/hr', icon: UserCog, roles: ['SUPERVISOR', 'ADMIN'] },
  { name: '設備管理', href: '/assets', icon: Wrench, roles: ['STAFF', 'SUPERVISOR', 'ADMIN'] },
  { name: '採購管理', href: '/procurement', icon: ShoppingCart, roles: ['STAFF', 'SUPERVISOR', 'ADMIN'] },
  { name: '醫療品質', href: '/quality', icon: Shield, roles: ['STAFF', 'SUPERVISOR', 'ADMIN'] },
  { name: '文件制度', href: '/documents', icon: BookOpen, roles: ['STAFF', 'SUPERVISOR', 'ADMIN'] },
  { name: '成本分析', href: '/finance', icon: TrendingUp, roles: ['SUPERVISOR', 'ADMIN'] },
  { name: '通知中心', href: '/notifications', icon: Bell, roles: ['STAFF', 'SUPERVISOR', 'ADMIN'] },
  { name: '使用者管理', href: '/users', icon: Users, roles: ['ADMIN'] },
  { name: '稽核紀錄', href: '/audit', icon: FileText, roles: ['ADMIN'] },
];

export function MobileSidebar({ user, open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user.role)
  );

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
            {filteredNavigation.map((item) => {
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
        </nav>
      </SheetContent>
    </Sheet>
  );
}
