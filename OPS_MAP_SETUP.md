# Map Server (TileServer‑GL) Setup & Operational Procedures

## 目的

このドキュメントは、**自前タイルサーバー (TileServer‑GL) を VPS 上で運用**し、**コスト削減**と **安定配信** を実現するための手順・対策をまとめたものです。

---

## 1. 初期セットアップ

### 1‑1. VPS の取得

- 推奨プラン: 1 GB RAM / 1 CPU / 25 GB SSD (月額 ¥5,000)
- OS: Ubuntu 22.04 LTS (または Debian 系)

### 1‑2. 必要パッケージのインストール

```bash
# SSH で VPS に接続
ssh user@your-vps.example.com

# Docker をインストール（公式手順）
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
sudo usermod -aG docker $USER   # ログアウト/再ログインで反映
```

### 1‑3. OSM データ取得 & 保存領域作成

```bash
# データ保存用ディレクトリ作成
mkdir -p /data && sudo chown $USER:$USER /data

# planet.osm.pbf（約 1 GB）をダウンロード
wget -O /data/planet.osm.pbf https://download.geofabrik.de/asia/japan-latest.osm.pbf
```

### 1‑4. TileServer‑GL コンテナ起動（1 行）

```bash
docker run -d \
  --name tileserver-gl \
  -p 80:80 \
  -v /data:/data \
  maptiler/tileserver-gl
```

- デフォルトで `http://<vps-ip>/tiles/{z}/{x}/{y}.png` がタイル URL になります。

---

## 2. 運用自動化（対策）

### 2‑1. Docker イメージ自動更新 & 再起動 (cron)

`/home/youruser/update_tileserver.sh` を作成し、cron に登録します。

**update_tileserver.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail

# 最新イメージ取得
docker pull maptiler/tileserver-gl

# コンテナ再起動（ダウンタイムは数秒）
docker stop tileserver-gl && docker rm tileserver-gl

docker run -d \
  --name tileserver-gl \
  -p 80:80 \
  -v /data:/data \
  maptiler/tileserver-gl
```

```bash
chmod +x /home/youruser/update_tileserver.sh
```

**cron 設定（深夜 2:30）**

```cron
30 2 * * * /home/youruser/update_tileserver.sh >> /var/log/tileserver_update.log 2>&1
```

### 2‑2. OSM データ定期更新 (cron)

`/home/youruser/update_osm.sh` を作成。

**update_osm.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail

# 古いデータ削除（必要に応じてバックアップ）
rm -f /data/planet.osm.pbf

# 最新データ取得（例: 日本全域）
wget -O /data/planet.osm.pbf https://download.geofabrik.de/asia/japan-latest.osm.pbf

# TileServer‑GL に再インポート（コンテナ再起動で自動反映）
# ここではコンテナ再起動だけで OK
docker restart tileserver-gl
```

```bash
chmod +x /home/youruser/update_osm.sh
```

**cron 設定（毎月 1 日 3:00）**

```cron
0 3 1 * * /home/youruser/update_osm.sh >> /var/log/osm_update.log 2>&1
```

### 2‑3. サーバー負荷対策 – Cloudflare CDN

1. Cloudflare にドメインを追加し、**DNS** を Cloudflare に切り替える。
2. **広告**は「通常バナー 2 個」＋「AI ボタンクリック時の高単価バナー 1 個」の構成とし、動画広告は廃止する。
3. **Page Rule** を作成し、`*your-vps.example.com/tiles/*` に対して **Cache Level: Cache Everything** と **Edge Cache TTL: 1 week** を設定。
4. PV が 500k を超えると、VPS プランを **2 GB / 2 CPU** にスケールアップ（同様に `docker run` コマンドは変わりません）。

### 2‑4. 障害時フェイルオーバー

- 予備 VPS（小規模、月額 ¥2,000 程度）を同一リージョンに用意し、同じ Docker イメージとデータを同期（rsync または scp）
- 障害検知は Cloudflare の **Always Online** 機能か、外部モニタリング（UptimeRobot）で自動切替スクリプトを走らせる。

### 2‑5. セキュリティ対策

```bash
# SSH 鍵認証のみ（パスワード無効化）
sudo sed -i 's/^#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# ufw で必要ポートだけ開放
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH（必要なら IP 制限）
sudo ufw allow 80/tcp   # HTTP（TileServer）
sudo ufw allow 443/tcp  # HTTPS（Cloudflare 経由）
sudo ufw enable
```

---

## 3. フロントエンド側設定変更

Leaflet のタイル URL を自前サーバーに切り替えるだけです。

```tsx
import L from "leaflet";

const map = L.map("map").setView([35.6762, 139.6503], 10);
L.tileLayer("https://your-vps.example.com/tiles/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);
```

---

## 4. まとめ

- **コスト**: VPS ¥5,000/月（スケールアップ時は ¥10,000）
- **運用**: cron で自動更新・再起動、Cloudflare でキャッシュ、予備 VPS でフェイルオーバー
- **セキュリティ**: SSH 鍵のみ、ufw でポート制限
- **導入手順**は上記スクリプトと cron 設定だけで完了

この手順をそのままプロジェクトの `OPS_MAP_SETUP.md` として保存し、チームで共有してください。
