# CIA Prep - content rules

Every rule below exists because the mistake it prevents already happened once in this repo. Read before writing or editing questions, study cards or explanations.

## 1. Sources: verify, never cite from memory

- **Check every GIAS citation against the official text** before writing it. Get the condensed GIAS PDF from theiia.org (Standards > Condensed Global Internal Audit Standards) and search it with `pdftotext`. If a claim can't be found there, don't attribute it to GIAS.
- **Keep GIAS 2024 and IPPF 2017 apart.** Many familiar rules come from the 2017 standards. When the rule is from 2017, cite it as `IPPF 2017 <number>`. Errors already made:
  - Saying evidence must be "sufficient, reliable, relevant **and useful**". GIAS 14.1 is relevant, reliable, sufficient; "useful" is IPPF 2017.
  - Attributing "not expected to have the expertise of a fraud investigator" to GIAS. It is IPPF 2017 1210.A2.
  - Attributing "may claim conformance only if QAIP results support it" to GIAS. It is IPPF 2017 1321.
- **GIAS numbers that were cited wrong before:**
  - 2.1 covers objectivity, mindset and bias only.
  - **2.2** covers the 12-month rule, gifts, conflicts of interest, and the duty to disclose to the client before accepting an advisory engagement.
  - 2.3 covers disclosing impairments, including after an engagement has finished.
  - 7.1: the board *authorizes* the CAE's appointment and removal. For the CAE's evaluation and pay, the board only *gives input to senior management*.
  - 8.4: external assessment at least every 5 years, with at least one assessor holding an active CIA.
  - 13.6: the CAE approves the work program before it is used, and approves changes promptly.
- **Name the source of non-GIAS frameworks:** COSO 2013 / COSO ERM 2017 / ISO 31000:2018 / ACFE / IIA Three Lines. The threat categories (self-interest, self-review, familiarity, intimidation, advocacy) come from the **IESBA Code**, not GIAS.
- **Exam structure must follow the current syllabus** (the CIA 2025 syllabus, source URL in `public/data/parts.json`). Never fall back to the 2019 domains. For counts, times, weights or the pass mark, re-check theiia.org.
- **Questions are original.** Never copy or paraphrase IIA questions (sample questions, practice questions, retired exam items); they are copyrighted.

## 2. Exam style (follow IIA's official sample questions)

- **No standard numbers in the stem** ("Theo GIAS 13.6, ..."). Citations go only in `explanation` and `refs`.
- Prefer short scenarios plus superlative wording: "phù hợp nhất", "chủ yếu", "rủi ro lớn nhất", "mục đích chính".
- 4 options and **exactly one defensible answer**. After editing distractors, re-read all 4: a "plausible" distractor must not become arguably correct.
- **Distractors are plausible**: common mistakes, mixed-up concepts, half-true statements. No absurd options.
- **No answer by length.** Keep options of similar length.
  - The correct option must not exceed 1.2x the longest distractor.
  - Per part, the correct option may be the longest in at most 40% of questions. The validator enforces both limits.
- **Options are shuffled**, so never reference a letter or position ("phương án A", "cả A và B", "tất cả các ý trên"), in stems, options, explanations or notes.
- **No pairs that give each other away**: two questions on the same concept or scenario, or one whose option answers another. Before adding a question, search the bank for its concept.
- Only one option may cite a standard if the others don't; that difference alone gives the answer away.

## 3. Explanations

- `explanation`: why the correct answer is right, plus the source.
- `optionNotes`: required. One note per option, in `options` order, starting with "Đúng." or "Sai.", giving the reason or the misconception.
- `refs`: `GIAS x.y`, `CIA Part n X.y` (syllabus section; not the old Roman numerals I-IV), `IPPF 2017 nnnn`, `COSO 2013`, `IESBA Code`...

## 4. Workflow

1. Write questions into a JSON file, then run `node scripts/add-questions.mjs <part> <file>`. It normalizes characters, checks the schema and refuses duplicate IDs.
2. When adding notes in bulk, check alignment: the "Đúng." note must sit on `answer`.
3. Run `npm run validate` and `npm test`, both with no errors or warnings, then `npm run build`.
4. Check in the browser (practice, results, bank). Make the browser load the new build, not a cached one.
5. Deleting or renaming a question ID is safe for sessions already in progress, since Session drops missing questions. Still state clearly why it was removed.
6. Use ASCII punctuation (hyphen, straight quotes, ...). `scripts/text.mjs` normalizes it automatically.

## 5. Honesty with the user

- Always state what was checked against the original text and what was written from memory.
- Don't claim the questions are "IIA standard" or "official". They are original practice questions based on the syllabus and the standards.
- Nobody holding a CIA has reviewed the content yet; say so when reporting.
