#!/usr/bin/env bash
set -euo pipefail

cd $(dirname "$0")/..

# if builder “multiarch” doesn’t exist, create it; otherwise just switch to it
if ! docker buildx inspect multiarch >/dev/null 2>&1; then
  echo "Creating buildx builder 'multiarch'…"
  docker buildx create --use --name multiarch
else
  echo "Using existing buildx builder 'multiarch'…"
  docker buildx use multiarch
fi

# now build & push
docker buildx build \
  --platform linux/amd64 \
  -t drustill/cs1380-server:latest \
  --push ./server/

cd $(dirname "$0")/scripts

./terminate-instances.sh
./provision-instances.sh
