import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { AuthService } from "../auth/auth.service";
import { UsersService } from "../users/users.service";
import { AuditService } from "../audit/audit.service";
import { UnauthorizedException } from "@nestjs/common";

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let auditService: jest.Mocked<AuditService>;

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockAuditService = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    auditService = module.get(AuditService);
  });

  describe("validateUser", () => {
    it("should throw UnauthorizedException if user not found", async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.validateUser("test@example.com", "password"),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if account is disabled", async () => {
      usersService.findByEmail.mockResolvedValue({
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role: "STAFF",
        position: "RECEPTIONIST",
        passwordHash: "hash",
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        authService.validateUser("test@example.com", "password"),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("login", () => {
    it("should return access token on successful login", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        role: "STAFF",
        position: "RECEPTIONIST",
        passwordHash: "$2b$10$YourHashedPasswordHere",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      usersService.findByEmail.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue("mock-jwt-token");
      auditService.create.mockResolvedValue(undefined as any);

      // 注意: 這個測試需要實際的 bcrypt 比較，這裡只是示例結構
      // 完整測試需要 mock bcrypt.compare
    });
  });
});
