# Session 13 — the dead session, the map, and a proof the notes claimed

## What happened

Two deliverables. **Lesson 14 — "One place to notice a dead session"**: the client
learns that a `401` can arrive from *any* request, so the knowledge moves into the
transport layer and every screen benefits; plus the `PersonResource.familyId`
deletion and the project's **first client-side check script**. And **Reference 12 —
"The map of KinLink"**: every folder, file, export, the request path, a
"which folder do I touch?" table, and the invariants with their proofs.

Five questions from lesson 13's prompt are answered: TanStack Query (a decision
with a trigger), the mid-use session death (the build), `PersonResource.familyId`
(the deletion), resend (a protocol), and the folder map (Reference 12).

## Key learnings

- **A `401` carries two different facts, and only the caller knows which.** `POST
  /api/auth/login` answers `401` for a wrong password — a *verdict* on the input.
  `GET /api/families` answers `401` for a dead session — an *eviction*. The
  status code is identical, so a transport that treats every `401` as an eviction
  punishes a typo by logging the user out of a session they never had. The fix is
  `expectsSession`, and the **default is `true`** so a forgotten option fails
  safe (a dead session is still noticed). The lesson names the two with the
  glossary pair *eviction / verdict*.
- **A seam covers only the traffic that uses it — measured by reading the map.**
  The announce lives in `request()`, so `client/src/AcceptPage.tsx` — the one
  component that calls `fetch` directly — is *not* covered: an expired session
  there still says "This link doesn't work." Found while writing Reference 12,
  not while writing the lesson. A property to state, not a bug to hide.
- **The first client check did not compile, and the reason is architectural.**
  It ended with the server scripts' familiar `process.exitCode = 1`.
  `npm run typecheck` → `client/src/scripts/checkSessionEnd.ts(63,3): error
  TS2591: Cannot find name 'process'`. The client program is typed for the
  browser (`types: ["vite/client"]` + DOM, **no Node types on purpose**), so the
  check fails by *throwing* instead — Node's default unhandled-rejection
  behaviour makes that a non-zero exit. The trap is adding `"node"` to the
  client's `types` to make one script compile: that hands every component Node
  APIs. Second trap, from lesson 05: the file must live at
  `client/src/scripts/`, because the client tsconfig includes `["src"]` and a
  file outside it is *silently not compiled at all*.
- **Deleting a field is compiler-enforced in a view, and was not in a Prisma
  select — measured, side by side.** `toPersonResource` has an annotated return
  type, so putting `familyId` back fails:
  `error TS2353: Object literal may only specify known properties, and 'familyId'
  does not exist in type 'PersonResource'`. The session-11 blind spot was the
  opposite: a `select` with a `where` beside it hid a dead column from the
  compiler for a month. **An annotated return type is checked; a Prisma argument
  object with a sibling key is not.**
- **The notes were wrong about the mint, and this is the session's real
  finding.** Session 11's notes describe a "mint hardening" — a transaction
  behind `lockFamily`, a re-read of the inviter inside the lock, a refusal of a
  second pending invite for the same email — with a runnable proof called
  `check:mint`. **None of it is in the tree.** `createInvitation` in
  `services/invitation.service.ts` is a plain `prisma.invitation.create` with the
  rank check and nothing else, and `grep -rn "mint" package.json
  server/src/scripts` returns nothing. So "one pending invite per email" is an
  *intention*, not an invariant: two concurrent mints for the same address both
  succeed. Reference 12 §5 now carries the honest table, and the debt has a name
  (lesson 15).
- **TanStack Query: not a deferral this time, a rule.** The trigger is **"the
  first screen where a mutation must invalidate a read"**, because a cache's
  whole value is knowing what to invalidate. Nothing in this client mutates yet —
  `whoami`, `families` and `invitations` are read-once-per-screen — so the library
  would be a store whose most valuable feature has nothing to do. That arrives
  with the people screen. The migration is cheap *because* of today's work: the
  transport already owns the envelope and the `401` rule, so swapping the data
  layer touches neither.
