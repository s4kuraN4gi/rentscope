#!/usr/bin/env bash
# update_osm.sh
# This script updates the OpenStreetMap data for TileServer-GL.
# It downloads the latest Japan PBF file and restarts the container.

set -euo pipefail

# Define data directory
DATA_DIR="/data"
PBF_URL="https://download.geofabrik.de/asia/japan-latest.osm.pbf"

echo "Starting OSM data update at $(date)"

# Remove old data (optional: backup before removing if needed)
if [ -f "$DATA_DIR/planet.osm.pbf" ]; then
    echo "Removing old planet.osm.pbf..."
    rm -f "$DATA_DIR/planet.osm.pbf"
fi

# Download latest data
echo "Downloading latest OSM data from $PBF_URL..."
wget -O "$DATA_DIR/planet.osm.pbf" "$PBF_URL"

# Restart TileServer-GL container to load new data
if docker ps -a --format '{{.Names}}' | grep -q '^tileserver-gl$'; then
    echo "Restarting tileserver-gl container..."
    docker restart tileserver-gl
else
    echo "tileserver-gl container is not running. Please start it manually."
fi

echo "OSM data update completed at $(date)"
