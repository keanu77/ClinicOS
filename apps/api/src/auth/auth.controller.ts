import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // 登入端點：嚴格限制為每分鐘 5 次請求，防止暴力破解
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  // 驗證端點：同樣限制請求頻率
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post("validate")
  async validate(@Body() dto: LoginDto) {
    // Used by NextAuth.js to validate credentials
    return this.authService.validateUser(dto.email, dto.password);
  }

  @Get("me")
  async me(@CurrentUser() user: any) {
    return user;
  }
}
