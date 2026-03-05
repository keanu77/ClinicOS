"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/lib/hooks";
import { navigationGroups, type NavItem } from "@/lib/navigation";
import { Activity } from "lucide-react";

interface SidebarProps {
  user: {
    name: string;
    role: string;
    position?: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } =
    usePermissions();

  const filterItems = (items: NavItem[]) =>
    items.filter((item) => {
      if (!item.permission && !item.permissions) return true;
      if (item.permission) return hasPermission(item.permission);
      if (item.permissions && item.permissions.length > 0) {
        return item.permissionMode === "any"
          ? hasAnyPermission(...item.permissions)
          : hasAllPermissions(...item.permissions);
      }
      return true;
    });

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-teal-900 to-teal-800 px-5 pb-4">
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Clinic OS
            </h1>
            <p className="text-[10px] text-teal-300 -mt-0.5">聯新運動醫學科</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-5">
            {loading ? (
              <li>
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
              </li>
            ) : (
              navigationGroups.map((group) => {
                const filtered = filterItems(group.items);
                if (filtered.length === 0) return null;
                return (
                  <li key={group.label}>
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
                              className={cn(
                                isActive
                                  ? "bg-white/15 text-white border-l-2 border-blue-400"
                                  : "text-teal-100 hover:bg-white/10 hover:text-white border-l-2 border-transparent",
                                "group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-medium transition-colors",
                              )}
                            >
                              <item.icon
                                className={cn(
                                  isActive
                                    ? "text-blue-400"
                                    : "text-teal-300 group-hover:text-white",
                                  "h-5 w-5 shrink-0",
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

        {/* Decorative sport silhouette */}
        <div className="flex justify-center opacity-[0.08] pointer-events-none select-none">
          <svg
            width="120"
            height="60"
            viewBox="0 0 120 60"
            fill="currentColor"
            className="text-white"
          >
            <path d="M30 55 Q25 40 20 30 Q15 20 25 15 Q30 12 32 18 L35 25 Q38 15 42 10 Q45 6 48 10 L45 20 Q50 15 55 12 Q58 10 60 14 L55 25 Q60 20 65 18 Q70 16 68 22 L60 35 Q55 45 50 55 Z" />
            <circle cx="42" cy="5" r="4" />
            <path d="M75 55 Q80 45 85 35 Q88 28 92 25 Q95 22 98 26 L95 35 Q98 30 102 28 Q106 26 105 32 L98 42 Q95 48 90 55 Z" />
            <circle cx="95" cy="20" r="3.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}
