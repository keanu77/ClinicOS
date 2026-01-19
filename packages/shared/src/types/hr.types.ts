import { CertificationStatus, SkillLevel, LeaveType, LeaveStatus } from '../enums/hr.enum';
import { UserWithoutPassword } from './user.types';

// Employee Profile
export interface EmployeeProfile {
  id: string;
  userId: string;
  user?: UserWithoutPassword;
  department?: string | null;
  position?: string | null;
  employeeNo?: string | null;
  hireDate?: Date | null;
  phone?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEmployeeProfileDto {
  userId: string;
  department?: string;
  position?: string;
  employeeNo?: string;
  hireDate?: string;
  phone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  notes?: string;
}

export interface UpdateEmployeeProfileDto {
  department?: string;
  position?: string;
  employeeNo?: string;
  hireDate?: string | null;
  phone?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  notes?: string;
}

// Certification
export interface Certification {
  id: string;
  userId: string;
  user?: UserWithoutPassword;
  name: string;
  issuingOrg?: string | null;
  certNo?: string | null;
  issueDate?: Date | null;
  expiryDate?: Date | null;
  status: CertificationStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCertificationDto {
  userId: string;
  name: string;
  issuingOrg?: string;
  certNo?: string;
  issueDate?: string;
  expiryDate?: string;
  notes?: string;
}

export interface UpdateCertificationDto {
  name?: string;
  issuingOrg?: string;
  certNo?: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  status?: CertificationStatus;
  notes?: string;
}

// Skill
export interface SkillDefinition {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeSkill {
  id: string;
  userId: string;
  user?: UserWithoutPassword;
  skillId: string;
  skill?: SkillDefinition;
  level: SkillLevel;
  certifiedAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSkillDefinitionDto {
  name: string;
  description?: string;
  category?: string;
}

export interface AssignSkillDto {
  userId: string;
  skillId: string;
  level?: SkillLevel;
  certifiedAt?: string;
  notes?: string;
}

// Leave
export interface LeaveRecord {
  id: string;
  requesterId: string;
  requester?: UserWithoutPassword;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason?: string | null;
  status: LeaveStatus;
  approverId?: string | null;
  approver?: UserWithoutPassword | null;
  approvedAt?: Date | null;
  rejectReason?: string | null;
  coverUserId?: string | null;
  coverUser?: UserWithoutPassword | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLeaveDto {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason?: string;
  coverUserId?: string;
}

export interface ApproveLeaveDto {
  approved: boolean;
  rejectReason?: string;
}

export interface LeaveQueryDto {
  requesterId?: string;
  status?: LeaveStatus;
  leaveType?: LeaveType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Employee with full details
export interface EmployeeWithDetails {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  profile?: EmployeeProfile | null;
  certifications?: Certification[];
  skills?: EmployeeSkill[];
}

// HR Dashboard stats
export interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  expiringCertifications: number;
  pendingLeaves: number;
  todayLeaves: number;
}
