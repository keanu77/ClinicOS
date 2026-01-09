export enum InventoryTxnType {
  IN = "IN",
  OUT = "OUT",
  ADJUST = "ADJUST",
  EXPIRED = "EXPIRED",
}

export const InventoryTxnTypeLabels: Record<InventoryTxnType, string> = {
  [InventoryTxnType.IN]: "入庫",
  [InventoryTxnType.OUT]: "出庫",
  [InventoryTxnType.ADJUST]: "調整",
  [InventoryTxnType.EXPIRED]: "過期",
};

export const InventoryTxnTypeColors: Record<InventoryTxnType, string> = {
  [InventoryTxnType.IN]: "green",
  [InventoryTxnType.OUT]: "red",
  [InventoryTxnType.ADJUST]: "blue",
  [InventoryTxnType.EXPIRED]: "gray",
};
