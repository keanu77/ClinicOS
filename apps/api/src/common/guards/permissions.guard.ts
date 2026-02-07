import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Permission } from "../../shared";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";
import { PermissionsService } from "../../permissions/permissions.service";

interface PermissionMetadata {
  permissions: Permission[];
  mode: "all" | "any";
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<PermissionMetadata>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (
      !metadata ||
      !metadata.permissions ||
      metadata.permissions.length === 0
    ) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("User not authenticated");
    }

    const userPermissions = await this.permissionsService.getUserPermissions(
      user.id,
    );

    let hasAccess: boolean;
    if (metadata.mode === "any") {
      hasAccess = metadata.permissions.some((p) => userPermissions.includes(p));
    } else {
      hasAccess = metadata.permissions.every((p) =>
        userPermissions.includes(p),
      );
    }

    if (!hasAccess) {
      throw new ForbiddenException("Insufficient permissions");
    }

    // 將有效權限附加到 request 中以供後續使用
    request.userPermissions = userPermissions;

    return true;
  }
}
