import {Octokit} from "@octokit/rest";
import {createAppAuth} from "@octokit/auth-app";
import {convert} from "html-to-text";
import removeMd from "remove-markdown";
import {client} from './db.js'

import OpenAI from 'openai';
import Groq from "groq-sdk";


const appId = process.env.GITHUB_APP_ID;
if (!appId) {
  console.error("Missing GITHUB_APP_ID environment variable");
  process.exit(1);
}
let privateKey = process.env.GITHUB_PRIVATE_KEY;
if (!privateKey) {
  console.error("Missing GITHUB_PRIVATE_KEY environment variable");
  process.exit(1);
}
const installationId = process.env.GITHUB_INSTALLATION_ID;
if (!installationId) {
  console.error("Missing GITHUB_INSTALLATION_ID environment variable");
  process.exit(1);
}

privateKey = privateKey.replace(/\\n/g, "\n");

const octokit = new Octokit({
  authStrategy: createAppAuth,
  auth: {
    appId,
    privateKey,
    installationId,
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Helper function to truncate content to max characters
function truncateContent(content) {
  const maxChars = 20000;
  if (content.length > maxChars) {
    console.log(`Content truncated from ${content.length} chars to ${maxChars} chars`);
    return content.substring(0, maxChars);
  }
  return content;
}
async function generateQuestion(content){
  const completion = await groq.completions.create({
    messages:[{
      role:"system",
      content:"You are generating mock user questions for question suggestions. Generate a question a user might ask about the given readme summary, make all questions short and as succinct as possible, use simple terms if possible. For example, if given a readme about a django project that interprets users voice, a question could be 'show me a python project that is focused on AI' or ' show me examples of voice recognition"
    },
      {role:'user', content}]
  })
 return completion.choices[0]?.message?.content || "";
}
async function summarizeWithGroq(content) {
  // Ensure content is truncated before sending to Groq
  const originalLength = content.length;
  const truncatedContent = truncateContent(content);

  if (originalLength !== truncatedContent.length) {
    console.log(`Content was truncated before sending to Groq API (from ${originalLength} to ${truncatedContent.length} characters)`);
  } else {
    console.log(`Content was not truncated (${originalLength} characters)`);
  }

  console.log("Sending request to Groq API for summarization...");
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "Your task is to summarize the GitHub Repository Readme in a short paragraph of 100 words. The summary should capture what the repository is about with rich semantic information that is useful for semantic search. Return ONLY THE PLAIN TEXT SUMMARY, NO OTHER TEXT."
      },
      {
        role: "user",
        content: truncatedContent
      }
    ],
    model: "llama-3.1-8b-instant",
    temperature: 0.1,
    max_tokens: 512,
  });

  console.log("Summary generated successfully with Groq API");
  return completion.choices[0]?.message?.content || "";
}

async function generateEmbeddings(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embeddings:', error.message);
    return null;
  }
}

const getCleanMarkdown = async (url) => {
  try {
    const response = await octokit.request("GET " + url);
    const {data} = response;
    const htmlContent = data;
    const textContent = convert(htmlContent, {
      wordwrap: false,
      ignoreImage: true,
      ignoreHref: true,
    });
    const cleanText = removeMd(textContent);
    return truncateContent(cleanText);
  } catch (error) {
    console.error(`Error fetching README from ${url}, skipping...`);
    return null;
  }
}

const storeRecord = async (key, record) => {
  const values = Array.from(Object.values(record))
  await client.query(`
    INSERT INTO readmes (name, owner, stars, language, url, content, summary, embeddings)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8::vector)
  `, values)
}

const crawl = async (start = 1, end = 1) => {
  const keys = []
  const query = "stars:>1000";
  const perPage = 1;

  for (let page = start; page <= end; page++) {
    console.log(`Fetching page ${page}...`);
    const {data} = await octokit.search.repos({
      q: query,
      sort: "stars",
      order: "desc",
      per_page: perPage,
      page: page,
    });

    for (let repo of data.items) {
      const {name, owner, stargazers_count, language, default_branch} = repo;
      const readmeUrl = `https://raw.githubusercontent.com/${owner.login}/${name}/${default_branch}/README.md`;
      const readmeContent = await getCleanMarkdown(readmeUrl);

      if (!readmeContent) {
        continue;
      }

      // Generate summary and embeddings
      console.log(`Processing ${owner.login}/${name}...`);
      const summary = await summarizeWithGroq(readmeContent);
      const embeddings = await generateEmbeddings(summary);

      const record = {
        name,
        owner: owner.login,
        stars: stargazers_count,
        language,
        readmeUrl,
        readmeContent,
        summary,
        embeddings: `[${embeddings.join(",")}]`
      };

      const key = `${owner.login}/${name}`;
      keys.push(key);
      try {
        await storeRecord(key, record);
        console.log(`Stored record for ${key} with summary and embeddings`);
      } catch (error) {
        console.error(`Error storing record for ${key}:`, error);
      }
    }
  }
  return keys
}


export {crawl, generateQuestion, generateEmbeddings}

/// FOR LATER

// const createGroup = (groupId = 'mdfd', nodes) => {
//   const groupConfig = {gid: groupId};
//   const groupMembers = {}

//   nodes.forEach((node) => {
//     const sid = distribution.util.id.getSID(node)
//     groupMembers[sid] = node
//   })

//   distribution.local.groups.put(groupConfig, groupMembers, (e, v) => {
//     distribution.mdfd.groups.put(groupConfig, groupMembers, (e, v) => {
//       console.log(`Group ${groupId} created with members:`, groupMembers);
//     });
//   })
// }

// const createRoute = (groupId = 'mdfd', key, fn) => {
//   distribution[groupId].routes.put(fn, key, (e, v) => {
//     if (e) {
//       console.error(`Error creating route for ${key}:`, e);
//     } else {
//       console.log(`Route ${key} created successfully`);
//     }
//   });
// }

// const groupId = 'mdfd'
// const crawlMessage = [1, 2]
// const crawlRemote = {service: 'crawl', method: 'crawl'}



// (async () => {
//   try {
//     await crawl();
//     console.log("Crawling completed.");
//   } catch (error) {
//     console.error("An error occurred:", error);
//   } finally {
//     console.log("Server closed.");
//   }
// })();
//

