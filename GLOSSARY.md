# KinLink Glossary

The canonical vocabulary for this workspace. Lessons use these terms and nothing
else. A term is promoted here once the user has used it correctly — this file is a
record of compressed knowledge, not a list to read and learn from.

## The project

**Website project**:
One folder holding the client, the server, the shared contracts and the config, run
by a single command. KinLink is one website project — not a monorepo of packages.
_Avoid_: monorepo, workspace, apps/packages

**Client**:
The React + TypeScript application that runs in the browser. Owns presentation and
interaction.
_Avoid_: frontend app, UI package

**Server**:
The Node + Express + TypeScript application that owns the data, the rules and the
permissions. Runs on a machine the user does not control.
_Avoid_: backend app, API package

**Contract**:
A type both the client and the server compile against, so a change on one side is a
compile error on the other. Lives in `shared/contracts/`.
_Avoid_: shared package, DTO library

**Route**:
A single URL pattern bound to a single controller function.
_Avoid_: endpoint, path handler

**Endpoint** vs **Route**: an endpoint is the URL the outside world calls; a route is
KinLink's internal binding from that URL to a controller.

**Middleware**:
A function that runs on the way into (or out of) a request for a concern that is not
business logic: authentication, family context, validation, error handling.
_Avoid_: interceptor, filter

**Request lifecycle**:
The fixed path a request travels: route → middleware → controller → service → model →
database → view → response. Knowing it by heart is what makes a layer violation
obvious.

## Back-end architecture (MVC)

**MVC (Model–View–Controller)**:
The pattern KinLink's server is organised around: the **model** owns data, the
**view** owns the shape of the response, the **controller** owns the HTTP boundary.

**Model**:
The layer that knows how data is stored and retrieved. The only place database
queries are allowed to exist.
_Avoid_: schema, entity

**View**:
In this JSON API, the layer that turns a domain object into the **resource** the
client is allowed to see. It shapes output; it never queries the database.
_Avoid_: template, page, screen

**Controller**:
The layer that takes an HTTP request, calls exactly one service, and chooses the
status code and response. Contains no business logic.
_Avoid_: handler, action

**Service**:
The layer where business rules live — permissible, testable, and unaware of HTTP. It
never sees a `Request` or a `Response`.
_Avoid_: manager, helper, use case (use case is close; KinLink uses "service")

**Resource**:
The JSON shape a view produces for the client. Deliberately not the database row.
_Avoid_: DTO, payload, view model

**Repository**:
An alternative name for a data-access layer. KinLink calls this layer **model**.

## Data

**ORM**:
A library that maps objects in code to rows in tables. KinLink uses Prisma.
_Avoid_: query builder

**Migration**:
A versioned, committed change to the database schema, applied in order and never
edited after it has run in a shared environment.
_Avoid_: schema update, script

**Backfill**:
Filling a column that already has rows with a value it never had. Its own step, in
batches, because the row count is the cost — and never `NOW()`, which invents a
history rather than recovering one.
_Avoid_: data fix, update script

**Expand-and-contract migration**:
Changing a live column in three steps: add it nullable (expand), backfill the true
value, then tighten it to `NOT NULL` (contract). The order is forced by the engine,
not chosen for style — MySQL makes adding a column instant, but tightening one
rebuilds the table and fails on any remaining `NULL`.
_Avoid_: two-phase migration (vague about which phase is which)

## Query behaviour

**Keyset pagination (seek method)**:
Paging by filtering on the last row seen — `WHERE (created_at, id) < (?, ?)` —
rather than by a count. Immune to inserts between pages, which `OFFSET` is not:
the standard defines `offset` as sorting everything and then dropping the first N
rows, so a row inserted between two fetches shifts the page and the reader sees a
duplicate.
_Avoid_: cursor pagination (a cursor is the token; a keyset is the predicate)

