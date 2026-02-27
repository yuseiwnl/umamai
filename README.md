# UmamAI リポジトリ

料理写真をスワイプで探索し、投稿・いいね・プロフィール管理ができるフルスタック Web アプリです。  

## 1. 全体構成

```text
[Browser]
   |
   v
[Next.js Frontend (App Router)]
   |- Server Components / Route Handler
   |    -> Supabase (認証確認・一覧取得)
   |
   |- Client Components
        -> FastAPI /upload-image (画像変換アップロード)
        -> Supabase (投稿メタ情報登録・いいね操作)

[FastAPI Backend]
   |- 画像受信
   |- HEIC/HEIF対応 + WebP変換 (Pillow + pillow-heif)
   |- Supabase Storage へ保存

[Supabase]
   |- Auth (Google OAuth)
   |- Postgres (menu_items / restaurants / liked_posts)
   |- Storage (media-public / media-private)
```

## 2. 技術スタック

- Frontend: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- Backend: FastAPI, Uvicorn, Pillow, pillow-heif
- BaaS: Supabase (Auth, Postgres, Storage)
- UI/UX: Framer Motion, shadcn/ui, Headless UI
- 地図/店舗検索: Google Maps Places API (`@vis.gl/react-google-maps`)
- 実行基盤: Docker / Docker Compose

## 3. レイヤー責務

### Frontend (`/frontend`)
- 画面ルーティングと描画（`src/app`）
- 認証状態の同期（Supabase SSR + middleware）
- スワイプ UI、いいね、投稿フォーム
- `src/app/api/images/route.ts` で画像一覧 API（ページング）を提供

### Backend (`/backend`)
- `app/main.py` の `POST /upload-image` が画像処理 API
- 画像を正規化して WebP 化し、Supabase Storage にアップロード
- フロントエンドからのファイルアップロード処理を集約

### Supabase
- OAuth ログイン（Google）
- アプリデータ永続化（投稿、店舗、いいね）
- 画像ファイル保管（公開/非公開バケット）

## 4. 主要データフロー

### A. 画像投稿フロー
1. `/upload` で画像・料理情報・店舗情報を入力
2. フロントエンドが FastAPI `/upload-image` にファイル送信
3. FastAPI が WebP 変換して Supabase Storage に保存
4. フロントエンドが `menu_items` / `restaurants` を Supabase DB に登録

### B. 一覧表示フロー
1. `/` が Server Component で `fetchImages()` を実行
2. Supabase DB から `menu_items + restaurants` を取得
3. クライアントでスワイプ UI 表示、追加ロードは `/api/images` 経由

### C. 認証・保護フロー
1. Google OAuth でログイン
2. `src/middleware.ts` が `/liked`, `/profile`, `/upload` への未認証アクセスをガード
3. 認証済みユーザーのみいいね・投稿・プロフィール閲覧が可能

## 5. ディレクトリ構成

```text
.
├─ frontend/
│  ├─ src/app/                 # 画面ルート（/, upload, liked, profile, details）
│  ├─ src/lib/supabase/        # SSR/CSR の Supabase クライアント設定
│  ├─ src/hooks/               # 投稿処理などのフック
│  └─ src/components/          # UI コンポーネント
├─ backend/
│  ├─ app/main.py              # FastAPI エントリポイント
│  └─ requirements.txt
├─ docker-compose.yml          # frontend + backend のローカル統合実行
└─ backend/archive/            # 旧 AI 実験コード（現行ランタイム外）
```

## 6. ローカル実行

### Docker で起動
```bash
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000/docs`

### 手動起動（開発）
```bash
# frontend
cd frontend && npm install && npm run dev

# backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 7. 環境変数

### Frontend
- `NEXT_PUBLIC_API_BASE` (FastAPI のベース URL)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`
- `NEXT_PUBLIC_SITE_URL` (OAuth リダイレクト先)

### Backend
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

---
