#!/usr/bin/env bash

set -Eeuo pipefail

IMAGE_NAME="${IMAGE_NAME:-lff-image}"
CONTAINER_NAME="${CONTAINER_NAME:-lff}"
HOST_PORT="${HOST_PORT:-3579}"
NETWORK_NAME="${NETWORK_NAME:-mariadb-network}"
ENV_FILE="${ENV_FILE:-.env}"

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker n'est pas installé ou n'est pas accessible."
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Fichier d'environnement introuvable : $ENV_FILE"
  exit 1
fi

CONTAINER_PORT="${CONTAINER_PORT:-$(
  sed -n 's/^[[:space:]]*PORT[[:space:]]*=[[:space:]]*//p' "$ENV_FILE" |
    tail -n 1 |
    tr -d '\r'
)}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"

if ! [[ "$HOST_PORT" =~ ^[0-9]+$ && "$CONTAINER_PORT" =~ ^[0-9]+$ ]]; then
  echo "❌ HOST_PORT et PORT doivent être des nombres valides."
  exit 1
fi

if ! docker network inspect "$NETWORK_NAME" >/dev/null 2>&1; then
  echo "❌ Le réseau Docker '$NETWORK_NAME' n'existe pas."
  echo "   Crée-le avec : docker network create $NETWORK_NAME"
  exit 1
fi

echo "🏗️  Build de l'image ${IMAGE_NAME}:latest..."
docker build -t "${IMAGE_NAME}:latest" .

if docker container inspect "$CONTAINER_NAME" >/dev/null 2>&1; then
  echo "⏹️  Arrêt du conteneur $CONTAINER_NAME..."
  docker stop "$CONTAINER_NAME"

  echo "🗑️  Suppression du conteneur $CONTAINER_NAME..."
  docker rm "$CONTAINER_NAME"
fi

echo "🚀 Lancement du conteneur $CONTAINER_NAME..."
docker run -d \
  -p "127.0.0.1:${HOST_PORT}:${CONTAINER_PORT}" \
  --env-file "$ENV_FILE" \
  --network "$NETWORK_NAME" \
  --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  "${IMAGE_NAME}:latest"

echo "✅ Conteneur lancé sur 127.0.0.1:${HOST_PORT}"
