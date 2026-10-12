# Session 10 (carry-forward from lesson 10) — finishing what lesson 10 didn't

## What happened

Lesson 10 shipped code into three files, but **none of it ran**:

1. `invitation.controller.ts` — the new `listInvitations` failed `npm run
   typecheck` with two errors. `req.params.slug` was typed `string | string[] |
   undefined`, and `orderBy: { createdAt: "desc" }` named a column that does not
   exist on the `Invitation` model (it has `expiresAt` and `usedAt`, but no
   `createdAt`). The errors live inside the lesson file, so a reader who
   copy-pasted got a broken build. **Lesson code that doesn't compile is a bug,
   not a draft.**
2. `invitation.routes.ts` — the `POST /` and `POST /:token/accept` handlers
   were stubs whose bodies were `// ... validation, then createInvitation(...)`.
   Neither endpoint was wired into `routes/index.ts` (the `apiRouter` mounts
   `authRouter`, applies `requireAuth`, then mounts `familyRouter` under
   `loadFamily` — `invitationRouter` is defined but never `use()`d). Two
   consequences: `POST /api/invitations` from the **client** never hit the
   server, and `POST /api/invitations/:token/accept` was undefined — both
   endpoints answered 404 in production.
3. `client/src/AcceptPage.tsx` — `import { useParams } from "react-router-dom"`
   in a project that has **no `react-router-dom` installed** (the manifest
   only has `react` and `react-dom`). Lesson 10 also didn't introduce the
   router package, didn't add it to the manifest, didn't wire the route
   `/invite/:token`, and didn't mention `useParams` at all. The lesson
   presented a working-looking page that imports a non-existent symbol.

Plus three design questions the lesson left dangling:

- **"Already a member" accept** → the answer per the user: the invite token
  has already been consumed (the compare-and-set set `usedAt`), so the URL
  is dead. Show **nothing** — the page simply renders "this link doesn't
  work", same body as every other refusal. No redirect to the family, no
  "already a member".
- **"Someone" or "email" in the pending-invites list for shareable links** →
  open question. Recorded as carried forward; user decided it later in
  session 11 follow-up (will be captured when the lesson that depends on it
  lands).
- **Accept page after expiry** → the user's preference: **no auto-refresh,
  no retry button.** The page is the page; the link has stopped working.
  Render a single state explaining that the invitation has expired.

## The house rule this implies

**Lesson code must pass `npm run typecheck` and reach the running app
before the lesson is published.** This is the lesson-05 rule sharpened:
running `check:guards` proved the auth layer answered correctly; it caught
the missing `.d.ts` and the broken `next(err)` chain. Lesson 10 didn't
even attempt it. The three complaints all reduce to one observation:
**the lesson's Verify commands were never run against the lesson's code.**

Concretely, every lesson from here on must include, before the "Build it"
section, a **Verify** paragraph listing the exact commands that prove
green, and the author must run them against the lesson's verbatim code
shape against the current main. The previous probe trick (write the code
into a sandbox first, run the verifier, delete the sandbox) catches this
class of bug at near-zero cost.

A second rule, direct consequence of #3: **if a lesson introduces a
module that is not yet in the client/server manifest, the lesson says
so explicitly, runs the install command, and the lesson's first Verify
asserts the package resolves.** "Use `useParams`" without naming the
package and the route that hands the page its URL is half a lesson.

A third rule, direct consequence of #2: **lesson code never contains
`// ... foo` placeholders where `foo` is the actual lesson content.**
Either the body is implemented (and is the lesson's working code) or
it is removed. A stub masquerading as a build step is the worst kind of
half-truth: it compiles, looks finished, and reaches for behaviour that
never existed.

## Evidence captured

- Baseline (pre-fix): `npm run typecheck` → 2 errors, both in
  `invitation.controller.ts`. Routes reach no endpoint (404).
  `AcceptPage.tsx` does not resolve.
- Fix surface (lesson 11): mount `invitationRouter`, narrow
  `req.params.slug` (or read from `req.family`), drop the bogus
  `createdAt` order, install `react-router-dom`, register
  `/invite/:token`.
