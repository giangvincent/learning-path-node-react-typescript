# Session 11 — the pending list, and an instrument that answers the wrong question

## What happened

Two lessons shipped. **Lesson 11** grew a new step: `createInvitation` hardened into one
transaction behind `lockFamily`, re-reading the inviter's membership inside the lock and
refusing a second pending invite for the same email — plus its runnable proof,
`npm run check:mint`. The user confirmed both open decisions (delete `listInvitations`; the
mint must re-check in a transaction because duplicates are unacceptable), and reported a
fourth thing: lesson 11's own `main.tsx` block closed with `<BrowserRouter>` instead of
`</BrowserRouter>`. That typo became a teaching moment — the measured `tsc` output (four
errors: TS17008 ×2, TS17002, TS1005) is now in the lesson's callout and its break-it list.

**Lesson 12** built the pending-invites list as a full vertical slice: `createdAt` on
`Invitation` via a one-thing migration, then contract → model → service → view → controller
→ route, with `npm run check:invites` as the proof. The shareable-link display question is
answered in the contract: `email: null`, labelled by the client as "Anyone with the link".

## Key learnings

- **The lock is still the whole mechanism.** With `lockFamily`: 1 credential, 1 row, demoted
  inviter refused. Without it: 0/5 runs pass, every run `2 succeeded, 2 row(s) written`. Same
  finding as lesson 08 in a new place — the lock protects the *read*, and the ordering
  (lock → read → decide → write) is the protection.
- **Trade-off recorded rather than hidden:** ordering on `expiresAt` would have avoided the
  migration entirely, because a fixed 7-day TTL makes the two orders identical. Rejected — it
  silently depends on the TTL never varying, and the list still cannot say when an invite was
  sent. One word of schema removes the dependence.
- **The blind spot is the session's real finding.** A Prisma `select` with an unknown field
  errors **only when `select` is alone**. Add a `where` beside it and `typecheck` is green;
  at runtime Prisma throws `Unknown field 'familyId' for select statement on model 'User'`.
  Measured, reproducible, and confirmed by injecting an unrelated type error into the same
  file (reported — so the file *is* in the program) while the bad `select` stayed silent.
- **That blind spot has already shipped a bug.** `auth.controller.ts:121` selects exactly that
  shape in `whoami`, so `GET /api/auth/whoami` answers 500 on `main` **with a green
  typecheck**. One-line fix, deliberately not bundled into a lesson.
- **Method consequence:** a Verify block that runs only `typecheck` proves the code *parses*.
  It does not prove it *works*. Every Verify keeps a runtime half. This does not weaken the
  lesson-10 correction — it completes it.

## Evidence

- Lesson 11's hardened mint and lesson 12's slice: `npm run typecheck` exit 0.
- `check:mint`: `1` succeeded, `1` row, `demoted inviter refused: true`.
- `check:mint` with `lockFamily` commented out: 0/5, `2 succeeded, 2 row(s) written`.
- `check:invites`: `rows returned: 2`, `emails: [null,"old@probe.invalid"]`, newest first.
- `check:invites` with both filter conditions removed: `rows returned: 4`,
  `EXPECTED 2 pending, got 4`.
- `tsc` on an unbalanced JSX tag: TS17008 ×2, TS17002, TS1005.
- `select`+`where` on a dead field: typecheck silent; runtime
  `Unknown field 'familyId' for select statement on model 'User'`.
- Probe hygiene: schema, generated client, four source files, the DDL column and every temp
  script were restored; `git status` byte-identical before and after, `prisma migrate status`
  reports the database up to date.

## Open / carried forward

- **Lesson 13 = render the list**, and it needs something the client has never had: a family.
  `lib/api.ts` still fetches `/api/people`, which is not a mounted route, and there is no login
  screen. Either lesson 13 gets `/family/:slug/invites` with the slug in the URL, or a client
  identity lesson comes first. Leaning: identity first, because "your pending invites" is a lie
  until the client knows who "you" are.
- **May admins manage invitations?** The client offers the dialog to admins; both server routes
  require `owner`. Decide once and change both together.
- **`whoami` 500** — fix in its own commit, and note in the message that typecheck could not
  have caught it.
- Revoke / resend still unbuilt. Resend is the interesting one: the raw token was never stored,
  so "resend" cannot mean "show me the link again" — it must mint a new credential and revoke
  the old one, in one transaction.
