import describeInstances from "@/app/api/ec2/ec2"


export async function GET() {
    const ips = await describeInstances()
    const port = 8000

    const promises:Promise<{language:string}>[] = []



    for (const ip of ips) {
        const url = `http://${ip}:${port}/languages`

        const resPromise: Promise<{language:string}> = fetch(url).then((res) => res.json())
        promises.push(resPromise)


    }
   const res = (await Promise.all(promises)).flat().map((x) => x.language)
   console.log(res)

   return Response.json({languages:Array.from(new Set(res))})

}