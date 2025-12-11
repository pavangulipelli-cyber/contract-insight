# Contract Insight - AI-Powered Contract Review

AI-powered contract attribute extraction, validation, and review platform.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn-ui
- **Backend**: Node.js + Express + SQLite
- **Database**: SQLite

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/your-org/contract-insight.git
cd contract-insight
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Backend Server

```bash
cd server
npm install
npm start
```

Backend runs on: **http://localhost:4000**

### 4. Run Frontend Server (New Terminal)

```bash
npm run dev
```

Frontend runs on: **http://localhost:4000**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/documents` | List all documents |
| GET | `/api/documents/:id` | Get document details |
| GET | `/api/documents/:id/attributes` | Get document attributes |
| GET | `/api/documents/:id/attributes/export` | Export attributes (CSV/JSON) |
| POST | `/api/documents/:id/review` | Save review corrections |
| POST | `/api/documents/bulk` | Bulk operations (approve, delete) |
| POST | `/api/documents/export` | Export documents (CSV/JSON) |

## Project Structure

```
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── pages/              # Page components
│   ├── api/                # API calls
│   └── context/            # Auth context
├── server/                 # Backend server
│   ├── index.js            # Express app
│   └── data/               # SQLite database
└── package.json            # Root dependencies
```

## Features

- ✅ AI-powered contract attribute extraction
- ✅ Confidence scoring for extracted values
- ✅ Manual review and correction interface
- ✅ Batch operations (approve, delete)
- ✅ Export to CSV/JSON
- ✅ Document status tracking
- ✅ PDF viewer with highlighting
