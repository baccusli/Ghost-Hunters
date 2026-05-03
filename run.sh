#!/bin/bash

set -e

MODE=${1:-local}

echo "Mode: $MODE"

npm install

if [ "$MODE" = "local" ]; then
  echo "Starting local development server..."
  npm run dev
elif [ "$MODE" = "vps-dev" ]; then
  echo "Starting VPS development server..."
  npm run dev -- --host 0.0.0.0
elif [ "$MODE" = "vps-prod" ]; then
  echo "Building production app..."
  npm run build

  echo "Starting production preview server..."
  npm run preview -- --host 0.0.0.0
else
  echo "Unknown mode: $MODE"
  echo "Use: ./run.sh local | vps-dev | vps-prod"
  exit 1
fi
