# CIA Prep - roadmap

Shared status for every work session in this folder. Read this file and `CLAUDE.md` first, pick one open item, and update this file in the same commit as the work. Rules for content live in `CLAUDE.md`; this file only tracks what is done and what is next.

Live site: https://phucnduy.github.io/cia-prep/ (GitHub Pages, deployed by pushing `main`).

## Status (2026-11-20)

| Part | Questions | Full exam needs | Easy / medium / hard | Trap-tagged | Status |
|---|---|---|---|---|---|
| P1 Internal Audit Fundamentals | 505 | 125 (A44 B25 C37 D19) | 1 / 53 / 46% | 388 | ready |
| P2 Internal Audit Engagement | 89 | 100 (A50 B40 C10); now A38 B35 C16 | 7 / 55 / 38% | 6 | draft |
| P3 Internal Audit Function | 65 | 100 (A25 B15 C15 D45); now A19 B11 C7 D28 | 3 / 62 / 35% | 41 | draft |

Lessons: all topics of P1, P2 and P3 have detailed lessons. Re-run `npm run audit:bank` for current numbers and thin topics.

## Next work, in priority order

1. **P3 to a full exam (100), then 200.** Biggest gaps: section D (28 of 45 needed for one exam; D8 has only 2), C (7 of 15) and A (19 of 25). Every P3 topic has fewer than 10 questions.
2. **P2 to a full exam (100), then 200.** Section A needs 12 more for one exam; 17 topics have fewer than 10.
3. **Raise hard share and traps.** P3 hard is 26% (aim 40%). New batches: at least 60% trap, easy at most 10%.
4. **Cross-part repeats** (same concept in P1 and P2/P3, lower priority since parts are separate exams): P2-A-M22 / P1-C-N09 (RTO and RPO), P2-B-H03 / P1-D-L013 (Benford), P2-C-M01 / P1-B-M21 (outsourced engagement, CAE still responsible), P3-D-003 / P1-C-L027 (cost-benefit). Also P2-A-005 / P2-A-M19 (missing analytics skills) is a mild hint pair.
5. **More "what first" sequence questions.** P1 has 11 of 505.
6. **Topical Requirements lessons** (third-party, organizational behavior), from IIA's published Topical Requirements.
7. **`guide.json` fees**: IIA changes fees from 4 January 2027; re-check on theiia.org then. Also confirm the reschedule notice period: the guide says 48 hours, a third-party page says 24 hours; check the current IIA Candidate Handbook.
8. **Content review by a CIA holder.** Nobody holding a CIA has reviewed the content yet.

## How to run one question batch

1. Pick topics from `npm run audit:bank` (thin topics first). Read the lesson and search the bank for the concept to avoid giveaway pairs. Write to the standard in `docs/nguyen-tac-bien-soan-ra-soat.md` and self-review with its checklist (section 6.1).
2. Check every GIAS citation: `node scripts/gias-req.mjs 9.5 11.5` prints the Requirements text (`--full` adds Considerations).
3. Write the batch as JSON in a temp file (ids like `P3-D-N07`, with `topic`, `difficulty`, `optionNotes`, `refs`, and `trap` for trap questions).
4. `node scripts/batch-check.mjs <part> <file>`: balances answer positions, flags length tells, misaligned notes and near-duplicates. Fix and re-run until "no problems".
5. `node scripts/add-questions.mjs <part> <file>` (use `--replace` to rewrite existing ids).
6. `npm run validate`, `npm test`, `npm run build`; check one practice session in the browser (reload so the new data loads).
7. Commit with the batch name, push `main`, confirm the GitHub Actions run succeeds, update this file.

## Working in parallel

Two sessions must not edit the same `public/data/<part>/questions-<section>.json` at the same time. Give each session its own part or section, or run them one after another. Batch ids include the part and section, so they never collide across sessions.

## Done (recent)

