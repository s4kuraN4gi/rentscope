# RentScope サーバー構築ガイド

このドキュメントは、**RentScope** プロジェクトを本番環境で動かすためのサーバー構築手順をまとめたものです。VPS（例: Ubuntu 22.04）を想定し、Docker を使って TileServer‑GL とアプリケーションをデプロイします。

---

## 1. 前提条件

- **VPS の取得**（例: さくらの VPS、AWS EC2、GCP Compute Engine など）
- OS は **Ubuntu 22.04 LTS**（他の Linux でも概ね同様）
- SSH 鍵でログインできること（`ssh user@your-vps-ip`）
- ルート権限（`sudo`）が使用可能
- **Docker** と **Docker Compose** をインストールする権限があること

---

## 2. VPS に SSH 接続

```bash
ssh your-username@your-vps-ip
```

> `your-username` は VPS のユーザー名、`your-vps-ip` はパブリック IP アドレスです。

---

## 3. 必要パッケージのインストール

```bash
# パッケージ情報を更新
sudo apt update && sudo apt upgrade -y

# 必要なツールをインストール
sudo apt install -y ca-certificates curl gnupg lsb-release ufw
```

---

## 4. Docker と Docker Compose のインストール

```bash
# Docker の公式 GPG 鍵を追加
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker リポジトリを追加
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker 本体をインストール
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io

# Docker Compose（v2）をインストール
sudo curl -SL "https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Docker グループにユーザーを追加（再ログインが必要）
sudo usermod -aG docker $USER
```

> 上記コマンド実行後、一度ログアウトしてから再度 SSH 接続してください。

---

## 5. ファイアウォール設定 (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 8080/tcp    # TileServer-GL のデフォルトポート（必要に応じて）
sudo ufw enable
```

---

## 6. プロジェクトコードの取得

```bash
# 任意のディレクトリにクローン
git clone https://github.com/your-org/RentScope.git
cd RentScope
```

> リポジトリ URL は実際のものに置き換えてください。

---

## 7. TileServer‑GL のデプロイ

### 7‑1. `docker-compose.yml` を作成（例）

```yaml
version: "3"
services:
  tileserver:
    image: mediagis/tileserver-gl:latest
    container_name: tileserver
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./tiles:/data/tiles # タイルデータを格納するディレクトリ
    environment:
      - TILESERVER_CONFIG=/data/config.json
```

保存場所: `scripts/tileserver/docker-compose.yml`（リポジトリ内の好きな場所で OK）

### 7‑2. タイルデータを配置

```bash
mkdir -p tiles
# 例: 日本の OSM タイルをダウンロード（スクリプトは既に scripts/update_osm.sh がある）
./scripts/update_osm.sh
```

### 7‑3. コンテナ起動

```bash
cd scripts/tileserver
sudo docker compose up -d
```

コンテナが起動したら `http://your-vps-ip:8080/` でタイルサーバーが確認できます。

---

## 8. Next.js / Vite アプリのデプロイ

### 8‑1. Node.js と pnpm のインストール

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm i -g pnpm
```

### 8‑2. アプリのビルド & 起動（例: Next.js）

```bash
cd /path/to/RentScope
pnpm install
pnpm run build   # 静的ファイル生成
pnpm run start   # 本番モードで起動（ポート 3000）
```

> 必要に応じて `pm2` などで永続化してください。

---

## 9. ドメインと Cloudflare の連携

1. Cloudflare に `rentscope.jp` を追加済みであることを確認（既に NS が Cloudflare に設定済み）。
2. Cloudflare の DNS タブで以下のレコードを作成（前述の **DNS 設定ガイド** を参照）:
   - `@` → A レコード → VPS のパブリック IP（プロキシ ON）
   - `www` → CNAME → `rentscope.jp`
   - `tiles` → CNAME → `rentscope.jp`（または直接 IP）
3. SSL/TLS → **「Full (strict)」** を選択し、**Always Use HTTPS** を有効化。
4. **ページルール**で `/tiles/*` を **Cache Everything**、**Edge Cache TTL: 1 week** に設定。

---

## 10. 運用・保守

- **自動更新**: `scripts/update_tileserver.sh` と `scripts/update_osm.sh` を cron に登録（例: 毎日 02:00）

```bash
crontab -e
# 0 2 * * * /usr/bin/bash /path/to/RentScope/scripts/update_tileserver.sh >> /var/log/tileserver_update.log 2>&1
# 0 3 * * * /usr/bin/bash /path/to/RentScope/scripts/update_osm.sh >> /var/log/osm_update.log 2>&1
```

- **ログ監視**: `docker logs tileserver`、`journalctl -u nodeapp`（Node アプリ）
- **バックアップ**: データディレクトリ `tiles/` と `.env`（必要なら）を定期的に別サーバへ rsync でコピー。

---

## 11. 参考リンク

- Docker Hub – TileServer‑GL: https://hub.docker.com/r/mediagis/tileserver-gl
- Cloudflare Docs – DNS 設定: https://developers.cloudflare.com/dns
- Ubuntu – Docker インストール手順: https://docs.docker.com/engine/install/ubuntu/

---

**このガイドは、RentScope のサーバー構築をゼロから始める方向けに作成しました。**
不明点やエラーが出た場合は、エラーメッセージを添えて質問してください。
