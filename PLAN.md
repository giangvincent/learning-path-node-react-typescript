# PLAN.md — the lesson-series board

The forward plan for the remaining build series. `ROADMAP.md` is the 8-week arc;
this file is the lesson-level board underneath it — one entry per series, with the
breakdown, the new concepts, the **open questions you answer**, and the sources
still to find.

**How to use it.** Review a series, answer its numbered questions, and tell the
teacher to author it. A series is *authored* only when its lesson files exist, and
*verified* only when its verbatim code has been compiled **and run** in the
isolated probe against a tree that already contains everything it depends on
(the house rule, from lesson 10).

## Status at a glance

| Series | Files | Authored | Applied to `kinlink/` | Code verified |
|---|---|---|---|---|
| 15 — invitation lifecycle | 15a–15e + 15f | yes | no | **no** — needs the mint restore |
| 16 — people CRUD + first cache | 16a–16e + 16f | yes | no | **yes** (probe: typecheck + `check:people` + HTTP walk) |
| 17 — relationships | 17a–17e + 17f | plan | no | — |
| 18 — the kinship engine | 18a–18e + 18f | plan | no | — |
| 19 — the tree | 19a–19e + 19f | plan | no | — |
| 20 — events and lễ giỗ | 20a–20e + 20f | plan | no | — |

**Dependency chain.** 17 depends on 16 (a person must exist before an edge can).
18 depends on 17. 19 depends on 18. 20 depends on nothing but 16 (it only needs a
person with a date). So 20 could be pulled forward if the graph work stalls — the
one series that can run in parallel.

---

## Series 17 — Relationships

**Goal.** KinLink stops being a list of people and becomes a graph. A person gains
edges to other people, and the server owns the integrity rules that make the graph
well-formed.

**Why now.** Must-ship item 6 in `ROADMAP.md`. It is also the first non-trivial
data model in the project: everything so far has been either a row or a join table
with a fixed owner. An edge connects two rows of the *same* table, and that is
where the interesting rules live.

**Lessons**

- **17a — the edge and its vocabulary.** The `Relationship` model and its
  migration: `fromPersonId`, `toPersonId`, a `type` enum, both FKs, a uniqueness
  constraint on the ordered pair. The design decision is in this sitting: one edge
  table with a type column, or two tables (`ParentChild`, `Spouse`). The relation
  is stored **once** and read in both directions — say why.
- **17b — reading a person's edges.** `GET /families/:slug/people/:personId/relationships`,
  the contract, the view, and the N+1 trap: a list of a person's relatives needs
  `include`, not a query per relative.
- **17c — creating an edge.** The write path again, now with domain rules: both
  people must be in the caller's family, no self-edge, no duplicate. A
  `check:relationships` proof that a cross-family edge is impossible.
- **17d — the cycle, and the first traversal.** A must not become their own
  ancestor. This is the one rule that cannot be a `WHERE` clause: it needs a walk
  up the ancestor chain *before* the insert, inside the transaction. The first
  place the project needs `WITH RECURSIVE` — or an explicit loop, and the
  trade-off between them.
- **17e — the client panel.** Relationships on the person screen; the first
  *transitive* invalidation — adding an edge changes the people list too, so one
  mutation must invalidate more than one key.
- **17f — practice.**

**New concepts.** Self-referential relations; a typed edge table; uniqueness on an
ordered pair; referential integrity across two FKs into one table; cycle detection
on write; recursive queries.

**Open questions** (answer these and the series can be authored)

1. **What edge types, exactly?** Parent/child only, or parent/child **and**
   spouse/partner? The mission mentions "link relationships", so I assume both —
   confirm.
2. **Do we model biological vs adoptive vs step?** A `type` enum can carry it, or
   it can be a later column. My default: start with `parent` and `spouse`, no
   adoption semantics, and record that as a deliberate cut.
3. **One edge table or two?** My recommendation is **one** (`type` discriminator),
   because both are "an edge between two people" and the traversal code will want
   to read them together. Counter-case: a spouse edge is symmetric and a parent
   edge is not, so the constraint sets differ and one table cannot express both
   cleanly.
4. **Does a person get at most two parents enforced?** Enforcing it is a rule plus
   a check; not enforcing it lets a data-entry mistake create a three-parent
   person. My default: **not enforced** in this series, logged as debt — because
   only the tree/engine work will reveal whether the constraint is real.
5. **Remarriage?** Vietnamese family records often have more than one spouse over a
   life. Does the model allow N spouse edges per person from day one? My default:
   yes, allow it — forbidding it is the harder constraint to undo.
6. **What happens to edges when a person is deleted?** This is 16e's deferred
   question arriving with force. My default: **cascade** for now, with a check that
   proves no orphan edge survives.

**Sources to gather.** MySQL 8.0 `WITH RECURSIVE` (the manual, not a tutorial);
Prisma self-relations and `onDelete` behaviour; a readable treatment of cycle
detection on insert. All land in `RESOURCES.md` before 17d is authored.

