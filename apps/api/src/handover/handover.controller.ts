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
} from '@nestjs/common';
import { HandoverService } from './handover.service';
import { CreateHandoverDto } from './dto/create-handover.dto';
import { UpdateHandoverDto } from './dto/update-handover.dto';
import { QueryHandoverDto } from './dto/query-handover.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@clinic-os/shared';

@Controller('handovers')
@UseGuards(RolesGuard)
export class HandoverController {
  constructor(private handoverService: HandoverService) {}

  @Get()
  findAll(
    @Query() query: QueryHandoverDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.handoverService.findAll(query, user);
  }

  @Get('my')
  findMyHandovers(@CurrentUser('id') userId: string) {
    return this.handoverService.findMyHandovers(userId);
  }

  @Get('urgent')
  getUrgentHandovers() {
    return this.handoverService.getUrgentHandovers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.handoverService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateHandoverDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.handoverService.create(dto, userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHandoverDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.handoverService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(Role.SUPERVISOR)
  remove(@Param('id') id: string) {
    return this.handoverService.delete(id);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.handoverService.addComment(id, dto.content, userId);
  }
}
