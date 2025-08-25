<template>
  <section class="intro">
    <!-- Title -->
    <h1 class="title">
      {{ paper.title }}
    </h1>

    <!-- Authors -->
        <div class="authors">
        <template v-for="(a, i) in paper.authors" :key="a.name">
            <a :href="a.homepage" target="_blank" rel="noopener" class="author">
            {{ a.name }}<sup v-if="getMark(a)" class="mark">{{ getMark(a) }}</sup>
            </a>
            <span v-if="i < paper.authors.length - 1" class="sep"> ，</span>
            <!-- 在 Zhihao Luo 后换行 -->
            <br v-if="a.name === 'Zhihao Luo'" />
        </template>
        </div>


    <!-- Affiliation -->
        <a href="https://www.shlab.org.cn/" target="_blank" rel="noopener noreferrer">
        <img src="@/assets/ailab.png" alt="Shanghai AI Lab" style="height:40px;" />
        </a>


    <!-- Action pills -->
    <div class="actions">
      <v-btn v-if="paper.links?.paper" :href="paper.links.paper" target="_blank"
             class="pill" variant="flat">
        <v-icon size="18">mdi-file-document-outline</v-icon>
        Paper
      </v-btn>

      <v-btn v-if="paper.links?.code" :href="paper.links.code" target="_blank"
             class="pill" variant="flat">
        <v-icon size="18">mdi-github</v-icon>
        Code
      </v-btn>

      <v-btn v-if="paper.links?.project" :href="paper.links.project" target="_blank"
             class="pill ghost" variant="tonal">
        <v-icon size="18">mdi-web</v-icon>
        Project
      </v-btn>

      <v-btn v-if="paper.links?.dataset" :href="paper.links.dataset" target="_blank"
             class="pill ghost" variant="tonal">
        <v-icon size="18">mdi-database</v-icon>
        Dataset
      </v-btn>
    </div>

<!-- Visual + English Introduction -->
<figure class="hero-image">
  <v-img src="/images/figure1.png" contain class="full-img" />
  <figcaption class="caption">
    Figure 1. Capability–Safety divergence in the Embodied AI landscape
  </figcaption>
</figure>

<div class="motivation-block">
  <h2 class="section-title">Research Motivation</h2>
<p class="section-text" style="margin-bottom: 8px;">
  While embodied AI (EAI) products are rapidly improving in capability, they often lack reliable safety mechanisms.
  In contrast, academic safety research remains fragmented and lags behind in capability. This divergence has raised
  significant concerns about the trustworthiness of physical AI systems.</p>
<p class="section-text" style="margin-top: 0;">
  To address this gap, we propose a unified research framework that integrates capability advancement and trustworthy
  safety, paving the way for the development of safe and aligned embodied agents.
</p>

  <div class="tags">
    <span class="tag">EAI Safety</span>
    <span class="tag">Capability-Safety Gap</span>
    <span class="tag">Trustworthy AI</span>
    <span class="tag">Embodied Intelligence</span>
  </div>
</div>

