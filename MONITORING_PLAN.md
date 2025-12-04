# Monitoring Plan for RentScope

このドキュメントは、RentScope の収益化と安定運用に向けたモニタリング方針と設定手順をまとめたものです。

## 1. 監視項目 (KPI & Metrics)

### 1-1. 収益・ユーザー行動 (Google Analytics 4)

- **PV (Page Views)**: サイト全体のトラフィック。収益シミュレーションのベース。
- **AI Button Clicks**: `ai_click` イベント。AI 分析の利用頻度。
  - 目標クリック率: 5%
  - イベントパラメータ: `location` (分析対象エリア), `salary` (入力給与帯)
- **Ad Impressions**: AdSense 管理画面で確認。
- **Ad Clicks / CTR**: AdSense 管理画面で確認。

### 1-2. システムリソース (VPS)

- **CPU Usage**: TileServer-GL の負荷状況。
- **Memory Usage**: メモリ不足による OOM Kill の監視。
- **Disk Usage**: OSM データ (`planet.osm.pbf`) と Docker ログによるディスク圧迫の監視。
- **Network I/O**: タイル配信による帯域使用量。

### 1-3. サービス稼働状況

- **Tile Server Status**: タイルサーバーが 200 OK を返しているか。
- **OpenAI API Status**: エラー率 (429/500 系)。

---

## 2. Google Analytics 設定手順

### イベント: `ai_click` の作成

1.  Google Analytics 管理画面にログイン。
2.  [設定] > [イベント] > [イベントを作成] をクリック。
3.  **カスタムイベント名**: `ai_click`
4.  **一致する条件**:
    - `event_name` 次と等しい `click`
    - `link_id` (または `button_id`) 次と等しい `ai_analysis_button` (※実装に合わせて調整)
    - または、コード側で `gtag('event', 'ai_click', { ... })` を直接呼び出す実装を推奨。

---

## 3. VPS モニタリング手順 (簡易版)

本格的な監視ツール (Prometheus/Grafana, Datadog 等) を導入する前の、コマンドラインベースの監視方法です。

### リアルタイム監視

```bash
# CPU/メモリ/プロセス監視
htop

# Docker コンテナのリソース使用状況
docker stats --no-stream
```

### ログの確認

```bash
# TileServer-GL のログ
docker logs --tail 100 tileserver-gl

# cron 実行ログ (設定した場合)
cat /var/log/tileserver_update.log
cat /var/log/osm_update.log
```

### ディスク容量確認

```bash
df -h
# 特に /data ディレクトリの空き容量に注意
```

---

## 4. アラート基準 (目安)

| 項目             | 閾値       | 対応アクション                                          |
| ---------------- | ---------- | ------------------------------------------------------- |
| **月間 PV**      | > 500,000  | VPS プランのスケールアップ (1GB -> 2GB) を検討          |
| **VPS CPU**      | 常時 > 80% | Cloudflare キャッシュ設定の見直し、またはスケールアップ |
| **Disk Usage**   | > 80%      | 不要なログの削除、またはストレージ拡張                  |
| **OpenAI Error** | 頻発       | クォータ確認、リトライロジックの調整                    |
