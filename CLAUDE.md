# Clinic OS - 診所營運管理系統

## 專案概述

Clinic OS 是一個診所營運管理系統，包含交班、庫存、排班管理功能。

## 技術架構

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend**: NestJS + Prisma ORM
- **Database**: SQLite (MVP) → MySQL ready
- **Auth**: NextAuth.js v5 + JWT
- **Structure**: pnpm monorepo

## 專案結構

```
clinic-os/
├── apps/
│   ├── web/           # Next.js 前端 (@clinic-os/web)
│   └── api/           # NestJS 後端 (@clinic-os/api)
└── packages/
    └── shared/        # 共用型別與列舉 (@clinic-os/shared)
```

## 快速開始

```bash
# 1. 安裝依賴
pnpm install

# 2. 設定環境變數
cp .env.example .env
# 編輯 .env 填入必要值

# 3. 初始化資料庫
pnpm db:push
pnpm db:seed

# 4. 啟動開發伺服器
pnpm dev
```

## 服務端口

- Frontend: http://localhost:3000 (或 3001，視端口可用性)
- Backend API: http://localhost:4000/api
- Prisma Studio: `pnpm db:studio`

## 專案完成狀態 (99%)

### 已完成功能
- [x] T0: Monorepo 結構 + pnpm workspace
- [x] T1: 認證與權限系統 (NextAuth + JWT + Role Guards)
- [x] T2: Prisma Schema + Seed 資料
- [x] T3: 儀表板 (Dashboard) API + UI
- [x] T4: 排班系統 (Scheduling) API + UI
- [x] T5: 庫存系統 (Inventory) API + UI + CSV 匯出
- [x] T6: 交班系統 (Handover) API + UI + 註記功能
- [x] T7: 通知系統 (Notifications) API + UI
- [x] T8: 稽核紀錄 (Audit Log) API
- [x] T9: CSV 匯出 API

### 待優化項目 (Optional)
- [ ] 單元測試
- [ ] E2E 測試
- [ ] Docker 部署配置
- [ ] 生產環境優化

## 測試帳號

| Email | Password | Role |
|-------|----------|------|
| admin@clinic.local | password123 | 管理員 |
| supervisor@clinic.local | password123 | 主管 |
| staff1@clinic.local | password123 | 員工 |
| staff2@clinic.local | password123 | 員工 |

## API 端點

### Auth
- `POST /api/auth/login` - 登入
- `POST /api/auth/validate` - 驗證 (NextAuth 用)
- `GET /api/auth/me` - 取得當前使用者

### Dashboard
- `GET /api/dashboard/summary` - 儀表板摘要
- `GET /api/dashboard/stats` - 統計數據

### Handover (交班)
- `GET /api/handovers` - 列表 (支援篩選: status, priority)
- `GET /api/handovers/my` - 我的待辦
- `GET /api/handovers/:id` - 詳情
- `POST /api/handovers` - 建立
- `PATCH /api/handovers/:id` - 更新
- `POST /api/handovers/:id/comments` - 新增註記

### Inventory (庫存)
- `GET /api/inventory/items` - 品項列表
- `GET /api/inventory/items/:id` - 品項詳情
- `POST /api/inventory/items` - 新增品項 (ADMIN)
- `POST /api/inventory/txns` - 庫存異動
- `GET /api/inventory/low-stock` - 低庫存列表
- `GET /api/inventory/export.csv` - CSV 匯出

### Scheduling (排班)
- `GET /api/scheduling/shifts` - 班表列表
- `GET /api/scheduling/shifts/weekly` - 週視圖
- `GET /api/scheduling/shifts/today` - 今日班表
- `POST /api/scheduling/shifts` - 新增班次 (SUPERVISOR+)

### Notifications (通知)
- `GET /api/notifications` - 通知列表
- `GET /api/notifications/unread-count` - 未讀數
- `POST /api/notifications/:id/read` - 標為已讀
- `POST /api/notifications/read-all` - 全部已讀

### Audit (稽核)
- `GET /api/audit/logs` - 操作紀錄 (ADMIN)

## 角色權限

| 功能 | STAFF | SUPERVISOR | ADMIN |
|------|-------|------------|-------|
| 查看儀表板 | ✓ | ✓ | ✓ |
| 建立交班 | ✓ | ✓ | ✓ |
| 更新交班狀態 | 自己的 | 全部 | 全部 |
| 刪除交班 | ✗ | ✓ | ✓ |
| 查看庫存 | ✓ | ✓ | ✓ |
| 庫存異動 | ✓ | ✓ | ✓ |
| 新增品項 | ✗ | ✗ | ✓ |
| 查看排班 | ✗ | ✓ | ✓ |
| 管理排班 | ✗ | ✓ | ✓ |
| 使用者管理 | ✗ | ✗ | ✓ |
| 稽核紀錄 | ✗ | ✗ | ✓ |

## 資料庫 Schema

主要模型:
- `User` - 使用者
- `Handover` - 交班事項
- `HandoverComment` - 交班註記
- `Shift` - 班次
- `InventoryItem` - 庫存品項
- `InventoryTxn` - 庫存異動
- `Notification` - 通知
- `AuditLog` - 稽核紀錄

## 開發指令

```bash
# 開發
pnpm dev              # 同時啟動前後端
pnpm dev:api          # 只啟動後端
pnpm dev:web          # 只啟動前端

# 建置
pnpm build            # 建置全部

# 資料庫
pnpm db:generate      # 產生 Prisma Client
pnpm db:push          # 推送 schema 到資料庫
pnpm db:migrate       # 執行 migration
pnpm db:seed          # 填充測試資料
pnpm db:studio        # 開啟 Prisma Studio
```
