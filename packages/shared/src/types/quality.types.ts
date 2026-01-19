import {
  IncidentSeverity,
  IncidentStatus,
  ComplaintSource,
  ComplaintStatus,
} from '../enums/quality.enum';
import { UserWithoutPassword } from './user.types';

// Incident Type
export interface IncidentType {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  severity: IncidentSeverity;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIncidentTypeDto {
  name: string;
  category?: string;
  description?: string;
  severity?: IncidentSeverity;
}

// Incident
export interface Incident {
  id: string;
  incidentNo: string;
  typeId: string;
  type?: IncidentType;
  title: string;
  description: string;
  occurredAt: Date;
  location?: string | null;
  severity: IncidentSeverity;
  isNearMiss: boolean;
  reporterId: string;
  reporter?: UserWithoutPassword;
  status: IncidentStatus;
  handlerId?: string | null;
  handler?: UserWithoutPassword | null;
  rootCause?: string | null;
  correctiveAction?: string | null;
  preventiveAction?: string | null;
  closedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  followUps?: IncidentFollowUp[];
}

export interface CreateIncidentDto {
  typeId: string;
  title: string;
  description: string;
  occurredAt: string;
  location?: string;
  severity?: IncidentSeverity;
  isNearMiss?: boolean;
}

export interface UpdateIncidentDto {
  title?: string;
  description?: string;
  location?: string;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  handlerId?: string | null;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
}

export interface IncidentQueryDto {
  typeId?: string;
  status?: IncidentStatus;
  severity?: IncidentSeverity;
  isNearMiss?: boolean;
  reporterId?: string;
  handlerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Incident Follow Up
export interface IncidentFollowUp {
  id: string;
  incidentId: string;
  authorId: string;
  author?: UserWithoutPassword;
  content: string;
  actionTaken?: string | null;
  createdAt: Date;
}

export interface CreateFollowUpDto {
  content: string;
  actionTaken?: string;
}

// Complaint
export interface Complaint {
  id: string;
  complaintNo: string;
  title: string;
  description: string;
  source: ComplaintSource;
  severity: IncidentSeverity;
  status: ComplaintStatus;
  handlerId?: string | null;
  handler?: UserWithoutPassword | null;
  resolution?: string | null;
  closedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateComplaintDto {
  title: string;
  description: string;
  source: ComplaintSource;
  severity?: IncidentSeverity;
}

export interface UpdateComplaintDto {
  title?: string;
  description?: string;
  source?: ComplaintSource;
  severity?: IncidentSeverity;
  status?: ComplaintStatus;
  handlerId?: string | null;
  resolution?: string;
}

export interface ComplaintQueryDto {
  source?: ComplaintSource;
  status?: ComplaintStatus;
  severity?: IncidentSeverity;
  handlerId?: string;
  page?: number;
  limit?: number;
}

// Quality Stats
export interface QualityStats {
  openIncidents: number;
  nearMissCount: number;
  openComplaints: number;
  monthlyIncidents: number;
  monthlyComplaints: number;
}

// Incident Trends
export interface IncidentTrend {
  date: string;
  count: number;
  byType: Record<string, number>;
  bySeverity: Record<IncidentSeverity, number>;
}
