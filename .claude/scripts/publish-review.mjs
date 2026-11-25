#!/usr/bin/env node
// Publishes a Product Adversarial Reviewer report, read from stdin, as a review on the open pull
// request of the checked-out branch: the summary as the review comment and one line comment for
// each finding that points to a line of the pull request diff.
// REVIEW_DRY_RUN=1 prints what would be posted without posting it.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { isAbsolute, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const VERDICTS = ['agree', 'changes_suggested', 'not_reviewed'];
const SEVERITIES = ['blocker', 'major', 'minor'];
const PROOF_TYPES = ['quote', 'scenario', 'external'];
const MAX_BODY = 65536;
const FOOTER =
  '_Posted by the Product Adversarial Reviewer, an AI agent. These are suggestions for the product team to accept or argue against._';

const filled = (value) => typeof value === 'string' && value.trim() !== '';

function check(condition, message) {
  if (!condition) throw new Error(`invalid report: ${message}`);
}

export function parseReport(text) {
  const lines = text.split('\n');
  const start = lines.map((line) => line.trim()).lastIndexOf('```json');
  const end = lines.findIndex((line, index) => index > start && line.trim() === '```');
  check(start >= 0 && end > start, 'no fenced json block');

  const summary = lines.slice(0, start).join('\n').trim();
  check(summary.startsWith('## Product review:'), 'the summary must start with "## Product review:"');

  let data;
  try {
    data = JSON.parse(lines.slice(start + 1, end).join('\n'));
  } catch (error) {
    check(false, `the json block does not parse (${error.message})`);
  }

  check(VERDICTS.includes(data.verdict), `verdict must be one of ${VERDICTS.join(', ')}`);
  check(filled(data.model), 'model is missing');
  check(Array.isArray(data.documents) && data.documents.every(filled), 'documents must list paths');
  check(data.verdict === 'not_reviewed' || data.documents.length > 0, 'documents is empty');
  check(Array.isArray(data.findings), 'findings must be a list');

  for (const finding of data.findings) {
    const id = finding.id ?? '(no id)';
    check(filled(finding.id), 'a finding has no id');
    check(SEVERITIES.includes(finding.severity), `${id}: unknown severity`);
    check(filled(finding.problem), `${id}: problem is missing`);
    check(filled(finding.suggestion), `${id}: suggestion is missing`);
    check(Array.isArray(finding.proof) && finding.proof.length > 0, `${id}: has no proof`);
    for (const proof of finding.proof) {
      check(PROOF_TYPES.includes(proof.type) && filled(proof.text), `${id}: incomplete proof`);
      check(proof.type !== 'quote' || filled(proof.file), `${id}: a quote needs a file`);
      check(proof.type !== 'external' || filled(proof.url), `${id}: external proof needs a url`);
    }
  }

  const serious = data.findings.some((finding) => finding.severity !== 'minor');
  const stillOpen = (data.previous_findings ?? []).some((finding) => finding.status === 'open');
  check(!(serious && data.verdict !== 'changes_suggested'), 'a blocker or major finding requires changes_suggested');
  check(!(data.verdict === 'changes_suggested' && !serious && !stillOpen), 'changes_suggested needs a blocker, major or open finding');

  return { summary, data };
}

// Line numbers of the new file that GitHub accepts a comment on: added and context lines.
export function commentableLines(patch = '') {
  const result = new Set();
  let line = null;
  for (const row of patch.split('\n')) {
    const hunk = row.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
    if (hunk) line = Number(hunk[1]);
    else if (line !== null && (row.startsWith('+') || row.startsWith(' '))) result.add(line++);
  }
  return result;
}

// Stops text taken from documents or web pages from notifying GitHub users.
export function neutralizeMentions(text) {
  return text.replace(/(^|[^A-Za-z0-9_])@(?=[A-Za-z0-9])/g, '$1@​');
}

function proofMarkdown(proof) {
  if (proof.type === 'quote') {
    const place = proof.line ? `${proof.file}:${proof.line}` : proof.file;
    return `- Quote, \`${place}\`: "${proof.text}"`;
  }
  if (proof.type === 'external') return `- Source ${proof.url}: ${proof.text}`;
  return `- Scenario: ${proof.text}`;
}

export function findingMarkdown(finding) {
  const place = [finding.file && `\`${finding.file}${finding.line ? `:${finding.line}` : ''}\``, finding.section]
    .filter(Boolean)
    .join(', ');
  return [
    `**${finding.id} · ${finding.severity}**${place ? ` · ${place}` : ''}`,
    finding.problem,
    `**Proof**\n${finding.proof.map(proofMarkdown).join('\n')}`,
    `**Suggestion:** ${finding.suggestion}`,
  ].join('\n\n');
}

