import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  Permission,
  PermissionRequestStatus,
  Position,
  DefaultPermissionsByPosition,
} from "../shared";

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * 取得職位的預設權限
   */
  getDefaultPermissions(position: Position): Permission[] {
    return DefaultPermissionsByPosition[position] || [];
  }

  /**
   * 取得使用者的所有有效權限（預設 + 自定義）
   */
  async getUserPermissions(userId: string): Promise<Permission[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customPermissions: {
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // 取得職位預設權限
    const position = user.position as Position;
    const defaultPermissions = this.getDefaultPermissions(position);
    const effectivePermissions = new Set<Permission>(defaultPermissions);

    // 套用自定義權限
    for (const customPerm of user.customPermissions) {
      const permission = customPerm.permission as Permission;
      if (customPerm.granted) {
        effectivePermissions.add(permission);
      } else {
        effectivePermissions.delete(permission);
      }
    }

    return Array.from(effectivePermissions);
  }

  /**
   * 取得使用者權限詳情（包含來源）
   */
  async getUserPermissionDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customPermissions: {
          where: {
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          include: {
            grantedBy: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const position = user.position as Position;
    const defaultPermissions = this.getDefaultPermissions(position);
    const effectivePermissions = await this.getUserPermissions(userId);

    return {
      userId,
      position,
      defaultPermissions,
      customPermissions: user.customPermissions.map((cp) => ({
        permission: cp.permission as Permission,
        granted: cp.granted,
        grantedAt: cp.grantedAt,
        expiresAt: cp.expiresAt,
        reason: cp.reason,
        grantedBy: cp.grantedBy,
      })),
      effectivePermissions,
    };
  }

  /**
   * 檢查使用者是否擁有特定權限
   */
  async hasPermission(
    userId: string,
    permission: Permission,
  ): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId);
    return permissions.includes(permission);
  }

  /**
   * 檢查使用者是否擁有任一權限
   */
  async hasAnyPermission(
    userId: string,
    permissions: Permission[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.some((p) => userPermissions.includes(p));
  }

  /**
   * 檢查使用者是否擁有所有權限
   */
  async hasAllPermissions(
    userId: string,
    permissions: Permission[],
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    return permissions.every((p) => userPermissions.includes(p));
  }

  /**
   * 授予使用者權限
   */
  async grantPermission(
    userId: string,
    permission: Permission,
    grantedById: string,
    reason?: string,
    expiresAt?: Date,
  ) {
    // 驗證使用者存在
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // 使用 upsert 來處理已存在的情況
    return this.prisma.userPermission.upsert({
      where: {
        userId_permission: {
          userId,
          permission,
        },
      },
      create: {
        userId,
        permission,
        granted: true,
        grantedById,
        reason,
        expiresAt,
      },
      update: {
        granted: true,
        grantedById,
        grantedAt: new Date(),
        reason,
        expiresAt,
      },
    });
  }

  /**
   * 撤銷使用者權限
   */
  async revokePermission(
    userId: string,
    permission: Permission,
    revokedById: string,
    reason?: string,
  ) {
    // 檢查是否為預設權限
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const position = user.position as Position;
    const defaultPermissions = this.getDefaultPermissions(position);

    if (defaultPermissions.includes(permission)) {
      // 如果是預設權限，建立一個 granted=false 的記錄來覆蓋
      return this.prisma.userPermission.upsert({
        where: {
          userId_permission: {
            userId,
            permission,
          },
        },
        create: {
          userId,
          permission,
          granted: false,
          grantedById: revokedById,
          reason,
        },
        update: {
          granted: false,
          grantedById: revokedById,
          grantedAt: new Date(),
          reason,
        },
      });
    } else {
      // 如果不是預設權限，直接刪除記錄
      return this.prisma.userPermission.deleteMany({
        where: {
          userId,
          permission,
        },
      });
    }
  }

  /**
   * 建立權限申請
   */
  async createPermissionRequest(
    requesterId: string,
    permission: Permission,
    reason: string,
  ) {
    // 檢查是否已經有待審核的相同申請
    const existingRequest = await this.prisma.permissionRequest.findFirst({
      where: {
        requesterId,
        permission,
        status: PermissionRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ConflictException(
        "Already have a pending request for this permission",
      );
    }

    // 檢查是否已經擁有該權限
    const hasPermission = await this.hasPermission(requesterId, permission);
    if (hasPermission) {
      throw new BadRequestException("Already have this permission");
    }

    return this.prisma.permissionRequest.create({
      data: {
        requesterId,
        permission,
        reason,
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true, position: true },
        },
      },
    });
  }

  /**
   * 取得權限申請列表
   */
  async getPermissionRequests(
    status?: PermissionRequestStatus,
    page = 1,
    limit = 20,
  ) {
    const where = status ? { status } : {};
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.permissionRequest.findMany({
        where,
        include: {
          requester: {
            select: { id: true, name: true, email: true, position: true },
          },
          reviewer: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.permissionRequest.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 取得使用者的權限申請記錄
   */
  async getMyPermissionRequests(userId: string) {
    return this.prisma.permissionRequest.findMany({
      where: { requesterId: userId },
      include: {
        reviewer: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * 審核權限申請
   */
  async reviewPermissionRequest(
    requestId: string,
    reviewerId: string,
    approved: boolean,
    reviewNote?: string,
  ) {
    const request = await this.prisma.permissionRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException("Permission request not found");
    }

    if (request.status !== PermissionRequestStatus.PENDING) {
      throw new BadRequestException("Request is not pending");
    }

    // 更新申請狀態
    const updatedRequest = await this.prisma.permissionRequest.update({
      where: { id: requestId },
      data: {
        status: approved
          ? PermissionRequestStatus.APPROVED
          : PermissionRequestStatus.REJECTED,
        reviewerId,
        reviewedAt: new Date(),
        reviewNote,
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true, position: true },
        },
        reviewer: {
          select: { id: true, name: true },
        },
      },
    });

    // 如果核准，授予權限
    if (approved) {
      await this.grantPermission(
        request.requesterId,
        request.permission as Permission,
        reviewerId,
        `Approved permission request: ${reviewNote || request.reason}`,
      );
    }

    return updatedRequest;
  }

  /**
   * 取得權限矩陣（所有使用者的權限狀態）
   */
  async getPermissionMatrix(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          position: true,
          customPermissions: {
            where: {
              OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where: { isActive: true } }),
    ]);

    const matrix = users.map((user) => {
      const position = user.position as Position;
      const defaultPermissions = this.getDefaultPermissions(position);
      const effectivePermissions = new Set<Permission>(defaultPermissions);

      for (const cp of user.customPermissions) {
        const permission = cp.permission as Permission;
        if (cp.granted) {
          effectivePermissions.add(permission);
        } else {
          effectivePermissions.delete(permission);
        }
      }

      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        position,
        permissions: Array.from(effectivePermissions),
        customPermissionCount: user.customPermissions.length,
      };
    });

    return {
      items: matrix,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 批量更新使用者職位
   */
  async updateUserPosition(userId: string, position: Position) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { position },
    });
  }
}
