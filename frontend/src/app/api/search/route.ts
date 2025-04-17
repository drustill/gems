import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Use the OpenAI key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();
    
    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }
    
    // Generate embeddings for the query
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query
    });
    
    const queryEmbedding = response.data[0].embedding;
    
    // Read the output.json file
    const outputPath = path.join(process.cwd(), 'public', 'output.json');
    const fileContent = await fs.readFile(outputPath, 'utf8');
    const outputData = JSON.parse(fileContent);
    
    // Calculate similarity scores
    const results = [];
    
    // Handle both array and object formats
    if (Array.isArray(outputData)) {
      for (const repoEntry of outputData) {
        const repoKey = Object.keys(repoEntry)[0];
        const repo = repoEntry[repoKey];
        
        if (repo.embeddings && Array.isArray(repo.embeddings)) {
          const similarity = cosineSimilarity(queryEmbedding, repo.embeddings);
          results.push({
            name: repoKey,
            description: repo.description || '',
            url: repo.url || '',
            owner: repo.owner || '',
            stars: repo.stars || 0,
            language: repo.language,
            readmeUrl: repo.readmeUrl || '',
            summary: repo.summary || '',
            similarity
          });
        }
      }
    } else {
      for (const repoKey in outputData) {
        const repo = outputData[repoKey];
        if (repo.embeddings) {
          const similarity = cosineSimilarity(queryEmbedding, repo.embeddings);
          results.push({
            name: repoKey,
            description: repo.description || '',
            url: repo.url || '',
            owner: repo.owner || '',
            stars: repo.stars || 0,
            language: repo.language,
            readmeUrl: repo.readmeUrl || '',
            summary: repo.summary || '',
            similarity
          });
        }
      }
    }
    
    // Sort by similarity score (highest first)
    results.sort((a, b) => b.similarity - a.similarity);
    
    // Return top results
    return NextResponse.json({ results: results.slice(0, 10) });
    
  } catch (error: unknown) {
    console.error("Error processing search:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
