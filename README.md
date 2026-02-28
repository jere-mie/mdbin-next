# mdbin

A minimal, beautiful pastebin for Markdown. Paste or type markdown content and share it with others through a unique URL.

## Features

- **Markdown rendering** with full GFM support (tables, task lists, strikethrough)
- **Syntax highlighting** for code blocks
- **Password protection** - optionally lock pastes behind a password
- **Configurable expiration** - set pastes to auto-expire after 1 hour, 1 day, 7 days, or 30 days
- **Responsive design** - works on desktop and mobile
- **Copy actions** - one-click copy for paste URL or raw content
- **Source/preview toggle** - switch between rendered markdown and raw source

## Tech Stack

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com)
- [Drizzle ORM](https://orm.drizzle.team) with [Turso](https://turso.tech) (SQLite)
- [react-markdown](https://github.com/remarkjs/react-markdown) + [rehype-highlight](https://github.com/rehypejs/rehype-highlight)
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) for password hashing

## Getting Started

### Prerequisites

- Node.js 18+
- A Turso database (or local SQLite file for development)

### Setup

1. Clone the repo:

```bash
git clone https://github.com/jere-mie/mdbin-next.git
cd mdbin-next
```

2. Install dependencies:

```bash
npm install
```

3. Copy the example env file and configure your database:

```bash
cp example.env .env
```

Edit `.env` with your Turso credentials (or use `file:local.db` for local development).

4. Push the database schema:

```bash
npx drizzle-kit push
```

5. Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using mdbin.

## Deployment

The app can be deployed to any platform that supports Next.js (Vercel, Netlify, etc.). Make sure to set the `DB_URL` and `DB_AUTH_TOKEN` environment variables for your Turso database.

## License

MIT
