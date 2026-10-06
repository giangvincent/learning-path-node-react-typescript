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
