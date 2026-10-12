# The 8-week plan (~320 hours)

40 h/week × 8 weeks. That is a real budget: enough to build the KinLink core
properly **and** learn the architectures while doing it. The rule for every week:
**ship something that runs, then make it defensible.**

## The project shape (fixed)

```
kinlink/
├── package.json          one manifest for the whole website
├── tsconfig.json         server + shared compiler options
├── vite.config.ts        client build (root: client/)
├── docker-compose.yml    MySQL 8
├── client/               React + TypeScript      ← front-end architecture
├── server/               Express + TypeScript    ← back-end architecture (MVC)
├── shared/contracts/     types both sides compile against (not a package)
└── docs/
```

Back-end layering, which every feature will follow:

```
HTTP → route → middleware → controller → service → model → MySQL
                                  ↓
                              view (resource) → JSON → React
```

## Must ship (the mission fails without these)

1. Skeleton: one folder, client + server, TypeScript both sides, one command to run
2. MySQL + Prisma: a real Model layer, migrations, seed data
3. Auth: register, log in, session, log out
4. Families + membership + roles; family-scoped routing
5. People CRUD + profile
6. Relationships + the Kinship Engine
7. Family tree visualization
8. Invitations (code, link, email)
9. Events: birthdays, anniversaries, lễ giỗ
10. Deployed, with tests running in CI

## Stretch (only if ahead of pace)

11. Photos / media via signed uploads 12. Realtime on the tree (Socket.IO)
13. Private family feed 14. Admin dashboard

**Explicitly deferred:** memories/book export, AI historian, billing, Meilisearch, DNA, mobile.

## Week by week

| Week | Ship | Architecture & system design |
|---|---|---|
| 1 | Skeleton: one folder, client + server, TS both sides, first request through every layer | layering, the request lifecycle, the contract boundary, dev proxy, why the server owns the truth |
| 2 | MySQL + Prisma: the Model layer becomes real, migrations, seed | ORM vs raw SQL, schema design, migration safety, connection pooling, env config |
| 3 | Auth + families + membership + roles | sessions vs JWT, password hashing, multi-tenant isolation, never trusting `family_id`, authorization vs authentication |
| 4 | People CRUD + relationships | relational modelling, integrity constraints, transactions, N+1 queries, indexing |
| 5 | Kinship Engine + tree API | graph traversal, generations, cycle detection, derived vs stored data, caching |
| 6 | Tree UI + invitations + events | server state vs client state, cache invalidation, graph layout, timezones and the lunar calendar |
| 7 | Media uploads + realtime + test suite | signed URLs, object storage, sockets and rooms, the testing pyramid, CI |
| 8 | Deploy + harden + defend | build pipeline, secrets, logs and metrics, performance profiling, README and interview rehearsal |

## The system design thread

These topics arrive inside a build, not as lectures. By the end I should be able to
draw this from memory and justify each box:

- **Layering and seams** — why controllers must not touch the database.
- **Statelessness** — what a session actually is, and where state lives.
- **Multi-tenancy** — one database, many families, and how a query is proven scoped.
- **Data modelling** — normalisation, constraints, and what must never be derived-and-stored.
- **Query behaviour** — N+1, indexes, `EXPLAIN`, pagination.
- **Caching** — what may be cached, for how long, and how it is invalidated.
- **Asynchrony** — background jobs, retries, idempotency.
- **Realtime** — fan-out, rooms, what happens when a socket drops.
- **Delivery** — build, deploy, migrations in production, observability.

## Lesson size, and the session cadence

A lesson is a **sitting**, not a topic. When a lesson "contains a lot of knowledge and
needs more explanation", that is a sizing bug — and this is the rule that fixes it.
Effective now, and applied retroactively to lessons 13 and 14 (see the `NNNNa` / `NNNNb`
splits).

### The lesson-size rule

- **One session = one new thing.** A lesson teaches one concept, proves it with one
  Verify block, and ends in one commit. Two new concepts is two lessons. "New thing"
  means a new *idea* to understand, not a new file: a model, service, view and controller
  that all serve one read are still one thing.
- **Budget: about 45–60 minutes of real work** — typing the code, running Verify,
  debugging, committing. The `about N minutes` in a header must be that measured number,
  not a wish. If it is a guess, write `≈ one session` rather than a fiction.
- **A lesson file stays around 300 lines of HTML, not counting the listings the
  learner types.** The code is work, not reading; the prose around it is what has to stay
  small. Two Verify blocks or two commits in one file means it is two lessons.
- **The build and the drills are different files.** `lessons/NNNN-….html` is the short
  build. "Defend it", "Break it on purpose" and "Retrieval practice" move to a sibling
  `lessons/NNNN…-practice.html`. They are spaced retrieval, done on a later day — not
  part of the sitting.
- **The teacher's method stays out of the lesson.** Verify-first, probe hygiene and the
  other house rules live in `NOTES.md`; the lesson carries only what the learner does.
- **Every lesson opens with its Verify commands** and closes with a commit.
- **Every lesson ends with a *Log it* block** — minutes, one line of "what fought back",
  the commit hash — pointed at this week's block in [PROGRESS.md](./PROGRESS.md). A
  lesson that does not ask to be logged is a lesson that will not be logged; every lesson
  so far shipped without one and the log stayed blank.

When a lesson overruns its timebox by half, stop and cut it into two. Splitting is cheap;
a learner stalled on a 1,200-line page is not.

### The session cadence

- **Schedule the sitting; do not wait for the mood.** A fixed block at a fixed time —
  start with **4 × 90 minutes a week**, the same slots every week. 40 h/week is the
  ambition; the calendar is what makes it real. (The 40 quietly becomes 12 with nothing
  booked.)
- **Every session runs the same shape:** a 10-minute interleaved drill from a prior
  [reference](./reference/) doc → one lesson build → commit → a two-line log.
- **Log after every session** in [PROGRESS.md](./PROGRESS.md): minutes in the editor
  (WakaTime) and the three signals. Weekly, fill the week block. Two numbers, five
  minutes — the point is to *notice* the drift, not to score it.
- **A session that produced no commit did not happen.** Re-cut the lesson smaller.

## Interleaving (storage strength, not just fluency)

Weeks build on each other, but practice must mix. From week 3 onward every session
opens with a **10-minute interleaved drill**: a few old concepts mixed with new, drawn
from the [reference](./reference/) docs. Retrieval beats re-reading.

## How we measure "senior"

Not "I finished the tutorial". Three signals, checked weekly:

- **Can explain** the code without looking at it — say it out loud, then check.
- **Can extend** it in a direction we never built (an interviewer's follow-up).
- **Can break** it deliberately and predict the failure before running it.
