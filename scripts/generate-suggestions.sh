#!/bin/bash
set -euo pipefail

ips=$(./describe-instances.sh)

for ip in $ips; do
  echo "Generating suggestions on $ip"
  curl "http://$ip:8000/runSuggestions/"
  echo -e "\n"
done
