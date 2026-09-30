# Architecture corrected: one website project, not a monorepo

Session 2. I proposed splitting KinLink into a pnpm monorepo of packages
(`apps/web`, `apps/api`, `packages/types`) and taught it that way for a full lesson.
The user rejected the framing: the deliverable is **one website project folder**
containing a React + TypeScript client, a Node + Express + TypeScript server
organised as **MVC**, and **MySQL**, with the layers intertwined rather than packaged
apart. They also raised the budget from 10–20 h/week to **~40 h/week (~320 hours
over 8 weeks)**.

## Implications

- **Do not reintroduce packages, workspaces or `workspace:*`.** The correct shared
  surface is a plain `shared/contracts/` folder that both tsconfigs include — types,
  no runtime code, no nested `package.json`.
- **MVC is a requirement, not a suggestion.** Lessons must show the seam between
  route, middleware, controller, service, model and view, and give an honest account
  of what a "View" is in a JSON API (a response shaper, not a template).
- **System design becomes a first-class track.** With 320 h there is room to explain
  *why* a layer exists, not just how to write it. The roadmap carries a system-design
  thread and doubles the topics that were previously deferred.
- **More of the product is reachable.** At 320 h, media, realtime and the test suite
  move from "deferred" to "must ship". Only memories/export, AI, billing, Meilisearch,
  DNA and mobile stay out.

## Evidence

The rejection was explicit and specific ("I see you are misleading me to packages
divided"), and it came with the architecture restated in full. Treat this as a firm
constraint on all future sessions, not a one-off preference.
