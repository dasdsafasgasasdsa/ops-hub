# OpenClaw Ops Hub

Localhost-only personal operations dashboard for OpenClaw with Kanban, worker automation, approvals, logs, and recovery.

## Monorepo layout

- `apps/web` — dashboard frontend
- `apps/api` — localhost API
- `apps/worker` — queue runner / automation worker
- `packages/shared` — shared types / DTOs
- `packages/db` — database access helpers
- `packages/task-engine` — task lifecycle and policy engine
- `packages/openclaw-adapter` — bridge to OpenClaw execution
- `prisma` — Prisma schema and migrations
- `scripts` — local bootstrap / maintenance scripts
- `var` — runtime data, logs, runs, artifacts
- `launchd` — local service manifests
