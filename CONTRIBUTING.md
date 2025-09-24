# Contributing

Thanks for your interest in improving this project! Please follow these guidelines:

## Setup
- Node.js 20+ recommended
- Install dependencies: `npm install`
- Copy env file: `copy config/env.example .env.local` (Windows) or `cp config/env.example .env.local`

## Development
- Start local dev (LAN-aware): `npm run dev`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Format check: `npm run format` (or fix with `npm run format:write`)

## Branching
- Create feature branches from `main`: `feat/*`, `fix/*`, `docs/*`
- Keep PRs focused and small when possible

## Commit messages
- Use conventional commits, e.g. `feat: add cashier route`, `fix: correct order totals`

## Code style
- TypeScript strict mode is enabled; add explicit types for public APIs
- Prefer descriptive names and early returns
- Avoid unnecessary try/catch and deep nesting

## Testing
- Manual testing: visit `/`, `/login`, `/admin`, `/cashier`
- Health check: `GET /api/health`

## UI
- Use shadcn/Radix components under `components/ui/*`
- Prefer `hooks/use-toast` for notifications and `components/ui/toaster` mounted in `app/layout.tsx`

## Accessibility
- Keep forms labelled, ensure focus states and keyboard navigation

Thank you!
