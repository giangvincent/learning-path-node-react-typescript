# Isolation bug found, and the reasoning corrected toward dependency direction

Session 4. After lesson 02 the user identified the data-isolation defect in
`findAll()` on their own: *"The fix is to list down the people in one family only, not
all the person."* Correct destination, incomplete mechanism — the answer did not say
**where the family id comes from**, which is the property that actually provides
security.

They attributed the service/model split to SOLID and separation of concerns. That is
adjacent rather than wrong, and I steered them toward the sharper framing: the model
answers a **fact** ("which rows match this familyId"), the service answers a
**policy** ("which family may this caller see"). Dependency direction survives a
follow-up question; the acronym does not.

## Evidence

- Found the isolation bug unprompted, from the exercise, and articulated the intended
  outcome in one sentence.
- Independently diagnosed two real problems during the lesson build and fixed both:
  1. `prisma init --output ../server/generated/prisma` resolved relative to the schema
     file, not the shell, so the generated client was never written to the intended
     path. Recovered without help.
  2. `npm audit` reported vulnerabilities in Prisma's transitive dependencies; resolved
     by adding npm `overrides` for `deepmerge-ts`, `mariadb` and `mysql2`. Verified:
     audit now reports 0 vulnerabilities and all three resolve to current versions.
- `git status` clean at two commits; `npm run typecheck` passes for both tsconfigs;
     `GET /api/people` returns real rows from MySQL with Vietnamese diacritics intact
     through the full stack.

## Implications

- **The baseline is now measured, not self-reported.** Self-description was "knows the
  basics" with TypeScript and server-side Node weak. The evidence points higher: they
  read error output, formed a hypothesis about path resolution, and fixed it. The
  remaining weakness is conceptual vocabulary, not tooling.
- **Expect to push on "why", not "how".** They reach for the nearest familiar acronym.
  Asking "what would break if this were the other way round?" gets a better answer than
  asking them to justify the principle.
- **Week 3 lesson (0004) is written and ready.** Authentication replaces the
  placeholder constant. The tenancy rules are already established, so that lesson can
  assume them rather than re-teach them.
- **Two open items carried into the review:** the error handler still returned
  `error.message` to the client unconditionally (lesson 03 exercise 3 fixes it), and
  `findAll()` was still unscoped (lesson 03 step 1 fixes it). Both were verified still
  present at session end — confirm they are closed before starting lesson 04.
