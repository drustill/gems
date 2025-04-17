#!/usr/bin/env bash
set -euo pipefail

aws ec2 describe-instances \
      --filters "Name=instance-state-name,Values=running" \
      --query "Reservations[].Instances[].PublicIpAddress" \
      --output text
