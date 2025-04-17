import express from 'express';
import {client} from './db.js'
import {crawl} from './crawl.js';
import {genSuggestions, getSuggestion} from './suggestionGeneration.js';

const app = express()

app.get('/', (req, res) => {
  res.send('OK')
})
app.post('/suggestion', async (req,res)=> {
  const {question} = req.query
  const suggestions = await getSuggestion(question)
  res.send(suggestions)
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

app.post('/runSuggestions', async (req, res) => {
  try {
    //Done so we can know when it is finished
    const _notUsed= await genSuggestions();
    res.status(200).json({message: "Suggestion Generation Finished"})
  } catch (error) {
    console.error('Error generating suggestions:', error);
    res.status(500).json({error: 'Failed to generate suggestions'});
  }
})

app.get('/suggestions', async (req, res) => {
  try {
    const { question } = req.query;
    if (!question) {
      return res.status(400).json({error: 'Question parameter is required'});
    }
    const suggestions = await getSuggestion(question);
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({error: 'Failed to get suggestions'});
  }
})

app.listen(8000, () => {
  console.log('Server is running on port 8000')
})
