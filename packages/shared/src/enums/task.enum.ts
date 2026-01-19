// Enhanced Task Module Enums

export enum TaskCollaboratorRole {
  COLLABORATOR = 'COLLABORATOR',
  REVIEWER = 'REVIEWER',
  OBSERVER = 'OBSERVER',
}

export const TaskCollaboratorRoleLabels: Record<TaskCollaboratorRole, string> = {
  [TaskCollaboratorRole.COLLABORATOR]: '協作者',
  [TaskCollaboratorRole.REVIEWER]: '審核者',
  [TaskCollaboratorRole.OBSERVER]: '觀察者',
};
