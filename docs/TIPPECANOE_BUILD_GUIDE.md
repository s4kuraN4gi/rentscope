# Tippecanoe Build Guide (Method A)

このドキュメントは、**Tippecanoe** をソースからビルドしてインストールする手順と、ビルドコマンド `make -j$(nproc)` が何をしているかをまとめたものです。

---

## 手順概要 (Method A)

1. **必要なビルドツールとライブラリをインストール**

   ```bash
   sudo apt-get update
   sudo apt-get install -y \
       build-essential \
       git \
       libsqlite3-dev \
       zlib1g-dev \
       libpng-dev \
       libzip-dev \
       libprotobuf-dev \
       protobuf-compiler
   ```

2. **Tippecanoe のソースコードをクローン**

   ```bash
   git clone https://github.com/mapbox/tippecanoe.git
   cd tippecanoe
   ```

3. **ビルド（マシンの CPU コア数に合わせて並列ビルド）**

   ```bash
   make -j$(nproc)
   ```

   - `make` は Makefile に記述されたビルド手順を実行します。
   - `-j$(nproc)` オプションは **同時に実行するジョブ（タスク）の数** を指定します。
   - `$(nproc)` はシステムが持つ **CPU コア数** を取得するシェル置換です。たとえば 8 コアのマシンなら `make -j8` と同等です。
   - これにより、コンパイルやリンク作業が **並列に走り、ビルド時間が大幅に短縮** されます。

4. **ビルドしたバイナリをシステムパスにコピー**

   ```bash
   sudo cp tippecanoe /usr/local/bin/
   ```

5. **インストール確認**
   ```bash
   tippecanoe -v   # 例: tippecanoe v2.33.0
   ```
   正しくバージョンが表示されればインストール完了です。

---

## `make -j$(nproc)` の詳細解説

- **`make`**: Makefile に定義されたビルドルール（コンパイル、リンク、インストールなど）を実行するツールです。
- **`-j N`**: `N` 個のジョブを同時に走らせるオプションです。デフォルトではシリアル（1 ジョブ）で実行されます。
- **`$(nproc)`**: Linux の `nproc` コマンドの出力（CPU コア数）をシェルが評価し、数値に置き換えます。例: `$(nproc)` → `8`（8 コアの場合）。
- **効果**: コンパイルは独立したソースファイルごとに並列化できるため、CPU コア数に比例してビルド時間が短くなります。CPU が多いマシンほど恩恵が大きく、逆にリソースが限られた環境では `-j1`（シリアル）に近い速度になります。

---

## 以降の作業

1. **OSM データ取得**（例: `japan.osm.pbf`）
2. **Tippecanoe で .mbtiles 作成**
   ```bash
   tippecanoe -o japan.mbtiles -zg -f -l japan japan.osm.pbf
   ```
3. **TileServer‑GL に配置し、権限調整**
   ```bash
   sudo chown -R 1000:1000 japan.mbtiles
   chmod 644 japan.mbtiles
   ```
4. **TileServer‑GL コンテナ再起動**
   ```bash
   cd ~/rentscope
   docker compose up -d --force-recreate tileserver
   ```

以上が Tippecanoe のビルド手順と `make -j$(nproc)` の意味です。必要に応じてこのドキュメントを参照してください。
