#!/usr/bin/env bash
# update_tileserver.sh
# This script pulls the latest TileServer-GL Docker image and restarts the container.

set -euo pipefail

# Pull latest image
docker pull maptiler/tileserver-gl

# Stop and remove existing container (if any)
if docker ps -a --format '{{.Names}}' | grep -q '^tileserver-gl$'; then
  docker stop tileserver-gl
  docker rm tileserver-gl
fi

# Restart container with the same volume mount
docker run -d \
  --name tileserver-gl \
  -p 80:80 \
  -v /data:/data \
  maptiler/tileserver-gl

echo "TileServer-GL updated and restarted at $(date)"
