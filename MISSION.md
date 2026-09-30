# Mission: Build and ship KinLink — one website, two architectures, two months

## Why

I am becoming a senior software engineer, and the proof is one website I design,
build and deploy myself: **KinLink**, a private family networking and genealogy
platform. Not a tutorial clone, and not a pile of separate packages — **a single
project folder** where a React + TypeScript client talks to a Node + Express +
TypeScript server built on MVC, over a MySQL database.

The learning is the same asset as the deliverable. As I build KinLink I learn
front-end architecture, back-end architecture and system design; what I finish with
is something I can demo, explain and defend in an interview.

## Success looks like

- One project folder that runs with a single command: `client/` (React + TypeScript),
  `server/` (Express organised as MVC, TypeScript), MySQL behind it.
- I can narrate a real request through every layer and say why each one exists:
  route → middleware → controller → service → model → database → view → JSON → React.
- A real family can use the deployed site: sign up, create a family, add people,
  link relationships, see a tree, invite a relative.
- I can design a feature end to end and defend each decision out loud — including
  why the server owns kinship logic, and why `family_id` is never trusted from the client.
- The deployed site has tests that run in CI, and I can name what each suite protects.

## Constraints

- **~40 focused hours per week for 8 weeks — about 320 hours.** Solo.
- **The architecture is fixed, not a question to revisit:** React + TypeScript
  front end; Node + Express + TypeScript back end organised as MVC; MySQL as the
  primary database; everything inside one website project folder. No monorepo, no
  packages, no workspaces.
- Learning by building: every lesson ends with committed code in the real project.
- Starting point: comfortable with JavaScript and React basics; TypeScript and
  server-side Node are the weak spots.
- Product context: Vietnam — Vietnamese name variants, lễ giỗ, privacy-first family data.

## Out of scope

- Multi-package / monorepo tooling. The project is one website folder.
- DNA integrations, mobile apps, printed books, physical products, partnerships.
- Feed, memories, AI historian, billing, Meilisearch, admin dashboard — unless
  weeks 7–8 finish early.
- "Mastering React/Node/TypeScript" in the abstract. Mastery only counts when it is
  shipped and defended.
