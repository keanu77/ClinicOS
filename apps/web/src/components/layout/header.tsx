'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';
import { RoleLabels, Role } from '@/shared';
import { MobileSidebar } from './mobile-sidebar';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const roleLabel = RoleLabels[user.role as Role] || user.role;

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex flex-1 items-center gap-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="開啟選單"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900 lg:hidden">
              Clinic OS
            </h2>
          </div>

          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <Link href="/notifications">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="通知中心"
              >
                <Bell className="h-5 w-5" />
              </Button>
            </Link>

            <div className="flex items-center gap-x-3">
              <div className="hidden sm:flex sm:flex-col sm:items-end">
                <span className="text-sm font-medium text-gray-900">
                  {user.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {roleLabel}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: '/login' })}
                aria-label="登出"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <MobileSidebar
        user={user}
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
      />
    </>
  );
}
