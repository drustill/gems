import { DescribeInstancesCommand, EC2Client } from "@aws-sdk/client-ec2"

console.log({
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
})

const client = new EC2Client({
  region: process.env.AWS_REGION || "",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export default async function describeInstances(): Promise<any[]> {
  try {
    const command = new DescribeInstancesCommand({
      Filters: [
        {
          Name: "instance-state-name",
          Values: ["running"],
        },
      ],
    });

    const { Reservations = [] } = await client.send(command);

    const ips = Reservations
      .flatMap(r => r.Instances || [])
      .map(i => i.PublicIpAddress)
      .filter(Boolean);

    return ips
  } catch (err) {
    console.log('err', err)
    return []
  }
}