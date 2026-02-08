import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service";
import { AuditService } from "../audit/audit.service";
import { JwtPayload } from "../shared";

// Bcrypt cost factor - 建議生產環境使用 12
const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // 安全：不在日誌中記錄電子郵件，使用通用訊息
      this.logger.warn("Login failed: user not found");
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Account is disabled");
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // 安全：不在日誌中記錄電子郵件
      this.logger.warn(`Login failed: invalid password for user: ${user.id}`);
      throw new UnauthorizedException("Invalid email or password");
    }

    // Return user without password
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(email: string, password: string) {
    // 安全：只記錄嘗試登入，不記錄電子郵件
    this.logger.log("Login attempt received");

    const user = await this.validateUser(email, password);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as JwtPayload["role"],
      position: user.position as JwtPayload["position"],
    };

    // 安全：只記錄用戶 ID，不記錄電子郵件
    this.logger.log(`Login successful for user: ${user.id}`);

    // 記錄登入審計日誌
    await this.auditService.create({
      action: "AUTH_LOGIN",
      userId: user.id,
      targetId: user.id,
      targetType: "USER",
      metadata: { email: user.email },
    });

    return {
      user,
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(email: string, password: string, name: string) {
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new BadRequestException("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await this.usersService.create({
      email,
      name,
      passwordHash: hashedPassword,
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  verifyToken(token: string) {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
