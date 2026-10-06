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

## Session 5 — corrections and resequencing

- **The lesson sequence changed.** The client lesson (React + TanStack Query + Zustand)
  moved from 05 to **06**. Lesson 05 is now *finish the auth contract*: the typecheck is
  red and `requireAuth` answers 500. A client cannot be built on either. Rationale in
  `learning-records/0004-auth-contract-and-typing-debt.md`.
- **Zustand: do not add it yet.** Auth status is *server state* — the session lives on
  the server, so the truth must be fetched (`/api/auth/whoami`), not mirrored into a
  client store. TanStack Query is the right tool for lesson 06. A client-state library
  earns its place when there is genuinely client-owned state (tree layout, selection,
  optimistic edits) — not before. Lesson 06 should argue this explicitly rather than
  installing libraries to satisfy a plan written three sessions ago.
- **Testing: not yet.** The only automation introduced in lesson 05 is a
  dependency-free guard check (tsx script, ephemeral port, no database, no framework),
  because `requireAuth` rejects before the model. The real testing pyramid is week 7 per
  the roadmap; resist smuggling Vitest in early.
- **`next(err)` destroys status codes.** Anything that is not a server fault must answer
  with its own status (401/403/409) rather than being funnelled into the 500 handler.
- **New reference: `reference/0005-auth-mechanics.html`** — work factor, timing-safe
  comparison, SameSite/CSRF limits, Redis session stores, fail-closed routing, and the
  corrections to lesson 04.
- **Read the typecheck before writing a lesson about the layer above it.** Session 5
  discovered the failure by running `npm run typecheck`; nothing in the session-4 record
  mentioned it. Make running the lesson's Verify commands the first act of every
  session, not the last.

## Session 6 — authorisation, and what the sequence is now