export function buildReview({ summary, data }, diffLines, commitId) {
  const comments = [];
  const unplaced = [];
  for (const finding of data.findings) {
    if (Number.isInteger(finding.line) && diffLines.get(finding.file)?.has(finding.line)) {
      comments.push({
        path: finding.file,
        line: finding.line,
        side: 'RIGHT',
        body: neutralizeMentions(findingMarkdown(finding)),
      });
    } else {
      unplaced.push(finding);
    }
  }

  const sections = [summary];
  if (unplaced.length > 0) {
    sections.push(`### Findings not on a changed line\n\n${unplaced.map(findingMarkdown).join('\n\n---\n\n')}`);
  }
  if (data.previous_findings?.length > 0) {
    const rows = data.previous_findings.map((f) => `- **${f.id}** ${f.status}: ${f.reason}`);
    sections.push(`### Earlier findings\n\n${rows.join('\n')}`);
  }
  sections.push(FOOTER);
  const body = neutralizeMentions(sections.join('\n\n'));

  for (const text of [body, ...comments.map((comment) => comment.body)]) {
    if (text.length > MAX_BODY) throw new Error('the report is too long for a GitHub comment');
  }
  return { payload: { commit_id: commitId, event: 'COMMENT', body, comments }, unplaced: unplaced.length };
}

export function parseRepository(remoteUrl) {
  const match = remoteUrl.match(/github\.com[:/]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/);
  if (!match) throw new Error('the origin remote is not a GitHub repository');
  return `${match[1]}/${match[2]}`;
}

function run(command, args, input) {
  try {
    return execFileSync(command, args, { encoding: 'utf8', input, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (error) {
    const detail = (error.stderr || error.stdout || error.message).toString().trim();
    throw new Error(`${command} ${args[0]} failed: ${detail}`);
  }
}

function publish(text) {
  const report = parseReport(text);
  const root = run('git', ['rev-parse', '--show-toplevel']);
  const fromRoot = (path) => (path && isAbsolute(path) ? relative(root, path) : path?.replace(/^\.\//, ''));
  report.data.documents = report.data.documents.map(fromRoot);
  for (const finding of report.data.findings) finding.file = fromRoot(finding.file);

  const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  if (branch === 'HEAD') throw new Error('no branch is checked out');
  const repository = parseRepository(run('git', ['remote', 'get-url', 'origin']));

  const pulls = JSON.parse(
    run('gh', ['pr', 'list', '--repo', repository, '--head', branch, '--state', 'open',
      '--json', 'number,url,headRefOid,isCrossRepository']),
  ).filter((pull) => !pull.isCrossRepository);
  if (pulls.length === 0) throw new Error(`no open pull request for branch "${branch}"`);
  if (pulls.length > 1) throw new Error(`more than one open pull request for branch "${branch}"`);
  const [pull] = pulls;

  // Line numbers are only right if the reviewed files are the ones in the pull request.
  if (report.data.verdict !== 'not_reviewed') {
    for (const document of report.data.documents) {
      let same = false;
      try {
        same =
          run('git', ['-C', root, 'rev-parse', '--verify', `${pull.headRefOid}:${document}`]) ===
          run('git', ['-C', root, 'hash-object', '--', document]);
      } catch {
        same = false;
      }
      if (!same) {
        throw new Error(`"${document}" differs from the pull request: commit and push it, then review again`);
      }
    }
  }

  const files = run('gh', ['api', '--paginate', `repos/${repository}/pulls/${pull.number}/files`,
    '--jq', '.[] | {filename, patch}']);
  const diffLines = new Map(
    files.split('\n').filter(Boolean).map((row) => {
      const file = JSON.parse(row);
      return [file.filename, commentableLines(file.patch ?? '')];
    }),
  );

  const { payload, unplaced } = buildReview(report, diffLines, pull.headRefOid);
  const counts = `${payload.comments.length} line comments, ${unplaced} findings in the summary only`;
  if (process.env.REVIEW_DRY_RUN) {
    return `DRY RUN, nothing posted: ${pull.url} (${counts})\n${JSON.stringify(payload, null, 2)}`;
  }
  const review = JSON.parse(
    run('gh', ['api', '--method', 'POST', `repos/${repository}/pulls/${pull.number}/reviews`, '--input', '-'],
      JSON.stringify(payload)),
  );
  return `PUBLISHED: ${review.html_url} (${counts})`;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  try {
    console.log(publish(readFileSync(0, 'utf8')));
  } catch (error) {
    console.log(`NOT PUBLISHED: ${error.message}`);
    process.exit(1);
  }
}
