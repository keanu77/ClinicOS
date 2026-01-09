import { HandoverStatus, HandoverPriority } from "../enums/handover.enum";
import { UserWithoutPassword } from "./user.types";

export interface Handover {
  id: string;
  title: string;
  content: string;
  status: HandoverStatus;
  priority: HandoverPriority;
  dueDate?: Date | null;
  createdById: string;
  createdBy?: UserWithoutPassword;
  assigneeId?: string | null;
  assignee?: UserWithoutPassword | null;
  shiftId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;
  comments?: HandoverComment[];
}

export interface HandoverComment {
  id: string;
  content: string;
  handoverId: string;
  authorId: string;
  author?: UserWithoutPassword;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHandoverDto {
  title: string;
  content: string;
  priority?: HandoverPriority;
  dueDate?: string;
  assigneeId?: string;
  shiftId?: string;
}

export interface UpdateHandoverDto {
  title?: string;
  content?: string;
  status?: HandoverStatus;
  priority?: HandoverPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export interface CreateCommentDto {
  content: string;
}

export interface HandoverQueryDto {
  status?: HandoverStatus;
  priority?: HandoverPriority;
  assigneeId?: string;
  createdById?: string;
  page?: number;
  limit?: number;
}

export interface HandoverListResponse {
  data: Handover[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