- **The lesson-03 rule got sharpened.** "The tenant id never comes from the client" was
  right for one-family-per-user and is now misleading. The durable version: **a client may
  name a resource; the server must prove access to it.** Reference 04's escape clause
  ("unless the caller genuinely belongs to more than one tenant, in which case the
  membership check must be explicit") is now live. Teach the pair together, or the user
  will conclude the earlier rule was simply wrong and over-correct.
- **`404` for "not a member", `403` only inside the boundary.** Recorded as a deliberate
  trade-off, not a law — an authenticated caller arguably deserves 403, and the lesson
  invites that argument. Either way the property holds: the two "you cannot have this"
  cases must be indistinguishable to a stranger.
- **The session holds identity only.** `session.familyId` removed, `familyId` dropped from
  `AuthResponse`. Rule: a value belongs in the session only if it is stable for the
  session's life. Authorisation context changes with the resource, so it is per-request.
- **Lesson sequence: 07 roles (`requireRole`, rank map not string equality, the last-owner
  invariant, 403 in anger) → 08 the client.** People CRUD and relationships still follow,
  now properly unblocked because people are reachable only through an authorised family.
- **Route-table derivation: answered, deliberately deferred.** It cannot be done by walking
  Express 5 internals (measured: `layer.path` is `undefined` for routes *and* mounts; the
  path lives in an opaque `matchers` structure). The answer is "make the route table the
  source of truth". Deferred because with three routes it buys *coverage*, not safety, and
  the hand-written list already fails loudly (404 ≠ 401). Revisit near ~15 routes, or fold
  into the week-7 testing lesson.
- **Register no longer joins a hardcoded family.** It creates the user's own family with
  them as owner, in one transaction. Next: invitations become the only legitimate way into
  someone else's family — without a token, "register by slug" is a join-any-family hole.
- **The `mergeParams` trap, documented with a measurement.** Mount-path params reach
  middleware on the mount but not a child router unless
  `Router({ mergeParams: true })`. The better answer remains "read `req.family`, not the
  raw slug".

## Session 7 — roles, and what the handoff attempt taught us

- **Lesson 06 landed without the handoff.** The Paseo agent errored and produced nothing,
  but `main` contains `fb9f865` and `8fffeb5` — implemented by the user, faithfully:
  identical 404 bodies for both membership failures, the single
  `findMembershipWithFamily`, `userId`-only session, `AuthResponse` without `familyId`.
  `typecheck` exits 0 and `check:guards` passes. **The user reads the lessons and builds
  them; the handoff added nothing and cost a session's worth of detours.**
- **Paseo handoff is unreliable on this machine — never reach for it unprompted.** MCP
  tools were not connected; the daemon and Docker were both stopped; and **none of the 16
  configured profiles carries a `notes` field**, so the skill's profile-selection rule
  cannot select one at all. `codex` is unusable in both routes (`403` from the
  `command-code` proxy; native `gpt-6.*`/`gpt-5.6-*` models rejected because the Codex CLI
  is on a ChatGPT account). Only `pi` works, and the agent launched there errored anyway.
  If asked again: launch it, but verify what actually landed before assuming anything did.
- **Outstanding cleanup from that attempt** (offer, do not act unprompted): a stale
  worktree at `~/.paseo/worktrees/1aizkxve/handoff-lesson-06` on branch
  `handoff/lesson-06` still at `a6cede7`, and three errored Paseo agents (`12db0ba`,
  `3daaa0a`, `6955280`). Docker Desktop and the Paseo daemon are running because this
  session started them — do not stop them unasked.
- **The four answers are now `reference/0007-membership-lifecycle.html`.** The two that
  will keep returning: **404-vs-403 is a documented trade-off, not a law**, and the
  collapse is *client-facing* — the server must still distinguish the branches in its
  logs.
- **Lesson 07 adds the first codebase-level invariant** (a family keeps ≥1 owner) in the
  service behind `SELECT … FOR UPDATE`, with `npm run check:ownership` as the runnable
  proof — deliberately a concurrency check, not a unit test, because a mocked race never
  happens. The `Db` type was extracted exactly where the lesson-06 comment predicted.
- **Second empirical verification of a Prisma assumption:** the
  `Omit<PrismaClient, …>` transaction-handle shape plus `tx.$queryRaw` were compiled in a
  throwaway probe (`TSC_EXIT=0`) before publishing lesson 07. Keep doing this for Prisma
  and TypeScript claims.

## Session 8 — the five answers, one build, and a probe that caught itself

- **Lesson 0008 = "transfer ownership, and fire the race on demand."** The five
  follow-up questions from lesson 07 are answered as one build (`transferOwnership`,
  one endpoint, one transaction), one skill (a deterministic race check), and three
  design defenses — compressed into **Reference 08** (`0008-races-locks-and-refusals.html`).
  **Invitations resequence to lesson 0009** — the transfer counter-case (propose/accept)
  is exactly the protocol invitations formalise, so the motive got sharper by waiting.
- **Verify-first rule followed:** baseline was green before authoring
  (`typecheck` 0, `check:guards` ok, `check:ownership` 1 refusal / 1 owner left).
- **The session's headline measurement** (race probe, deleted after): moving
  `lockFamily` to *after* the count — with the lock still in the file — brings the
  zero-owners bug back **3/3 runs** (`t2 counted=2`), while lock-first holds **3/3**
  (`t2 counted=1`). So the lesson teaches: **the lock protects the read, not the
  write**; the pattern is lock → read → decide → write and the *ordering* is the
  protection. This also resolves the manual's "don't mix locking and nonlocking
  reads" warning for our shape — measured, not argued.
- **Hope vs forced, measured:** `Promise.all` caught the bug 20/20 on this machine —
  and the Arkency post reports the identical technique catching *nothing* on theirs.
  Quote both numbers side by side; the spread is the argument. (Taste: show the
  counter-case proactively.)
- **The SERIALIZABLE deadlock claim is labelled a prediction, not a measurement**
  (setting per-transaction isolation through the Prisma adapter was fiddly). It ships
  in Reference 08 §2 as a predict-then-look exercise. Do not upgrade it to fact
  without a probe run.
- **Meta-lesson worth keeping: the instrument can be wrong.** The probe's first run
  reported "invariant broke 20/20 *with* the lock", contradicting the green
  `check:ownership`. Cause: the probe returned a count `Promise` whose `finally`
  deleted the fixture first — every measurement read a deleted family and saw 0.
  When two tools disagree, suspect the newer one first. (This also nearly published a
  spectacular false finding.)
- **Third empirical verification of code shapes before publishing** (house rule):
  a compile probe with the lesson's verbatim code against the generated Prisma
  client — caught one real error (`findOtherMembers` called via the module before it
  existed there), and verified the Prisma `include` mapping, `Extract<Role, …>`, the
  gate's definite assignment and `Promise.race` typing. Probe deleted; tree clean.
- **`keepRole` default (`member`) is flagged in the lesson as a product question** —
  the user decides with a real family, not us.

## Open questions

- Deployment target (Fly.io / Railway / VPS). Needed before week 8.
- Is a job-search / interview loop already running? If yes, interleave interview prep from week 4.
- ~~Auth style: httpOnly cookie session vs JWT~~ — **decided (session 4):
  httpOnly session cookie**, `sameSite: "lax"`, bcrypt at cost 12. The JWT trade-off
  (no lookup versus hard revocation) is recorded in Reference 05 §4; revisit only if
  KinLink needs cross-origin auth or multiple instances without a shared store.
- ~~MySQL via Docker container or local install?~~ — **decided (sessions 2–3):
  containerised `mysql:8.0`**, not a system install.
- Does the admin dashboard get built in these 8 weeks? Currently deferred.

## Facts about this machine (checked in session 3)

- Docker 29.7.2 installed, daemon running; Docker Compose v5.3.1. MySQL will run containerised (`mysql:8.0`), not as a system install.
- Homebrew 7.0.6 present. The `mysql` CLI on PATH is actually **MariaDB 11.7.2**, so do not assume a local MySQL server exists.
- Port 3306 is free.

## Known defects to chase

- **Closed, verified by reading the files at session 5:**
  1. `errorHandler.ts` gates `error.message` behind `NODE_ENV` and answers
     `Internal server error` in production.
  2. `person.model.ts` has `findByFamily(familyId: string)` with a required argument;
     no unscoped person query remains.
- **Closed at session 5, verified by running the lesson's Verify commands:**
  3. `npm run typecheck` was failing with **10 errors** across `auth.controller.ts`,
     `middlewares/auth.ts` and `people.routes.ts` — one root cause, nothing declared what
     the auth layer attaches to a request. Fixed by
     `server/src/types/express.d.ts` (two declaration merges: `SessionData` through the
     module, `Request` through the global `Express` namespace). **`typecheck` now exits 0.**
  4. `requireAuth` answered **500** via `req.next(new Error(...))`; it now answers **401**
     with `{ message: "Authentication required" }`, and `authContext(req)` throws
     `Route is missing requireAuth` when a route is mounted without the guard. Routing is
     default-deny: public routes above `apiRouter.use(requireAuth)`, protected below.
     **`npm run check:guards` prints `ok /api/people -> 401`** and needs no database,
     because the guard rejects before the model.
     → **Committed as `a6cede7`** (after the `.d.ts` move; see the lesson-05 fix below,
     which was still uncommitted at the start of session 6).
- **New small defect (lesson 06 spot): `Person.updatedAt` is `@default(now())`, not
  `@updatedAt`.** The field is set at creation and never changes — a column called
  "updated" that does not update. One word, but it deserves its own migration
  (`--name fix_person_updated_at`); a migration should do one thing. **Still open at
  session 7** — the schema was touched again (`family_members`) and it was correctly *not*
  folded in, but it is now the oldest known defect.
- **First-attempt mistake worth remembering (it cost a round trip):** the declaration file
  was created at `server/types/express.d.ts` — one level above `server/src` — so it fell
  outside `tsconfig.json`'s `include: ["server/src", "shared"]`. TypeScript silently
  ignored it: no warning, no error, and all ten errors persisted, which reads exactly like
  "the augmentation does not work". **An ambient declaration outside the program fails by
  doing nothing.** Verify one by *deleting* it and watching the errors return — adding it
  and seeing nothing change proves nothing. Now taught as a callout and a break-it
  exercise in lesson 05.
- **Doc defects, corrected at session 5:** lesson 04 claimed `bcrypt.compare()` is
  constant-time (the bcrypt README says the comparison may exit early), that modern
  bcrypt bundles its own types (it does not — `@types/bcrypt` is required), and that
  `SameSite=Lax` "prevents CSRF for GET requests" (inverted — Lax *allows* top-level
  GETs and blocks cross-site unsafe methods). Corrections in Reference 05 §6.

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
