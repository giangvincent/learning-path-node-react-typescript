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
- No trusted source yet on **multi-tenant data isolation patterns** for Prisma + MySQL. Needed before week 3.
