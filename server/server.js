import express from 'express';
import {client} from './db.js'
import {crawl} from './crawl.js';

const app = express()

app.get('/', (req, res) => {
  res.send('OK')
})

app.get('/select', async (req, res) => {
  const result = await client.query('SELECT (name, owner) FROM readmes')
  res.send(result.rows)
})

app.get('/crawl', async (req, res) => {
  const {start, end} = req.query
  console.log(`Crawling from ${start} to ${end}`)
  const crawlRes = await crawl(parseInt(start), parseInt(end))
  res.status(200).json({message: crawlRes})
})

app.listen(8000, () => {
  console.log('Server is running on port 8000')
})
