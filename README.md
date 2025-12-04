# RentScope

給料から最適な家賃とエリアを AI 分析する Web アプリケーション

## 概要

RentScope は、ユーザーの給料を入力すると、AI が「その給料で住める家賃帯」「おすすめエリア」「理想のエリアに住むために必要な収入」を分析し、グラフとマップで可視化する Web アプリです。

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: TailwindCSS
- **グラフ**: Chart.js / react-chartjs-2
- **地図**: Leaflet.js / react-leaflet
- **AI**: OpenAI API
- **ホスティング**: Vercel
- **収益化**: Google AdSense + GA4

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

Vercel へのデプロイが推奨されます:

```bash
vercel
```

## 収益化戦略

- Google AdSense 広告配置
- Google Analytics 4 でのトラッキング
- 将来的にアフィリエイト追加予定

## ライセンス

MIT

## 作者

RentScope Team

## 🚀 次のステップ (2025-12-01 更新)

現在、収益化基盤の整備とコスト削減施策を進めています。

- [x] **AI 分析のオンデマンド化**: ボタンクリック時のみ API を呼び出すように変更し、コストを削減。
- [x] **エラーハンドリング**: AI 分析失敗時のリトライ処理とエラーメッセージ表示を実装。
- [x] **高単価バナー枠の設置**: AI 分析待ち時間に表示するバナー枠（プレースホルダー）を追加。
- [ ] **バナー広告 ID の設定**: 高単価バナーと、常時表示するバナーの正しい `slot` ID を設定する必要があります。
- [ ] **バックアップ設定**: VPS のデータバックアップスクリプトを作成する必要があります（VPS 情報待ち）。
- [ ] **HTTPS / Cloudflare 設定**: ユーザー側での設定が必要です。

詳細は `TASKS.md` を参照してください。
