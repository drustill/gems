import { NextRequest, NextResponse } from "next/server"
import describeInstances from "../ec2/ec2"

export async function POST(req: NextRequest) {
  const ips = await describeInstances()
  const port = 8000

  const promises = []
  const json = await req.json()


  for (const ip of ips) {
    const url = `http://${ip}:${port}/query`
    const resPromise = fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(json)
    }).then((res) => {
      return res.json()
    }).catch((e) => {
      console.log('ERROR', e)
    })

    promises.push(resPromise)
  }

  const promiseResults = await Promise.all(promises)
  const res = promiseResults.flat().sort((a,b) => a.distance - b.distance).slice(0,10);


  return NextResponse.json({res})
}