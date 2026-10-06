# Authorisation arrived: the tenant rule was sharpened, not abandoned

Session 6. Lesson 06 replaced `User.familyId` — a placeholder carried since lesson 04 —
with a `family_members` relationship carrying a `role`, backfilled by a migration that
had to be generated with `--create-only` and hand-edited so the backfill `INSERT … SELECT`
ran before `DROP COLUMN users.family_id`. `GET /api/families/:slug/people` now answers
200 for a member, **404** for a non-member (deliberately identical to "no such family"),
and 401 with no session. The session lost `familyId` entirely: identity stays, and
authorisation context is resolved per request.

## Implications

- **The lesson-03 rule needed sharpening, not abandoning, and this is the session's
  highest-value insight.** Lesson 03 taught "the tenant id is derived from an
  authenticated session and never appears in a request the client controls." That was
  correct for one-family-per-user, and it is the wrong rule to *repeat* now that a URL
  names a family. The actual invariant is: **the client may name a resource; the server
  must prove access to it.** Reference 04 already carried the escape clause ("unless the
  caller genuinely belongs to more than one tenant, in which case the membership check
  must be explicit") — the clause is now live. Teach the pair together, or the user will
  conclude the earlier rule was wrong and over-correct.
- **`403` is now a code the project can justify, and `404` for non-membership is a
  documented trade-off rather than an obvious truth.** A real counter-argument exists: for
  an *authenticated* caller, 403 is arguably more honest, and the enumeration worry is
  smaller than it looks. What matters is that the choice is deliberate, uniform, and
  explained — recorded in Reference 06 §1 and offered as an argument in the lesson's
  "ask your teacher" prompt. Expect the user to push back here, and welcome it.
- **Session shape mirrors the data model; stale session fields are a smell.** `familyId`
  in the session was a faithful mirror of "a user has one family", and it became a lie the
  moment that stopped being true. The rule to teach: *a value belongs in the session only
  if it is stable for the session's life.* Identity qualifies; authorisation context does
  not, because it changes with the resource named.
- **Migration discipline is now a taught skill, not an aside.** `migrate dev` would have
  dropped the column that held the only user↔family link, silently orphaning every
  account. `--create-only` → hand-edit the SQL → apply, then *verify with a count* because
  a migration that reports success is not evidence that it preserved anything. This is the
  most interview-ready thing produced so far.
- **Deny-by-default, ReBAC-over-RBAC, enumeration oracles, transaction boundaries and
  fail-closed tripwires are now all in one project.** The interview story is assembling
  itself without needing a separate "system design" track.
- **The route-table question was answered with a measurement, not an opinion.** The probe
  against Express 5.2.1 showed `layer.path === undefined` for both routes and mounts,
  `regexp` gone and `keys` empty (the path lives in an opaque `matchers` structure), so
  mount paths cannot be recovered from the router. The recommended design — make the route
  table the source of truth — is therefore grounded in evidence. Also measured: mount-path
  params reach middleware but **not** a child router without `mergeParams`.
- **Deferred on purpose: the route table itself.** With three routes, deny-by-default plus
  the fail-loud tripwire already provide the safety, and the hand-written list fails
  loudly (404 ≠ 401) rather than silently. It buys convenience and *coverage*, not safety,
  and coverage is not worth the indirection until the route count justifies it — roughly
  fifteen routes, or the moment a route is added and forgotten.

## Evidence

- `prisma migrate dev --create-only` confirmed present in Prisma 7.10.0 (CLI help output).
- `RequestHandler` returns `unknown` in the installed `@types/express-serve-static-core`
  (line 67), so an `async` middleware typechecks; the Express 5 migration guide confirms
  rejected promises are forwarded to the error handler automatically.
- Express 5 router internals probed live (`express 5.2.1`) rather than assumed — output
  reproduced in Reference 06 §6.
- Two failures would be loud by design and worth confirming during the build: a non-member
  branch changed to 403 (becomes an enumeration oracle) and `findMembershipWithFamily`
  replaced by a membership-blind lookup (serves another family's people). Both are
  break-it exercises; the second is the leak the single `where` clause exists to prevent.

## Carried forward

- **The lesson-05 fix was still uncommitted at the start of session 6:** `server/types/`
  → `server/src/types/express.d.ts` was staged but not committed, and
  `middlewares/auth.ts` had an unstaged edit. Confirm the tree is clean before starting
  lesson 07, and make sure the rename is *in* the commit rather than sitting in the index.
- **Lesson sequence:** 07 = roles (`requireRole`, rank not equality, the last-owner
  invariant, 403 in anger). 08 = the client (`whoami`, login form, server state vs client
  state). People CRUD and relationships — roadmap week 4 — still follows, and is now
  properly unblocked because people are reachable only through an authorised family.
- **New small defect to name, not fix:** `Person.updatedAt` is `@default(now())` rather
  than `@updatedAt`, so the field never updates. Own migration, one word. Flagged in the
  lesson so the user decides.
