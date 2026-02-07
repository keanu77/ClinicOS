'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { apiGet } from '../api';
import { Permission, Position, DefaultPermissionsByPosition } from '@/shared';

interface UserPermissionDetails {
  userId: string;
  position: Position;
  defaultPermissions: Permission[];
  customPermissions: {
    permission: Permission;
    granted: boolean;
    grantedAt: string;
    expiresAt?: string;
    reason?: string;
  }[];
  effectivePermissions: Permission[];
}

export function usePermissions() {
  const { data: session, status } = useSession();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 獲取使用者權限
  const fetchPermissions = useCallback(async () => {
    if (status !== 'authenticated' || !session?.accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await apiGet<UserPermissionDetails>('/permissions/my');
      setPermissions(data.effectivePermissions);
    } catch (err) {
      console.error('Failed to fetch permissions:', err);
      // 如果 API 失敗，使用 session 中的 position 取得預設權限
      if (session?.user?.position) {
        const position = session.user.position as Position;
        const defaultPerms = DefaultPermissionsByPosition[position] || [];
        setPermissions(defaultPerms);
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // 檢查是否擁有特定權限
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      return permissions.includes(permission);
    },
    [permissions]
  );

  // 檢查是否擁有任一權限
  const hasAnyPermission = useCallback(
    (...perms: Permission[]): boolean => {
      return perms.some((p) => permissions.includes(p));
    },
    [permissions]
  );

  // 檢查是否擁有所有權限
  const hasAllPermissions = useCallback(
    (...perms: Permission[]): boolean => {
      return perms.every((p) => permissions.includes(p));
    },
    [permissions]
  );

  // 重新載入權限
  const refetch = useCallback(() => {
    return fetchPermissions();
  }, [fetchPermissions]);

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refetch,
    position: session?.user?.position as Position | undefined,
  };
}
