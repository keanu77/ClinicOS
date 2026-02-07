import { SetMetadata } from "@nestjs/common";
import { Permission } from "../../shared";

export const PERMISSIONS_KEY = "permissions";

/**
 * 要求使用者擁有指定的權限（全部）
 */
export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, { permissions, mode: "all" });

/**
 * 要求使用者擁有指定權限之一
 */
export const RequireAnyPermission = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, { permissions, mode: "any" });