- **Resend cannot show the link, so it must mint and revoke in one
  transaction.** The raw token existed for one HTTP response and was never
  written down; storing it would be a plaintext credential at rest. Expressing
  "the old one is dead" is a schema decision — reusing `usedAt` conflates
  *claimed* with *revoked* and loses the fact you will want in six months, so it
  gets its own `revokedAt` column and "pending" becomes three conditions in the
  same one place (`findPendingByFamily`, so `check:invites` grows a fifth row).
  `lockFamily` + a re-read of the inviter's role inside the lock, because two
  concurrent resends otherwise leave two live credentials and an emailed link
  that is already dead — the lesson-11 race shape. And a retry is *not* safe: the
  second attempt revokes the link the first one emailed.
- **The map paid for itself immediately.** Writing it surfaced three things
  reading the code file-by-file had not: `InviteDialog.tsx` is dead *and* posts
  to a route that does not exist; `AcceptPage.tsx` bypasses the transport;
  `server/generated/prisma/` is **tracked in git** (unusual, and worth knowing
  before anyone hand-edits it). A reference document is also an audit.

## Evidence

- **Baseline:** `npm run typecheck` exit 0; `check:families` → 2 families,
  `roles: ["owner","member"]`; the bug reproduced in the browser by deleting
  `kinlink.sid` → `Failed to load: GET /api/families/<slug>/invitations -> 401`
  while the family list still rendered (two contradictory beliefs in one app).
- **The lesson's verbatim code, probed in the real tree:** `typecheck` exit
  **0**; `npm run check:session` → `announced: 1`, `announced: 0`, `announced: 0`,
  exit **0**.
- **Break 1 (no `expectsSession: false` on login):** `Error: EXPECTED exactly 1
  announcement, got 2`, exit **1**.
- **Break 2 (`familyId` back in the view):** `error TS2353 … 'familyId' does not
  exist in type 'PersonResource'`, exit **1**.
- **Route order, verified empirically:** the user mounts
  `GET /api/families` **after** `/families/:slug`, and it still resolves —
  `GET /api/families` → `200` with
  `[{"slug":"probe14-…-f4ed25","name":"…'s family","role":"owner"}]`;
  `GET /api/families/<slug>/people` → `200`;
  `GET /api/families/nope/people` → `404`. (`use("/families/:slug")` requires the
  second segment, so `/families` falls through to the exact route.)
- **Probe hygiene:** five files backed up with checksums and restored —
  `shasum -c` reported **5/5 OK**, `git status --short` **byte-identical**,
  `router` probe deleted, `client/src/scripts/` removed, baseline `typecheck`
  exit 0 afterwards.
- `grep -rn familyId client/src` → **no matches**, which is what makes deleting
  the field safe today.
- The user's own sequencing was correct: the `whoami` fix landed as its own
  commit, `6f97495`, before the feature work — exactly what lesson 13 argued.

## Open / carried forward

- **Lesson 15 = the invitation lifecycle, finished**: the mint UI (replacing the
  dead `InviteDialog.tsx`), revoke, resend with `revokedAt`, and **restoring
  `check:mint`** — including the hardening the notes claim is already there.
- **`AcceptPage.tsx` still bypasses `lib/api.ts`**, so it is outside the
  announce. Route it through a named transport function.
- **TanStack Query lands with the people screen** (the trigger is recorded in
  NOTES as a rule, not an open question).
- **`PersonResource` is now consistent with `FamilyResource`** — both drop the
  family id. Check `InvitationResource` and any future resource against the same
  rule.
- **`Person.updatedAt` is still `@default(now())`, not `@updatedAt`** — now the
  oldest known defect across six sessions, and the migration named
  `change_default_updated_at` did not fix it.
- **The map will drift.** Reference 12 ends with the instruction to correct it
  the moment a folder changes, because a stale map is worse than none.
