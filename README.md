# NDRF Portal — Zeabur 部署指南

內部資料提交與管理系統，使用 Next.js 16 + Prisma 7 + PostgreSQL。

## 功能一覽

| 功能 | 說明 |
|------|------|
| 多用戶登入 | Email + 密碼，分 USER / ADMIN 角色 |
| 資料提交表單 | SKU、Site Code、數量、單價、備註、自訂欄位 |
| 自動查詢 | 輸入 SKU / Site Code 時自動顯示對照資料 |
| 批量匯入 | 貼上 Tab 分隔資料或上傳 CSV / Excel |
| 審核鎖定 | 管理員審核後，一般用戶無法修改 |
| 報表匯出 | 每日報表 / 每月報表 Excel 下載 |
| 自動清理 | 每日凌晨 2 點歸檔超過 1 年的資料 |
| 管理後台 | 用戶管理、SKU 對照表、店舖對照表、自訂欄位 |

---

## 本地開發

```bash
# 安裝依賴
npm install

# 設定環境變數
cp .env.example .env
# 編輯 .env 填入你的 DATABASE_URL

# 初始化資料庫 + 匯入種子資料
npx prisma migrate dev
npm run db:seed

# 啟動開發伺服器
npm run dev
```

首次開啟 `http://localhost:3000` 會自動引導建立管理員帳號。

---

## Zeabur 部署步驟（傻瓜式教學）

### 步驟 1：推送程式碼到 GitHub

1. 在 GitHub 建立一個新的 **Private** 倉庫（例如 `ndrf-portal`）
2. 在終端執行：
   ```bash
   cd ndrf-portal
   git init
   git add .
   git commit -m "Initial commit: NDRF Portal"
   git remote add origin https://github.com/你的帳號/ndrf-portal.git
   git branch -M main
   git push -u origin main
   ```

### 步驟 2：在 Zeabur 建立 Project

