#!/bin/bash
set -euo pipefail

ips=$(./describe-instances.sh)
start=1

for ip in $ips; do
  end=$((start + 55))
  echo "crawling pages $start to $end on $ip"
  curl "http://$ip:8000/crawl?start=$start&end=$end"
  echo -e "\n"
  start=$((end + 1))
done
