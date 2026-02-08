'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../api';
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
  const hasFetchedRef = useRef(false);
  const lastTokenRef = useRef<string | null>(null);

  // 獲取使用者權限
  const fetchPermissions = useCallback(async () => {
    if (status !== 'authenticated' || !session?.accessToken) {
      setLoading(false);
      return;
    }

    // 防止重複請求：如果已經用同一個 token 請求過就跳過
    if (hasFetchedRef.current && lastTokenRef.current === session.accessToken) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      hasFetchedRef.current = true;
      lastTokenRef.current = session.accessToken;

      // 直接傳入 token 避免 api 內部再次調用 getSession
      const data = await api<UserPermissionDetails>('/permissions/my', {
        method: 'GET',
        token: session.accessToken,
      });
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
  }, [session?.accessToken, session?.user?.position, status]);

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
    hasFetchedRef.current = false; // 重置以允許重新請求
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
