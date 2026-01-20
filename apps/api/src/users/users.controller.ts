import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { Role } from "../shared";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";

@Controller("users")
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Get()
  @Roles(Role.SUPERVISOR)
  findAll(@Query("includeInactive") includeInactive?: boolean) {
    return this.usersService.findAll(includeInactive);
  }

  @Get(":id")
  @Roles(Role.SUPERVISOR)
  findOne(@Param("id") id: string) {
    return this.usersService.findById(id);
  }

  @Patch(":id")
  @Roles(Role.ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  remove(@Param("id") id: string) {
    return this.usersService.delete(id);
  }

  @Post(":id/reset-password")
  @Roles(Role.ADMIN)
  resetPassword(@Param("id") id: string) {
    return this.usersService.resetPassword(id);
  }

  @Get("role/:role")
  @Roles(Role.SUPERVISOR)
  findByRole(@Param("role") role: Role) {
    return this.usersService.findByRole(role);
  }
}
