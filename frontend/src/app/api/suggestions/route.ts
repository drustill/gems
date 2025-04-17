import { NextRequest, NextResponse } from "next/server"
import describeInstances from "../ec2/ec2"

export async function POST(req: NextRequest) {
    const ips = await describeInstances()
    const port = 8000

    const promises = []
    const {question} = await req.json()


    for (const ip of ips) {
        const url = `http://${ip}:${port}/suggestion?question=${encodeURIComponent(question)}`
        const resPromise:Promise<{distance:number, question:string}> = fetch(url, {
            method: 'POST',
        }).then((res) => res.json())

        promises.push(resPromise)
    }
    console.log(promises);
    const res = (await Promise.all(promises)).flat().sort((a,b) => b.distance - a.distance)
        .slice(0,10).map(x => x.question);
    console.log(res)

    return NextResponse.json({suggestions: res})
}