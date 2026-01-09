export enum Role {
  STAFF = 'STAFF',
  SUPERVISOR = 'SUPERVISOR',
  ADMIN = 'ADMIN',
}

export const RoleLabels: Record<Role, string> = {
  [Role.STAFF]: '員工',
  [Role.SUPERVISOR]: '主管',
  [Role.ADMIN]: '管理員',
};

export const RoleHierarchy: Record<Role, number> = {
  [Role.STAFF]: 1,
  [Role.SUPERVISOR]: 2,
  [Role.ADMIN]: 3,
};
