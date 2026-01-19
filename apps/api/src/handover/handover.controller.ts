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
import { HandoverService } from "./handover.service";
import { CreateHandoverDto } from "./dto/create-handover.dto";
import { UpdateHandoverDto } from "./dto/update-handover.dto";
import { QueryHandoverDto } from "./dto/query-handover.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import {
  SetCategoriesDto,
  AddCollaboratorDto,
  CreateChecklistDto,
  UpdateChecklistDto,
  CreateSubTaskDto,
} from "./dto/task-enhanced.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "../shared";

@Controller("handovers")
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

  @Get("my")
  findMyHandovers(@CurrentUser("id") userId: string) {
    return this.handoverService.findMyHandovers(userId);
  }

  @Get("urgent")
  getUrgentHandovers() {
    return this.handoverService.getUrgentHandovers();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.handoverService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateHandoverDto, @CurrentUser("id") userId: string) {
    return this.handoverService.create(dto, userId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateHandoverDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.handoverService.update(id, dto, user);
  }

  @Delete(":id")
  @Roles(Role.SUPERVISOR)
  remove(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.handoverService.delete(id, userId);
  }

  @Post(":id/comments")
  addComment(
    @Param("id") id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.handoverService.addComment(id, dto.content, userId);
  }

  // ==================== Task Categories ====================

  @Get("categories/all")
  getTaskCategories() {
    return this.handoverService.getTaskCategories();
  }

  @Post("categories")
  @Roles(Role.ADMIN)
  createTaskCategory(
    @Body() dto: { name: string; color?: string; description?: string },
  ) {
    return this.handoverService.createTaskCategory(dto.name, dto.color, dto.description);
  }

  @Post(":id/categories")
  @Roles(Role.SUPERVISOR)
  setCategories(@Param("id") id: string, @Body() dto: SetCategoriesDto) {
    return this.handoverService.setCategories(id, dto);
  }

  // ==================== Collaborators ====================

  @Post(":id/collaborators")
  addCollaborator(
    @Param("id") id: string,
    @Body() dto: AddCollaboratorDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.handoverService.addCollaborator(id, dto, user);
  }

  @Delete(":id/collaborators/:userId")
  @Roles(Role.SUPERVISOR)
  removeCollaborator(
    @Param("id") id: string,
    @Param("userId") userId: string,
  ) {
    return this.handoverService.removeCollaborator(id, userId);
  }

  // ==================== Checklists ====================

  @Post(":id/checklist")
  addChecklist(@Param("id") id: string, @Body() dto: CreateChecklistDto) {
    return this.handoverService.addChecklist(id, dto);
  }

  @Patch(":id/checklist/:checklistId")
  updateChecklist(
    @Param("id") id: string,
    @Param("checklistId") checklistId: string,
    @Body() dto: UpdateChecklistDto,
  ) {
    return this.handoverService.updateChecklist(id, checklistId, dto);
  }

  @Delete(":id/checklist/:checklistId")
  deleteChecklist(
    @Param("id") id: string,
    @Param("checklistId") checklistId: string,
  ) {
    return this.handoverService.deleteChecklist(id, checklistId);
  }

  // ==================== SubTasks ====================

  @Post(":id/subtasks")
  createSubTask(
    @Param("id") id: string,
    @Body() dto: CreateSubTaskDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.handoverService.createSubTask(id, dto, userId);
  }

  @Get(":id/subtasks")
  getSubTasks(@Param("id") id: string) {
    return this.handoverService.getSubTasks(id);
  }

  // ==================== Stats ====================

  @Get("stats/overview")
  @Roles(Role.SUPERVISOR)
  getTaskStats() {
    return this.handoverService.getTaskStats();
  }
}