---

## Series 18 — The Kinship Engine

**Goal.** Given two people and the graph, compute *how they are related* — the path,
the generation, and the Vietnamese word for it. Derived on read, never stored.

**Why now.** Must-ship item 6's second half, and the heart of the product: a
genealogy app that cannot say "this is your bác" is a database with a tree drawn on
it. It is also the first place the project gets a **pure function** worth a real
unit test — the traversal has no database, no HTTP and no I/O, which is exactly
when a unit test beats a check script.

**Lessons**

- **18a — the walk.** Shortest path between two nodes in the edge graph, as a pure
  function with no Prisma in sight. The project's **first true unit test**, and why
  this is the case that finally justifies one.
- **18b — generations and the common ancestor.** Turning a path into "you share a
  grandparent": generation offsets, the ancestor join, and the sibling/cousin
  distinction.
- **18c — the term table.** Path shape → Vietnamese kinship term. The domain
  knowledge sitting, and the one that needs a **trusted source**, not memory.
- **18d — the API.** The endpoint the client asks: "how is everyone in this family
  related to me?" — a bulk read, and why it is one call and not N.
- **18e — the screen.** The term appears where a person appears; the client asks
  once and reads it many times.
- **18f — practice.**

**New concepts.** Graph traversal (BFS vs DFS, and which this needs); derived vs
stored data and the cache-invalidation cost of deriving; caching a pure function;
domain vocabulary as a table, not a chain of `if`s; **affinal** vs **consanguineal**
relations (relationship through marriage vs blood).

**Open questions**

1. **How deep on Vietnamese terms?** Just the common ones (parents, siblings,
   grandparents, aunts/uncles, cousins), or the full system with paternal/maternal
   distinction — **nội** vs **ngoại** — and birth order (anh vs chị, and the số
   numbering of uncles)? My default: the full nội/ngoại distinction, because it is
   the thing that makes the output feel Vietnamese rather than translated.
2. **Which side of the family is "your father's brother"?** The term depends on
   whether the link is through the father or the mother — the path alone may not be
   enough if we allow the same person to be reachable two ways. Confirm the
   intended behaviour.
3. **Do we name relations through marriage?** ("Your wife's sister" → *em vợ*?) Or
   stop at the last blood link and say "related through marriage"?
4. **What do we do with a path we have no term for?** Show the path in words, show
   a generic "relative", or refuse? My default: always answer — a longer path with
   a plain description beats a blank.
5. **Caching.** Compute per request, or memoise per family for the session? My
   default: per request in this series; measure before caching, per the standing
   rule.
6. **Does the engine ever write?** My default: no — it is a reader of the graph,
   and keeping it pure is what lets 18a be a unit test.

**Sources to gather.** A trusted reference on Vietnamese kinship terminology
(`RESOURCES.md` has carried this gap since session 1 — it is the blocker for 18c);
a standard BFS/shortest-path reference; the mermaid-free, text explanation of
generation offsets if one exists.

---

## Series 19 — The Tree

**Goal.** Draw the graph. The first feature whose *primary* difficulty is on the
client, and the first state the client genuinely owns.

**Why now.** Must-ship item 7. It is also the payoff: after 17 and 18 the server
knows everything, and this series proves it can be looked at.

**Lessons**

- **19a — the tree read API.** One payload shaped for a layout — nodes and edges,
  filtered to a depth — and why the client should not fetch the whole family to
  probably discard half of it.
- **19b — the first render.** Install Cytoscape.js, take the API payload, draw the
  graph. Plain, unstyled, unglamorous — a correctness step, not a design step.
- **19c — layout and brand.** Choose and configure a layout (dagre vs breadthfirst),
  then style it against the KinLink tokens. The pixel-DNA visual language arrives
  here or nowhere.
- **19d — the client owns this: selection, pan, zoom.** The **counter-case to
  Reference 13**: layout and selection are *client* state, they must survive a
  re-render, and no invalidation will ever fix them. This is where a store finally
  earns its place, and the lesson argues it rather than installing it.
- **19e — when the family is big.** A payload with 400 nodes; measure, then decide
  between depth limits, lazy expansion, or virtualisation. A performance sitting
  with a real number in it.
- **19f — practice.**

**New concepts.** Nodes-and-edges as a wire format; graph layout algorithms;
canvas/SVG rendering and its accessibility cost; **client-owned state** (the
counter-case the whole course has been waiting for); measuring before optimising.

**Open questions**

1. **Which layout, and what does it show?** Ancestors up and descendants down
   (dagre), or a radial "how am I related to everyone" (concentric/breadthfirst)?
   My default: **dagre**, vertical, because a family tree is the mental model a
   relative already has.
2. **How much at once?** The whole family, or N generations around a focus person
   with expand-on-click? My default: **N generations around a focus**, because it
   is the only option that keeps working as the family grows.
