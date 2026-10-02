# NOTES.md

Working notes and preferences. Not a lesson — a scratchpad for me (the teacher).

## Who I'm teaching

- **Goal:** senior-level software engineering role. KinLink is the proof, not the hobby.
- **Baseline (self-reported, session 1):** "knows the basics" — can build small apps;
  TypeScript and server-side Node are the shaky parts.
- **Time budget: ~40 h/week for 8 weeks (~320 h).** Raised from 10–20 h in session 2.
  Nearly all of the original "deferred" list is now reachable — revisit the cut.

## Corrections and standing preferences

- **Session 2 correction, important.** I proposed a pnpm monorepo of packages
  (`apps/*`, `packages/*`). The user rejected it. What they want is **one website
  project folder** with the React client, the Express server and the database
  intertwined — no packages, no workspaces, no nested manifests, no `workspace:*`.
  **Never reintroduce a monorepo framing.**
- **The architecture is given, not up for debate.** React + TypeScript front end;
  Node + Express + TypeScript back end organised as **MVC**; **MySQL** as the primary
  database. Teach how to build it well and how to defend it. Do not propose
  alternatives unless explicitly asked.
- **Three learning tracks in parallel with the product:** front-end architecture,
  back-end architecture, and **system design**. Weave system design into each build
  rather than running it as a separate theory track.
- Build-as-you-learn: lessons must end in committed, running code.

## Open questions

- Deployment target (Fly.io / Railway / VPS). Needed before week 8.
- Is a job-search / interview loop already running? If yes, interleave interview prep from week 4.
- Auth style: httpOnly cookie session vs JWT. Decide in the auth lesson.
- MySQL via Docker container or local install? Affects the MySQL lesson setup.
- Does the admin dashboard get built in these 8 weeks? Currently deferred.

## Facts about this machine (checked in session 3)

- Docker 29.7.2 installed, daemon running; Docker Compose v5.3.1. MySQL will run containerised (`mysql:8.0`), not as a system install.
- Homebrew 7.0.6 present. The `mysql` CLI on PATH is actually **MariaDB 11.7.2**, so do not assume a local MySQL server exists.
- Port 3306 is free.

## Known defects to chase

- Both were found in lesson 02 and are fixed in lesson 03, but **were still open at session 4** — confirm closed before lesson 04:
  1. `errorHandler.ts` returns `error.message` to the client unconditionally, including database connection failures.
  2. `person.model.ts` still had an unscoped `findAll()`; replaced by `findByFamily(familyId: string)`.

## Housekeeping worth raising

- **87 files of agent skills are committed** under `.agents/`, `.claude/` and `.windsurf/` (from `npx prisma skills sync`). 120 tracked files total, so ~73% of the repo is tooling, not application code. Harmless, but it buries the real source in diffs and reviews. Suggest gitignoring them and re-syncing locally.
- **`typescript: ^7.0.2`** resolves to 7.0.2 — TypeScript 7 is the native-port line, materially faster than 5.x. Works fine; worth a note in the portfolio.

## Working decisions

- **Prisma pinned to 7.10.0** across `prisma`, `@prisma/client` and `@prisma/adapter-mariadb`. `prisma@latest` resolves to `8.0.0-rc.19`, a release candidate that changes schema authoring and migration planning. Revisit only as a deliberate, planned migration.
- Prisma 7 talks to MySQL through a driver adapter (`@prisma/adapter-mariadb`), not a built-in engine. Do not use pre-7 tutorial code in lessons.
- Project lives at `./kinlink/`, git-ignored by this teaching workspace so the two git histories stay separate.
- `shared/contracts/` holds types both sides compile against. It is **not** a package — just a folder both tsconfigs include.
- The pixel-logo generator was written in session 1 against the monorepo shape; it is deferred to a small week-1/2 exercise and now targets `client/src/brand/`.
- The user had already run the superseded monorepo scaffold into `./kinlink/` (empty `packages/brand`, one lockfile, zero commits, no source). It was removed in session 2. The logo raster was preserved and re-homed to `kinlink/client/src/brand/source/kinlink-logo.png` — the path the brand reference specifies.
- Lessons use classic (non-module) `<script>` tags so they open correctly from `file://`.
