# GitHub Commits Explorer

A full-stack web application that fetches and displays GitHub repository commit data via the GitHub REST API. Built with **TypeScript**, **Node.js**, **React**, and **Docker**.

---

## Quick Start (Docker)

The only prerequisite is [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose).

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd assignment_smart_works

# 2. (Optional but recommended) Set a GitHub token to avoid rate limits
cp .env.example .env
# Edit .env and add your token:
# GITHUB_TOKEN=ghp_your_token_here

# 3. Build and start both services
docker-compose up --build

# 4. Open the app
# Frontend → http://localhost:3000
# Backend API → http://localhost:3001
```

To stop: `docker-compose down`

> **GitHub Rate Limits**: Without a token you get 60 API requests/hr (unauthenticated). With a token you get 5,000/hr. Create a free token at https://github.com/settings/tokens — no special scopes are needed for public repos.

---

## API Endpoints

All endpoints accept `owner` and `repo` as path parameters.

### 1. Get All Commits
```
GET /api/:owner/:repo/commits
```
Returns all commits including author/committer details, commit title (first line of message), and comment count.

**Example:**
```
GET http://localhost:3001/api/octocat/Spoon-Knife/commits
```

**Response shape:**
```json
{
  "repository": "octocat/Spoon-Knife",
  "totalCommits": 3,
  "commits": [
    {
      "sha": "a30c19e3f13765a3b48829788bc1cb8b4e95cee4",
      "title": "Create styles.css",
      "message": "Create styles.css",
      "htmlUrl": "https://github.com/...",
      "author": {
        "name": "The Octocat",
        "email": "octocat@github.com",
        "date": "2014-02-05T23:40:15Z",
        "login": "octocat",
        "avatarUrl": "https://avatars.githubusercontent.com/...",
        "htmlUrl": "https://github.com/octocat"
      },
      "committer": { ... },
      "commentCount": 2
    }
  ]
}
```

### 2. Get Unique Commit Authors
```
GET /api/:owner/:repo/authors
```
Returns a deduplicated list of commit authors with their avatar, username, profile URL, and commit count — sorted by commit count descending.

**Example:**
```
GET http://localhost:3001/api/octocat/Spoon-Knife/authors
```

**Response shape:**
```json
{
  "repository": "octocat/Spoon-Knife",
  "totalAuthors": 2,
  "authors": [
    {
      "login": "octocat",
      "name": "The Octocat",
      "email": "octocat@github.com",
      "avatarUrl": "https://avatars.githubusercontent.com/...",
      "htmlUrl": "https://github.com/octocat",
      "commitCount": 3
    }
  ]
}
```

### 3. Get All Commit Comments
```
GET /api/:owner/:repo/comments
```
Returns all commit comments for the repository, including the commit SHA, commenter avatar/username, comment body, and HTML URL.

**Example:**
```
GET http://localhost:3001/api/octocat/Spoon-Knife/comments
```

**Response shape:**
```json
{
  "repository": "octocat/Spoon-Knife",
  "totalComments": 5,
  "comments": [
    {
      "id": 1296269,
      "commitSha": "a30c19e3...",
      "htmlUrl": "https://github.com/.../commit/...",
      "body": "Great change!",
      "createdAt": "2014-02-05T23:40:15Z",
      "commenter": {
        "login": "monalisa",
        "avatarUrl": "https://avatars.githubusercontent.com/...",
        "htmlUrl": "https://github.com/monalisa"
      }
    }
  ]
}
```

---

## Frontend Features

- **Repository Input** — Type any `owner/repo` (e.g. `facebook/react`) and press Enter or click Explore
- **Stats Header** — Shows live total commits, unique authors, and total comment count
- **Author Dropdown** — Select any author to filter the table; shows avatar badge with commit count
- **Commits Table** — Sortable by date or comment count, paginated (20 per page)
- **Comment Preview** — Click the 💬 badge on any commit with comments to open an inline modal showing commenter avatars, usernames, comment bodies, and links
- **API Links Panel** — Quick links to all 3 raw API endpoints for the current repo
- **Loading Skeletons** — Animated skeleton rows during data fetch
- **Error Handling** — Clear error banners with GitHub API error details

---

## Code Structure

```
assignment_smart_works/
│
├── backend/                        # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── index.ts                # Express app entry — CORS, logging, routes
│   │   ├── routes/
│   │   │   ├── commits.ts          # GET /api/:owner/:repo/commits
│   │   │   ├── authors.ts          # GET /api/:owner/:repo/authors
│   │   │   └── comments.ts         # GET /api/:owner/:repo/comments
│   │   ├── services/
│   │   │   └── github.ts           # GitHub API client — pagination, data transforms
│   │   └── types/
│   │       └── github.ts           # TypeScript interfaces (raw GitHub + response shapes)
│   ├── Dockerfile                  # Multi-stage: tsc build → production node
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                       # React + TypeScript + Vite
│   ├── src/
│   │   ├── main.tsx                # React entry point
│   │   ├── App.tsx                 # Root component: repo input, stats, filter bar
│   │   ├── index.css               # Design system (CSS variables, dark theme, animations)
│   │   ├── api/
│   │   │   └── client.ts           # Axios client — all API calls
│   │   ├── hooks/
│   │   │   └── useCommits.ts       # React Query hooks for commits + authors
│   │   ├── components/
│   │   │   ├── CommitsTable.tsx    # Sortable/paginated table with SHA chips
│   │   │   ├── AuthorFilter.tsx    # Dropdown + selected author badge
│   │   │   └── CommentsModal.tsx   # Modal for per-commit comment preview
│   │   └── types/
│   │       └── api.ts              # Frontend API response types
│   ├── nginx.conf                  # Nginx: serves SPA + proxies /api/ to backend
│   ├── Dockerfile                  # Multi-stage: vite build → nginx serve
│   ├── vite.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml              # Orchestrates backend (3001) + frontend (3000)
├── .env.example                    # GITHUB_TOKEN config template
├── .gitignore
└── README.md
```

---

## Libraries & Frameworks

### Backend
| Library | Version | Purpose |
|---|---|---|
| `express` | ^4.19 | HTTP server and routing |
| `axios` | ^1.7 | GitHub API HTTP client with pagination |
| `cors` | ^2.8 | Cross-origin request support |
| `dotenv` | ^16.4 | Environment variable loading |
| `typescript` | ^5.4 | Type safety and compilation |
| `ts-node` | ^10.9 | TypeScript execution (dev only) |

### Frontend
| Library | Version | Purpose |
|---|---|---|
| `react` + `react-dom` | ^18.3 | UI framework |
| `vite` | ^5.3 | Build tool and dev server |
| `@tanstack/react-query` | ^5.45 | Data fetching, caching, and loading states |
| `axios` | ^1.7 | API HTTP client |
| `typescript` | ^5.4 | Type safety |

### Infrastructure
| Tool | Purpose |
|---|---|
| Docker (multi-stage builds) | Containerised, reproducible builds |
| Docker Compose | Service orchestration (backend + frontend) |
| Nginx | Serves React SPA + proxies `/api/` to backend |

---

## Running Locally (without Docker)

**Backend:**
```bash
cd backend
npm install
# Optional: create .env with GITHUB_TOKEN=your_token
npm run dev
# → http://localhost:3001
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000  (Vite proxies /api to :3001)
```

---

## AI Tooling Disclosure

This project was built with assistance from **Antigravity (Google DeepMind)** — an AI coding assistant. The AI was used for:

- **Architecture decisions** — service/route/component structure, API response shape design
- **Boilerplate generation** — TypeScript interfaces, Express route handlers, React Query hooks
- **Docker configuration** — multi-stage Dockerfiles, nginx proxy config, Compose healthchecks
- **CSS design system** — dark theme, glassmorphism, animation keyframes

All code was reviewed for correctness and tailored to the specific requirements of this assignment. The human developer directed all technical decisions, data flow design, and feature requirements.

---

## Notes

- The backend automatically paginates GitHub's API (100 commits per page, up to 2000 commits max to stay within rate limits)
- Authors are deduplicated by GitHub `login` (falling back to email for commits without a linked GitHub account)
- The comment preview modal fetches all repo comments once and filters client-side by commit SHA to minimise API calls
