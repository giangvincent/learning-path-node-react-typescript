# The auth layer shipped running but un-typecheckable, and the fix is structural

Session 5. Lesson 04 (authentication) produced working behaviour — register, login,
`saltRounds: 12`, an httpOnly session cookie, `bcrypt.compare`, `requireAuth` — and
committed it as `cc1dc17`. It also left the repository in a state that
`npm run typecheck` rejects: **10 errors across 3 files**, every one of them a symptom
of a single omission. Nothing had declared what the auth layer attaches to a request,
so `req.session.userId`, `req.session.familyId`, `req.authenticatedUserId`,
`req.authenticatedFamilyId` were all unknown, `Express.MutatedSession` did not exist,
and the controller's local `RequestWithAuth` narrow type broke route registration in
`people.routes.ts`.

The second defect is semantic and more dangerous for what comes next:
`requireAuth` called `req.next(new Error("Authentication required"))`, so an
unauthenticated request was answered by `errorHandler` with **500**. The client can
therefore not distinguish "I don't know who you are" (401) from "the server broke"
(500), which is precisely the distinction the client lesson is built on.

## Implications

- **Fix the contract before the consumer.** The client lesson was scheduled as 05 and
  is now 06. Building a login flow against an API that answers 500 for "no
  credentials" would teach the client to treat a missing session as a server fault.
  One small lesson that makes the foundation honest beats one large lesson that papers
  over it — this is the working-memory rule and the dependency order agreeing for once.
- **A cast is a type you declined to write down.** `as unknown as SessionWithUser`
  was covering for a missing declaration. The remedy is one `.d.ts` with two merges,
  after which the cast and the local `RequestWithAuth` interface both disappear. Teach
  the rule, not the workaround.
- **An ambient declaration outside `include` is silently ignored.** The file was written
  correctly but placed at `server/types/express.d.ts`, one level above `server/src`, so
  the compiler never read it: no warning, no error, all ten failures unchanged. That
  looks identical to "the augmentation idea is wrong", and it sent the search in the wrong
  direction for a round trip. **Verify a declaration by deleting it and watching the
  errors return** — adding it and observing no change proves nothing. Same principle as
  the guard, one layer down: make the failure loud, or you will misread the silence.
- **The user's answer to "how do you make the requireAuth mistake harder to repeat?"
  was right in destination and shallow in mechanism.** "Wrap routes into a group" is
  the instinct; the mechanism is *default-deny ordering* — public routes above the
  guard, everything below it protected with no per-route argument. The generalisable
  principle, which is the real lesson, is **choose the direction your mistakes fail
  in**: a public route below the guard fails loudly (401), a forgotten guard fails
  silently (data leak).
- **The compiler can never catch a missing middleware.** There is no type error for it.
  So the third layer has to be a request. A dependency-free guard check
  (`server/src/scripts/checkGuards.ts`, ephemeral port, no MySQL needed because the
  guard rejects before the model) was introduced deliberately *without* a test
  framework — the testing pyramid is week 7 and should not be smuggled in early.
- **`next(err)` is not a generic escape hatch.** For anything that is not a server
  fault it destroys the status code, which is part of the API contract. Route it to a
  typed error or answer directly.
- **Watch for wrong claims in material written quickly.** Lesson 04 asserted three
  falsehoods: that `bcrypt.compare()` is constant-time, that modern bcrypt bundles its
  own types, and that `SameSite=Lax` "prevents CSRF for GET requests" (inverted). All
  three were corrected in place, and Reference 05 §6 carries the corrections. The user's
  question made the first one visible — they had absorbed the wrong model.

## Evidence

- `npm run typecheck` output captured before the fix: 10 errors, listed in lesson 05.
  After: 0.
- The declaration-merging paths were **verified empirically before publishing**, not
  reasoned about: a throwaway probe compiled with `tsc --ignoreConfig` and `EXIT=0`,
  proving `declare module "express-session"` merges `SessionData` while
  `declare global { namespace Express { interface Request } }` merges the request
  fields. The two paths differ because `@types/express-session` declares `Request` at
  line 10 inside `declare global` and `SessionData` at line 212 inside
  `declare namespace session`. This was checked after an initial wrong guess.
- `bcrypt@6.0.0` has no `types`/`typings` field and no `.d.ts` in the package;
  `@types/bcrypt` is load-bearing.
- The bcrypt README's "A Note on Timing Attacks" states the comparison "is *not* time
  safe (constant-time), as it may exit early when a mismatch is found" — the primary
  source contradicts the premise the user brought.
- Baseline update, measured rather than reported: the user reasons accurately about
  isolation and dependency direction (record 0003) but reaches for approximate
  mechanisms under time pressure and committed lesson 04 without running the
  verification commands. **Add "run the checklist" to the lesson rhythm** — it is why
  lesson 05's Verify section is specific and command-level.

## Carried forward

- ✅ **Verified at session 5:** `npm run typecheck` exits 0 and `npm run check:guards`
  prints `ok /api/people -> 401`. Lesson 06 (the client) starts from a green tree.
- **Schedule pressure to watch.** Auth (roadmap week 3) has now consumed lessons 03,
  04 and 05. People CRUD and relationships — roadmap week 4, and the prerequisite for
  the Kinship Engine — is still unstarted. The client lesson (06) is a deliberate
  insertion ahead of it, justified by the broken vertical slice; if 06 slips, cut the
  client back to `whoami` + login + the people list and start week 4 server work
  immediately afterwards.
