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

## Interleaving (storage strength, not just fluency)

Weeks build on each other, but practice must mix. From week 3 onward every session
opens with a **10-minute interleaved drill**: a few old concepts mixed with new, drawn
from the [reference](./reference/) docs. Retrieval beats re-reading.

## How we measure "senior"

Not "I finished the tutorial". Three signals, checked weekly:

- **Can explain** the code without looking at it — say it out loud, then check.
- **Can extend** it in a direction we never built (an interviewer's follow-up).
- **Can break** it deliberately and predict the failure before running it.
