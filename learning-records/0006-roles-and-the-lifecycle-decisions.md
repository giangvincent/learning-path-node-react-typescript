# Roles landed, and the handoff machinery did not

Session 7. Two findings, one of which is about the tooling rather than the code.

**Lesson 06 was implemented by hand and it is faithful.** The Paseo handoff agent
errored and produced nothing, yet `main` contains `fb9f865` ("Replace User.familyId with a
family_members relationship; scope /families/:slug") and `8fffeb5` (seed cleanup). Reading
the result: `loadFamily` answers 404 for both "no such family" and "not a member" with an
identical body; `findMembershipWithFamily` is the single query with the membership in the
`WHERE` clause; the service collapses both failures into one `null`; the session holds
`userId` only; `AuthResponse` no longer carries `familyId`; `checkGuards` was updated to
the placeholder path. `npm run typecheck` exits 0 and `npm run check:guards` prints
`ok   /api/families/__probe__/people -> 401`. The `role` column exists and **nothing reads
it** — which is precisely the gap lesson 07 fills.

**The Paseo route to this work is not viable here.** MCP tools were not connected in the
session; the daemon and Docker Desktop were both stopped; **none of the 16 configured
profiles carries a `notes` field**, so the handoff skill's profile-selection rule selects
nothing and the documented fallback (provider discovery) is the only path. `codex` then
failed in both of its routes — `403` from the local `command-code` proxy, and the native
`gpt-6.*` / `gpt-5.6-*` models rejected because the Codex CLI is authenticated with a
ChatGPT account. `pi` works, but the agent launched there errored too.

## Implications

- **Do not reach for a Paseo handoff unprompted, and treat its output as unverified.**
  The user builds the lessons themselves and does it well; the detour cost a full
  session's worth of infrastructure work and delivered nothing. If a handoff is requested
  again, launch it — but check what actually landed before assuming anything did, and
  prefer a worktree plus a dedicated database so a failure cannot touch the real project.
- **The user's reading is careful enough that the lesson *is* the deliverable.** The
  implementation matches the designed shape file-for-file, including the details that
  were only justified in prose (the identical 404 bodies, the collapse happening in the
  service). Keep writing lessons that specify *why*, because that is what is being
  reproduced — not just the code.
- **The four questions are now Reference 07**, and two of them are the kind that keep
  returning in interviews: **404-vs-403 is a documented trade-off, not a law** (with a
  real counter-argument for authenticated callers), and the collapse is *client-facing* —
  the server must still distinguish the branches in its own logs. The other two —
  invitation tokens as bearer credentials, and one-query-vs-two as a question of
  *unrepresentability rather than speed* — are each worth their own future lesson.
- **Lesson 07 is the first codebase-level invariant** ("a family keeps at least one
  owner"), and the first place a transaction alone is genuinely insufficient: counting is
  a read, so it needs `SELECT … FOR UPDATE` behind it. The MySQL manual's counter example
  is the authoritative framing. `npm run check:ownership` is the runnable proof, and it is
  deliberately a concurrency check rather than a unit test, because a mocked race never
  happens.
- **The code comment predicted the refactor.** `user.model.ts` says "when a second
  [transaction] appears, extract a `Db` type and thread it through the model functions".
  A second one appeared, and the `Omit<PrismaClient, …>` shape was **verified by compiling
  a probe** (`TSC_EXIT=0`) before the lesson was published — including `tx.$queryRaw`. This
  is now the second time a Prisma/TypeScript assumption was checked empirically rather
  than asserted; keep doing that.

## Evidence

- `npm run typecheck` → exit 0; `npm run check:guards` → `ok /api/families/__probe__/people -> 401`.
- `grep -rn "role" server/src` shows only three writes (register, seed) and no reads —
  confirming the authorisation gap.
- Probe compiled with `tsc --ignoreConfig --noEmit --strict --noUncheckedIndexedAccess
  --verbatimModuleSyntax …`: no errors, so both `prisma` and a transaction handle satisfy
  the `Db` type and `$queryRaw` is present on both.
- Lesson-06 artefacts confirmed present: `middlewares/family.ts`,
  `services/membership.service.ts`, `models/membership.model.ts`, `routes/family.routes.ts`,
  `server/src/types/express.d.ts`, and `people.routes.ts` deleted.

## Carried forward

- **Cleanup outstanding, offer rather than act:** a stale worktree at
  `~/.paseo/worktrees/1aizkxve/handoff-lesson-06` (branch `handoff/lesson-06`, still at
  `a6cede7`), and three errored Paseo agents (`12db0ba`, `3daaa0a`, `6955280`). Docker
  Desktop and the Paseo daemon are both running because this session started them — do
  not stop them unasked.
- **`Person.updatedAt` is still `@default(now())`** instead of `@updatedAt`. Flagged in
  lesson 06 and again here; the schema has now been touched twice without folding it in,
  which is correct (one migration, one thing) but it is the oldest known defect.
- **Sequence:** 08 = invitations (the token that stands in for membership), then the
  client. People CRUD and relationships — roadmap week 4 — is still unstarted, and the
  schedule pressure noted in record 0005 has not eased.
