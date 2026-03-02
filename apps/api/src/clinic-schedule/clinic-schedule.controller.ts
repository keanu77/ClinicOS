import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ClinicScheduleService } from "./clinic-schedule.service";
import { CreateClinicSlotDto } from "./dto/create-clinic-slot.dto";
import { UpdateClinicSlotDto } from "./dto/update-clinic-slot.dto";
import { QueryClinicSlotDto } from "./dto/query-clinic-slot.dto";
import { CopyMonthDto } from "./dto/copy-month.dto";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { Role } from "../shared";

@Controller("clinic-schedule")
@UseGuards(RolesGuard)
export class ClinicScheduleController {
  constructor(private readonly clinicScheduleService: ClinicScheduleService) {}

  @Get("slots")
  findAll(@Query() query: QueryClinicSlotDto) {
    return this.clinicScheduleService.findAll(query);
  }

  @Get("slots/:id")
  findOne(@Param("id") id: string) {
    return this.clinicScheduleService.findOne(id);
  }

  @Post("slots")
  @Roles(Role.SUPERVISOR)
  create(@Body() dto: CreateClinicSlotDto) {
    return this.clinicScheduleService.create(dto);
  }

  @Patch("slots/:id")
  @Roles(Role.SUPERVISOR)
  update(@Param("id") id: string, @Body() dto: UpdateClinicSlotDto) {
    return this.clinicScheduleService.update(id, dto);
  }

  @Delete("slots/:id")
  @Roles(Role.SUPERVISOR)
  remove(@Param("id") id: string) {
    return this.clinicScheduleService.remove(id);
  }

  @Post("slots/copy-month")
  @Roles(Role.SUPERVISOR)
  copyMonth(@Body() dto: CopyMonthDto) {
    return this.clinicScheduleService.copyMonth(dto);
  }
}
