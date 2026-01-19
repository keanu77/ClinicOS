'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Calendar,
  Bell,
  Users,
  FileText,
  Settings,
  UserCog,
  Wrench,
  ShoppingCart,
  Shield,
  BookOpen,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  user: {
    name: string;
    role: string;
  };
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

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user.role)
  );

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
                {filteredNavigation.map((item) => {
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
          </ul>
        </nav>
      </div>
    </div>
  );
}
