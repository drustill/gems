import pg from 'pg'

const {Client} = pg
const client = new Client()
await client.connect()

const init = async () => {
  await client.query(`CREATE EXTENSION IF NOT EXISTS vector;`);
  await client.query(`DROP TABLE IF EXISTS readmes;`)
  await client.query(`DROP TABLE if exists suggestions`)
  await client.query(`
      CREATE TABLE IF NOT EXISTS readmes (
        id SERIAL PRIMARY KEY,
        name TEXT,
        owner TEXT,
        stars INT,
        language TEXT,
        url TEXT,
        content TEXT,
        summary TEXT,
        embeddings VECTOR(1536)
      );
  `)
  await client.query(`
    CREATE TABLE IF NOT EXISTS suggestions (
      id serial PRIMARY KEY,
      question TEXT,
      embeddings VECTOR(1536)
    );
  `)

  console.log('[readmes]')
}

await init()

export {
  client,
}
