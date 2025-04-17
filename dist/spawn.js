const config = {
  'ip': '0.0.0.0',
  'port': 7110,
}

const distribution = require('./distribution')(config)
distribution.node.start((server) => {
  // Make the group with all of the IPs that are running postgresql server and express
})

// Somehow expose query from here and query all the nodes
