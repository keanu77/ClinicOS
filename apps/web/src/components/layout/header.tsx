"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, LogOut, Menu, Activity } from "lucide-react";
import Link from "next/link";
import { RoleLabels, Role } from "@/shared";
import { MobileSidebar } from "./mobile-sidebar";
import { apiGet } from "@/lib/api";

interface HeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const roleLabel = RoleLabels[user.role as Role] || user.role;

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const result = await apiGet<{ count: number }>(
          "/notifications/unread-count",
        );
        setUnreadCount(result.count);
      } catch {
        // silently ignore
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        {/* Teal accent line at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600 opacity-60" />

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
            <div className="flex items-center gap-2 lg:hidden">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500">
                <Activity className="h-3.5 w-3.5 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-teal-900">Clinic OS</h2>
            </div>
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
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </Link>

            <div className="flex items-center gap-x-3">
              <div className="hidden sm:flex sm:flex-col sm:items-end">
                <span className="text-sm font-medium text-foreground">
                  {user.name}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {roleLabel}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/login" })}
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
