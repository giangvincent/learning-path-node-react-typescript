# Session 9 — invitations: propose → accept → expire

## What happened

Lesson 09 builds the invitation flow as a stateful protocol (propose → accept → expire),
motivated by the counter-case in Lesson 08: transfer is the repair for last-owner;
invitations formalise the same concern — someone else must agree before membership.

## Key learnings

- **Invitation is a credential, not a URL.** Raw token generated, sent once, never stored.
  Hash is what the server keeps — same rules as passwords per OWASP Forgot Password Cheat Sheet.
- **Compare-and-set beats check-then-write.** `updateMany` with `usedAt: null` in the WHERE clause
  is atomic; `count !== 1` means the race was lost. Expiry check is inside the same statement,
  so expired and used collapse to one response — the right amount of information for a stranger.
- **Two endpoints, one resource.** Registration creates your own family; acceptance joins someone
  else's. Split matters because the invitee is often already a user.
- **Two authorisation rules:** granted role ≤ inviter's rank (service, before token creation);
  identity from the session, never the body (userId is never a parameter).
- **Race window: check → accept.** The seam is the same shape as lesson 08's race window —
  the gap between reading the token's state and writing the claim. The fix is one conditional
  write, not a lock, because the database arbitrates the race directly.

## Evidence

- `npm run typecheck` exit 0 (after one real error caught in probe — model function called via module before it existed).
- `npm run check:guards` passes — public routes above `apiRouter.use(requireAuth)`, protected below.
- Race probe: two concurrent accepts of the same token → exactly one succeeds, the other gets 409.
  Without compare-and-set → two memberships for one invite.
- Compile probe with lesson's verbatim code shapes against generated Prisma client: verified `updateMany` + `findFirst` pattern, `InvitationResult` discriminated union, `hashToken` call consistency.

## Open / carried forward

- **Shareable vs targeted invite:** shareable links (no email) let anyone with the link join;
  targeted invites leak existence by design. The rank check applies to both. Product decision
  for a real family — not ours yet.
- **Token expiry vs last-owner guard:** if the only owner invites someone and the invite expires
  before acceptance, the family has no way to add a member. This is a real product question —
  the owner should be able to resend or extend, but that's a protocol change, not a bug.
- **Idempotency keys on accept:** the accept endpoint is not naturally idempotent — two clicks
  with the same token should be safe, but the first consumes the token. The second gets 409.
  Whether that's acceptable or needs a retry-after header is a product question.
- **Invitation list UI:** pending invites with expiry — lesson 10 territory.