# AWS Lightsail で RentScope サーバーを構築する手順

このドキュメントは、**RentScope** プロジェクトを AWS Lightsail 上にデプロイし、TileServer‑GL と Next.js/Vite アプリを Docker で動かすまでのフローをまとめたものです。すべての手順は **東京リージョン (ap-northeast-1)** を前提としています。

---

## 1. 前提条件

- **AWS アカウント**（無料利用枠で Lightsail の 2CPU/4GB プランは有料ですが、月額 $5 で利用可能）
- **SSH キー**（ローカルマシンで生成し、AWS に登録）
- **Docker / Docker‑Compose** のインストール権限（Lightsail インスタンスは root 権限で操作）
- **Cloudflare アカウント**で `rentscope.jp` がすでに追加され、NS が Cloudflare に設定済みであること

---

## 2. Lightsail インスタンス作成

1. AWS コンソールにログイン → **Lightsail** サービスへ移動
2. **Create instance** をクリック
3. **Location** → `Tokyo (ap-northeast-1)` を選択
4. **Instance image** → `OS Only → Ubuntu 22.04 LTS` を選択
5. **Choose your instance plan** → **$5/month (2 CPU, 4 GB RAM, 80 GB SSD)** を選択
6. **SSH key pair** → **Create new**（ローカルにダウンロード）か、既存のキーを **Upload** してください
7. **Name** → `rent-scope`（任意）
8. **Create instance** をクリックして作成完了を待ちます

> **ポイント**：Lightsail のコンソール画面に表示される **Public IP** をメモしておきます（例: `34.84.123.45`）。この IP が Cloudflare の A レコードに設定されます。

---

## 3. SSH 接続と基本セットアップ

```bash
# ダウンロードした .pem キーに権限を付与（例: rent-scope-key.pem）
chmod 400 rent-scope-key.pem

# SSH 接続（IP は先ほどメモしたもの）
ssh -i rent-scope-key.pem ubuntu@<PUBLIC_IP>
```

### 3‑1. パッケージ更新 & 必要ツールインストール

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg lsb-release ufw
```

### 3‑2. Docker と Docker‑Compose のインストール

```bash
# Docker の公式 GPG 鍵を追加
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Docker リポジトリを追加
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker 本体をインストール
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io

# Docker Compose (v2) をインストール
sudo curl -SL "https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Docker グループにユーザーを追加（再ログインが必要）
sudo usermod -aG docker $USER
exit   # SSH から抜けて再度接続
ssh -i rent-scope-key.pem ubuntu@<PUBLIC_IP>
```

> 再接続後、`docker version` と `docker compose version` が表示されれば OK。

---

## 4. ファイアウォール設定 (UFW)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp      # HTTP（Cloudflare がリバースプロキシとして使用）
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 8080/tcp    # TileServer‑GL のデフォルトポート（内部だけでも OK）
sudo ufw enable
```

---

## 5. プロジェクトコード取得 & ディレクトリ構成

```bash
# 任意のディレクトリにクローン（例: /home/ubuntu）
cd ~
git clone https://github.com/your-org/RentScope.git   # 実際のリポジトリ URL に置き換えてください
cd RentScope
```

> **※** プライベートリポジトリの場合は SSH キーを GitHub に登録しておくか、HTTPS で認証情報を入力してください。

---

## 6. TileServer‑GL のデプロイ

### 6‑1. `docker-compose.yml`（例）を作成

```yaml
# ファイル: scripts/tileserver/docker-compose.yml
version: "3"
services:
  tileserver:
    image: mediagis/tileserver-gl:latest
    container_name: tileserver
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./tiles:/data/tiles # タイルデータ格納ディレクトリ（後述）
    environment:
      - TILESERVER_CONFIG=/data/config.json
```

保存場所は `scripts/tileserver/docker-compose.yml`（リポジトリ内の好きな場所で OK）。

### 6‑2. タイルデータを配置

```bash
mkdir -p tiles
# 例: 日本の OSM タイルを取得（既に scripts/update_osm.sh があるのでそれを利用）
./scripts/update_osm.sh   # タイルデータが ./tiles に展開されます
```

> `update_osm.sh` は既にリポジトリに含まれているので、そのまま実行してください。

### 6‑3. コンテナ起動

