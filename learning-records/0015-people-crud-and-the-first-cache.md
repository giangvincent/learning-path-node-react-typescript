# Session 15 — people CRUD, and where the cache earns its keep

## What happened

The mission's week-4 work — **People CRUD** — is authored as one series,
**16a–16f**: a write through every layer (16a), the people screen on TanStack
Query (16b), the first mutation that invalidates a read (16c), the edit plus the
`updated_at` repair (16d), delete (16e), and the series practice (16f). It also
produces **Reference 13 — Server state and the screen**, the compressed version:
the write path, the wire shapes, the four verbs and their status codes, and the
rule that decides when a client caches anything at all.

The series was designed against the live tree, not against the notes, and every
line of its code was compiled and run before it was published.

## Key learnings

- **The verify-first rule finally applies to a whole series, and a round trip is
  cheap.** An isolated copy of `kinlink/` was rsync'd to a scratch directory, the
  dependencies installed once, and the lesson's verbatim code compiled
  (`tsc --noEmit`, both programs) and **run**: `check:people` prints
  `people in the family: 1`, `name: "Nguyễn Văn A"`, `living: true`, exit 0. Then
  the HTTP boundary was walked with curl against a probe server on **port 4100**
  (the user's own server holds 4000): `201` create, `400` bad gender, `200` list,
  `200` patch, `404` unknown person, `401` unauthenticated JSON, `204` delete,
  `404` second delete. **No lesson-10 repeat**: this lesson describes code and
  status codes that were actually observed.
- **Two Express-5 param lessons, one already in the codebase.** `req.params.personId`
  is typed `string | string[] | undefined` and the controller must narrow it — the
  existing `family.controller.ts` already does exactly this for `membershipId`.
  The probe caught it on the first typecheck (`TS2345`, twice), which is the whole
  argument for compiling before publishing.
- **`updateMany`, not `update`.** A Prisma `update` demands a *unique* `where`, so
  it cannot filter on `familyId` at the same time. `updateMany({ where: { id,
  familyId } })` can, and its `count` is how the controller learns a person was not
  the caller's — a scoped write with no extra query and no `findFirst`-then-check
  race.
- **`@updatedAt` is client-side, and the project already proves it.** The probe
  resolved the safe way to repair `people.updated_at`: drop `@default(now())`, add
  `@updatedAt`. `prisma validate` → valid; `migrate dev --create-only` planned
  exactly one statement, `ALTER TABLE people ALTER COLUMN updated_at DROP DEFAULT;`
  — metadata-only, no table rebuild. The risk ("does Prisma stamp it on create, or
  does the dropped default break inserts?") is answered by the `users` table, which
  has been `@updatedAt` with **no** default and has been registering users since
  lesson 04.
- **`migrate dev --create-only` is the honest probe for a schema change.** It plans
  and writes the migration file without applying it, so a lesson can show the exact
  SQL before the learner ever touches their database. The probe's migration was
  deleted with the scratch copy; the real database was never altered by it.
- **The cache's value is one call, and the lesson says so in three places.** The
  design decision — invalidate the key, never copy the row — is argued in 16c
  (the *trigger* for adopting TanStack Query, which Notes has deferred since
  session 5), re-used in 16d and 16e, and compressed in Reference 13 §6.

## Evidence

- **Baseline before authoring, measured:** `npm run typecheck` exit 0;
  `grep -n "check:people" package.json` → no match.
- **The lesson's verbatim code, in a real tree:** `typecheck` exit **0**;
  `check:people` exit **0** with the four printed figures; `build:client` exit 0,
  **70 modules** transformed; `@tanstack/react-query` resolved to **5.104.2**.
- **The HTTP smoke test, all measured:** `201 / 400 / 200 / 200 / 404 / 401 / 204 /
  404`, with the `400` body naming the gender and the `401` body being JSON
  (`{"message":"Authentication required"}`), not Express's HTML fallthrough.
- **The migration plan, measured:** one line, `DROP DEFAULT`.
- **Probe hygiene:** the scratch copy is disposable and was never the user's tree;
  `git status --short` in `kinlink/` is unchanged by this session (its five
  modified files are lesson 14's, already applied and uncommitted). The probe
  server was killed and port 4100 confirmed closed; the two probe families and one
  probe user created by the smoke test were deleted.

## Open / carried forward

- **Lesson 16 applied?** The series is authored and verified, but the user's tree
  is still at lesson 14 (uncommitted). Lesson 15 is authored and not yet applied
  either. The 16 lessons assume **15 is done**; the two series do not touch the
  same files except `client/src/lib/api.ts`, `contracts.ts` and `App.tsx`, where
  their changes are additive.
- **`updated_at` no longer a defect — once 16d runs.** Until then it is still the
  oldest known defect, and 16d is the sitting that pays it.
- **Two invariants still have no runnable proof** (Reference 13 §7): the
  `updated_at` freshness, and "the client's list agrees after a write" (a browser
  behaviour, verified by hand). Both are stated, not hidden.
- **Open product decisions raised, not settled:** who may write people (default:
  any member); hard delete vs soft delete, which relationships will force; whether
  `ApiError` should carry the server's prose; whether `useSession` migrates to
  TanStack Query once login/logout are mutations.
- **Zod has a named trigger:** a third resource needing shape validation. Today is
  two hand-rolled parsers in one controller.
- **The map (Reference 12) predates this series.** Reference 13 covers the people
  feature; when the next series lands, Reference 12's folder table should gain the
  people files rather than drift.
