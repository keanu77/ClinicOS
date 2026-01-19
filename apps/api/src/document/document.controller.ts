import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { DocumentService } from "./document.service";
import {
  CreateDocumentCategoryDto,
  CreateDocumentDto,
  UpdateDocumentDto,
  PublishDocumentDto,
  QueryDocumentDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  QueryAnnouncementDto,
} from "./dto/document.dto";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Role } from "../shared";

@Controller("documents")
@UseGuards(RolesGuard)
export class DocumentController {
  constructor(private documentService: DocumentService) {}

  // ==================== Document Categories ====================

  @Get("categories")
  getCategories() {
    return this.documentService.getCategories();
  }

  @Post("categories")
  @Roles(Role.SUPERVISOR)
  createCategory(@Body() dto: CreateDocumentCategoryDto) {
    return this.documentService.createCategory(dto);
  }

  // ==================== Documents ====================

  @Get()
  getDocuments(@Query() query: QueryDocumentDto) {
    return this.documentService.getDocuments(query);
  }

  @Get("my-unread")
  getMyUnreadDocuments(@CurrentUser("id") userId: string) {
    return this.documentService.getMyUnreadDocuments(userId);
  }

  @Get("stats")
  getDocumentStats(@CurrentUser("id") userId: string) {
    return this.documentService.getDocumentStats(userId);
  }

  @Get(":id")
  getDocument(@Param("id") id: string) {
    return this.documentService.getDocument(id);
  }

  @Post()
  @Roles(Role.SUPERVISOR)
  createDocument(
    @Body() dto: CreateDocumentDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.documentService.createDocument(dto, userId);
  }

  @Patch(":id")
  @Roles(Role.SUPERVISOR)
  updateDocument(
    @Param("id") id: string,
    @Body() dto: UpdateDocumentDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.documentService.updateDocument(id, dto, userId);
  }

  @Post(":id/publish")
  @Roles(Role.ADMIN)
  publishDocument(
    @Param("id") id: string,
    @Body() dto: PublishDocumentDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.documentService.publishDocument(id, dto, userId);
  }

  @Post(":id/confirm-read")
  confirmRead(@Param("id") id: string, @CurrentUser("id") userId: string) {
    return this.documentService.confirmRead(id, userId);
  }

  // ==================== Announcements ====================

  @Get("announcements/list")
  getAnnouncements(
    @Query() query: QueryAnnouncementDto,
    @CurrentUser() user: { id: string; role: string },
  ) {
    return this.documentService.getAnnouncements(query, user.id, user.role);
  }

  @Post("announcements")
  @Roles(Role.SUPERVISOR)
  createAnnouncement(
    @Body() dto: CreateAnnouncementDto,
    @CurrentUser("id") userId: string,
  ) {
    return this.documentService.createAnnouncement(dto, userId);
  }

  @Patch("announcements/:id")
  @Roles(Role.SUPERVISOR)
  updateAnnouncement(
    @Param("id") id: string,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    return this.documentService.updateAnnouncement(id, dto);
  }

  @Post("announcements/:id/read")
  markAnnouncementRead(
    @Param("id") id: string,
    @CurrentUser("id") userId: string,
  ) {
    return this.documentService.markAnnouncementRead(id, userId);
  }
}
