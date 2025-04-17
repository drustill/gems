const {execSync} = require('child_process')
const distribution = require('./dist/distribution')

const PORT = 7110
const GID = 'mdfd'

const nodeGroup = {}
const nodeConfig = {gid: GID}

const getNodeIPs = () => {
  return execSync(`./scripts/describe-instances.sh`).toString().trim().split(/\s+/).filter(Boolean)
}

const registerGroup = async () => {
  return new Promise((resolve, reject) => {
    distribution.local.groups.put(nodeConfig, nodeGroup, (e, v) => {
      distribution[GID].groups.put(nodeConfig, nodeGroup, (e, v) => {
        console.log(v)
        console.log(`[group] ${GID} registered`)
        resolve()
      })
    })
  })
}

const getGroup = async () => {
  return new Promise((resolve, reject) => {
    distribution[GID].groups.get(nodeConfig, (e, v) => {
      if (e) {
        console.log(e)
        reject(e)
      } else {
        resolve(v)
      }
    })
  })
}


(async () => {
  console.log('[group] Starting')
  const group = await getGroup()
  console.log('[group] Group:', group)
  // const node = {ip: 'localhost', port: 8000}
  // nodeConfig[distribution.util.id.getSID(node)] = node
  // await registerGroup()
  // console.log('[group] Finished')
})()
