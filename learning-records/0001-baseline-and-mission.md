# Baseline established: "knows the basics", and the mission is capped by ~160 hours

Session 1. The user self-reports comfortable JavaScript and React basics, with
TypeScript and server-side Node as the weakest areas. The stated goal is a
senior-level engineering role within two months, proven by shipping **KinLink** — a
private family networking and genealogy platform with the family tree at its centre —
to production, with real relatives using it.

## Implications

- **The budget forces a cut.** At 10–20 h/week for 8 weeks that is 80–160 hours. The
  full KinLink Phase 1 spec is realistically 400–600 hours for one person. So
  [ROADMAP.md](../ROADMAP.md) defines an explicit must-ship core and explicitly
  defers feed, memories, AI historian, billing, Meilisearch and the admin dashboard.
  This cut should be revisited weekly, not treated as fixed.
- **Build-as-we-learn was chosen** over theory-first. Lessons must therefore end in
  committed, running code — a lesson that produces only notes has failed here.
- **TypeScript is the highest-leverage gap**, because it is the medium of both the
  frontend and the backend. The first lesson teaches literal types, `as const`,
  `keyof typeof` and type guards through the brand package rather than through
  abstract exercises.
- **The logo is the opening hook.** The user supplied the KinLink mark and asked to
  start from it, so brand lives in a shared package from the first commit, and the
  first deliverable is visual.

## Evidence

Self-report only. No code has been reviewed yet, so the depth of "knows the basics"
is unverified. Calibrate after lesson 0001 by reading what was actually built and
asking the user to explain it back.
