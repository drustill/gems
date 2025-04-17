#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
./write-user-data.sh

# aws ec2 create-security-group --group-name "CS1380SecurityGroup" --description "launch-wizard-3 created 2025-04-16T19:31:39.235Z" --vpc-id "vpc-0df512ef7dca9f089"
# aws ec2 authorize-security-grou--ingress --group-id "sg-preview-1" --ip-permissions '{"IpProtocol":"tcp","FromPort":22,"ToPort":22,"IpRanges":[{"CidrIp":"0.0.0.0/0"}]}' '{"IpProtocol":"tcp","FromPort":7000,"ToPort":8000,"IpRanges":[{"CidrIp":"0.0.0.0/0"}]}'
# aws ec2 run-instances --image-id "ami-084568db4383264d4" --instance-type "t2.micro" --key-name "aws-key" --block-device-mappings '{"DeviceName":"/dev/sda1","Ebs":{"Encrypted":false,"DeleteOnTermination":true,"Iops":3000,"SnapshotId":"snap-0edbe0f6601b2861c","VolumeSize":16,"VolumeType":"gp3","Throughput":125}}' --network-interfaces '{"AssociatePublicIpAddress":true,"DeviceIndex":0,"Groups":["sg-preview-1"]}' --credit-specification '{"CpuCredits":"standard"}' --metadata-options '{"HttpEndpoint":"enabled","HttpPutResponseHopLimit":2,"HttpTokens":"required"}' --private-dns-name-options '{"HostnameType":"ip-name","EnableResourceNameDnsARecord":true,"EnableResourceNameDnsAAAARecord":false}' --count "2"

### ─── CONFIGURATION ────────────────────────────────────────────────────────────
# Edit these as needed:
GROUP_NAME="CS1380SecurityGroup"
VPC_ID="vpc-0df512ef7dca9f089"
AMI_ID="ami-084568db4383264d4"
INSTANCE_TYPE="t2.micro"
KEY_NAME="aws-key"
COUNT=2
# device mapping JSON (single‑quoted)
BLOCK_DEVICE_MAPPINGS='[{
  "DeviceName": "/dev/sda1",
  "Ebs": {
    "Encrypted": false,
    "DeleteOnTermination": true,
    "Iops": 3000,
    "SnapshotId": "snap-0edbe0f6601b2861c",
    "VolumeSize": 16,
    "VolumeType": "gp3",
    "Throughput": 125
  }
}]'
### ────────────────────────────────────────────────────────────────────────────────

# locate user‑data
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
USER_DATA_FILE="/tmp/combined-user-data.sh"
if [[ ! -f "$USER_DATA_FILE" ]]; then
  echo "ERROR: user‑data file not found at $USER_DATA_FILE"
  exit 1
fi

echo "► Checking for security group $GROUP_NAME"
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=${GROUP_NAME}" "Name=vpc-id,Values=${VPC_ID}" \
  --query "SecurityGroups[0].GroupId" --output text)

if [[ -z "$SG_ID" || "$SG_ID" == "None" ]]; then
  echo "→ Not found, creating security group…"
  SG_ID=$(aws ec2 create-security-group \
    --group-name "$GROUP_NAME" \
    --description "Created by provision-instances.sh on $(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
    --vpc-id "$VPC_ID" \
    --query "GroupId" --output text)
  echo "✔ Created SG: $SG_ID"
else
  echo "✔ Found existing SG: $SG_ID"
fi

echo "► Authorizing ingress (22 and 7000–8000)…"
# wrap in || true to ignore duplicate‑rule errors
aws ec2 authorize-security-group-ingress \
  --group-id "$SG_ID" \
  --ip-permissions \
    IpProtocol=tcp,FromPort=7000,ToPort=8000,IpRanges=[{CidrIp=0.0.0.0/0}] \
  || echo "  (ingress rules may already exist)"

echo "► Launching $COUNT instance(s)…"
aws --no-cli-pager ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type "$INSTANCE_TYPE" \
  --key-name "$KEY_NAME" \
  --block-device-mappings "$BLOCK_DEVICE_MAPPINGS" \
  --network-interfaces AssociatePublicIpAddress=true,DeviceIndex=0,Groups="$SG_ID" \
  --credit-specification CpuCredits=standard \
  --metadata-options HttpEndpoint=enabled,HttpPutResponseHopLimit=2,HttpTokens=required \
  --private-dns-name-options HostnameType=ip-name,EnableResourceNameDnsARecord=true,EnableResourceNameDnsAAAARecord=false \
  --user-data file://"$USER_DATA_FILE" \
  --tag-specifications "ResourceType=instance,Tags=[{Key=Role,Value=server}]" \
  --count "$COUNT"

echo "✔ Done. Instances are launching—tagged Role=server."
