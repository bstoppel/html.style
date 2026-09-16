# Yearly standards snapshot

> Decision record for [#61](https://github.com/bstoppel/html.style/issues/61).
> Status: Accepted.

CLAUDE.md states the browser floor — currently "2026 Baseline" — as a fixed
fact. Nothing says what happens in 2027, or any year after: whether the floor
ever moves again, who decides, when, or how a consumer finds out. That gap
was part of what blocked #60: publishing to npm commits the project to a
versioning and deprecation policy it didn't have.

## Decision

The floor is reviewed once a year and re-set every December 31.

**During the year**, development stays trunk-based, as everywhere else in
this project. Code that raises the floor merges to `main` through ordinary
small PRs; nothing structural blocks it. What doesn't move mid-year is the
*stated* floor — the CLAUDE.md heading, the no-polyfill boundary, and the
published baseline. Releases during the year are versioned
`{year}.{timestamp}.0` (year as major, the Unix epoch second of publish as
minor, patch fixed at `0`) and published under an npm dist-tag named for the
year, so `2026` always resolves to the newest 2026 publish. Epoch seconds
avoid the leading-zero restriction plain semver numeric identifiers carry.

**The lock** is nothing more than December 31 arriving. Whatever was most
recently published under that year's tag is the snapshot — the stated floor
catches up to it, and CLAUDE.md's baseline section is updated to match. No
separate action moves the tag; it simply stops advancing once nothing new is
published under it.

**Bug fixes found after lock** patch the frozen timestamp:
`{year}.{final-timestamp}.1`, `.2`, and so on. The year and the timestamp
stay fixed; only the patch slot is live.

**The criterion for what moves the floor** is not a version-count offset.
CLAUDE.md already rules that out for *describing* the floor ("current - 4"
means something different in Chrome, which ships every four weeks, than in
Safari, which ships once a year) and the same reasoning applies to *setting*
it. Each year names a specific feature that has newly reached Baseline and
sets the floor there — the method that picked full Relative Color Syntax
support for 2026. Favor Newly Available over waiting for the two-year Widely
Available mark: the point is to move with the platform, not trail it.

**If no feature qualifies in a given year**, the floor holds. The year still
cuts a tag on schedule, for timeline consistency, but its stated baseline
carries over unchanged from the year before.

**`npm install html.style` with no tag** resolves to the most recently
*locked* year, not the current year's rolling line. A first-time installer
gets a frozen, complete baseline rather than a still-in-progress one — the
current year's releases are explicitly the experimentation-and-bug-fix line
until it locks. Anyone who wants the current year's motion asks for it by
tag (`html.style@2026`). This wasn't explicit in the conversation that
produced the rest of this record; flagged here as the default and open to
being overridden.

**Finding next year's candidate features** is manual today. A future scanner
against the `web-features` dataset — the same data MDN's and caniuse's
Baseline badges draw from — should surface qualifying features automatically
instead of requiring research from scratch each December. Tracked as
follow-up work, not a blocker on this decision.

## What this changes

CLAUDE.md's "Browser Support" section gains a stated process (this record,
linked) instead of reading as a one-time fact. `package.json`'s version
moves off semver onto the scheme above. #60's npm-publish blocker is
resolved on the versioning question; the `website/` question is untouched.

## Revisit when

Never, in the sense that matters: this record *is* the yearly revisit
mechanism, not an instance of it. A future change to the cadence, the lock
date, or the criterion is itself a new decision record, not an edit to this
one.
