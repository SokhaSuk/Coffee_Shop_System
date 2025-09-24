# Developer Quickstart

## Prerequisites
- Node.js >= 18.18 (20+ recommended)
- npm

## Install
```
npm install
```

## Environment
Copy the example and adjust as needed:
```
# Windows (PowerShell)
copy config\env.example .env.local

# macOS/Linux
cp config/env.example .env.local
```

## Scripts
- `npm run dev` – Start Next.js dev, bound to LAN if possible
- `npm run lan` – Same as dev but uses default port auto-selection
- `npm run build` – Production build
- `npm run start` – Start production server
- `npm run lan:prod` – Start production server on 0.0.0.0:3000
- `npm run typecheck` – TypeScript check
- `npm run lint` – Next lint
- `npm run format` – Prettier check
- `npm run format:write` – Prettier write

## Project Map
See `app/docs/overview/page.tsx` in the running app for an overview.

## Routes
- `/` – Role-based dashboard (admin or cashier)
- `/login` – Login form (demo: admin@darkcoffee.com or cashier@darkcoffee.com, password: password123)
- `/admin` – Admin dashboard (requires admin role)
- `/cashier` – Cashier dashboard (requires cashier role)
- `/api/health` – Health probe

## UI and State
- UI primitives: `components/ui/*`
- Theme provider: `components/theme-provider.tsx`
- Toasts: `hooks/use-toast.ts` + `components/ui/toaster.tsx`
- Responsive helper: `hooks/use-mobile.ts`
- Contexts: `lib/auth-context.tsx`, `lib/product-context.tsx`, `lib/order-context.tsx`

## Coding Standards
- Follow EditorConfig and Prettier
- Descriptive names, early returns, explicit types for exported APIs

Happy building!
