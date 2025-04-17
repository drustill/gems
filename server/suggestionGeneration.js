import {client} from "./db.js";
import {generateQuestion} from "./crawl.js";


const genSuggestions = async () => {
    const summaries = await client.query('SELECT summary from readmes;').rows;
    summaries.forEach(async(summary) => {
        const question = await generateQuestion(summary);
        const questionEmbedding = await generateEmbeddings(question);
        await client.query('insert into suggestions(question, embeddings) values ($1::text, $2::vector)', [question, questionEmbedding])

    })

    // This is only here so the other side knows when we are finished.
    return {message:'success'}
}            


const getSuggestion = async (question) => {
    const embedding = await generateEmbeddings(question)
    const suggestions = await client.query(
     `Select question, embeddings <-> $1::vector as distance from suggestions sort by distance desc limit 10;`,[`[${embeddings.join(",")}]`]
    )
    return suggestions.rows
}

export { genSuggestions, getSuggestion }
