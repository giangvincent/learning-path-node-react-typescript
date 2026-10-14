# NOTES.md

Working notes and preferences. Not a lesson — a scratchpad for me (the teacher).

**Forward plan:** the lesson-series board for 17–20 (breakdowns, open questions,
sources still to find) lives in [PLAN.md](./PLAN.md). This file is the record;
that one is the plan.

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
- **Every lesson ends with a *Log it* block** (rule added after every lesson so far
  shipped without one).
  Minutes in the editor, one line of "what fought back", the commit hash — aimed at this
  week's block in `PROGRESS.md`. Every lesson before this asked for everything except the
  log, so the log was never filled: the ritual lived in a file the user never opens
  mid-session. Also recorded in `ROADMAP.md` under "Lesson size, and the session cadence".

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

## Session 10 (carry-forward) — three complaints, one house rule

- **Lesson 10 wrote code that did not run.** Concretely: `invitation.controller.ts` failed
  `npm run typecheck` with two errors (bad slug type, `orderBy.createdAt` on a column that does
  not exist on `Invitation`); `invitation.routes.ts` was stub-bodied
  (`// ... createInvitation(...)`) and never mounted in `routes/index.ts`; `AcceptPage.tsx`
  imported `useParams` from `react-router-dom` in a project that had no such package in the
  manifest. The user's three complaints map to these three findings one-for-one.
