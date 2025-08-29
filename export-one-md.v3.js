#!/usr/bin/env node
/* export-one-md.v3.js — ONE Markdown with clean lists + icon links
 *
 * - Normalize grids/cards to <ul><li> lists (no <table>).
 * - Convert raw URL anchors to short **icon labels**:
 *     PDF → 📄, arXiv → arXiv, IEEE → IEEE, GitHub → GitHub, others → ↗
 * - Strip noisy Vue/tooling attributes (data-*, aria-*) and inline code artifacts.
 * - Keep <details>/<summary>, headings, images.
 *
 * Usage:
 *   yarn node export-one-md.v3.js --base=https://trustworthy-embodied-ai.pages.dev/ \
 *     --routes="/,/project,/about" --out=WEBSITE.md --title="Trustworthy-Embodied-AI"
 */
const fs = require('fs');
const path = require('path');

async function main() {
  const argv = Object.fromEntries(process.argv.slice(2).map(arg => {
    const [k, v = ''] = arg.replace(/^--/, '').split('=');
    return [k, v];
  }));
  const base = argv.base || 'http://localhost:5173';
  const routes = (argv.routes || '/').split(',').map(s => s.trim()).filter(Boolean);
  const out = argv.out || 'WEBSITE.md';
  const siteTitle = argv.title || 'Website';

  const puppeteer = require('puppeteer');
  const TurndownService = require('turndown');
  const { gfm } = require('turndown-plugin-gfm');
  const cheerio = require('cheerio');

  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*',
    hr: '---'
  });
  td.use(gfm);
  td.keep(['details','summary','kbd','sup','sub','br']);

  function absolutize($, origin) {
    const abs = (u) => {
      try {
        if (!u) return u;
        if (/^(https?:|mailto:|#)/.test(u)) return u;
        if (u.startsWith('/')) return new URL(u, origin).toString();
        return u;
      } catch { return u; }
    };
    $('a[href]').each((_,a)=>$(a).attr('href', abs($(a).attr('href'))));
    $('img[src]').each((_,img)=>$(img).attr('src', abs($(img).attr('src'))));
  }

  function labelForHref(href) {
    try {
      const u = new URL(href);
      const host = u.hostname;
      const p = u.pathname.toLowerCase();
      if (p.endsWith('.pdf') || p.includes('.pdf?')) return '📄';
      if (host.includes('arxiv.org')) return 'arXiv';
      if (host.includes('ieeexplore.ieee.org')) return 'IEEE';
      if (host.includes('acm.org')) return 'ACM';
      if (host.includes('biorxiv') || host.includes('medrxiv')) return 'bioRxiv';
      if (host.includes('openreview')) return 'OpenReview';
      if (host.includes('github.com')) return 'GitHub';
      if (host.includes('doi.org')) return 'DOI';
      return '↗';
    } catch { return '↗'; }
  }

  // Clean noisy attributes/tags, rewrite anchors
  function sanitizeDom($) {
    // remove noisy attributes
    $('*').each((_, el) => {
      const attribs = el.attribs || {};
      for (const name of Object.keys(attribs)) {
        if (/^(data-|aria-)/.test(name)) $(el).removeAttr(name);
      }
    });
    // drop suspicious inline <code> artifacts (e.g., tooltip junk inside headings)
    $('h1 code, h2 code, h3 code, h4 code, h5 code, h6 code').each((_,el)=>{
      const txt = $(el).text() || '';
      if (txt.length > 0) $(el).remove(); // drop
    });
    // also drop <code> that contains http-like text and isn't inside pre
    $(':not(pre) > code').each((_, el) => {
      const txt = ($(el).text() || '').trim();
      if (/https?:\/\//.test(txt) || txt.length > 80) $(el).remove();
    });

    // Convert anchors with URL-like text to short labels
    $('a[href]').each((_, a) => {
      const $a = $(a);
      if ($a.find('img').length) return; // keep badges unchanged
      const href = $a.attr('href') || '';
      const text = ($a.text() || '').trim();
      const looksLikeUrl = /^https?:\/\//.test(text) || text === '' || text.length > 90;
      if (looksLikeUrl || text === href) {
        $a.text(labelForHref(href));
      }
    });

    // Optional: remove <sup class="mark">…</sup> artifacts
    $('sup.mark, sup[class*="mark"]').remove();
  }

  // Convert grouped cards/grids to bullet lists
  function normalizeToLists(html, origin) {
    const $ = cheerio.load(html);

    sanitizeDom($);
    absolutize($, origin);

    const groupSelectors = ['.v-row', '.grid', '.cards', '.card-list', '.items', 'section'];
    $(groupSelectors.join(',')).each((_, el) => {
      const $el = $(el);
      if ($el.find('ul>li, ol>li').length >= 3) return;

      let cards = $el.find('.paper, .paper-item, .paper-card, .v-card, .card, article').toArray();
      if (cards.length < 3) {
        const kids = $el.children().toArray();
        cards = kids.filter(k => $(k).find('a').length >= 1 && $(k).text().trim().length > 30);
      }
      if (cards.length < 3) return;

      const ul = $('<ul></ul>');
      cards.forEach(c => {
        const $c = $(c).clone();
        $c.find('script, style').remove();
        // clean nested noisy code
        $c.find(':not(pre) > code').each((_, el) => {
          const txt = ($c(el).text || '').trim?.() || '';
          if (/https?:\/\//.test(txt) || txt.length > 80) $(el).remove();
        });
        // absolutize inner
        $c.find('a[href], img[src]').each((_, n) => {
          const $n = $(n);
          if ($n.is('a')) {
            const href = $n.attr('href') || '';
            if (href && !/^(https?:|mailto:|#)/.test(href)) {
              $n.attr('href', href.startsWith('/') ? new URL(href, origin).toString() : href);
            }
            // relabel if needed
            if ($n.find('img').length === 0) {
              const t = ($n.text() || '').trim();
              if (t === '' || t === href || /^https?:\/\//.test(t) || t.length > 90) {
                $n.text(labelForHref(href));
              }
            }
          } else if ($n.is('img')) {
            const src = $n.attr('src') || '';
            if (src && !/^(https?:|data:)/.test(src)) {
              $n.attr('src', src.startsWith('/') ? new URL(src, origin).toString() : src);
            }
          }
        });

        // compress lines
        const html = ($c.html() || '').replace(/\s+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
        ul.append($('<li></li>').html(html));
      });

      $el.replaceWith(ul);
    });

    absolutize($, origin);
    sanitizeDom($);

    return $.html();
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox','--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const sections = [];

  for (const route of routes) {
    const url = new URL(route, base).toString();
    await page.goto(url, { waitUntil: 'networkidle0' });

    // Expand lazy content
    await page.evaluate(async () => {
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      let last = 0;
      for (let i = 0; i < 10; i++) {
        window.scrollTo(0, document.body.scrollHeight);
        await sleep(350);
        const h = document.body.scrollHeight;
        if (Math.abs(h - last) < 5) break;
        last = h;
      }
      window.scrollTo(0,0);
    });

    const raw = await page.evaluate((origin) => {
      const main = document.querySelector('main') || document.querySelector('#app') || document.body;
      main.querySelectorAll('script, style, noscript').forEach(n => n.remove());
      // absolutize
      const abs = (u) => {
        try {
          if (!u) return u;
          if (u.startsWith('http://') || u.startsWith('https://') || u.startsWith('mailto:') || u.startsWith('#')) return u;
          if (u.startsWith('/')) return new URL(u, origin).toString();
          return u;
        } catch { return u; }
      };
      main.querySelectorAll('a[href]').forEach(a => a.setAttribute('href', abs(a.getAttribute('href'))));
      main.querySelectorAll('img[src]').forEach(img => img.setAttribute('src', abs(img.getAttribute('src'))));
      return main.outerHTML;
    }, base);

    const normalized = normalizeToLists(raw, base);
    const md = td.turndown(normalized);
    const title = await page.title() || url;
    sections.push({ title, route, url, md });
  }

  await browser.close();

  // Assemble to one file
  let outMd = `<div align="center">\n\n# ${siteTitle}\n\n${routes.map(r => `[${r || '/'}](#${(r||'/').replace(/[^\w]+/g,'-')})`).join(' · ')}\n\n</div>\n\n---\n`;
  for (const s of sections) {
    const anchor = (s.route || '/').replace(/[^\w]+/g,'-');
    outMd += `\n\n## ${s.title}\n<a id="${anchor}"></a>\n\n`;
    outMd += s.md.trim() + '\n\n---\n';
  }
  fs.writeFileSync(out, outMd, 'utf8');
  console.log('[export-one-md.v3] wrote', out);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
