/**
 * Badge Variant 工具函數
 * 統一管理各種 Badge 的顏色樣式
 */

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'danger'
  | 'warning'
  | 'success'
  | 'outline';

/**
 * 取得交班優先度的 Badge 樣式
 */
export function getPriorityBadgeVariant(priority: string): BadgeVariant {
  switch (priority) {
    case 'URGENT':
      return 'danger';
    case 'HIGH':
      return 'warning';
    case 'MEDIUM':
      return 'default';
    default:
      return 'secondary';
  }
}

/**
 * 取得交班狀態的 Badge 樣式
 */
export function getStatusBadgeVariant(status: string): BadgeVariant {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'IN_PROGRESS':
      return 'default';
    case 'CANCELLED':
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * 取得稽核動作的 Badge 樣式
 */
export function getActionBadgeVariant(action: string): BadgeVariant {
  switch (action) {
    case 'CREATE':
      return 'success';
    case 'DELETE':
      return 'danger';
    case 'UPDATE':
    case 'STATUS_CHANGE':
      return 'warning';
    default:
      return 'secondary';
  }
}

/**
 * 取得庫存異動類型的 Badge 樣式
 */
export function getTxnBadgeVariant(type: string): BadgeVariant {
  switch (type) {
    case 'IN':
      return 'success';
    case 'OUT':
      return 'danger';
    case 'ADJUST':
      return 'default';
    default:
      return 'secondary';
  }
}
