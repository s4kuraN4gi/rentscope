# RentScope

給料から最適な家賃とエリアを AI 分析する Web アプリケーション

## 概要

RentScope は、ユーザーの給料を入力すると、AI が「その給料で住める家賃帯」「おすすめエリア」「理想のエリアに住むために必要な収入」を分析し、グラフとマップで可視化する Web アプリです。

## 技術スタック

### フロントエンド

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: TailwindCSS
- **グラフ**: Chart.js / react-chartjs-2
- **地図**: MapLibre GL JS（ベクタータイル対応）
- **AI**: OpenAI API

### インフラ

- **本番環境**: AWS Lightsail VPS
- **タイルサーバー**: TileServer-GL（自前ホスティング）
- **リバースプロキシ**: Nginx
- **SSL/TLS**: Cloudflare Origin Certificate（Full Strict）
- **CDN**: Cloudflare
- **コンテナ**: Docker / Docker Compose

### 収益化

- **広告**: Google AdSense
- **分析**: Google Analytics 4（予定）

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example`を`.env.local`にコピーして、必要な値を設定してください:

```bash
cp .env.local.example .env.local
```

必要な環境変数:

- `OPENAI_API_KEY`: OpenAI API キー
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: Google AdSense クライアント ID
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics 測定 ID

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## プロジェクト構成

```
/
├── app/                    # Next.js App Router
│   ├── api/               # APIルート
│   ├── prefecture/        # 都道府県別ページ
│   └── result/            # 分析結果ページ
├── components/            # Reactコンポーネント
│   ├── features/         # 機能コンポーネント
│   ├── layout/           # レイアウトコンポーネント
│   └── ui/               # UIコンポーネント
├── types/                # TypeScript型定義
├── lib/                  # ユーティリティ関数
└── data/                 # 静的データ
```

## 主な機能

### 1. 給与分析

- 月収入力から推奨家賃を自動計算
- 家族構成に応じた調整
- グラフで可視化

### 2. エリア推奨

- 予算内で住めるエリアを提案
- 地図上にマーカー表示
- 主要駅からの距離情報

### 3. AI 分析

- OpenAI API による詳細分析
- 節約・収入アップのアドバイス
- パーソナライズされた提案

### 4. 都道府県別ページ

- SSG(Static Site Generation)対応
- SEO 最適化
- 各都道府県の家賃相場情報

## ビルド

```bash
npm run build
```

## デプロイ

### 本番環境（AWS Lightsail）

Docker Compose を使用したデプロイ:

```bash
# サーバーで実行
cd ~/rentscope
git pull origin main
docker compose down
docker compose up -d --build
```

### 環境変数

サーバー上の `.env.local` に以下を設定:

- `OPENAI_API_KEY`: OpenAI API キー
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: Google AdSense クライアント ID
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics 測定 ID（オプション）

### アーキテクチャ

```
ユーザー → Cloudflare (CDN/SSL) → Nginx (443) → Docker Containers
                                        ├─ web:3000 (Next.js)
                                        └─ tileserver:8080 (TileServer-GL)
```

詳細は `docs/` ディレクトリのガイドを参照してください。

## 収益化戦略

- Google AdSense 広告配置
- Google Analytics 4 でのトラッキング
- 将来的にアフィリエイト追加予定

## ライセンス

MIT

## 作者

RentScope Team

## 🚀 次のステップ (2025-12-04 更新)

### ✅ 完了済み

- [x] **TileServer-GL デプロイ**: 日本全域の OSM データを自前サーバーで配信
- [x] **Full (strict) SSL**: Cloudflare Origin Certificate による完全暗号化
- [x] **MapLibre GL JS 実装**: ベクタータイル対応の地図表示
- [x] **cron 自動化**: TileServer と OSM データの自動更新設定
- [x] **Docker デプロイ**: 本番環境での安定稼働

### 🔄 進行中

- [ ] **Google Analytics 設定**: GA4 測定 ID の取得とイベント実装
- [ ] **広告最適化**: 高単価バナー枠の効果測定

### 📋 今後の予定

- [ ] **データ収集**: ユーザー行動分析の開始
- [ ] **収益最適化**: 広告配置の A/B テスト
- [ ] **機能追加**: ユーザーフィードバックに基づく改善

詳細は `TASKS.md` および `docs/` ディレクトリを参照してください。
