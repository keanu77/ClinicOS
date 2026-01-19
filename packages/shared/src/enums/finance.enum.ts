// Finance Module Enums

export enum CostType {
  FIXED = 'FIXED',
  VARIABLE = 'VARIABLE',
}

export const CostTypeLabels: Record<CostType, string> = {
  [CostType.FIXED]: '固定成本',
  [CostType.VARIABLE]: '變動成本',
};
