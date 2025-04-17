import express from 'express';
import {client} from './db.js'
import {crawl, generateEmbeddings} from './crawl.js';
import fs from 'fs';

function log(message) {
  fs.writeFileSync('./log.txt', `${new Date().toISOString()} - ${message}\n`, {flag: 'a'});
}

const app = express()
app.use(express.json())

app.get('/', (req, res) => {
  res.send('OK')
})

app.get('/select', async (req, res) => {
  const result = await client.query('SELECT (name, owner) FROM readmes')
  res.send(result.rows)
})
app.get("/languages", async(req,res)=> {
  const result = await client.query(`select distinct language from readmes`)
  res.send(result.rows);
})


app.get('/crawl', async (req, res) => {
  const {start, end} = req.query
  console.log(`Crawling from ${start} to ${end}`)
  const crawlRes = await crawl(parseInt(start), parseInt(end))
  res.status(200).json({message: crawlRes})
})

app.post('/query', async (req, res) => {
  log(`Query received ${req.body}`)
  const {query, language} = req.body
  
  log(`query ${query}`)
  const embeddings = await generateEmbeddings(query)
  log(`got embeddings`)
  if (language){
    try {
      const result = await client.query(`
      select *, embeddings <-> $1::vector as distance from readmes
        where language = $2::text
      order by distance
      limit 10`, [`[${embeddings.join(',')}]`, language])
    }
  }
  try {
    const result = await client.query(`
    SELECT *, embeddings <-> $1::vector FROM readmes
    ORDER BY embeddings <-> $1::vector
    LIMIT 10
  `, [`[${embeddings.join(',')}]`])
    log(`got result`)
    res.status(200).json(result.rows)
  } catch (e) {
    log(`Error: ${e}`)
  }
})

app.listen(8000, () => {
  console.log('Server is running on port 8000')
})

