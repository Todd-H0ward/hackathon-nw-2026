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
  components/   # app-level layouts / providers
  contexts/     # React contexts (e.g. user session)
  pages/        # route pages
  shared/
    api/        # Axios instance + endpoints
    constants/  # routes, etc.
    hooks/      # shared hooks (React Query, …)
    lib/        # utilities (cn, …)
    types/      # shared types
    ui/         # shadcn UI primitives
```

Path alias: `@/*` → `src/*`.

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
