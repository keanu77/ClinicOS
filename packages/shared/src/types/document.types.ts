import { DocumentStatus, AnnouncementPriority } from '../enums/document.enum';
import { UserWithoutPassword } from './user.types';

// Document Category
export interface DocumentCategory {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  parent?: DocumentCategory | null;
  children?: DocumentCategory[];
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentCategoryDto {
  name: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
}

// Document
export interface Document {
  id: string;
  docNo: string;
  title: string;
  content: string;
  categoryId?: string | null;
  category?: DocumentCategory | null;
  createdById: string;
  createdBy?: UserWithoutPassword;
  status: DocumentStatus;
  version: number;
  publishedAt?: Date | null;
  effectiveDate?: Date | null;
  reviewDate?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  versions?: DocumentVersion[];
  readConfirmations?: DocumentReadConfirmation[];
}

export interface CreateDocumentDto {
  docNo: string;
  title: string;
  content: string;
  categoryId?: string;
  effectiveDate?: string;
  reviewDate?: string;
}

export interface UpdateDocumentDto {
  title?: string;
  content?: string;
  categoryId?: string | null;
  effectiveDate?: string | null;
  reviewDate?: string | null;
}

export interface PublishDocumentDto {
  changeNotes?: string;
}

export interface DocumentQueryDto {
  categoryId?: string;
  status?: DocumentStatus;
  search?: string;
  page?: number;
  limit?: number;
}

// Document Version
export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  title: string;
  content: string;
  changeNotes?: string | null;
  publishedAt?: Date | null;
  createdAt: Date;
}

// Document Read Confirmation
export interface DocumentReadConfirmation {
  id: string;
  documentId: string;
  userId: string;
  user?: UserWithoutPassword;
  version: number;
  readAt: Date;
}

// Announcement
export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  isPinned: boolean;
  createdById: string;
  createdBy?: UserWithoutPassword;
  publishAt: Date;
  expireAt?: Date | null;
  targetRoles?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  readConfirmations?: AnnouncementReadConfirmation[];
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  priority?: AnnouncementPriority;
  isPinned?: boolean;
  publishAt?: string;
  expireAt?: string;
  targetRoles?: string[];
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  priority?: AnnouncementPriority;
  isPinned?: boolean;
  publishAt?: string;
  expireAt?: string | null;
  targetRoles?: string[] | null;
  isActive?: boolean;
}

export interface AnnouncementQueryDto {
  priority?: AnnouncementPriority;
  isPinned?: boolean;
  page?: number;
  limit?: number;
}

// Announcement Read Confirmation
export interface AnnouncementReadConfirmation {
  id: string;
  announcementId: string;
  userId: string;
  user?: UserWithoutPassword;
  readAt: Date;
}

// Document Stats
export interface DocumentStats {
  totalDocuments: number;
  publishedDocuments: number;
  draftDocuments: number;
  myUnreadDocuments: number;
  activeAnnouncements: number;
}
