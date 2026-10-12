# Session 12 — the client learns who it is, and three answers that outlive it

## What happened

Lesson 13 is written: **the client's identity flow**, plus the server read that
makes it possible. The four questions from lesson 12's prompt split cleanly into
two knowledge answers and two build answers, and each half landed where it
belongs:

- **Reference 10 (`0010-client-identity.html`)** — the session state machine,
  why `GET /api/families` rides `requireAuth` alone, and the `whoami` defect with
  its commit placement (question 3, question 4).
- **Reference 11 (`0011-live-schema-and-growing-lists.html`)** — expand /
  backfill / contract, and when a list earns pagination (question 1, question 2).
- **Lesson 13** — the build: fix `whoami`, add `GET /api/families` with
  `check:families`, rewrite the client's `lib/api.ts`, add `useSession`,
  `LoginScreen`, `InvitesPage`, and wire `App.tsx`.

## Key learnings

- **The break-it is the sharpest measurement in the project so far.** Remove
  `where: { userId }` from `findAllForUser` and
  `npm run typecheck` stays **green** — the parameter is merely unused and no
  `noUnusedParameters` rule exists to notice — while `check:families` returns
  **7** families: every membership row in the database, across users. This is
  the session-11 blind spot in a second place, and the strongest argument yet
  that *typecheck proves the code parses, running it proves it works*. Both
  halves of every Verify block stay.
- **The `whoami` fix is a layering fix, and that is why it is one line.**
  `userModel.findById` already existed, selecting exactly `{ id, email }`, and
  `grep -rn "findById" server/src` showed it was used by **nothing** — it was
  written for `whoami` and the controller went around it to hand-write a
  `select`. Calling it removes the class of bug, not the instance: one
  definition of "a user's public fields", and no hand-written `select` left to
  drift. The lesson's framing ("the fix is not 'delete the key'") is the part
  worth keeping.
- **An unmounted route fails in the wrong content type.** Baseline
  `GET /api/families` answers `404` whose body is **HTML** (`Cannot GET
  /api/families`), because it falls through to Express's built-in handler. No
  route in this API ever wrote that, which is exactly why the API contract ("errors
  are `{"message": …}`") is broken by the fall-through and not by a route.
  Measured at baseline, then measured fixed: with the route mounted and the guard
  running, no cookie answers **`401` JSON**.
- **A route that names nothing has nothing to prove.** `GET /api/families` is
  the first protected route to use `authContext(req)` without `familyContext`,
  and the first `/families/…` route *not* to carry `loadFamily`. The security
  property is unchanged and lives in the `where` clause. This is the cleanest
  illustration yet of the lesson-06 rule — the client names a resource; the
  server proves access — and of when the prover is not needed.
- **Granted role is deliberately absent from the session and present on the
  read.** `FamilyResource` carries `role` because the client must decide what to
  offer. It is fetched per request, not remembered — the session-6 rule ("a value
  belongs in the session only if it is stable for the session's life") holding
  up under a new feature.
- **TanStack Query is deferred on purpose, and recorded as a decision.** The
  notes have called it the right tool since session 5. Lesson 13 introduces
  identity *and* a new read *and* a new screen; adding a data-fetching library at
  the same time would put three new concepts in one working memory. The
  hand-rolled `useSession` is ~40 lines and teaches the state machine a library
  would hide. Raised in the lesson's prompt as the next question, not smuggled.
- **`PersonResource` contradicts today's own argument.** The new view drops the
  family `id` from `FamilyResource` on the grounds that "an id the client never
  sees is an id it cannot hand back to a route that might trust it" — while
  `person.view.ts` still ships `familyId`. Found while writing the lesson, not
  fixed: it is pre-existing and out of scope. Raised as a lesson-14 question.

## Evidence

- **Baseline (against `main`, before authoring):** `npm run typecheck` exit 0;
  `check:invites` → `rows returned: 2`, `emails: [null,"old@probe.invalid"]`;
  `GET /api/auth/whoami` → **500** with
  `Unknown field 'familyId' for select statement on model 'User'`;
  `GET /api/families` → **404 HTML**.
- **The lesson's verbatim code, probed in the real tree:** `npm run typecheck`
  exit **0**; `npm run check:families` → `families returned: 2`,
  `roles: ["owner","member"]`, `my-families scoping, ordering and view mapping
  all held`; `GET /api/auth/whoami` → **200**; `GET /api/families` with no cookie
  → **401** `{"message":"Authentication required"}`; with a cookie → **200**
  `{"data":[{"slug":"probe13b-…-aca54c","name":"…'s family","role":"owner"}]}`;
  `npm run build:client` → **23 modules, built in 62ms**.
- **Break-it, measured:** `where: { userId }` removed → `typecheck` exit **0**
  (silent) and `check:families` → `families returned: 7`,
  `roles: ["owner","member","owner","owner","owner","member","owner"]`,
  `Error: EXPECTED 2 families, got 7`.
- **Probe hygiene:** nine files backed up with checksums and restored —
  `shasum -c` reported **9 OK**, `git status --short` was **byte-identical** to
  the baseline (21 entries), both probe scripts deleted, no probe symbols left in
  `server/src`, `client/src` or `shared`.
- **Docs validated:** tag-balance and quiz-JSON check across the lesson and both
  new references — all `OK`.
- **Sources fetched, not remembered:** MySQL 8.0 Online DDL Operations (the
  column-operations table: `INSTANT` for adding, "Rebuilds Table: Yes" plus
  "fails if the column contains NULL values" for `NOT NULL`); Prisma ORM v7
  expand-and-contract guide (expand → typed backfill script → contract); Markus
  Winand's `#NoOffset` (the SQL standard's own wording on `offset`, and the seek
  recipe).

## Open / carried forward

- **Lesson 14 candidates.** The people screen is the honest next step:
  `PersonResource` is defined, `/api/families/:slug/people` already answers, and
  the client now has a family slug and an auth state to hang it on. Relationships
  and the Kinship Engine stay behind it, per the roadmap.
- **`InviteDialog.tsx` is dead *and* broken.** It is imported by nothing, and it
  posts to `/api/invitations` with `{email, role}` — a route that does not exist
  (`acceptInvitationRouter` only has `POST /:token/accept`), so it would answer
  404. Lesson 13 does not touch it, which is why its Verify step mints by curl.
  Either delete it or rebuild it as the lesson-14 mint UI; do not leave it as a
  third thing.
- **A session dying mid-use is unhandled.** If the cookie expires while a tab is
  open, the next request answers `401` and each screen shows its own "Failed to
  load". The fix is a single 401 interceptor in the fetch helper that flips the
  session to `anonymous`. Raised in the lesson's prompt.
- **`GET /api/auth/whoami` is still 500 on `main`** until the user runs lesson
  13 step 2. It is a live, committed defect and lesson 13 exists to repair it.
- **Admins and invitations is still undecided.** The client's (dead)
  `InviteDialog` offers the dialog to admins; both server routes require
  `owner`. Decide once, change both together.
- **Revoke / resend are still unbuilt**, and resend is the interesting one: the
  raw token was never stored, so "resend" must mint a new credential and revoke
  the old one in one transaction. It cannot mean "show me the link again".
- **`Person.updatedAt` is still `@default(now())`** — the oldest known defect,
  now carried across five sessions. Its own migration, one word.
