import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Calendar,
  Stethoscope,
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
  type LucideIcon,
} from "lucide-react";
import { Permission } from "@/shared";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
  permissions?: Permission[];
  permissionMode?: "any" | "all";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigationGroups: NavGroup[] = [
  {
    label: "主要功能",
    items: [
      { name: "儀表板", href: "/dashboard", icon: LayoutDashboard },
      {
        name: "任務系統",
        href: "/handover",
        icon: ClipboardList,
        permission: Permission.HANDOVER_VIEW,
      },
      {
        name: "庫存管理",
        href: "/inventory",
        icon: Package,
        permission: Permission.INVENTORY_VIEW,
      },
      {
        name: "排班系統",
        href: "/scheduling",
        icon: Calendar,
        permission: Permission.SCHEDULING_VIEW,
      },
      {
        name: "門診時刻",
        href: "/clinic-schedule",
        icon: Stethoscope,
        permission: Permission.CLINIC_SCHEDULE_VIEW,
      },
    ],
  },
  {
    label: "營運管理",
    items: [
      {
        name: "人員管理",
        href: "/hr",
        icon: UserCog,
        permission: Permission.HR_VIEW,
      },
      {
        name: "設備管理",
        href: "/assets",
        icon: Wrench,
        permission: Permission.ASSETS_VIEW,
      },
      {
        name: "採購管理",
        href: "/procurement",
        icon: ShoppingCart,
        permission: Permission.PROCUREMENT_VIEW,
      },
    ],
  },
  {
    label: "行政管理",
    items: [
      {
        name: "醫療品質",
        href: "/quality",
        icon: Shield,
        permission: Permission.QUALITY_VIEW,
      },
      {
        name: "文件制度",
        href: "/documents",
        icon: BookOpen,
        permission: Permission.DOCUMENTS_VIEW,
      },
      {
        name: "成本分析",
        href: "/finance",
        icon: TrendingUp,
        permission: Permission.FINANCE_VIEW,
      },
    ],
  },
  {
    label: "系統管理",
    items: [
      { name: "通知中心", href: "/notifications", icon: Bell },
      {
        name: "使用者管理",
        href: "/users",
        icon: Users,
        permission: Permission.USERS_MANAGE,
      },
      {
        name: "權限管理",
        href: "/admin/permissions",
        icon: KeyRound,
        permission: Permission.PERMISSIONS_MANAGE,
      },
      {
        name: "稽核紀錄",
        href: "/audit",
        icon: FileText,
        permission: Permission.AUDIT_VIEW,
      },
    ],
  },
];

// Flat list for backwards compatibility
export const navigation: NavItem[] = navigationGroups.flatMap(
  (group) => group.items,
);
