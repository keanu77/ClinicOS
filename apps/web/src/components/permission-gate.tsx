'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/lib/hooks';
import { Permission } from '@/shared';

interface PermissionGateProps {
  /** 需要的權限（單一或多個） */
  permission?: Permission;
  permissions?: Permission[];
  /** 權限檢查模式：all 需要所有權限，any 只需任一權限 */
  mode?: 'all' | 'any';
  /** 有權限時顯示的內容 */
  children: ReactNode;
  /** 無權限時顯示的內容 */
  fallback?: ReactNode;
  /** 是否顯示載入狀態 */
  showLoading?: boolean;
}

/**
 * 權限控制組件
 *
 * @example
 * // 單一權限
 * <PermissionGate permission={Permission.INVENTORY_MANAGE}>
 *   <AddItemButton />
 * </PermissionGate>
 *
 * @example
 * // 多個權限（需要全部）
 * <PermissionGate
 *   permissions={[Permission.USERS_VIEW, Permission.USERS_MANAGE]}
 *   mode="all"
 * >
 *   <UserManagement />
 * </PermissionGate>
 *
 * @example
 * // 多個權限（任一即可）
 * <PermissionGate
 *   permissions={[Permission.HANDOVER_EDIT_ALL, Permission.HANDOVER_DELETE]}
 *   mode="any"
 * >
 *   <EditButton />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  permissions,
  mode = 'all',
  children,
  fallback = null,
  showLoading = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading && showLoading) {
    return <div className="animate-pulse h-4 w-16 bg-muted rounded" />;
  }

  if (loading) {
    return null;
  }

  // 處理單一權限
  if (permission) {
    if (!hasPermission(permission)) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  // 處理多個權限
  if (permissions && permissions.length > 0) {
    const hasAccess =
      mode === 'any' ? hasAnyPermission(...permissions) : hasAllPermissions(...permissions);

    if (!hasAccess) {
      return <>{fallback}</>;
    }
    return <>{children}</>;
  }

  // 沒有指定權限，直接顯示
  return <>{children}</>;
}

/**
 * 權限 HOC - 用於包裝整個頁面或大型組件
 */
export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: Permission,
  FallbackComponent?: React.ComponentType
) {
  return function PermissionWrapper(props: P) {
    const { hasPermission, loading } = usePermissions();

    if (loading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!hasPermission(requiredPermission)) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-xl font-semibold text-muted-foreground">無權限存取</h2>
          <p className="text-sm text-muted-foreground mt-2">
            您沒有權限存取此頁面，請聯繫管理員。
          </p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
