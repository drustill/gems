# GEMS (GitHub Embedded Markdown Search)

A **semantic search engine** for GitHub Markdown files, focusing on repository `README.md` documents.

---

## 📁 Repository Structure

```text
.
├── .gitignore
├── docker-compose.yml
├── frontend
├── server
├── scripts
└── README.md
```

### frontend/

- A **Next.js** application rendering the search UI. It sends query requests to the backend aggregator.
- Configuration in `frontend/.env.local` (copy from root `.env.example`).

### server/

- Implements the **crawl**, **embed**, and **query** endpoints:
  - `GET /crawl?start=X&end=Y` — fetch and store READMEs in Postgres
  - `GET /runSuggestions/` — compute and persist embeddings
  - `POST /query` — accept a text prompt, compute its embedding, and return the top-k similar documents
- Uses **pgvector** for vector storage and similarity search.

### scripts/

- Provisioning and orchestration scripts

---