**Bounded by construction**:
A list whose maximum size is enforced by a mechanism — an expiry, a uniqueness
rule, a cap — rather than merely expected to stay small. The test for whether a
list has earned pagination.
_Avoid_: small table (that is an observation; this is a guarantee)

## Concurrency and refusals

**Race condition**:
Two requests whose correctness depends on their interleaving: both read a fact, both decide, and the second decides on a world the first already changed.
_Avoid_: timing bug, thread bug

**Race window**:
The gap between reading the fact a decision depends on and writing the decision. Harm requires a collision *inside* the window — so a test that forces one there needs no luck.
_Avoid_: critical section (that is the locked part; the window is the unprotected gap)

**Lost update**:
The damage a race leaves behind: a write computed from a stale read, so one of two valid updates vanishes. "A family with zero owners" is a lost update against the owner count.

**Locking read**:
`SELECT … FOR UPDATE` — a read that takes an exclusive row lock until commit, so check-then-write decides on a serialized world. Only protective when taken *before* the transaction's first plain read.
_Avoid_: pessimistic lock (vague)

**Isolation level**:
A transaction-wide setting (READ COMMITTED … SERIALIZABLE) deciding what concurrent writes a read may see. Policy. A locking read is a tool.

**Seam**:
A place where behaviour can be altered without editing the code at that place (Feathers). KinLink's: the `RaceWindow` hook at the race window.

**Barrier (gate)**:
Two promises — one reporting arrival, one releasing — with which a test parks transactions at a seam and *decides* their interleaving instead of hoping for it.

**Idempotent**:
Safe to repeat: the second request's effect equals the first's, so a retry causes no harm. Leaving a family is; transferring ownership is not.

**Problem document**:
An RFC 9457 error body: `type`, `title`, `status`, `detail`, plus machine extensions — `code` (why, for branches) and `remediation` (what now, as data). `detail` is prose; never parse it.

## Client identity

**Session state**:
The client's belief about who it is, in four values: `loading`, `anonymous`,
`error`, `authenticated`. `anonymous` is a state and not a failure — it is what a
`401` produces, and it has a screen.
_Avoid_: auth flag, loggedIn boolean

**Identity read**:
A read whose answer depends only on who the caller is, never on a resource they
name. `GET /api/families` is one: it needs authentication and no authorisation
check, because there is no `:slug` to prove access to.
_Avoid_: profile endpoint

**Eviction** vs **verdict**:
Two different facts that arrive as the same `401`. An **eviction** means the
session is gone — a fact about the caller, which the whole app must react to. A
**verdict** means the input was wrong — a fact about one request, which only the
form that sent it cares about. The status code cannot tell them apart, so the
caller declares which question it asked (`expectsSession`).
_Avoid_: "a 401 is a 401"

**Notifier**:
A tiny module of listeners with a publish function, used when the layer that
notices an event must not import the layer that reacts to it. KinLink's:
`client/src/lib/session.ts`, so the transport can announce a dead session without
knowing React exists.
_Avoid_: event bus (accurate but grander than twenty lines of `Set`)

## Method

**Runnable check**:
A script that asserts one claim, prints what it saw, and exits non-zero when the
claim is false — no test framework, sometimes no database or port. KinLink's five:
`check:guards`, `check:ownership`, `check:invites`, `check:families`,
`check:session`. Deliberately not a unit test: a mocked race never happens.
_Avoid_: test (a check is not a suite; it is one claim)

## Brand

**Mark**:
The textless visual symbol of the brand — for KinLink, the pixel DNA helix. The
**logo** is the mark plus the wordmark.

**Grid (pixel grid)**:
A fixed lattice of square cells. The KinLink mark is drawn on one; every cell is
exactly one background, strand or rung cell.

**Pitch**:
The size, in source pixels, of one cell of the pixel grid.

**Raster** / **Vector**:
A raster image stores a grid of coloured pixels at a fixed size; a vector image
stores shapes that scale to any size. The logo arrives as a raster and is emitted as
vector.