- 2026-11-21: P3 batch S for section A (11 questions, 6 hard, all trap; citations checked against the must/should list): updating methodologies after significant change (9.3), outsourced work follows the function's methodology (4.1, 9.3), mandated public-sector HR frameworks (10.2), rotation programs and the 12-month rule (10.2, 2.2), CAE succession with the board (10.2), budget variances (10.1), adjusting strategy when the organization changes course and prioritizing initiatives (9.2), CAE attending management meetings (11.1), what to tell the CEO after a private session about the CEO (6.3), discussing disagreements with senior management before the board (8.1). Dropped one on subsidiary audit heads talking to local management: same misconception (independence means no contact) as P3-A-S10 and P3-D-S05.
- 2026-11-21: P3 batch S for section D (12 questions, 7 hard, 11 trap; every GIAS citation checked against the must/should list): external release needs legal or senior management advice (11.3), precise wording (11.2), only significant errors must be re-sent (11.4), tracking an alternative action plan (15.2), discussing recommendations with management (14.4), content of an overall conclusion (11.3), unacceptable risk without a formal appetite statement (11.5), accepted risk within appetite needs no escalation, implemented but ineffective action plans, prioritizing findings (15.1, 14.3), board reporting per agreed expectations, timely communication of themes. A 13th (CEO-owned overdue plan) was dropped: it repeated P3-D-007.
- 2026-11-21: must/should scan of the whole bank. scripts/gias-must-should.mjs builds a local list of every GIAS must (Requirements) and should (Considerations) sentence plus Essential Conditions (kept outside the repo; GIAS is copyrighted). 209 sentences that state a GIAS rule as required were checked; 8 fixed: board or senior management duties written with 'phải' now say 'cần' (P1-A-N17, N18 incl. its correct option, N19, M40), and three citations corrected (P1-B-M01 report clarity is 15.1, P1-B-N06 sample size is not required in the report, P1-B-M09 independent assurance over the CAE's own areas is 7.1).
- 2026-11-20: P2 and P3 repeat check (all 131 questions read). Rewritten, same ids: P2-B-M02 (repeated P2-A-006 on full-population analytics; now internal control questionnaires as a lead, not evidence), P2-A-M02 (gave away P2-A-M01 on Topical Requirement exclusions; now objectives vs scope, GIAS 13.3), P2-A-M04 (gave away P2-A-M16 on advisory agreement; now scope sufficient for the objectives, GIAS 13.3), P2-B-M09 (repeated P2-B-H02 on concluding when no findings; now recommendations that fix the cause), P3-D-003 (repeated P3-D-H03 on management action plans; now proportionate recommendations), P3-B-003 (gave away P3-B-H02 on board approval of plan changes; now a reserve for emerging risks), P3-C-L001 (gave away P3-C-H01 on conformance claims; now internal assessments go to the external assessors, GIAS 12.1). Stems edited so they no longer reveal another answer: P2-B-M15 (listed the sampling details that answer P2-A-M15), P3-D-N05 (stated the escalation that answers P3-D-005). P1-B-M34 now also cites GIAS 1.3 (claiming a certification never earned). P3 hard share fell to 24%.
- 2026-11-20: P1 cross-section repeat check (scripts/cross-pairs.mjs ranks pairs by stem and answer overlap; top 70 read). Rewritten, same ids: P1-C-019 (repeated P1-A-049; now internal non-financial reporting as a COSO reporting objective), P1-C-L007 (repeated P1-A-M43; now COSO principle 9, assessing significant change), P1-C-M19 (repeated P1-A-N38; now gifts to officials during a pending decision), P1-B-M34 (repeated P1-D-M09; now using the CIA title before certification, GIAS 1.1). Removed P1-A-H03 and P1-A-M36: with P1-A-H01 they formed a cluster of three on the CAE's roles beyond internal audit, all answered by an independent outside party. Left as is (same principle, different scenario): P1-A-H01 / P1-B-M09.
- 2026-11-20: section D near-pairs fixed by rewriting one of each (same ids): P1-D-N07 (repeated P1-D-004 on lapping) now covers a payroll clerk raising their own pay (master-data change approval and log review); P1-D-M19 (repeated P1-D-H05 on digital evidence) now covers sizing the full loss before closing an investigation; P1-D-M14 (repeated P1-C-022 on owner review) now covers a signature stamp used by the person who prepares payments.
- 2026-11-20: P1 section D trap-tagged (68 more; 69 of 83). P1 trap tagging finished: 389 of 507 (77%); untagged ones are recall items or have no clear misconception distractor. Removed P1-D-S01: it repeated the collusion scenario of P1-D-M23.
- 2026-11-20: section C near-pairs fixed. P1-C-L005 (repeated P1-C-L004 on soft-control evidence) now covers deviations not addressed in time (COSO 2013 principle 1); P1-C-M54 (repeated P1-C-010 on risk tolerance) now covers new risks created by a risk treatment (ISO 31000). 'Dung sai rủi ro' replaced by 'ngưỡng chịu đựng rủi ro' across P1-P3 lessons, frameworks and questions; term added to CLAUDE.md 1b.
- 2026-11-20: P1 section C trap-tagged (112 more; 117 of 159). P1-C-S01: correct option no longer says 'theo một giao dịch', which gave away P1-C-020 (walkthrough shows design only).
- 2026-11-20: P1 section B trap-tagged (79 more; 81 of 102). Removed P1-B-S02: it repeated the derivatives-model scenario of P1-B-015. 
- 2026-11-20: two near-pairs fixed by rewriting one question of each: P1-B-M22 (was a repeat of P1-B-H04) now covers negative bias from a personal conflict; P1-B-M24 (was a repeat of P1-B-006) now covers the familiarity threat after long tenure and rotation as a safeguard. Same ids, so sessions in progress are not affected.
- 2026-11-20: P1 section A trap-tagged (121 of 163; the other 42 have no clear misconception distractor). Removed P1-A-S01 and P1-B-S01 from batch S: they repeated the scenarios of P1-A-H02 and P1-A-H05 (batch-check did not flag them, so search the bank by concept, not only by wording).
- 2026-11-20: P1 batch S (11 questions, all trap-tagged, 7 hard, 7 "what first" stems): advisory-then-assurance (2.2), impairment found after the report (2.3), missing expertise (3.1), skepticism (4.3), lost laptop (5.2), design before operating tests, compliance obligations inventory, compensating control, unregistered risk, collusion, revenue cut-off fraud.
- 2026-11-20: all wrong-option notes now explain the error (240 notes in 182 questions rewritten; none under 45 characters), 9 more throwaway distractors replaced; writing and review standard published in docs/nguyen-tac-bien-soan-ra-soat.md; validator bar raised to 45 characters; scripts/review-notes.mjs added.
- 2026-11-20: quality pass after comparing with Gleim's Part 1 quiz: 72 questions got real wrong-option notes (why wrong, what is right), 27 throwaway distractors in 18 questions replaced with plausible misconceptions, giveaway pair P1-C-M43 / P1-B-N10 removed (M43 rewritten), one typo fixed; validator now warns on wrong-option notes under 35 characters.
- 2026-11-20: guide facts re-checked on theiia.org after reviewing Gleim's resource pages: online proctoring ended 28/5/2025, no immediate unofficial score from 1/4/2026, Challenge Exam format (150 questions, 180 minutes, 5 sections from June 2026). Pass rates left out: IIA's pass-rate page no longer shows them.
- 2026-11-17: Vietnamese terms follow Decree 05/2019 (Quy chế, bộ phận KTNB, kiến nghị, hồ sơ kiểm toán); validator rejects the old terms.
- 2026-11-17: trap field and trap notes; easy capped at 10%; 22 new P2/P3 questions; diagnostic quiz, live accuracy, pool filter, difficulty labels, cheat sheet, term games.
- 2026-11-16: graphic layer (section icons, hero art, weight donuts, progress rings).
- 2026-11-13: full GIAS review of lessons and citations; detailed P2 and P3 lessons.