1. 登入 [Zeabur 控制台](https://dash.zeabur.com)
2. 點擊 **「Create Project」**
3. 選擇地區：**Asia (Hong Kong)** 或 **Asia (Tokyo)**
4. 輸入專案名稱：`NDRF Portal`

### 步驟 3：建立 PostgreSQL 資料庫

1. 在 Project 頁面，點擊 **「+ Create Service」**
2. 選擇 **「Prebuilt」** → **「PostgreSQL」**
3. 服務名稱保持預設即可
4. 等待狀態變為 **Running**（約 30 秒）
5. 點進 PostgreSQL 服務 → **「Variables」** 分頁
6. 找到 `DATABASE_URL` 的值，複製下來（後面會用到）

### 步驟 4：建立 Web 服務（部署應用）

1. 回到 Project 頁面，點擊 **「+ Create Service」**
2. 選擇 **「Git」** → 授權 GitHub → 選擇你的 `ndrf-portal` 倉庫
3. Zeabur 會自動偵測為 Next.js 專案

### 步驟 5：設定環境變數

1. 點進 Web 服務 → **「Variables」** 分頁
2. 新增以下環境變數：

| 變數名稱 | 值 | 說明 |
|----------|-----|------|
| `DATABASE_URL` | `postgresql://...` | 從步驟 3 複製的 Postgres 連線字串 |
| `NEXTAUTH_SECRET` | （隨機字串） | 執行 `openssl rand -base64 32` 生成 |
| `NEXTAUTH_URL` | `https://你的域名.zeabur.app` | 等部署完成後再回來填入實際網址 |
| `NODE_ENV` | `production` | 生產環境 |

> **注意**：`NEXTAUTH_URL` 需要等步驟 7 綁定域名後才能確定。可以先部署，拿到網址後再回來設定。

### 步驟 6：連接資料庫到 Web 服務

1. 回到 Project 頁面
2. 點擊 PostgreSQL 服務的 **「Networking」** 分頁
3. 確認 PostgreSQL 服務和 Web 服務在同一個 Project 內，Zeabur 會自動建立內部網路連接
4. 或者：在 Web 服務的 Variables 中，點擊 **「+ Add Variable Reference」**，選擇 PostgreSQL 的 `DATABASE_URL`

### 歷程 7：綁定域名（可選）

1. 點進 Web 服務 → **「Networking」** 分頁
2. Zeabur 會自動生成一個 `.zeabur.app` 子域名
3. 若要自訂域名，點擊 **「Add Domain」** 輸入你的域名
4. 到你的域名管理商設定 CNAME 指向 Zeabur 提供的地址

### 步驟 8：初始化資料庫

部署成功後，需要執行 migration 初始化資料表：

1. 在 Zeabur 控制台，點進 Web 服務
2. 點擊 **「Logs」** 分頁確認服務正常啟動
3. 使用 Zeabur 的 **「Console」** 功能（或 SSH 進入容器）
4. 執行以下指令：
   ```bash
   npx prisma migrate deploy
   ```
5. 匯入種子資料（範例 SKU / Site 對照表）：
   ```bash
   npm run db:seed
   ```

### 步驟 9：首次登入

1. 開啟你的應用網址（例如 `https://xxx.zeabur.app`）
2. 系統會自動導向 **Setup 頁面**
3. 填寫管理員姓名、Email、密碼（至少 8 位）
4. 建立完成後，用管理員帳號登入
5. 在管理後台新增更多用戶、設定 SKU 對照表、店舖對照表

---

## 專案結構

```
ndrf-portal/
├── prisma/
│   ├── schema.prisma          # 資料庫 Schema
│   ├── seed.ts                # 種子資料
│   └── migrations/            # Migration 檔案
├── src/
│   ├── app/
│   │   ├── (auth)/            # 登入/註冊頁面
│   │   ├── (protected)/       # 需要登入的頁面
│   │   │   ├── dashboard/     # 儀表板
│   │   │   ├── submissions/   # 資料提交/列表/詳情/編輯
│   │   │   └── admin/         # 管理員後台
│   │   ├── api/               # API 路由
│   │   ├── setup/             # 初始設定頁
│   │   └── layout.tsx         # 根佈局
│   ├── components/            # UI 組件
│   │   ├── admin/             # 管理員組件
│   │   ├── auth/              # 認證組件
│   │   ├── layout/            # 佈局組件
│   │   ├── setup/             # 設定組件
│   │   ├── shared/            # 共用組件
│   │   ├── submissions/       # 提交相關組件
│   │   └── ui/                # shadcn/ui 組件
│   ├── hooks/                 # 自訂 Hooks
│   ├── lib/                   # 工具函數
│   │   ├── auth.ts            # NextAuth 設定
│   │   ├── prisma.ts          # Prisma Client
│   │   ├── cron.ts            # 排程任務
│   │   ├── excel.ts           # Excel 產生
│   │   ├── csv.ts             # CSV 解析
│   │   └── utils.ts           # 工具函數
│   ├── instrumentation.ts     # Next.js 啟動時執行（啟動 Cron）
│   ├── middleware.ts          # 認證中介層
│   └── types/                 # TypeScript 型別
├── Dockerfile                 # Docker 建置設定
├── next.config.ts             # Next.js 設定
└── package.json               # 依賴與腳本
```

---

## 常見錯誤排除

### ❌ 應用程式無法啟動

**症狀**：Zeabur Logs 顯示 `Error: Cannot find module` 或立即退出

**解決方法**：
1. 確認 `package.json` 的 `scripts.build` 是 `next build`
2. 確認 `Dockerfile` 存在且包含 `prisma generate` 步驟
3. 在 Zeabur 的 Variables 確認 `NODE_ENV=production`

### ❌ 資料庫連線失敗

**症狀**：Logs 顯示 `P1001: Can't reach database server`

**解決方法**：
1. 確認 PostgreSQL 服務狀態為 **Running**
2. 確認 `DATABASE_URL` 環境變數已正確設定
3. 確認 PostgreSQL 和 Web 服務在同一個 Project 內
4. 確認 `DATABASE_URL` 格式為 `postgresql://user:password@host:5432/dbname`

### ❌ 登入後一直被導回登入頁

**症狀**：輸入帳密後又回到 `/login`

**解決方法**：
1. 確認 `NEXTAUTH_URL` 已設定且與實際網址完全一致（包括 `https://`）
2. 確認 `NEXTAUTH_SECRET` 已設定（至少 32 字元的隨機字串）
3. 清除瀏覽器 Cookie 後重試

### ❌ Migration 失敗

**症狀**：執行 `prisma migrate deploy` 時報錯

**解決方法**：
1. 確認 `DATABASE_URL` 正確
2. 嘗試改用 `npx prisma db push` 來強制同步 Schema
3. 檢查 PostgreSQL 版本是否為 14+

### ❌ Excel 下載失敗

**症狀**：點擊下載按鈕後報錯或下載的檔案為空

**解決方法**：
1. 確認所選日期範圍內有資料
2. 檢查瀏覽器是否封鎖了彈出視窗
3. 查看 Zeabur Logs 是否有 `exceljs` 相關錯誤

### ❌ Cron 排程未執行

**症狀**：超過 1 年的資料沒有被自動歸檔

**解決方法**：
1. 確認 `src/instrumentation.ts` 存在
2. 查看 Logs 是否有 `[CRON] Jobs scheduled.` 訊息
3. Cron 任務每日凌晨 2 點（UTC）執行，請耐心等待
4. 若需手動觸發，可建立一個臨時 API Route 來執行清理邏輯

---

## 後續維護

### 更新程式碼

```bash
# 修改程式碼後，提交到 GitHub
git add .
git commit -m "描述你的修改"
git push
```

Zeabur 會自動偵測 GitHub push 並重新部署（通常 2-3 分鐘）。

### 備份資料庫

1. 在 Zeabur 控制台，點進 PostgreSQL 服務
2. 使用 **「Backup」** 功能建立備份
3. 或透過指令匯出：
   ```bash
   pg_dump "postgresql://user:password@host:5432/dbname" > backup.sql
   ```

### 還原資料庫

```bash
psql "postgresql://user:password@host:5432/dbname" < backup.sql
```

### 新增 Prisma Migration

如果修改了 `schema.prisma`：

```bash
npx prisma migrate dev --name 描述名稱
git add .
git commit -m "Add migration: 描述"
git push
```

部署後在 Zeabur Console 執行：
```bash
npx prisma migrate deploy
```

---

## 技術堆疊

| 技術 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.2.4 | 全端框架（App Router） |
| React | 19.2.4 | UI 框架 |
| TypeScript | 5 | 型別安全 |
| Tailwind CSS | 4 | 樣式 |
| shadcn/ui | latest | UI 組件庫 |
| Prisma | 7.8.0 | ORM（PostgreSQL） |
| NextAuth.js | 5.0.0-beta | 認證（Credentials Provider） |
| exceljs | 4.4.0 | Excel 產生 |
| node-cron | 4.2.1 | 排程任務 |
| Zod | 4.4.1 | 資料驗證 |
