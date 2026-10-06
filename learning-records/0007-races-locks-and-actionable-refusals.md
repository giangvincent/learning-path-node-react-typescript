# The collision story: force the interleaving, and let the refusal carry its fix

Session 8. Lesson 07's five questions became one build, one skill, and three design
defenses — lesson 0008 (ownership transfer + a deterministic race check + problem
bodies) and Reference 08. Invitations resequenced to lesson 0009.

## Implications

- **A race test is deterministic when the losing interleaving is *constructed*.**
  The race window is count → write; a seam there plus a gate per transaction lets the
  test park both decisions on the same stale fact, so the bug fires every run it
  exists. `Promise.all` is sampling the scheduler: measured 20/20 on this machine,
  reported 0/20 by Arkency's identical technique. Same test, two schedules — which is
  the definition of schedule dependence. A regression test must fail for the code's
  sake, never for the scheduler's.
- **The lock protects the read, not the write.** The same `FOR UPDATE`, moved after
  the count, lost the invariant 3/3 runs (t2 counted 2); lock-first held 3/3 (t2
  counted 1). Under REPEATABLE READ the snapshot is established at the transaction's
  first plain read, so the pattern is *lock → read → decide → write* and the ordering
  is the entire protection. This is also what settles the MySQL manual's "don't mix
  locking and non-locking reads" warning for this codebase — with the lock first, the
  plain reads decide on an already-serialized world. The discipline it rests on:
  every writer of ownership rows takes the lock first.
- **`FOR UPDATE` beats an isolation level here on scope and on failure mode.**
  SERIALIZABLE converts *every* plain SELECT into a locking read (manual's words),
  turning read paths into lock takers, and read-then-write collisions into deadlock
  errors and retries. The locking read keeps the refusal a business answer: the second
  transaction waits and gets a 409 the client can act on. The counter-case (the
  manual recommends SERIALIZABLE precisely for mixed read patterns) is answered by
  the ordering measurement above — and labelled honestly: the SERIALIZABLE deadlock
  outcome is a *prediction* with a mechanism, shipped as a predict-then-look exercise,
  not as a measurement.
- **Transfer is one transition: one endpoint, one transaction.** The sharp version of
  the argument: two steps through the existing API *cannot* break the invariant — the
  last-owner guard answers 409 to demote-first — so what one endpoint buys is
  atomicity of *intent*, not safety. Three traps closed: transfer-to-self (promote-
  then-demote of one row is a third way to zero owners — the repair tool must not
  break what it repairs), the in-flight demotion (re-read the caller inside the lock;
  the refusal is 409 `not_owner`, a state conflict), and retries (transfer consumes
  the caller's authority, so it is not idempotent — idempotency keys deferred to the
  week-8 asynchrony thread).
- **The rank stays in code because a `role_rank` table moves the order but breaks the
  rules.** Invariants key on the *name* `owner`; custom roles re-key them on
  capabilities the table cannot express ("may edit events but not people" is not a
  point on a total order — that is RBAC vs ReBAC/ABAC in the OWASP sheet). Code makes
  a new role a compile error until a human ranks it in review; a table makes it an
  INSERT that can smuggle `superowner` past every rule keyed on the maximum. Escape
  hatch preserved: checks funnel through `requireRole`, so the map can move behind it.
- **The 409 body answers three questions: what happened (human), why (code), what now
  (remediation as data)** — RFC 9457 problem details with `code` and `remediation`
  extension members. Its own out-of-credit example ("triggering a transfer of more
  credit", `accounts` listing where) is this design. Consumers "SHOULD NOT parse the
  detail member for information" — so the contract is `code`, never the sentence.
  Candidates ride with the refusal (one round trip to the dialog; the factoring
  alternative `GET /members` is right once a member list has a screen, and the model
  function is shared either way).
- **Instruments lie too.** The race probe's first run reported "invariant broke 20/20
  with the lock" — contradicting the green `check:ownership`. The probe returned a
  count `Promise` whose `finally` deleted the fixture first, so every measurement read
  a deleted family. A contradiction between two tools is a prompt to distrust the
  newer one first; this one nearly published a spectacular false finding.

## Evidence

- Baseline before authoring (verify-first rule): `npm run typecheck` exit 0,
  `check:guards` ok, `check:ownership` → `demotions refused: 1 / owners remaining: 1`.
- Race probe (throwaway, deleted): forced interleaving ×3 each — no lock:
  `t2 in window=true, counted=2, refused=0, remaining=0`; lock-first:
  `window=false, counted=1, refused=1, remaining=1`; lock-after-count:
  `window=true, counted=2, refused=0, remaining=0`. Hope harness ×20 each — no lock:
  bug in 20/20; lock-first: bug in 0/20. (Arkency's post: their hope harness caught
  nothing — quoted as the counter-example.)
- Compile probe (throwaway, deleted) with the lesson's verbatim code shapes:
  `npm run typecheck` exit 0 after one real error caught (model function called via
  the module before it existed there). Verified against the generated Prisma client:
  `findMany` + `include: { user: { select: … } }` mapping, `Extract<Role, "member" |
  "admin">`, `let arrive!: () => void` definite assignment, `Promise.race` boolean
  typing.
- Sources fetched and quoted verbatim (not remembered): MySQL 8.0 isolation levels
  (SERIALIZABLE conversion + mixing warning + "used mainly in specialized situations"),
  RFC 9457 (member table, detail/extension rules, out-of-credit example), Arkency
  (seam + barrier, the two quoted rules), CHESS and FoundationDB testing pages.
- `git status --short` clean after both probes removed.

## Carried forward

- **Sequence:** 09 = invitations (propose → accept/expire — a protocol with state,
  motivated by transfer's counter-case), then the client. People CRUD and
  relationships (roadmap week 4) still unstarted; the schedule pressure from record
  0005 stands.
- **SERIALIZABLE prediction is unmeasured** — labelled in Reference 08 §2 and set as
  an exercise. If the user runs it, record the real outcome here either way.
- **check:ownership's 400ms** is a bound on *observing* t2 blocked, not the
  assertion — the invariant check is what makes the test unable to pass against
  broken code. Upgrade path if it ever needs to be stronger: read
  `performance_schema.data_lock_waits` to observe the block directly.
- **`Person.updatedAt` is still `@default(now())`** — oldest known defect, its own
  migration.
- **Idempotency keys** for retried transfers deferred to week 8 (asynchrony thread).
- **`keepRole` default** (`member`) is the user's product decision to make with a
  real family.