```bash
cd scripts/tileserver
sudo docker compose up -d
```

起動後、`http://<PUBLIC_IP>:8080/` にアクセスすると TileServer‑GL のデフォルトページが表示されます。

---

## 7. Next.js / Vite アプリのデプロイ

### 7‑1. Node.js と pnpm のインストール

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
npm i -g pnpm
```

### 7‑2. アプリのビルド & 起動（例: Next.js）

```bash
cd ~/RentScope   # ルートディレクトリへ
pnpm install
pnpm run build   # 静的ファイル生成
pnpm run start   # 本番モードで起動（デフォルトはポート 3000）
```

> **永続化**したい場合は `pm2` などのプロセスマネージャを導入すると便利です。

```bash
sudo npm i -g pm2
pm2 start npm --name "rent-scope" -- run start
pm2 save
pm2 startup   # 再起動時に自動起動設定
```

---

## 8. Cloudflare で DNS と SSL 設定

1. **Cloudflare ダッシュボード** → **DNS** タブを開く
2. 以下のレコードを追加（**TTL は Auto**、**Proxy status は Proxied（オレンジ）**）
   - **A** `@` → **Lightsail の Public IP**（例: `34.84.123.45`）
   - **CNAME** `www` → `rentscope.jp`
   - **CNAME** `tiles` → `rentscope.jp`（または直接 IP）
3. **SSL/TLS** → **Full (strict)** を選択し、**Always Use HTTPS** を ON にする
4. **ページルール** → `/tiles/*` に対して **Cache Level: Cache Everything**、**Edge Cache TTL: 1 week** を設定（CDN 効果最大化）

---

## 9. 自動更新・保守（任意）

### 9‑1. TileServer‑GL と OSM データの定期更新（cron）

```bash
crontab -e
# 毎日 02:00 に TileServer のイメージ更新
0 2 * * * /usr/bin/bash /home/ubuntu/RentScope/scripts/update_tileserver.sh >> /var/log/tileserver_update.log 2>&1
# 毎日 03:00 に OSM データ更新
0 3 * * * /usr/bin/bash /home/ubuntu/RentScope/scripts/update_osm.sh >> /var/log/osm_update.log 2>&1
```

### 9‑2. ログ監視

```bash
# TileServer のログ
sudo docker logs -f tileserver

# Node アプリ（pm2）
pm run logs   # または pm2 logs rent-scope
```

### 9‑3. バックアップ（tiles ディレクトリ）

```bash
# 例: 別サーバへ rsync（毎日 04:00）
0 4 * * * rsync -avz /home/ubuntu/RentScope/tiles backup_user@backup-host:/backup/rentscope_tiles
```

---

## 10. トラブルシューティング

| 症状                            | 確認ポイント                                          | 対処法                                                                                 |
| ------------------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **Docker コンテナが起動しない** | `sudo docker compose logs`                            | エラーメッセージに従いボリュームパスや権限を修正                                       |
| **HTTPS が無効**                | Cloudflare の **SSL/TLS** 設定                        | `Full (strict)` にし、証明書が自動発行されているか確認                                 |
| **タイルが 404**                | TileServer のポート (`8080`) が開いているか           | `sudo ufw status` で 8080 が許可されているか確認、`docker ps` でコンテナが起動中か確認 |
| **アクセスが遅い**              | Cloudflare の **Page Rules** が正しく設定されているか | `/tiles/*` のキャッシュ設定が有効か、Edge Cache TTL が 1 week になっているか確認       |

---

## 11. 参考リンク

- **Lightsail 公式ドキュメント**: https://aws.amazon.com/lightsail/
- **Docker インストール手順 (Ubuntu)**: https://docs.docker.com/engine/install/ubuntu/
- **TileServer‑GL Docker Hub**: https://hub.docker.com/r/mediagis/tileserver-gl
- **Cloudflare DNS 設定**: https://developers.cloudflare.com/dns/
- **pm2 プロセスマネージャ**: https://pm2.keymetrics.io/

---

**このガイドは、RentScope を AWS Lightsail 上で本番運用できるようにするための最小構成です。** 途中でエラーが出た場合は、エラーメッセージを添えて質問してください。必要に応じて個別手順やスクリプトの修正もサポートします。
