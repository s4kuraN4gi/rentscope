# RentScope

給料から最適な家賃とエリアをAI分析するWebアプリケーション

## 概要

RentScopeは、ユーザーの給料を入力すると、AIが「その給料で住める家賃帯」「おすすめエリア」「理想のエリアに住むために必要な収入」を分析し、グラフとマップで可視化するWebアプリです。

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
- `OPENAI_API_KEY`: OpenAI APIキー
- `NEXT_PUBLIC_ADSENSE_CLIENT_ID`: Google AdSenseクライアントID
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: Google Analytics測定ID

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

### 3. AI分析
- OpenAI APIによる詳細分析
- 節約・収入アップのアドバイス
- パーソナライズされた提案

### 4. 都道府県別ページ
- SSG(Static Site Generation)対応
- SEO最適化
- 各都道府県の家賃相場情報

## ビルド

```bash
npm run build
```

## デプロイ

Vercelへのデプロイが推奨されます:

```bash
vercel
```

## 収益化戦略

- Google AdSense広告配置
- Google Analytics 4でのトラッキング
- 将来的にアフィリエイト追加予定

## ライセンス

MIT

## 作者

RentScope Team
