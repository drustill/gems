#!/bin/bash
cd "$(dirname "$0")"

set -a
if [[ -f .env ]]; then
  echo "Loading environment variables from .env"
  source .env
else
  echo "No .env file found! Exiting."
  exit 0
fi
set +a

cat > /tmp/combined-user-data.sh <<EOF
#!/usr/bin/env bash
cat > /home/ubuntu/.env <<DOTENV
$(cat .env)
DOTENV
$(cat user-data.sh)
EOF