- **The lesson's Verify commands were never run against the lesson's code.** That is the
  entire problem in one sentence. Lesson 05 added the verify-first rule (capture the green
  baseline, prove the lesson's claim against it). Lesson 10 skipped it — the lesson's
  "Build it" section describes a finished client, but the runner would have shown typecheck
  red and `npm ls react-router-dom` empty.
- **House rule (effective lesson 11 onward):** every lesson opens with a Verify-against-the-
  baseline paragraph at the top of "Build it" — the exact commands that prove the lesson's
  claim, run against `main`, expected output listed in the lesson. The lesson is not
  considered done until those commands exit 0 with the lesson's verbatim code shape.
- **Three corollaries, derived from the lesson-10 errors and now part of the house rule:**
  1. **Lesson code that doesn't compile is a bug, not a draft.** If a lesson text contains
     verbatim code and `npm run typecheck` would error on it, the lesson is wrong, not the
     runner. Lesson 11 deletes `listInvitations` entirely; the failure mode "half-mock the
     controller and leave the errors live" is no longer acceptable.
  2. **If a lesson introduces a new module, the lesson says so explicitly.** Name the
     package, show the install command, register the route (or import) the new code depends
     on, and add a Verify step that asserts the symbol resolves. Lesson 11 installs
     `react-router-dom@^6.28.0`, wraps `BrowserRouter` at `main.tsx`, registers
     `/invite/:token`, and Verify lists `npm ls react-router-dom` alongside typecheck.
  3. **Stubs are not step bodies.** A handler whose body is a comment is a stub masquerading
     as a step. Either the body is implemented and is the lesson's working code, or the
     route is removed. `// ... createInvitation(...)` is gone from the codebase; the lesson
     rewrites the file with full bodies.
- **One split, one reason:** the create route mounts under `/families/:slug/invitations`
  with `loadFamily` (slug names the family, owner-role gate rides on `loadFamily`'s
  membership proof); the accept route mounts directly under `/api/invitations` outside
  `loadFamily` — the invitee is by definition not yet a member. Lesson 10 tried to express
  this with `Router({ mergeParams: true })` and a stub; the right answer is two routers,
  two mount points, full bodies.
- **Pending-list question carried forward to lesson 12:** shareable vs targeted invites
  display ("someone" vs email). The three lesson-10 questions are answered in lesson 11's
  code (no "already a member" page, no redirect to family, no auto-refresh on expired link
  — page is "this link doesn't work"). The third design question — display choice for
  shareable links — is the lesson-12 build.

## Session 11 — the mint hardening, the list, and what typecheck misses

- **The user confirmed both open decisions.** (1) Delete `listInvitations` rather than patch it —
  done in lesson 11. (2) `createInvitation` must re-check inside a transaction, "we don't want
  duplicate invitation to be created". Both landed in lesson 11 as a new step 3.
- **The mint hardening, measured.** ⚠️ **CORRECTED at session 13 — this does not describe the
  code.** Verified by reading `services/invitation.service.ts` and grepping: `createInvitation`
  has **no** transaction, **no** `lockFamily`, **no** duplicate-email refusal, and `createdBy`
  comes from the route's `userId`; `grep -rn "mint" package.json server/src/scripts` returns
  nothing, so **`check:mint` does not exist**. The text below is kept only as a record of what
  was believed — the measurements were never reproduced against this tree:
  - Claimed: `createInvitation` runs one transaction behind `lockFamily`, re-reads the inviter's
    membership inside the lock (the `transferOwnership` shape), and refuses a second pending
    invite for the same email; `createdBy` comes from `inviter.userId`, read inside the lock.
  - Claimed: with the lock, 1 credential, 1 row, demoted inviter refused; `check:mint` exit 0.
  - Claimed: `lockFamily` commented out, **0/5 runs pass**, each writing `2 succeeded, 2 row(s)
    written`; the lock is the whole mechanism.
  → **Debt, to be paid in lesson 15.** "One pending invite per email" is currently an
  *intention*, not an invariant: two concurrent mints for the same address both succeed.
  Reference 12 §5 carries the honest invariant table.
- **The shareable-link display question is answered, decisively:** the contract carries
  `email: string | null`; the client labels `null` **"Anyone with the link"**. Not "someone" —
  "someone" implies a chosen person whose identity is withheld, while a shareable link has no
  addressee. The owner must tell the two apart to revoke the right invite.
- **Lesson 12 = the pending-invites list** (the server slice, end to end through every layer).
  Adds `createdAt` to `Invitation` via a one-thing migration, `invitation.model.ts`,
  `listPendingInvitations`, `invitation.view.ts`, `shared/contracts/invitation.ts`,
  `invitation.controller.ts`, and `GET /api/families/:slug/invitations` (owner-only).
  `check:invites` is the runnable proof. (`check:mint`, claimed from lesson 11, does **not**
  exist in the tree — see the correction above.)
- **The cheapest-fix trade-off, recorded because it will be asked in an interview:** ordering by
  `expiresAt` would have avoided the migration entirely (fixed 7-day TTL makes the orders
  identical). Rejected: it silently depends on the TTL never varying, and the list still cannot
  say when an invite was sent. Adding the missing column is one word and removes the dependence.
- **NEW, and important — the typecheck blind spot (measured, reproducible).** A Prisma `select`
  with an unknown field errors **only when `select` is alone**:
  - `prisma.user.findUnique({ select: { id: true, familyId: true } })` →
    `error TS2353: 'familyId' does not exist in type 'UserSelect'`.
  - the **same** `select` with a `where` beside it → **no error**. Runtime:
    `Unknown field 'familyId' for select statement on model 'User'`.
  So the excess-property check is lost as soon as the argument object has a second key. This is
  the sharpest possible argument for the verify-first rule: **typecheck proves the code parses,
  running it proves it works.** Both halves of every Verify block stay.
- **NEW DEFECT (live, committed): `GET /api/auth/whoami` answers 500.**
  `auth.controller.ts:121` selects `{ id, email, familyId }` on `User`, which has had no
  `familyId` since the session-6 `family_members` change. Typecheck is green because of the
  blind spot above; at runtime Prisma throws. One-line fix, deliberately **not** bundled into a
  lesson: `select: { id: true, email: true }` (or drop the `familyId` key). Own commit.
  The user was told; expects an offer to fix, not a silent edit.
- **The client still has no identity flow.** No login screen, no `whoami` call, and
  `lib/api.ts` still fetches `/api/people`, which is not a mounted route (family reads live at
  `/api/families/:slug/people`). The client's family features are testable only with a
  hand-made cookie, and the accept page inherits the same limit. Candidate lesson: client auth
  + "which family am I in" — it is the prerequisite for lesson 13's list UI.
- **`requireRole("owner")` vs lesson 10's admin-or-owner dialog.** The client shows "send
  invite" to admins; the server refuses them. Flagged in lesson 12 as a deliberate product
  decision to make once ("may admins manage invitations?") and then apply to both routes in the
  same commit. Lesson 13 tightens the client to `owner` until it is decided.

- **Follow-up from the user running lesson 12: two lesson defects, both now fixed in the
  lesson text.** (1) The curl block used a **fixed email**
  (`owner@probe.invalid`), so the second run answered `409 Email already registered`, wrote
  **no cookie** to the jar, and every later request answered `401 Authentication required`.
  Reproduced exactly. The block now registers a per-run unique email, keeps `-i`, and asserts
  `201` + `Set-Cookie` before continuing. (2) The lesson said "read the slug from the database"
  **without giving a command**. Then the real trap: **every register creates a brand-new
  family**, so a slug copied from an earlier run belongs to a different user and answers
  `404 Family not found`. Verified both ways against the running dev server: the user's own
  cookie gave `200` on `owner-1791449541-aa6f74` and `404` on the older `owner-f76dc7`.
  The lesson now gives the lookup (`npm run db:studio`), the deterministic slug rule
  (local part slugified + 6 random chars, from `user.model.ts`), and how to tell `404
  Family not found` (bad slug) from `401` (dead cookie) by body, not just status.
- **NEW GAP, and it is lesson 13's opener: nothing tells a caller which families they are in.**
  `register` returns `{ userId, email }` and deliberately not the slug; there is no
  `GET /api/families`. So a slug is discoverable only via the database or as a registration
  side effect — neither of which the browser client can do. `GET /api/families` returning the
  caller's families with `{ slug, name, role }` is the missing read, and the list UI cannot
  honestly render "your pending invites" without it.
- **`tsx watch` + `MemoryStore` is a real papercut, and now a taught one.** Verified: a cookie
  that returned `404` (i.e. authenticated) returned `401` after restarting the API process.
  Every save while building a lesson logs you out. Lesson 12 carries it as a callout, tied to
  lesson 05's Redis recommendation — the production note finally has a concrete dev symptom.

## Session 12 — the client's identity, and four answers

- **Lesson 13 = the client's identity flow.** Fix `whoami` (its own commit), add
  `GET /api/families` + `check:families`, rewrite `lib/api.ts` around one `request<T>`
  helper that throws `ApiError(status)`, add `useSession` (four states), `LoginScreen`,
  `InvitesPage`, and wire `App.tsx`. Reference 10 = client identity; Reference 11 = live
  schema and growing lists.
- **The four questions from lesson 12's prompt are answered** — Q1 backfill and Q2
  pagination as Reference 11, Q3 the `whoami` fix and its commit placement and Q4 the
  no-session client as Reference 10 + the build. All four are also restated in the
  lesson's "Defend it", so the lesson stands alone.
- **The break-it is the sharpest measurement in the project.** Remove `where: { userId }`
  from `findAllForUser`: `typecheck` exit **0** (the parameter is merely unused; there is
  no `noUnusedParameters`) while `check:families` returns **7** families — every
  membership row in the database, across users. The session-11 blind spot, second
  instance, and the strongest argument yet for the runtime half of every Verify block.
- **`findById` was dead code**, and that is the whole reason the fix is one line.
  `grep -rn "findById" server/src` → only its definition. It was written for `whoami` and
  the controller hand-wrote its own `select` instead. Calling it removes the class of bug
  (one definition of a user's public fields), not just the instance.
- **An unmounted route fails in the wrong content type — measured at baseline.**
  `GET /api/families` answered `404` with an **HTML** body (`Cannot GET /api/families`),
  because it fell through to Express's built-in handler; nothing in this API wrote it.
  Fixed, the same request with no cookie answers **`401` JSON**. Lesson 13 teaches the
  pair.
- **`GET /api/families` rides `requireAuth` alone** — no `loadFamily`, because there is no
  `:slug` to resolve; it is the first protected route to use `authContext` without
  `familyContext`. The security property is unchanged and lives in `where: { userId }`.
- **TanStack Query deferred on purpose, recorded as a decision.** The notes have called it
  the right tool since session 5, but lesson 13 introduces identity + a new read + a new
  screen; a library now would be a fourth new thing at once. The hand-rolled hook is ~40
  lines and shows the state machine a library hides. Raised as lesson 14's first question.
- **New finding while writing the lesson, not fixed: `PersonResource` still ships
  `familyId`.** Today's `FamilyResource` drops the family `id` on the argument that a
  client should never hold an id it cannot safely hand back; `person.view.ts` contradicts
  it. Out of scope here; raised in the lesson's prompt.
- **`InviteDialog.tsx` is dead *and* broken** (found while checking the lesson's Verify
  step): imported by nothing, and it posts to `/api/invitations` — a route with no `POST /`
  handler, so 404. Lesson 13 does not touch it; lesson 14 must either delete it or rebuild
  it as the mint UI.
- **Probe hygiene, and the house rule held.** Nine files backed up with checksums; the
  lesson's verbatim code compiled (`typecheck` exit 0) and ran
  (`check:families` → 2 families, `roles: ["owner","member"]`; `whoami` → 200;
  `/api/families` → 401 JSON unauthenticated and 200 with `{slug,name,role}` with a
  cookie; `build:client` → 23 modules in 62 ms). `shasum -c` reported **9 OK**,
  `git status --short` came back **byte-identical**, both probe scripts deleted.
- **Sources fetched, not remembered:** MySQL 8.0 Online DDL Operations (column table:
  `INSTANT` to add, "Rebuilds Table: Yes" + "fails if the column contains NULL values" to
  tighten), Prisma ORM v7 expand-and-contract guide, Markus Winand's `#NoOffset`.

## Session 13 — the dead session, the map, and a proof the notes claimed

- **Lesson 14 = one place to notice a dead session.** `client/src/lib/session.ts` (a
  twenty-line notifier), `request()` announcing on a `401` except when the caller says it is a
  sign-in (`expectsSession: false` on `login`/`register`), `useSession` subscribing, and the
  `PersonResource.familyId` deletion. Plus **`npm run check:session`** — the first client-side
  check, which stubs `fetch` and needs no server, no port and no database.
- **Reference 12 = the map of KinLink**, written for the user's explicit fear ("one day I will
  forget everything"): every folder, file, export, the request path, a "which folder do I
  touch?" table, the invariants **with their proofs**, the five checks, and the migration
  history. It is the interview walkthrough as a document.
- **The biggest finding is a documentation defect, not a code one.** Session 11's notes
  describe a mint hardening and a `check:mint` proof. **Neither exists** (verified above).
  This is why the map lists *proofs* per invariant: an invariant with no runnable proof is a
  belief, and this project had one filed as a fact.
- **A `401` carries two facts and only the caller knows which.** `login` answers `401` for a
  wrong password (*verdict*); `/api/families` answers `401` for a dead session (*eviction*).
  Hence `expectsSession`, defaulting to `true` so a forgotten option fails safe. Glossary now
  carries the eviction/verdict pair.
- **The first client check did not compile — `error TS2591: Cannot find name 'process'`.**
  The client program is typed for the browser (`types: ["vite/client"]`, DOM lib, **no Node
  types on purpose**), so the check fails by throwing instead, and an unhandled rejection
  exits non-zero. Do not "fix" it by adding `"node"` to the client's `types`. The file also
  must live at `client/src/scripts/`, inside `include: ["src"]`, or it is not compiled at all.
- **Deleting a field is compiler-enforced in a view and was not in a Prisma select** —
  measured side by side. `familyId` back in `toPersonResource` → `error TS2353: … 'familyId'
  does not exist in type 'PersonResource'`. The session-11 blind spot was the opposite: the
  annotated return type is checked, the argument object with a sibling key is not.
- **TanStack Query is answered with a rule, not another deferral:** adopt it on the **first
  screen where a mutation must invalidate a read**. Nothing in this client mutates yet, so the
  cache would have nothing to invalidate. That screen is the people screen (lesson 16-ish).
- **Resend answered in full** (the build is lesson 15): it cannot show the link — the raw token
  was never stored and storing it would be a plaintext credential at rest — so it mints a new
  credential and revokes the old one in one transaction behind `lockFamily`, with the inviter's
  role **re-read inside the lock** (lesson 11's race shape) and the granted role re-checked
  against the rank (or resend is an escalation path). `revokedAt` gets its own column rather
  than reusing `usedAt`, because *claimed* and *revoked* are different facts; "pending" grows a
  third condition in the same one place, so `check:invites` grows a fifth row. A retry is not
  safe — the second attempt revokes the link the first one emailed.
- **Route-order question, measured:** the user mounts `GET /api/families` *after*
  `/families/:slug`, and it still resolves (`200`; `/families/<slug>/people` → `200`;
  `/families/nope/people` → `404`). `use("/families/:slug")` needs the second segment, so
  `/families` falls through to the exact route. Works — but the exact route belongs **above**
  the prefix mount for readability, and lesson 13 showed it there.
- **The map found three things reading file-by-file had not:** `AcceptPage.tsx` bypasses
  `lib/api.ts` (so the new announce does not cover it); `InviteDialog.tsx` is dead *and* broken;
  `server/generated/prisma/` is **tracked in git**.
- **Probe hygiene held:** five files backed up with checksums, the lesson's verbatim code
  compiled and ran (`typecheck` 0; `check:session` 1/0/0), both break-it cases measured
  (`got 2` announcements; `TS2353`), `shasum -c` **5/5 OK**, `git status --short`
  **byte-identical**, probe and `client/src/scripts/` removed.

## Session 15 — the people series, and a probe that paid for itself

- **Lesson 16 = People CRUD, authored as one series, 16a–16f.** 16a the write
  through every layer (`POST /families/:slug/people`, validation at the boundary,
  `check:people`); 16b the people screen on **TanStack Query** (install,
  `QueryClientProvider`, `useQuery`); 16c the add form — the **first mutation that
  invalidates a read**, which is the trigger the notes have carried for TanStack
  Query since session 5; 16d the edit **plus the `updated_at` repair** (its own
  commit, first); 16e delete (`204`, no body); 16f the practice. **Reference 13** =
  server state and the screen.
- **Verify-first was applied to a whole series, not one lesson, and it caught a
  real error.** An rsync'd copy of `kinlink/` in the scratchpad, dependencies
  installed once, the lesson's verbatim code compiled (`tsc --noEmit`, both
  programs, exit 0) **and run**: `check:people` exit 0; `build:client` 0, **70
  modules**; `@tanstack/react-query` **5.104.2**. The typecheck failed first on
  `req.params.personId` (`string | string[] | undefined` under Express 5) — the
  existing `family.controller.ts` already narrows `membershipId` the same way, so
  the lesson now copies that shape. **Written from memory, that error ships.**
- **The HTTP boundary was walked, because a route that is not mounted fails
  silently in the wrong content type** (lesson 13's finding). Probe server on
  **port 4100** — the user's own API holds 4000, never kill it. Measured:
  `201` create · `400` bad gender (`gender must be one of …`) · `200` list · `200`
  patch · `404` unknown person · `401` unauthenticated **JSON** · `204` delete ·
  `404` second delete.
- **The `updated_at` repair is designed and probed, not guessed.** `@default(now())`
  → `@updatedAt`; `prisma validate` valid; `migrate dev --create-only` planned
  exactly `ALTER TABLE people ALTER COLUMN updated_at DROP DEFAULT;` —
  metadata-only, no table rebuild. The "does dropping the default break inserts?"
  fear is answered by the `users` table, which has had `@updatedAt` with no default
  since lesson 04. **`migrate dev --create-only` is the honest probe for any schema
  change** — it writes the migration file without applying it.
- **Two design decisions the lessons argue rather than assume.** (1) A people
  write's authorisation is `loadFamily`'s membership proof; `requireRole("member")`
  would be a check that can never fail, so it is deliberately absent. (2)
  `updateMany`, not `update`, because Prisma's `update` needs a unique `where` and
  so cannot also filter on `familyId`; the returned `count` is the "not yours"
  signal.
- **New open decisions, all raised in the lessons and none implemented:** who may
  write people (default any member; delete could be admin-only); hard delete vs
  soft delete (relationships will force it); should `ApiError` carry the server's
  prose; should `useSession` migrate to TanStack Query once login/logout are
  mutations. **Zod gets a named trigger** — a third resource needing shape
  validation.
- **Probe hygiene held:** the user's `kinlink/` tree is unchanged by this session
  (its five modified files are lesson 14's, already applied and uncommitted); the
  probe server was killed, port 4100 closed, and the probe rows created by the
  smoke test were deleted from the dev database.

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
- **May admins manage invitations?** The client offers "send invite" to admins
  (lesson 10) but the server requires `owner` on both the mint and the list. Decide
  once, then change both routes in the same commit. Until then the client is tightened
  to `owner`.
- ~~Does the client get an identity flow?~~ — **answered (session 12): yes, lesson 13.**
  It has a login/register screen, a `useSession` hook with four states, and
  `GET /api/families` to learn the slug. `lib/api.ts` no longer fetches the unmounted
  `/api/people`.
- ~~Should `useSession` be replaced by TanStack Query?~~ — **answered (session 13) with a
  rule, not a deferral:** adopt it on the first screen where **a mutation must invalidate a
  read**. Nothing in this client mutates yet, so a cache would have nothing to invalidate. The
  people screen is where that changes; the migration is cheap because the transport already
  owns the envelope and the `401` rule.
- ~~What happens when a session dies mid-use?~~ — **fixed (session 13):** `lib/session.ts` is a
  notifier; `request()` announces on a `401` unless the caller says it is a sign-in; `useSession`
  subscribes. Proof: `npm run check:session`.
- **`AcceptPage.tsx` bypasses `lib/api.ts`** and calls `fetch` directly, so it is outside the
  announce and outside the envelope. Route it through a named transport function. `InviteDialog.tsx`
  also uses raw `fetch`, but is dead and targets a nonexistent mint route; delete or rebuild it
  when the mint UI arrives. The transport audit should leave `lib/api.ts` as the only live fetch.
- ~~Should `PersonResource` keep `familyId`?~~ — **removed (session 13)** from the contract and
  the view; `grep -rn familyId client/src` had already proven nothing consumed it. Now both
  resources drop the family id. Apply the same test to `InvitationResource` and any new one.
- **Invitation lifecycle is one lesson series (15a–15e, practice 15f), not one lesson.** The
  series shape is the standing pattern: builds lettered `a`, `b`, `c`… and **one** practice file
  as the last file of the series (cf. 13a–d → 13e-practice, 14a–c → 14d-practice). A practice is
  never created mid-series.
  - **15a** — restore the mint invariant (family lock, membership re-read, pending-email
    refusal) and `check:mint`.
  - **15b** — `revokedAt` as a nullable column; move *both* "pending" definitions (list and
    accept claim) together.
  - **15c** — revoke and resend (mint-new-kill-old in one transaction behind `lockFamily`).
  - **15d** — `AcceptPage` onto the transport with the 401/403/409 split.
  - **15e** — the mint UI replacing the dead `InviteDialog`; fixes the routes that skipped the
    `{ data }` envelope.
  - **15f** — the series practice.
  These are lesson plans, not shipped code. No notes may describe any of this as implemented until
  its code and runnable proof have been verified against the tree.
- **People CRUD is the next series (16a–16e, practice 16f), authored and verified (session 15).**
  16a write through every layer + `check:people`; 16b the screen on TanStack Query; 16c the mutation
  that invalidates (the trigger the notes have carried since session 5, now fired); 16d edit +
  the `updated_at` repair; 16e delete. **Verify-first was actually done this time** — the series'
  verbatim code was compiled and run in an rsync'd copy, `check:people` exit 0, `build:client` 70
  modules, and the HTTP boundary walked on port 4100 (`201/400/200/200/404/401/204/404`). It is
  authored-but-unapplied: the tree is still at lesson 14. Reference 13 is its companion.
- **Root cause of the false `check:mint` claim:** the earlier plan and intended probe were recorded
  in past tense without being reproduced against the live tree. This is a verification/process
  debt, not a typo; code notes must distinguish proposed, implemented, and actually verified.

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
- **CLOSED (session 13, committed): `GET /api/auth/whoami` answered 500.** The user ran
  lesson 13 and committed the repair **alone**, as `6f97495 "Fix GET /api/auth/whoami answering
  500"` — exactly the sequencing the lesson argued for (fix the contract before the consumer).
  The fix calls `userModel.findById(userId)`, which already selected `{ id, email }` and had
  been used by nothing. Original report kept below for the record:
  `server/src/controllers/auth.controller.ts:121` selected `{ id: true, email: true,
  familyId: true }` on `User`. `User` has had no `familyId` since the session-6
  `family_members` change, and the column is not in the database either
  (`users`: created_at, email, id, password_hash, updated_at). Prisma threw
  `Unknown field 'familyId' for select statement on model 'User'`. **Typecheck was green** —
  see the blind spot below.
- **NEW (session 13, verified by reading the code): the mint hardening and `check:mint` do not
  exist.** See the corrected session-11 entry and Reference 12 §5. Restoring both is lesson 15's
  job; until then "one pending invite per email" has no enforcement and no proof.
- **NEW (session 13, found while writing the map): `client/src/AcceptPage.tsx` is the one
  component that bypasses `lib/api.ts`** (raw `fetch`, its own `credentials: "include"`). It is
  therefore outside the session-end announce added in lesson 14.
- **NEW (session 12): `client/src/InviteDialog.tsx` is dead and broken.** Imported by
  nothing, and it posts to `/api/invitations` with `{ email, role }`. That path is mounted
  (`acceptInvitationRouter`) but has no `POST /` handler — only `/:token/accept` — so it
  answers 404. The real mint lives at `/api/families/:slug/invitations`. Either delete it
  or rebuild it as lesson 15's mint UI; do not leave it as a third thing.
- **NEW (session 11, measured): the typecheck blind spot that hid the defect above.**
  Prisma's excess-property check is lost when the argument object has more than one key:
  - `prisma.user.findUnique({ select: { id: true, familyId: true } })` →
    `error TS2353: 'familyId' does not exist in type 'UserSelect<DefaultArgs>'`
  - the same `select` **with a `where` beside it** → no error at all
  Verified by injecting a deliberate `const x: number = "s"` into `auth.controller.ts`
  (reported, so the file *is* in the program) while the same file's bad `select` stayed
  silent. Consequence for method: **every Verify block needs the runtime half, not just
  `typecheck`.** Lesson 12 carries the callout.
- **New small defect (lesson 06 spot): `Person.updatedAt` is `@default(now())`, not
  `@updatedAt`.** The field is set at creation and never changes — a column called
  "updated" that does not update. One word, but it deserves its own migration
  (`--name fix_person_updated_at`); a migration should do one thing. **Still open at
  session 7** — the schema was touched again (`family_members`) and it was correctly *not*
  folded in, but it is now the oldest known defect.
  → **Addressed by lesson 16d (session 15), not yet applied.** The repair is
  `@default(now())` → `@updatedAt` as its own commit; probed: `prisma validate` valid and
  `migrate dev --create-only` plans exactly `ALTER TABLE people ALTER COLUMN updated_at
  DROP DEFAULT;` (metadata-only). Safe because Prisma stamps `@updatedAt` client-side on
  create — the `users` table has proved that since lesson 04.
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
