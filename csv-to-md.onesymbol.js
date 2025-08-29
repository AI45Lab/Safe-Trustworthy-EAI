#!/usr/bin/env node
/* csv-to-md.onesymbol.js — Read local CSV -> ONE Markdown
 *
 * Usage:
 *   yarn node csv-to-md.onesymbol.js --csv=data.csv --out=WEBSITE.md --title="Trustworthy-Embodied-AI"
 *
 * Assumptions (default columns in Chinese):
 *   标题, 发表年月, 一作/第一作者, 链接, 以及若干 tag 列（包含 “原则/阶段/标签/tag” 关键字）
 * - 所有链接统一显示为一个符号 [🔗]，不展示长网址
 * - 中文 tag 将按内置表映射到英文，未知词原样保留
 * - 自动检测分隔符: , ; | \t
 */
const fs = require('fs');

function parseArgs() {
  const args = {};
  for (const a of process.argv.slice(2)) {
    const [k, ...rest] = a.replace(/^--/, '').split('=');
    const v = rest.join('=') || '1';
    args[k] = v;
  }
  return args;
}

function detectSep(header) {
  const cands = [',',';','\t','|'];
  let best = ',', max = -1;
  for (const c of cands) {
    const n = header.split(c).length;
    if (n > max) { max = n; best = c; }
  }
  return best;
}

// Simple CSV parser (quotes supported; good enough for common cases)
function csvToRows(text, sep) {
  const rows = [];
  let row = [], cell = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i+1] === '"') { cell += '"'; i++; }
        else inQuotes = false;
      } else cell += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === '\r') { /* skip */ }
      else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else if (ch === sep) { row.push(cell); cell = ''; }
      else cell += ch;
    }
  }
  row.push(cell); rows.push(row);
  return rows;
}

function normalizeKey(k) {
  return String(k || '').trim();
}

function formatMonth(s) {
  s = String(s || '').trim();
  if (/^\d{2}\.\d{2}$/.test(s)) return '20' + s; // 25.04 -> 2025.04
  return s;
}

function splitTags(s) {
  if (!s) return [];
  return String(s).split(/[,;，；、/ ]+/).map(x => x.trim()).filter(Boolean);
}

const TAG_MAP = {
  "安全-防滥用": "Abuse Prevention",
  "安全-价值对齐": "Value Alignment",
  "安全-抗攻击": "Attack Resistance",
  "安全-隐私可保护": "Privacy Protection",
  "安全-可标识": "Identifiability",
  "可信-可解释": "Explainability",
  "可信-可靠": "Reliability",
  "可信-可控": "Controllability",
  "可信-可审计": "Auditability",
  "可信-准确": "Accuracy",
  "指令理解": "Instruction Understanding",
  "环境感知": "Environment Perception",
  "物理交互": "Physical Interaction",
  "决策规划": "Action Planning"
};

function dedupe(arr) {
  const out = [];
  const seen = new Set();
  for (const x of arr) if (!seen.has(x)) { out.push(x); seen.add(x); }
  return out;
}

function main() {
  const args = parseArgs();
  const csvPath = args.csv || 'data.csv';
  const out = args.out || 'WEBSITE.md';
  const title = args.title || 'Website';

  if (!fs.existsSync(csvPath)) {
    console.error('CSV not found:', csvPath);
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, 'utf8').replace(/\uFEFF/g, '');
  const headerLine = raw.split(/\r?\n/).find(l => l.trim().length > 0) || '';
  const sep = args.sep || detectSep(headerLine);
  const rows = csvToRows(raw, sep).filter(r => r.some(x => String(x).trim() !== ''));
  if (rows.length < 2) {
    console.error('CSV has no data rows.');
    process.exit(1);
  }

  const header = rows[0].map(normalizeKey);
  const data = rows.slice(1).map(r => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').toString().trim()])));

  // Locate columns
  const titleKey = header.find(h => ['标题','title','论文标题'].includes(h)) || header[0];
  const dateKey  = header.find(h => ['发表年月','年月','日期','date','时间'].includes(h)) || '';
  const authorKey= header.find(h => ['一作','第一作者','作者','first author'].includes(h)) || '';
  const linkKey  = header.find(h => ['链接','link','url','链接1'].includes(h)) || '';

  const tagKeys = header.filter(h => /原则|阶段|标签|tag/i.test(h));

  const items = [];
  for (const row of data) {
    const t = row[titleKey] || '';
    const d = dateKey ? formatMonth(row[dateKey]) : '';
    const a = authorKey ? row[authorKey] : '';
    const u = linkKey ? row[linkKey] : '';

    let tags = [];
    for (const k of tagKeys) tags = tags.concat(splitTags(row[k]));
    tags = dedupe(tags.map(x => TAG_MAP[x] || x));

    let titleMd = `**${t || '(untitled)'}**`;
    if (u) titleMd = `[${titleMd}](${u})`;

    const meta = [];
    if (a) meta.push(`_${a}_`);
    if (d) meta.push(`(${d})`);

    let line = `- ${titleMd}`;
    if (meta.length) line += ' — ' + meta.join(' ');
    if (u) line += ` [🔗](${u})`;

    if (tags.length) line += `\n  - Tags: ${tags.map(x => '`' + x + '`').join(' ')}`;

    items.push(line);
  }

  const md = `# ${title}\n\n` + items.join('\n') + '\n';
  fs.writeFileSync(out, md, 'utf8');
  console.log('[onesymbol] wrote', out);
}

main();
