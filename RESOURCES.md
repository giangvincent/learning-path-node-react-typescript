# KinLink / TypeScript-Full-Stack Resources

Curated trusted sources. Lessons draw their knowledge from here, never from the
teacher's memory. Every entry says what it is good for.

## Knowledge

### Language: TypeScript

- [The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
  The primary source for the language itself. Use for: type system questions, narrowing, generics, module resolution.
- [TypeScript Handbook — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
  Use for: the smallest reference that covers unions, literal types and `interface` vs `type`.

### Frontend: React

- [react.dev — Learn React](https://react.dev/learn)
  The official tutorial, rewritten around hooks and modern thinking. Use for: mental model of state, effects, and rendering.
- [react.dev — Thinking in React](https://react.dev/learn/thinking-in-react)
  Use for: the process of decomposing a design into components. Directly applicable to the KinLink tree and dashboard.
- [overreacted — Dan Abramov](https://overreacted.io/)
  Deep essays on React's mental model by a former React core maintainer. Use for: understanding *why*, not *how*. Start with The Two Reacts.
- [patterns.dev — React Stack Patterns](https://www.patterns.dev/react/react-2026/)
  Server vs client state, data fetching, and 2026-era recommendations. Use for: deciding where state should live.

### Data & server state

- [TanStack Query — Overview](https://tanstack.com/query/latest/docs/framework/react/overview)
  The canonical server-state library. Use for: caching, invalidation, optimistic updates. KinLink uses this, not Redux.
- [React Libraries for 2026 — Robin Wieruch](https://www.robinwieruch.de/react-libraries/)
  Opinionated, well-maintained survey of the React ecosystem. Use for: "which library should I pick" decisions.

### Backend: Node & Express

- [Express — Routing guide](https://expressjs.com/en/guide/routing/)
  Official. Covers `Router`, route paths and parameters, and typing requests and responses in TypeScript. Use for: anything about how routes are declared and mounted.
- [MDN — Express Tutorial Part 4: Routes and controllers](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/routes)
  MDN's LocalLibrary tutorial is a full MVC walkthrough in Node. Use for: seeing route → controller → model mapped onto a real app before you write KinLink's.
- [Node.js API documentation](https://nodejs.org/api/documentation.html)
  The runtime reference. Use for: streams, fs, crypto, worker threads, the actual semantics of the platform.
- [Node.js Best Practices — goldbergyoni](https://github.com/goldbergyoni/nodebestpractices)
  Large, curated, maintained production checklist. Use for: project structure, error handling, security, testing conventions.

### Security: authentication, sessions and cookies

- [OWASP — Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
  The authority on hashing. Use for: work-factor selection, salting vs peppering, why bcrypt is now listed as legacy and Argon2id is preferred, and how to upgrade a cost factor without knowing a password.
- [OWASP — Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
  Use for: the exact limits of `SameSite`, synchronizer tokens vs double-submit cookies, `__Host-` prefixes, and the checklist for when `SameSite` alone is sufficient. Read "Limitations of SameSite" twice.
- [kelektiv/node.bcrypt.js — README](https://github.com/kelektiv/node.bcrypt.js)
  Use for: cost = 2^rounds, the 72-*byte* truncation, the `$2b$cost$salt$hash` layout, and "A Note on Timing Attacks", which corrects the constant-time myth at the source.
- [expressjs/session — README](https://github.com/expressjs/session)
  Use for: every session option, why `MemoryStore` is not a production store, what `touch()` has to do with `resave: false`, and session-fixation guidance (`regenerate`).
- [tj/connect-redis — README](https://github.com/tj/connect-redis)
  Use for: Redis session storage once more than one instance must serve a session. Watch `prefix`, TTL behaviour and `disableTouch`.
- [MDN — Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
  Use for: attribute semantics, the cookie-prefix table, and the precise `Lax` rules — top-level navigation plus safe methods, excluding `fetch`, subresources and iframes.
- [RFC 9110 §15.5.2 — 401 Unauthorized](https://www.rfc-editor.org/rfc/rfc9110.html#name-401-unauthorized) and [§15.5.4 — 403 Forbidden](https://www.rfc-editor.org/rfc/rfc9110.html#name-403-forbidden)
  Use for: the difference between "no valid credentials" and "authenticated but not permitted". Four sentences that decide your status codes.
- [Node.js — `crypto.timingSafeEqual`](https://nodejs.org/api/crypto.html#cryptotimingsafeequalab)
  Use for: comparing raw secrets (session ids, API keys, CSRF tokens) without leaking how many leading bytes matched.
- [OWASP — Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)
  The design authority for *authorisation*, as distinct from authentication. Use for: deny by default, validating permissions on every request, lookup-id enumeration (the 404-versus-403 question), ReBAC/ABAC versus RBAC, and testing access-control logic.
- [OWASP Top 10 — A01: Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
  Use for: the "why this matters" framing. It ranks first on the list, and its examples are precisely the bugs this project is actively avoiding.
- [MySQL 8.0 — Locking Reads](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html)
  Use for: `SELECT … FOR UPDATE` and `FOR SHARE`. Its worked counter example is the last-owner problem verbatim: "first perform a locking read of the counter using FOR UPDATE, then increment it." Read the `NOWAIT` / `SKIP LOCKED` sections too.
- [MySQL 8.0 — Transaction Isolation Levels](https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html)
  Use for: what `SERIALIZABLE` actually does ("implicitly converts all plain SELECT statements to SELECT … FOR SHARE if autocommit is disabled"), when MySQL itself recommends it (XA, deadlock troubleshooting), and the warning against mixing locking and non-locking reads in a REPEATABLE READ transaction — which is the counter-case Reference 08 §2 answers with a measurement.
- [RFC 9110 §15.5.10 — 409 Conflict](https://www.rfc-editor.org/rfc/rfc9110.html#name-409-conflict)
  Use for: the difference between "you may never" (403) and "not in this state, not now" (409). Decides every last-owner refusal.
- [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457.html)
  Use for: the error body a client can act on. §3 defines `type`/`title`/`status`/`detail`/`instance` and extension members (`code`, `remediation`); the out-of-credit example is literally "why you were refused and where to fix it". Rules to quote: consumers "SHOULD NOT parse the detail member for information" and "MUST ignore any such extensions that they don't recognize".
- [OWASP — Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html)
  Use for: designing any single-use token — invitations as much as resets. CSPRNG generation, length against brute force, linked to a record, invalidated after use, stored in a secure manner (hashed), plus the link-specific warnings: `Referrer-Policy: no-referrer` and never building the URL from the `Host` header.

### Database

- [Prisma ORM + MySQL quickstart](https://www.prisma.io/docs/v7/prisma-orm/quickstart/mysql)
  Official MySQL path end-to-end. Use for: schema, migrations, client usage. Start here in week 2.
- [Prisma docs — ORM](https://www.prisma.io/docs)
  Use for: relations, transactions, query performance, and the generated client's type behaviour.
- [MySQL — official Docker image](https://hub.docker.com/_/mysql/)
  Use for: running MySQL 8 locally in a container with no system install.
- [Docker Docs — Use containerized databases](https://docs.docker.com/guides/databases/)
  Use for: the compose file for a local MySQL, volumes, and why the data survives restarts.

### Validation, testing, realtime

- [Zod — Intro](https://zod.dev/) and [Zod — Defining schemas](https://zod.dev/api)
  TypeScript-first validation. Use for: validating every request body and env var at the boundary.
- [Vitest — Getting Started](https://vitest.dev/guide/)
  Use for: unit tests. Same config as Vite, so it already fits the workspace.
- [Arkency — Making race condition tests deterministic with CyclicBarrier and seam](https://blog.arkency.com/making-race-condition-tests-deterministic-with-cyclicbarrier-and-seam/)
  Use for: the seam + barrier technique that makes a race test deterministic. Carries the acceptance rule ("a test that FAILS without the lock and PASSES with it"), the Feathers seam definition, and a live example of a hope harness missing the bug entirely. KinLink's explicit hook is the deliberate variation (Reference 08 §1).
- [CHESS: A systematic testing tool for concurrent software](https://www.microsoft.com/en-us/research/publication/chess-a-systematic-testing-tool-for-concurrent-software/)
  Use for: the field's name for this — systematic concurrency testing — and the systematic version: enumerate all interleavings of a scenario instead of hand-picking one.
- [FoundationDB — Simulation and Testing](https://apple.github.io/foundationdb/testing.html)
  Use for: the extreme end. "Determinism is crucial in that it allows perfect repeatability of a simulated run, facilitating controlled experiments to home in on issues."
- [Socket.IO — Rooms](https://socket.io/docs/v4/rooms/)
  Use for: the `family:{familyId}` room pattern in KinLink's realtime layer.

### UI system

- [shadcn/ui — Installation](https://ui.shadcn.com/docs/installation)
  Use for: copying accessible, unstyled-by-default components into the repo and theming them with the brand tokens.
- [Cytoscape.js](https://js.cytoscape.org/)
  The graph library behind the family tree. Use for: nodes, edges, layouts, styling selectors.
- [Cytoscape.js — Using layouts](https://blog.js.cytoscape.org/2020/05/11/layouts/)
  Use for: choosing and configuring the tree layout. Read before week 6.

### Build & workspace

- [pnpm — Workspaces](https://pnpm.io/workspaces)
  Primary source for `pnpm-workspace.yaml`, the `workspace:*` protocol, and filtering.
- [React Router](https://reactrouter.com/)
  Use for: the family-scoped route tree (`/f/:familySlug/...`).

## Wisdom (Communities)

- [TypeScript Community Discord](https://discord.com/invite/typescript)
  Official community. High-quality help on types, compiler errors and tooling. Use for: when a type error makes no sense after 20 minutes.
- [r/typescript](https://www.reddit.com/r/typescript/)
  Use for: reading how experienced developers reason about type design. Post sparingly, lurk usefully.
- [Reactiflux Discord](https://www.reactiflux.com/)
  The long-running React community, with dedicated help and code-review channels. Use for: React design critique.
- [r/reactjs](https://www.reddit.com/r/reactjs/)
  Use for: ecosystem debates and "is this idiomatic" questions.
- **Local (Vietnam):** find the Ho Chi Minh City or Hanoi JS/React meetup groups.
  Use for: in-person feedback on a demo of KinLink. Real reactions beat online ones.

## Gaps

- No trusted source yet on **Vietnamese kinship terminology** (how to name a relative given a computed path). This is core to the Kinship Engine's user-facing output. Search before week 5.
- No trusted source yet on **lunar calendar / lễ giỗ date computation** in JavaScript. The `Intl` APIs and the Vietnamese lunar calendar libraries need evaluating before week 7.
- ~~No trusted source yet on **multi-tenant data isolation patterns** for Prisma + MySQL.~~
  Covered at sessions 3–4 by [Reference 04](./reference/0004-ids-and-tenancy.html): tenant id
  from the session only, a required scoping argument on the model, model answers *fact* and
  service answers *policy*. No external source was needed; the rule is a design decision.
- ~~No trusted source yet on **structuring a growing Express middleware chain and route
  guards** beyond the Express routing guide.~~ Covered at session 6 by
  [Reference 06](./reference/0006-authorisation-chains.html): deny-by-default mounting, the
  resolve-once chain, and why the guard *order* (session → family → membership → role) is
  itself a security property. The only external source added was the
  [Express 5 migration guide](https://expressjs.com/en/guide/migrating-5.html), for async
  error forwarding and the `req.params` changes.
- ~~No trusted source yet on **testing concurrency deterministically**~~ —
  Covered at session 8 by [Reference 08](./reference/0008-races-locks-and-refusals.html) §1:
  the seam + gate technique (Arkency), the field's systematic version (CHESS), and the
  deterministic-simulation end (FoundationDB). The gap's own suggestion — "barrier-based
  test harnesses" — was the right instinct.
- No trusted source yet on **authorisation test matrices** — systematically enumerating
  (role × route × resource) combinations so a missing guard is found by the suite rather
  than by review. OWASP ASVS V4 is the starting pointer; a real technique is still missing.