<!-- ===== Figure 2: Five Levels (compact 2+3, pixel-perfect alignment) ===== -->
<section class="figure2-section f2-compact" id="figure2">
  <h2 class="f2-title">The Five Levels of “Make Safe EAI”</h2>
  <p class="f2-lead">
    We chart the progression from <strong>Resistance</strong> (L1–L2) to <strong>Resilience</strong> (L3–L5),
    moving from refusal and oversight to adaptive learning and verifiable guarantees.
  </p>

  <!-- Figure 2 image -->
  <figure class="f2-figure">
    <img src="/images/figure2.png" alt="Figure 2: The five levels of Make Safe EAI" />
    <figcaption>Figure 2. From Resistance (L1–L2) to Resilience (L3–L5).</figcaption>
  </figure>

  <!-- TOP: L1–L2 -->
  <div class="f2-row f2-row-top">
    <article class="f2-card">
      <h3>L1 — Alignment <span>(Foundational Resistance)</span></h3>
      <ul class="f2-bullets">
        <li><span class="dot">•</span><span class="label">Goal</span><span class="text">Refuse harmful instructions; follow basic safety norms.</span></li>
        <li><span class="dot">•</span><span class="label">How</span><span class="text">Instruction tuning, RLHF, safety filters, red-teaming data.</span></li>
        <li><span class="dot">•</span><span class="label">Limit</span><span class="text">Correlation-based; vulnerable to jailbreaks and shifts.</span></li>
      </ul>
    </article>

    <article class="f2-card">
      <h3>L2 — Intervention <span>(Oversight-based Resistance)</span></h3>
      <ul class="f2-bullets">
        <li><span class="dot">•</span><span class="label">Goal</span><span class="text">Let humans halt/redirect <i>before</i> risky actions.</span></li>
        <li><span class="dot">•</span><span class="label">How</span><span class="text">Interrupt channels, intent/plan display, trajectory visualization.</span></li>
        <li><span class="dot">•</span><span class="label">Limit</span><span class="text">Needs constant oversight; weak scalability to high autonomy.</span></li>
      </ul>
    </article>
  </div>

  <!-- BOTTOM: L3–L5 -->
  <div class="f2-row f2-row-bottom">
    <article class="f2-card">
      <h3>L3 — Mimetic Reflection <span>(Foundational Resilience)</span></h3>
      <ul class="f2-bullets">
        <li><span class="dot">•</span><span class="label">Goal</span><span class="text">Internalize validated safe behaviors.</span></li>
        <li><span class="dot">•</span><span class="label">How</span><span class="text">Imitation learning, behavior cloning, curated safety playbooks.</span></li>
        <li><span class="dot">•</span><span class="label">Limit</span><span class="text">Limited generalization to novel tasks and combinations.</span></li>
      </ul>
    </article>

    <article class="f2-card">
      <h3>L4 — Evolutionary Reflection <span>(Adaptive Resilience)</span></h3>
      <ul class="f2-bullets">
        <li><span class="dot">•</span><span class="label">Goal</span><span class="text">Continual self-improvement; proactive patching.</span></li>
        <li><span class="dot">•</span><span class="label">How</span><span class="text">Continual learning, self red-teaming, safety-aware exploration.</span></li>
        <li><span class="dot">•</span><span class="label">Limit</span><span class="text">Empirical assurance only — no prior formal guarantees.</span></li>
      </ul>
    </article>

    <article class="f2-card">
      <h3>L5 — Verifiable Reflection <span>(Guaranteed Resilience)</span></h3>
      <ul class="f2-bullets">
        <li><span class="dot">•</span><span class="label">Goal</span><span class="text">Provable safety/stability of closed-loop behavior.</span></li>
        <li><span class="dot">•</span><span class="label">How</span><span class="text">Reachability/invariance analysis, control-theoretic synthesis, neuro-symbolic proofs.</span></li>
        <li><span class="dot">•</span><span class="label">Limit</span><span class="text">Model/compute-intensive; engineering maturity evolving.</span></li>
      </ul>
    </article>
  </div>
</section>




  </section>
</template>

