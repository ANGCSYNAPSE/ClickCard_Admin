# ClickCard Admin

The admin panel for ClickCard, split out of the main web app into its own
deployable Next.js project. It talks to [ClickCard_Backend](../ClickCard_Backend)
over its REST API — it holds no database access or business logic of its own.

## Development

```bash
npm install
npm run dev
```

Runs on http://localhost:3001 by default. Copy `.env.example` to `.env.local`
and point `NEXT_PUBLIC_API_BASE_URL` at your backend instance.

## Structure

- `src/pages` — admin routes (dashboard, users, revenue, subscriptions,
  analytics, moderation, support, team, settings, login)
- `src/components` — admin shell/layout and dashboard widgets
- `src/services` — thin wrappers around backend REST endpoints
  (`adminService`, `notificationService`)
- `src/lib` — axios client with token refresh, auth guard, token storage
