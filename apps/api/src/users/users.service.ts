import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Role } from "../shared";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { CreateUserDto } from "./dto/create-user.dto";

// Bcrypt cost factor - 建議生產環境使用 12
const BCRYPT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive = false) {
    return this.prisma.user.findMany({
      where: includeInactive ? {} : { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // 注意：不返回 passwordHash
      },
    });
  }

  // 內部使用：需要包含 passwordHash 的查詢（僅用於認證）
  async findByIdWithPassword(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: string;
  }) {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role || Role.STAFF,
      },
    });
  }

  async update(
    id: string,
    data: { name?: string; role?: string; isActive?: boolean },
  ) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async delete(id: string) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Soft delete
    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async findByRole(role: Role) {
    return this.prisma.user.findMany({
      where: { role, isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });
  }

  async createUser(dto: CreateUserDto) {
    const existingUser = await this.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException("Email already exists");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: dto.role || Role.STAFF,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async resetPassword(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // 使用密碼學安全的隨機數生成臨時密碼
    const tempPassword = crypto.randomBytes(12).toString("base64url");
    const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    // 注意：生產環境應透過安全的管道（如電子郵件）發送臨時密碼
    // 絕對不要在 API 回應中返回密碼
    // TODO: 實作郵件發送功能
    return {
      message: "密碼已重置，請透過其他安全管道通知使用者新密碼",
      // 開發環境可透過日誌查看，生產環境應發送郵件
      ...(process.env.NODE_ENV !== "production" && { tempPassword }),
    };
  }
}