<script>
export default {
  name: 'PaperIntro',
  props: { paper: { type: Object, required: true } },
  computed: {
    resolvedImages() {
      const arr = this.paper.images || []
      return arr.map((p) => this.resolveImg(p))
    }
  },
  methods: {
    /**
     * Returns the superscript marker for an author.
     * Priority:
     * - a.symbol: direct character (e.g., '†', '§', '*')
     * - a.equalSymbol: 'asterisk' | 'dagger' | 'section' | 'star' | direct char
     * - a.equal: true|string for backward compatibility
     */
    getMark(a) {
      if (!a) return '';
      // 1) explicit character override
      if (a.symbol && typeof a.symbol === 'string' && a.symbol.trim()) return a.symbol.trim();
      // 2) named symbol
      const name = (a.equalSymbol || a.equal || '').toString().toLowerCase().trim();
      if (name === 'dagger' || name === '†' || name === 'dag') return '†';
      if (name === 'section' || name === '§' || name === 'sect') return '§';
      if (name === 'asterisk' || name === 'star' || name === '*' || name === 'true') return '*';
      // 3) legacy boolean equal
      if (a.equal === true) return '*';
      return '';
    },

    resolveImg(p) {
      if (!p) return ''
      if (/^https?:\/\//i.test(p)) return p
      const name = p.replace(/^\/?assets\//, '')
      try {
        return new URL(`../assets/${name}`, import.meta.url).href
      } catch {
        return p
      }
    }
  }
}
</script>

<style scoped>
.intro{
  padding: 28px 8px 16px;
  text-align: center;
}
.grid.column {
  grid-template-columns: 1fr !important;
  text-align: center;
}

/* Title */
.title{
  margin: 0 auto 10px;
  max-width: 1100px;
  font-weight: 900;
  font-size: clamp(28px, 5vw, 52px);
  line-height: 1.15;
  letter-spacing: .2px;
}

/* Authors */
.authors {
  margin: 6px 0 2px;
  font-size: clamp(16px, 1.8vw, 22px); /* 字体更大 */
}

.author {
  color: #3b82f6;              /* 浅蓝 */
  text-decoration: none;
  font-weight: 500;
}

.author:hover {
  color: #2563eb;              /* hover 更深蓝 */
  text-decoration: underline;
}

.sep {
  color: #9ca3af;
  margin: 0 .2rem;
}

.mark {
  color: #000;         /* 星号黑色 */
  font-size: 0.7em;    /* 缩小一点 */
  margin-left: 1px;    /* 微调 */
}

/* Affiliation */
.affil{
  color:#6b7280;
  margin: 6px auto 14px;
  max-width: 900px;
}

/* Action buttons */
.actions{
  display: flex; gap: 10px; flex-wrap: wrap;
  justify-content: center; margin: 8px 0 16px;
}
.pill{
  border-radius: 999px;
  padding: 8px 14px;
  text-transform: none;
  font-weight: 600;
  background: #1f2937;
  color: #e5e7eb;
}
.pill:hover { filter: brightness(1.08); }
.pill.ghost{ background: #111827; border: 1px solid #334155; color:#cbd5e1; }

/* Hero image */
.hero{
  border-radius: 16px;
  overflow: hidden;
  margin: 6px auto 10px;
  max-width: 1200px;
}

/* Abstract + side figure */
.grid{
  margin: 10px auto 0; max-width: 1100px;
  display: grid; grid-template-columns: 1fr; gap: 16px; text-align: left;
}
@media (min-width: 960px){
  .grid{ grid-template-columns: 1.2fr .8fr; gap: 20px; }
}
.subhead{ margin: 8px 0 6px; font-size: 20px; font-weight: 800; }
.abstract{ margin: 0 0 8px; color:#111827; }
.tags{ display:flex; gap:8px; flex-wrap:wrap; }
.tag{
  font-size: 12px; padding: 4px 10px; border-radius: 999px;
  background: #eef2ff; color:#1e3a8a; border: 1px solid #c7d2fe;
}
.side{ margin:0; text-align:center; }
.img{ border-radius: 12px; }
.cap{ font-size: 12px; color:#6b7280; margin-top: 6px; }
.motivation-block {
  max-width: 960px;
  margin: 40px auto 0;
  text-align: center;
}

.section-title {
  font-size: 24px;
  font-weight: 900;
  margin-bottom: 14px;
  color: #111827;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-text {
  font-size: 18px;
  line-height: 1.8;
  color: #111827;
  margin-bottom: 16px; /* ⬅ 原来可能是 22px，可适当减小 */
}



.tags {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12.5px;
  padding: 5px 12px;
  border-radius: 999px;
  background: #dbeafe;
  color: #1e40af;
  border: 1px solid #93c5fd;
  font-weight: 500;
}


.hero-image {
  margin: 80px auto 20px;
  text-align: center;
  max-width: 960px;
  width: 100%;
}

.full-img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
  border-radius: 12px;
}

.caption {
  font-size: 14px;
  color: #6b7280;
  margin-top: 8px;
}

/* ===== Figure 2 (compact, pixel columns, gradual widening) ===== */
.figure2-section.f2-compact{
  /* 调这三项：逐渐变宽（图 < 上排 < 下排）+ 卡片宽度 */
  --f2-figure-max: 1020px;   /* figure 更窄 */
  --f2-card-w:     336px;   /* 小卡片稍宽，避免挤成竖排 */
  --f2-card-w-bottom: calc(var(--f2-card-w) + 36px);
  --f2-gap-top:     28px;   /* ↑↑ 上排两卡间距更大 → 渐进式变宽 */
  --f2-gap-bottom:  14px;

  /* 子弹三列的“绝对像素”宽度，跨卡片完全对齐 */
  --f2-dot-w: 12px;
  --f2-label-w:   6.2ch;       /* Goal./How./Limit. 列宽，必要时调 64–72px */
  --f2-col-gap:   4px;

  max-width: calc( 3 * var(--f2-card-w-bottom) + 2 * var(--f2-gap-bottom));
  margin: 28px auto 0;
  padding: 0 12px;

  /* 防全局 break-all 影响 */
  word-break: normal;
}
.figure2-section{ text-align: left; }

.figure2-section.f2-compact *{
  word-break: normal !important;
  overflow-wrap: break-word;
  white-space: normal !important;
}

.f2-title{margin:0 0 6px;font-size:22px;line-height:1.3;text-align:center;}
.f2-lead{margin:6px auto 12px;max-width:70ch;text-align:center;color:#444;font-size:14.5px}

/* Figure block */
.f2-figure{margin:6px auto 10px;max-width:var(--f2-figure-max);text-align:center}
.f2-figure img{width:100%;height:auto;display:block;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.06)}
.f2-figure figcaption{margin-top:6px;font-size:.9rem;color:#5b5b5b}

/* Rows：2 + 3，且“上排间距更大”制造渐进式变宽 */
.f2-row{display:grid;justify-content:center;margin-left:auto;margin-right:auto}
.f2-row-top{
  grid-template-columns: repeat(2, var(--f2-card-w));
  gap: var(--f2-gap-top);
  width: calc(2 * var(--f2-card-w) + var(--f2-gap-top));
  margin: 12px auto 10px;
}
.f2-row-bottom{
  grid-template-columns: repeat(3, var(--f2-card-w-bottom));
  gap: var(--f2-gap-bottom);
  width: calc( 3 * var(--f2-card-w-bottom) + 2 * var(--f2-gap-bottom));
  margin: 10px auto 0;
}

/* Cards */
.f2-card{
  width: var(--f2-card-w);
  border:1px solid #ececec;border-radius:12px;background:#fff;
  padding:8px 10px;box-shadow:0 4px 14px rgba(0,0,0,.04);min-width:0;line-height:1.5;
 text-align:left;}
.f2-row-bottom .f2-card{ width: var(--f2-card-w-bottom); }
.f2-card h3{margin:0 0 4px;font-size:15px}
.f2-card h3 span{color:#666;font-weight:500;font-size:.92em}

/* Bullets：3 列像素网格（• / Label / Text）—— 所有卡片完全对齐 */
.f2-bullets{list-style:none;margin:0;padding:0;font-size:14px}
.f2-bullets li{
  display:grid;
  grid-template-columns: var(--f2-dot-w) var(--f2-label-w) 1fr;
  column-gap: var(--f2-col-gap);
  align-items:flex-start;
  margin:2px 0;
  min-width:0;
}
.f2-bullets .dot  {display:block; width:var(--f2-dot-w); text-align:center; font-weight:700; line-height:1.5; position:relative; top:2px;}
.f2-bullets .label{display:block; width:var(--f2-label-w); font-weight:700; white-space:nowrap;}
.f2-bullets .text {display:block; min-width:0}

/* Responsive */
@media (max-width: 980px){
  .f2-row-bottom{grid-template-columns: repeat(2, var(--f2-card-w));
    width: calc(2 * var(--f2-card-w) + var(--f2-gap-bottom));}
}
@media (max-width: 650px){
  .f2-row-top{grid-template-columns: var(--f2-card-w); width: var(--f2-card-w)}
  .f2-row-bottom{grid-template-columns: var(--f2-card-w); width: var(--f2-card-w)}
  .f2-title{font-size:20px}.f2-lead{font-size:14px}
}


.f2-bullets .label::after{ content: ":"; margin-left: .25ch; }
</style>