3. **Is the tree editable?** Can you add a person or an edge by clicking the graph,
   or is it read-only with editing on the list screen? My default: **read-only in
   this series** — the edit paths already exist on the people screen.
4. **Accessibility.** A canvas graph is invisible to a screen reader and to the
   keyboard. Is a text-equivalent list (which 18d's bulk read makes cheap) a
   requirement or a nicety? My default: a requirement, but confirm — it changes
   how much of 19 is "the list under the picture".
5. **Does the tree need the kinship terms on hover?** That couples 19 to 18d's
   payload. My default: yes, since 18 already computes them.

**Sources to gather.** Cytoscape.js layout guidance (the `blog.js.cytoscape.org`
layouts post is already in `RESOURCES.md`); the dagre layout docs; a note on
rendering graphs accessibly.

---

## Series 20 — Events: birthdays, anniversaries, lễ giỗ

**Goal.** Dates that recur, in the right calendar. The hardest correctness problem
in the product, and the one most specific to the Vietnam-first domain.

**Why now.** Must-ship item 9. It depends only on 16, so it can be pulled forward
if the graph work needs to breathe.

**Lessons**

- **20a — an event and a date.** The `Event` model; a **date-only** column and why
  a birthday is not a timestamp; the migration, and the same
  one-thing-per-migration discipline.
- **20b — recurrence and "next occurrence".** Annual events; computing the next one;
  and the timezone pitfall — `new Date("2026-03-14")` is UTC midnight, so a naive
  arithmetic off-by-one-day hides until the first Vietnam-time user sees it.
- **20c — the lunar calendar.** Solar ↔ lunar conversion, and the **Vietnamese**
  variant: Vietnam's UTC+7 offset means the lunar month boundary sometimes falls a
  day (and occasionally a month) away from the Chinese calendar. A library or a
  table — a real decision, argued.
- **20d — lễ giỗ.** Deriving a death anniversary from a death date on the lunar
  calendar, including the **leap month** (tháng nhuận) problem: what does "the same
  lunar day" mean in a year with a repeat month?
- **20e — the upcoming screen.** Today, this week, this month; the next giỗ per
  person; the client, on the transport and the cache 16 established.
- **20f — practice.**

**New concepts.** Date vs instant; date-only storage; recurrence rules; timezone
arithmetic and the UTC trap; calendar conversion; leap months; deriving a recurring
date from a stored one.

**Open questions**

1. **Library or implement?** A maintained Vietnamese lunar-calendar package, or our
   own conversion table? My default: prefer a **verified** library, because a
   calendar is exactly the kind of thing not to hand-roll — and verify it against
   known lễ giỗ dates before trusting it.
2. **How far back and forward?** Lunar data is finite (many libraries cover a
   fixed range). Does the range cover a person born in 1930 and a giỗ in 2090? My
   default: state the range the library supports and fail loudly outside it.
3. **Which events first?** Birthdays, death anniversaries (giỗ), wedding
   anniversaries, or all three? My default: **all three**, one model, because they
   are the same shape.
4. **Reminders?** Do we notify (email/push) or only show a list? My default: a list
   only in this series; notification is infrastructure (week 7–8) and a separate
   decision.
5. **Unknown dates.** Many relatives will have a year but no day, or nothing at
   all. Sort them last silently, or show them as "date unknown"? My default: show
   them, labelled — a genealogy app that hides incomplete ancestors is lying about
   the family.
6. **Whose timezone decides "today"?** The server's, or the family's? My default:
   the server is authoritative and runs in one timezone; record that as a known
   limitation rather than pretending otherwise.

**Sources to gather.** A trusted Vietnamese lunar-calendar reference **and** a
library to evaluate (`RESOURCES.md` gap since session 1); `Intl.DateTimeFormat`
timezone behaviour; a note on `@db.Date` in Prisma and why it avoids the offset
problem.

---

## Open questions from lessons already written

These were raised in the 15/16 lessons and are still unanswered. They are small,
and each is a "decide once, then apply in one commit" choice.

1. **May admins manage invitations?** The client offers it; the server requires
   `owner`. Decide once, change both in the same commit (`NOTES.md`).
2. **Who may write people?** Default is any member; delete could be `admin`.
3. **Hard delete or soft delete?** 17's cascade question forces this — see 17 Q6.
4. **Should `ApiError` carry the server's prose?** Currently every refusal reads
   "That did not work". One change, three verbs.
5. **Does `useSession` migrate to TanStack Query?** The trigger was "when a mutation
   must invalidate a read" — login and logout are already that.
6. **Zod's trigger** is a third resource needing shape validation. 17 is that
   third resource — so 17 should decide it.

## Sequence

```
16 people ──┬─▶ 17 relationships ──▶ 18 kinship engine ──▶ 19 the tree
            └─▶ 20 events (independent; can run in parallel)
```

Author in order 17 → 18 → 19, with 20 available as a change of scene. Each series
is authored **after** the one before it is applied, so its code can be verified
against a real tree.
