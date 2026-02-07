import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { RequirePermissions } from "../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import {
  CreatePermissionRequestDto,
  ReviewPermissionRequestDto,
  GrantPermissionDto,
  RevokePermissionDto,
  UpdateUserPositionDto,
  PermissionRequestQueryDto,
} from "./dto/permission.dto";
import {
  Permission,
  PermissionCategories,
  PermissionLabels,
  PositionLabels,
  DefaultPermissionsByPosition,
} from "../shared";

interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: string;
  position: string;
}

@Controller("permissions")
@UseGuards(PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * 取得當前使用者的權限
   */
  @Get("my")
  async getMyPermissions(@CurrentUser() user: JwtPayload) {
    return this.permissionsService.getUserPermissionDetails(user.id);
  }

  /**
   * 取得指定使用者的權限
   */
  @Get("users/:id")
  @RequirePermissions(Permission.USERS_VIEW)
  async getUserPermissions(@Param("id") userId: string) {
    return this.permissionsService.getUserPermissionDetails(userId);
  }

  /**
   * 授予使用者權限
   */
  @Post("users/:id/grant")
  @RequirePermissions(Permission.PERMISSIONS_MANAGE)
  async grantPermission(
    @Param("id") userId: string,
    @Body() dto: GrantPermissionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;
    return this.permissionsService.grantPermission(
      userId,
      dto.permission,
      user.id,
      dto.reason,
      expiresAt,
    );
  }

  /**
   * 撤銷使用者權限
   */
  @Post("users/:id/revoke")
  @RequirePermissions(Permission.PERMISSIONS_MANAGE)
  async revokePermission(
    @Param("id") userId: string,
    @Body() dto: RevokePermissionDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.permissionsService.revokePermission(
      userId,
      dto.permission,
      user.id,
      dto.reason,
    );
  }

  /**
   * 更新使用者職位
   */
  @Post("users/:id/position")
  @RequirePermissions(Permission.USERS_MANAGE)
  async updateUserPosition(
    @Param("id") userId: string,
    @Body() dto: UpdateUserPositionDto,
  ) {
    return this.permissionsService.updateUserPosition(userId, dto.position);
  }

  /**
   * 取得權限申請列表（管理者）
   */
  @Get("requests")
  @RequirePermissions(Permission.PERMISSIONS_MANAGE)
  async getPermissionRequests(@Query() query: PermissionRequestQueryDto) {
    return this.permissionsService.getPermissionRequests(
      query.status,
      query.page || 1,
      query.limit || 20,
    );
  }

  /**
   * 取得我的權限申請記錄
   */
  @Get("requests/my")
  async getMyPermissionRequests(@CurrentUser() user: JwtPayload) {
    return this.permissionsService.getMyPermissionRequests(user.id);
  }

  /**
   * 提交權限申請
   */
  @Post("requests")
  async createPermissionRequest(
    @Body() dto: CreatePermissionRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.permissionsService.createPermissionRequest(
      user.id,
      dto.permission,
      dto.reason,
    );
  }

  /**
   * 審核權限申請
   */
  @Post("requests/:id/review")
  @RequirePermissions(Permission.PERMISSIONS_MANAGE)
  async reviewPermissionRequest(
    @Param("id") requestId: string,
    @Body() dto: ReviewPermissionRequestDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.permissionsService.reviewPermissionRequest(
      requestId,
      user.id,
      dto.approved,
      dto.reviewNote,
    );
  }

  /**
   * 取得權限矩陣
   */
  @Get("matrix")
  @RequirePermissions(Permission.PERMISSIONS_MANAGE)
  async getPermissionMatrix(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.permissionsService.getPermissionMatrix(page || 1, limit || 20);
  }

  /**
   * 取得權限定義（前端用）
   */
  @Get("definitions")
  getPermissionDefinitions() {
    return {
      permissions: Permission,
      permissionLabels: PermissionLabels,
      permissionCategories: PermissionCategories,
      positionLabels: PositionLabels,
      defaultPermissionsByPosition: DefaultPermissionsByPosition,
    };
  }
}
