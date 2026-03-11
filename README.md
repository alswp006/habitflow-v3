🇺🇸 [한국어](./README.ko.md)

# habitflow-v3

A mobile app for tracking daily habits and managing streaks (consecutive days of achievement).

## Features

- **Daily Habit Tracking**: Log your habits every day with a simple, intuitive interface
- **Streak Management**: Track consecutive days of completion for each habit
- **Active Habits List**: View all your active habits at a glance
- **Edit & Manage**: Create, edit, and manage your habits
- **Offline Support**: Works offline with local data persistence
- **Pull-to-Refresh**: Keep your data up-to-date with refresh functionality

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: SQLite (better-sqlite3)
- **Storage**: localStorage for client-side persistence
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm 8+

### Installation

```bash
# Install dependencies
pnpm install --ignore-workspace

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

### Build & Deploy

```bash
# Typecheck
npx tsc --noEmit

# Build
npx next build --experimental-app-only

# Test
pnpm test
```

### Project Structure

```
src/
├── app/              # Next.js 15 App Router pages
├── components/       # React components (shadcn/ui)
├── lib/              # Utilities (auth, API, database)
├── store/            # State management (Zustand)
├── __tests__/        # Test files
└── styles/           # Global styles
```

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm test` - Run tests with Vitest
- `pnpm typecheck` - Run TypeScript type checking

## License

MIT
