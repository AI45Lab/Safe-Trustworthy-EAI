// /src/utils/paperSearch.js — phrase-first with fuzzy-per-token (no stopwords, v2)
console.info('[paperSearch] strict-phrase-fuzzy-all-v2 loaded');

const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[_/]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/-+/g, ' ')      // model-agnostic -> model agnostic
    .replace(/\s+/g, ' ')
    .trim();

const splitWords = (s) => normalize(s).split(' ').filter(Boolean);

// ---------- edit distance ----------
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]; dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      if (a[i - 1] === b[j - 1]) dp[j] = prev;
      else dp[j] = Math.min(prev + 1, dp[j] + 1, dp[j - 1] + 1);
      prev = tmp;
    }
  }
  return dp[n];
}

// 末词可前缀；每个词都可轻度模糊（长词更宽，短词更严）
function tokenOkSim(qTok, word, isLast) {
  if (!qTok || !word) return { ok: false, sim: 0 };
  const L = qTok.length;

  // ① 末词前缀优先判断（用于边打字）
  if (isLast && word.startsWith(qTok)) {
    const ratio = qTok.length / Math.max(qTok.length, word.length); // 0..1
    // 前缀门槛：1→0.1，2→0.25，3→0.375，4→0.5，5–6→0.6，7+→0.7
    const minPrefix =
      L >= 7 ? 0.7 :
        L >= 5 ? 0.6 :
          L === 4 ? 0.5 :
            L === 3 ? 0.375 :
              L === 2 ? 0.25 : 0.10;
    if (ratio >= minPrefix) return { ok: true, sim: ratio };
  }

  // ② 极短词（≤2）其它情况只接受完全相等，避免噪声
  if (L <= 2) return { ok: qTok === word, sim: qTok === word ? 1 : 0 };

  // ③ 轻度模糊（编辑距离）：8+ 允许 2 次，其它允许 1 次
  const allow = L >= 8 ? 2 : 1;
  const d = levenshtein(qTok, word);
  if (d > allow) return { ok: false, sim: 0 };

  const sim = 1 - d / Math.max(L, word.length);
  const minNeed = L <= 4 ? 0.75 : 0.80; // 最低相似度
  return { ok: sim >= minNeed, sim };
}

// 在标题中查找“模糊连续短语”，返回最佳相似度和起点索引；未命中返回 {ok:false}
function bestFuzzyPhraseSim(titleWords, tokens) {
  if (!tokens.length) return { ok: true, sim: 1, start: -1 };
  const T = titleWords.length, K = tokens.length;
  let best = -1, bestStart = -1;

  for (let s = 0; s + K <= T; s++) {
    let sum = 0, ok = true;
    for (let k = 0; k < K; k++) {
      const { ok: o, sim } = tokenOkSim(tokens[k], titleWords[s + k], k === K - 1);
      if (!o) { ok = false; break; }
      sum += sim;
    }
    if (ok && sum > best) { best = sum; bestStart = s; }
  }
  return best >= 0 ? { ok: true, sim: best / K, start: bestStart } : { ok: false, sim: 0, start: -1 };
}

// 相邻双词（末词允许前缀）
function bestFuzzyBigramSim(titleWords, a, b) {
  const T = titleWords.length;
  let best = -1;
  for (let i = 0; i < T - 1; i++) {
    const r1 = tokenOkSim(a, titleWords[i], false);
    const r2 = tokenOkSim(b, titleWords[i + 1], true);
    if (r1.ok && r2.ok) best = Math.max(best, (r1.sim + r2.sim) / 2);
  }
  return best >= 0 ? { ok: true, sim: best } : { ok: false, sim: 0 };
}

// 提取引号短语（支持 " “ ” 「 」 『 』 ＂）
function extractQuoted(raw) {
  const pairs = [['"', '"'], ['“', '”'], ['「', '」'], ['『', '』'], ['＂', '＂']];
  for (const [L, R] of pairs) {
    const li = raw.indexOf(L);
    const ri = raw.indexOf(R, li + 1);
    if (li >= 0 && ri > li) return raw.slice(li + 1, ri);
  }
  return '';
}

// ---------- main ----------
export function searchPapers(list, rawQuery, TOP_N = 60) {
  const raw = (rawQuery || '').trim();
  if (!raw) return [];

  // 引号短语：模糊连续（每词可模糊、末词可前缀）
  const quoted = extractQuoted(raw);
  const phraseTokens = splitWords(quoted);

  // 无引号：按原始输入切词（不去停用词）
  const queryClean = quoted
    ? normalize(raw.replace(quoted, '').replace(/["“”「」『』＂]/g, ''))
    : normalize(raw);
  const tokens = splitWords(queryClean);
  const nTok = tokens.length;

  const results = [];
  for (const item of list) {
    const title = normalize(item.title || '');
    if (!title) continue;
    const tWords = splitWords(title);

    let passed = false;
    let score = 0;

    // A) 引号短语硬门槛
    if (phraseTokens.length) {
      const r = bestFuzzyPhraseSim(tWords, phraseTokens);
      if (!r.ok) continue;
      passed = true;
      score += 1000 + r.sim * 100;
    }

    // B) 无引号
    if (!passed) {
      if (nTok >= 3) {
        const r = bestFuzzyPhraseSim(tWords, tokens);
        if (!r.ok) continue;
        passed = true;
        score += 800 + r.sim * 100;
      } else if (nTok === 2) {
        const r = bestFuzzyBigramSim(tWords, tokens[0], tokens[1]);
        if (!r.ok) continue;
        passed = true;
        score += 700 + r.sim * 100;
      } else if (nTok === 1) {
        let best = -1;
        for (let j = 0; j < tWords.length; j++) {
          const r = tokenOkSim(tokens[0], tWords[j], true);
          if (r.ok) best = Math.max(best, r.sim);
        }
        if (best < 0) continue;
        passed = true;
        score += 200 + best * 100;
      } else {
        continue;
      }
    }

    results.push({ item, score });
  }

  results.sort((a, b) =>
    (b.score - a.score) ||
    ((a.item.title || '').localeCompare(b.item.title || ''))
  );
  const sliced = TOP_N > 0 ? results.slice(0, TOP_N) : results;
  return sliced.map(x => x.item);
}
