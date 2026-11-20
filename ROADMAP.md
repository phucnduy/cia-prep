# CIA Prep - roadmap

Shared status for every work session in this folder. Read this file and `CLAUDE.md` first, pick one open item, and update this file in the same commit as the work. Rules for content live in `CLAUDE.md`; this file only tracks what is done and what is next.

Live site: https://phucnduy.github.io/cia-prep/ (GitHub Pages, deployed by pushing `main`).

## Status (2026-11-20)

| Part | Questions | Full exam needs | Easy / medium / hard | Trap-tagged | Status |
|---|---|---|---|---|---|
| P1 Internal Audit Fundamentals | 500 | 125 (A44 B25 C37 D19) | 1 / 53 / 46% | 0 | ready |
| P2 Internal Audit Engagement | 89 | 100 (A50 B40 C10); now A38 B35 C16 | 7 / 55 / 38% | 6 | draft |
| P3 Internal Audit Function | 42 | 100 (A25 B15 C15 D45); now A8 B11 C7 D16 | 5 / 69 / 26% | 16 | draft |

Lessons: all topics of P1, P2 and P3 have detailed lessons. Re-run `npm run audit:bank` for current numbers and thin topics.

## Next work, in priority order

1. **P3 to a full exam (100), then 200.** Biggest gaps: section D (16 of 45 needed for one exam) and A (8 of 25). Every P3 topic has fewer than 10 questions.
2. **P2 to a full exam (100), then 200.** Section A needs 12 more for one exam; 17 topics have fewer than 10.
3. **Raise hard share and traps.** P3 hard is 26% (aim 40%). New batches: at least 60% trap, easy at most 10%.
4. **Tag `trap` on existing P1 questions.** Needs a read of each question; do it by section (A, then B, C, D), one session per section.
5. **More "what first" sequence questions.** P1 has 8 of 500.
6. **Topical Requirements lessons** (third-party, organizational behavior), from IIA's published Topical Requirements.
7. **`guide.json` fees**: IIA changes fees from 4 January 2027; re-check on theiia.org then. Also confirm the reschedule notice period: the guide says 48 hours, a third-party page says 24 hours; check the current IIA Candidate Handbook.
8. **Content review by a CIA holder.** Nobody holding a CIA has reviewed the content yet.

## How to run one question batch

1. Pick topics from `npm run audit:bank` (thin topics first). Read the lesson and search the bank for the concept to avoid giveaway pairs.
2. Check every GIAS citation: `node scripts/gias-req.mjs 9.5 11.5` prints the Requirements text (`--full` adds Considerations).
3. Write the batch as JSON in a temp file (ids like `P3-D-N07`, with `topic`, `difficulty`, `optionNotes`, `refs`, and `trap` for trap questions).
4. `node scripts/batch-check.mjs <part> <file>`: balances answer positions, flags length tells, misaligned notes and near-duplicates. Fix and re-run until "no problems".
5. `node scripts/add-questions.mjs <part> <file>` (use `--replace` to rewrite existing ids).
6. `npm run validate`, `npm test`, `npm run build`; check one practice session in the browser (reload so the new data loads).
7. Commit with the batch name, push `main`, confirm the GitHub Actions run succeeds, update this file.

## Working in parallel

Two sessions must not edit the same `public/data/<part>/questions-<section>.json` at the same time. Give each session its own part or section, or run them one after another. Batch ids include the part and section, so they never collide across sessions.

## Done (recent)

- 2026-11-20: guide facts re-checked on theiia.org after reviewing Gleim's resource pages: online proctoring ended 28/5/2025, no immediate unofficial score from 1/4/2026, Challenge Exam format (150 questions, 180 minutes, 5 sections from June 2026). Pass rates left out: IIA's pass-rate page no longer shows them.
- 2026-11-17: Vietnamese terms follow Decree 05/2019 (Quy chế, bộ phận KTNB, kiến nghị, hồ sơ kiểm toán); validator rejects the old terms.
- 2026-11-17: trap field and trap notes; easy capped at 10%; 22 new P2/P3 questions; diagnostic quiz, live accuracy, pool filter, difficulty labels, cheat sheet, term games.
- 2026-11-16: graphic layer (section icons, hero art, weight donuts, progress rings).
- 2026-11-13: full GIAS review of lessons and citations; detailed P2 and P3 lessons.
