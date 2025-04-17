# CS1380 EC2 Orchestration Scripts

Bash scripts to **provision**, **configure**, **orchestrate**, and **terminate** a pool of AWS EC2 instances running a distributed crawling and embedding pipeline.

---

## Environment Setup
`cp .env.example .env` and fill in environment variables
---

## Script Overview

### `provision-instances.sh`

- Launches a specified number of EC2 instances, creates or reuses a security group, and tags them with `Role=server`.

### `terminate-instances.sh`

-  Finds all running EC2 instances launched by this suite and terminates them.

### `reload-provision.sh`

- `docker build ... & docker push ... & ./terminate-instances.sh & ./provision-instances.sh`. Closest thing we have to something like nodemon or hot-reload

---

### `write-user-data.sh`

- Reads local `.env` into `user-data` script (`/tmp/combined-user-data.sh`)

### `user-data.sh`

- The bootstrap script that runs **on each EC2 instance** during initialization.
- **Actions**:
  1. Writes out `/home/ubuntu/.env` from the embedded contents.
  2. Installs Docker, Docker Compose, and configures the `docker-compose.yml` to launch your Postgres (`pgvector`) and `cs1380-server` containers.
  3. Brings up the services in detached mode.

---

## Orchestrator Scripts

These scripts run **locally**

### `crawl-pages.sh`

- **Purpose**: Distributes URL crawling jobs by invoking the `/crawl` endpoint on each running instance over a rolling range of page IDs.
- **Usage**:
  ```bash
  ./crawl-pages.sh
  ```

### `generate-suggestions.sh`

- **Purpose**: Hits the `/runSuggestions` endpoint on every instance to run the embedding/suggestion pipeline.
- **Usage**:
  ```bash
  ./generate-suggestions.sh
  ```

---
