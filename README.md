# Clinic OS - 診所營運管理系統

一個完整的診所營運管理系統，包含交班、庫存、排班等核心功能。

## 功能特色

- **認證系統** - NextAuth.js v5 + JWT + 角色權限控制
- **儀表板** - 即時摘要、統計、待辦事項
- **交班系統** - 交班事項管理、註記、狀態追蹤
- **庫存系統** - 品項管理、異動記錄、低庫存警示、CSV 匯出
- **排班系統** - 班表管理、週視圖
- **通知系統** - 即時通知、已讀管理
- **稽核紀錄** - 操作記錄追蹤

## 技術架構

| 層級 | 技術 |
|------|------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui |
| Backend | NestJS + Prisma ORM |
| Database | SQLite (開發) / MySQL (生產) |
| Auth | NextAuth.js v5 + JWT |
| Structure | pnpm monorepo |

## 專案結構

```
clinic-os/
├── apps/
│   ├── web/           # Next.js 前端 (@clinic-os/web)
│   └── api/           # NestJS 後端 (@clinic-os/api)
├── packages/
│   └── shared/        # 共用型別 (@clinic-os/shared)
├── zeabur.yaml        # Zeabur 部署說明
└── pnpm-workspace.yaml
```

## 本地開發

### 環境需求
- Node.js 18+
- pnpm 8+

### 快速開始

```bash
# 1. Clone 專案
git clone https://github.com/keanu77/ClinicOS.git
cd ClinicOS

# 2. 安裝依賴
pnpm install

# 3. 設定環境變數
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 4. 初始化資料庫
pnpm db:push
pnpm db:seed

# 5. 啟動開發伺服器
pnpm dev
```

### 服務位址
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api
- Prisma Studio: `pnpm db:studio`

### 測試帳號

| Email | Password | 角色 |
|-------|----------|------|
| admin@clinic.local | password123 | 管理員 |
| supervisor@clinic.local | password123 | 主管 |
| staff1@clinic.local | password123 | 員工 |
| staff2@clinic.local | password123 | 員工 |

## Zeabur 部署

此專案為 monorepo 結構，需在 Zeabur 建立兩個服務。

### 步驟 1: 建立 API 服務

1. 在 Zeabur 新增服務 → 從 GitHub 匯入
2. 選擇 `ClinicOS` repository
3. 設定：
   - **服務名稱**: `clinic-os-api`
   - **根目錄**: `apps/api`
   - **建置指令**: `pnpm install && pnpm build`
   - **啟動指令**: `pnpm start:prod`

4. 環境變數：
   ```
   DATABASE_URL=file:./prod.db
   JWT_SECRET=<生成一個強密碼>
   JWT_EXPIRES_IN=8h
   FRONTEND_URL=https://<your-web-domain>.zeabur.app
   PORT=4000
   ```

### 步驟 2: 建立 Web 服務

1. 在 Zeabur 新增服務 → 從 GitHub 匯入
2. 選擇 `ClinicOS` repository
3. 設定：
   - **服務名稱**: `clinic-os-web`
   - **根目錄**: `apps/web`
   - **框架**: Next.js (自動偵測)

4. 環境變數：
   ```
   NEXT_PUBLIC_API_URL=https://<your-api-domain>.zeabur.app
   NEXTAUTH_SECRET=<生成一個強密碼>
   NEXTAUTH_URL=https://<your-web-domain>.zeabur.app
   ```

### 步驟 3: 初始化資料庫

部署完成後，在 API 服務的終端執行：
```bash
pnpm db:push
pnpm db:seed
```

### 生產環境資料庫 (選用)

如需使用 MySQL，在 Zeabur 新增 MySQL 服務並更新 `DATABASE_URL`：
```
DATABASE_URL=mysql://user:password@host:3306/clinic_os
```

同時需修改 `apps/api/prisma/schema.prisma`：
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

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
pnpm db:seed          # 填充測試資料
pnpm db:studio        # 開啟 Prisma Studio
```

## API 端點

詳見 [CLAUDE.md](./CLAUDE.md)

## License

MIT
