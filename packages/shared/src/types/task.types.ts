import { TaskCollaboratorRole } from '../enums/task.enum';
import { UserWithoutPassword } from './user.types';

// Task Category
export interface TaskCategory {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskCategoryDto {
  name: string;
  color?: string;
  icon?: string;
  description?: string;
}

// Task Collaborator
export interface TaskCollaborator {
  id: string;
  handoverId: string;
  userId: string;
  user?: UserWithoutPassword;
  role: TaskCollaboratorRole;
  createdAt: Date;
}

export interface AddCollaboratorDto {
  userId: string;
  role?: TaskCollaboratorRole;
}

// Task Checklist
export interface TaskChecklist {
  id: string;
  handoverId: string;
  content: string;
  isCompleted: boolean;
  completedAt?: Date | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateChecklistDto {
  content: string;
  sortOrder?: number;
}

export interface UpdateChecklistDto {
  content?: string;
  isCompleted?: boolean;
  sortOrder?: number;
}

// Extended Handover (Enhanced Task)
export interface EnhancedHandover {
  id: string;
  title: string;
  content: string;
  status: string;
  priority: string;
  dueDate?: Date | null;
  createdById: string;
  createdBy?: UserWithoutPassword;
  assigneeId?: string | null;
  assignee?: UserWithoutPassword | null;
  shiftId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date | null;

  // Enhanced fields
  estimatedHours?: number | null;
  actualHours?: number | null;
  blockedReason?: string | null;
  parentId?: string | null;
  parent?: EnhancedHandover | null;
  subTasks?: EnhancedHandover[];

  // Relations
  categories?: TaskCategoryAssignment[];
  collaborators?: TaskCollaborator[];
  checklists?: TaskChecklist[];
}

export interface TaskCategoryAssignment {
  id: string;
  handoverId: string;
  categoryId: string;
  category?: TaskCategory;
  createdAt: Date;
}

export interface UpdateTaskEnhancedDto {
  estimatedHours?: number | null;
  actualHours?: number | null;
  blockedReason?: string | null;
  parentId?: string | null;
}

export interface SetCategoriesDto {
  categoryIds: string[];
}

export interface CreateSubTaskDto {
  title: string;
  content: string;
  priority?: string;
  dueDate?: string;
  assigneeId?: string;
}
