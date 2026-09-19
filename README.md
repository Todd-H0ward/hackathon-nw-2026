# NW Step Hackathon — frontend template

Vite + React 19 + TypeScript + React Router + TanStack Query + Axios + Tailwind 4 + shadcn (Base UI) + Biome.

## Quick start

```bash
pnpm install
cp .env-example .env
pnpm dev
```

## Scripts

| Command        | Description                          |
|----------------|--------------------------------------|
| `pnpm dev`     | Start Vite dev server                |
| `pnpm build`   | Typecheck and production build       |
| `pnpm preview` | Preview production build             |
| `pnpm lint`    | Run Biome linter                     |
| `pnpm format`  | Format and autofix with Biome        |
| `pnpm check`   | Biome check + TypeScript project refs|

## Project structure

```
src/
  App.tsx, router.tsx, providers.tsx, main.tsx   # app shell
  contexts/     # React contexts, one folder per domain
  store/        # Zustand stores: <domain>/{store,selectors,index}.ts
  features/     # domain modules with their own UI and logic
  pages/        # route pages; page-only components in <page>/ui/
  shared/
    api/        # Axios instances + endpoints
    constants/  # routes, etc.
    lib/        # utilities (cn, webgl helpers, …)
    types/      # shared types
    ui/         # design-system primitives + the globe widget
```

Path alias: `@/*` → `src/*`.

### Where does a new component go?

| Reused across pages, no domain knowledge | `shared/ui/` |
|------------------------------------------|--------------|
| Belongs to a domain, used on 2+ pages    | `features/<domain>/` |
| Used by exactly one page                 | `pages/<page>/ui/` |

There is deliberately no `src/components/`: it used to be a fourth location with
no rule, which is how the same `Sparkline` ended up implemented twice.

## Environment

| Variable         | Description              |
|------------------|--------------------------|
| `VITE_API_URL`   | API base URL for Axios   |

`GET /me` is available via `useCurrentUser` / `getCurrentUser`. Wire it into `UserProvider` when you need session bootstrap.

## UI

Add shadcn components with:

```bash
pnpm dlx shadcn@latest add <component>
```

Components land in `src/shared/ui`.

## Stack notes

- Imports are organized by Biome (`assist.source.organizeImports`).
- Axios converts snake_case ↔ camelCase on request/response.
- React Query defaults: `staleTime` 60s, limited retries, no refetch on focus.
