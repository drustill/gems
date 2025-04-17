#!/usr/bin/env bash
set -euo pipefail

INSTANCE_IDS=$(aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query "Reservations[].Instances[].InstanceId" \
  --output text)

if [[ -z "$INSTANCE_IDS" ]]; then
  echo "No EC2 instances to terminate."
  exit 0
fi

echo "Terminating the following EC2 instances:"
echo "$INSTANCE_IDS"

aws ec2 terminate-instances --instance-ids $INSTANCE_IDS

echo "Termination command sent. Use 'aws ec2 describe-instances' to check status."
