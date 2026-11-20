// Print the Requirements block of GIAS standards from the full official text, to check a
// citation before writing it (CLAUDE.md section 1).
// Usage: node scripts/gias-req.mjs 9.5 11.5 [--full]   (--full also prints Considerations)
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';

const GIAS = `${homedir()}/.claude/skills/internal-audit/references/gias-official-full.txt`;
const args = process.argv.slice(2);
const full = args.includes('--full');
const ids = args.filter((a) => a !== '--full');
if (!ids.length || !existsSync(GIAS)) {
  console.error(ids.length ? `GIAS text not found: ${GIAS}` : 'Usage: node scripts/gias-req.mjs <x.y> [...] [--full]');
  process.exit(1);
}
// pdftotext puts a form feed (\f) at the start of each page; strip it so headings match.
const lines = readFileSync(GIAS, 'utf8').split('\n').map((l) => l.replace(/\f/g, '').trimEnd());
const STOP = full ? /^(Examples of Evidence of Conformance|Standard \d+\.\d+ )/ : /^(Essential Conditions|Considerations for Implementation)/;

for (const id of ids) {
  // The heading may wrap onto a second line; the table of contents has dot leaders.
  const isHeading = (l) => l.startsWith(`Standard ${id} `) && !l.includes('....');
  let start = lines.findIndex((l, k) => isHeading(l) && lines.slice(k + 1, k + 5).includes('Requirements'));
  // A few standards (e.g. 2.3) lost the "Requirements" line in extraction: take a title-only line.
  if (start < 0) start = lines.findIndex((l) => isHeading(l) && l.length < 90 && !/[.,;]$/.test(l) && !/ (provides|is|as|in) /.test(l));
  if (start < 0) {
    console.log(`--- ${id}: heading not found (grep the file directly)`);
    continue;
  }
  // In some pages the extracted text puts a section header before the requirement text
  // (e.g. 3.2); skip a stop header that comes before any real text.
  const textAfter = (k) => lines.slice(start + 1, k).join(' ').replace(/Requirements/g, '').trim().length;
  const end = lines.findIndex((l, k) => k > start + 1 && STOP.test(l) && textAfter(k) > 40);
  console.log(`--- ${lines[start]}\n${lines.slice(start + 1, end < 0 ? start + 60 : end).join(' ')}\n`);
}
