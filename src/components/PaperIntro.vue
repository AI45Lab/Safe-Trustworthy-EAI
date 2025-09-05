<template>
  <section class="intro">
    <!-- Title -->
    <h1 class="title">
      {{ paper.title }}
    </h1>

    <!-- Authors -->
    <div class="authors">
      <template v-for="(a, i) in (paper.authors || [])" :key="a.name">
        <a :href="a.homepage" target="_blank" rel="noopener" class="author">
          {{ a.name }}<sup v-if="getMark(a)" class="mark">{{ getMark(a) }}</sup>
        </a>
        <span v-if="i < paper.authors.length - 1" class="sep"> ,</span>
        <!-- 在 Zhihao Luo 后换行 -->
        <br v-if="a.name === 'Zhihao Luo'" />
      </template>
    </div>



    <!-- Affiliation -->
    <!-- Affiliation -->
    <div class="aff-row">
      <a href="https://www.shlab.org.cn/" target="_blank" rel="noopener" class="aff-logo-link"
        aria-label="Shanghai AI Lab">
        <img src="@/assets/ailab.png" alt="Shanghai Artificial Intelligence Laboratory" class="aff-logo" />
      </a>

      <div class="aff-names" title="">
        <div ref="affCn" class="aff-cn"
          :style="{ width: affTargetWidth + 'px', letterSpacing: affCnLetterSpacing + 'px' }">
          上海人工智能实验室
        </div>
        <div ref="affEn" class="aff-en"
          :style="{ width: affTargetWidth + 'px', wordSpacing: affEnWordSpacing + 'px', letterSpacing: affEnLetterSpacing + 'px' }">
          Shanghai Artificial Intelligence Laboratory
        </div>
      </div>

      <!-- Add spacing between the two affiliations -->
      <div style="width: 120px;"></div>

      <a href="https://www.ecnu.edu.cn/" target="_blank" rel="noopener" class="aff-logo-link"
        aria-label="East China Normal University">
        <img src="@/assets/ecnu.png" alt="East China Normal University" class="aff-logo" />
      </a>

      <div class="aff-names" title="">
        <div ref="affCn" class="aff-cn"
          :style="{ width: affTargetWidth + 'px', letterSpacing: affCnLetterSpacing + 'px' }">
          华东师范大学
        </div>
        <div ref="affEn" class="aff-en"
          :style="{ width: affTargetWidth + 'px', wordSpacing: affEnWordSpacing + 'px', letterSpacing: affEnLetterSpacing + 'px' }">
          East China Normal University
        </div>
      </div>
    </div>

    <!-- Visual + English Introduction -->


    <!-- Abstract block START -->
    <!-- Abstract block START -->
    <section class="abs-band">
      <!-- Decorative elements -->
      <div class="abs-decorations">
        <div class="abs-line abs-line-1"></div>
        <div class="abs-line abs-line-2"></div>
        <div class="abs-dot abs-dot-1"></div>
        <div class="abs-dot abs-dot-2"></div>
        <div class="abs-dot abs-dot-3"></div>
        <div class="abs-gradient-orb abs-orb-1"></div>
        <div class="abs-gradient-orb abs-orb-2"></div>
      </div>

      <div class="abs-inner">
        <div class="abs-title-wrapper">
          <div class="abs-title-line"></div>
          <h2 class="abs-title">Abstract</h2>
          <div class="abs-title-line"></div>
        </div>
        <p class="abs-text" lang="en">The increasing autonomy and physical capability of Embodied Artificial Intelligence
          (EAI) introduce critical challenges to safety and trustworthiness. Unlike purely digital AI, failures in
          perception, planning, or interaction can lead to direct physical harm, property damage, or the violation of
          human safety and social norms. However, current EAI foundation models disregard the risks of misalignment
          between the model capabilities and the safety and trustworthiness competencies. Some works attempt to address
          these issues, however, they lack a unified framework capable of balancing the developmental trajectories between
          safety and capability. In this paper, we first comprehensively define a new term <em>safe and trustworthy
            EAI</em> by establishing an L1-L5 levels framework and proposing ten core principles of trustworthiness and
          safety. To unify fragmented research efforts, we propose a novel, agent-centric framework that analyzes risks
          across the four operational stages of an EAI system. We systematically review state-of-the-art but fragmented
          solutions, benchmarks, and evaluation metrics, identifying key gaps and challenges. Finally, we identify the
          need for a paradigm shift away from optimizing isolated components towards a holistic, cybernetic approach. We
          argue that future progress hinges on engineering the closed-loop system of the agent (Self), its environment
          (World), and their dynamic coupling (Interaction), paving the way for the next generation of truly safe and
          trustworthy EAI.</p>
      </div>
    </section>

    <!-- Abstract block END -->


    <figure class="hero-image">
      <v-img src="/images/figure1.png" contain class="full-img" />
      <figcaption class="caption">
        Figure 1. Capability-Safety divergence in the Embodied AI landscape
      </figcaption>
    </figure>

    <div class="motivation-block">
      <h2 class="section-title">Research Motivation</h2>
      <p class="section-text" style="margin-bottom: 8px;">
        While embodied AI (EAI) products are rapidly improving in capability, they often lack reliable safety mechanisms.
        In contrast, academic safety research remains fragmented and lags behind in capability. This divergence has raised
        significant concerns about the trustworthiness of physical AI systems.</p>
      <p class="section-text" style="margin-top: 0;">
        To address this gap, we propose a unified research framework that integrates capability advancement and
        trustworthy
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
            <li><span class="dot">•</span><span class="label">Goal</span><span class="text">Refuse harmful instructions;
                follow basic safety norms.</span></li>
            <li><span class="dot">•</span><span class="label">How</span><span class="text">Instruction tuning, RLHF,
                safety filters, red-teaming data.</span></li>
            <li><span class="dot">•</span><span class="label">Limit</span><span class="text">Correlation-based; vulnerable
                to jailbreaks and shifts.</span></li>
          </ul>
        </article>

        <article class="f2-card">
          <h3>L2 — Intervention <span>(Oversight-based Resistance)</span></h3>
          <ul class="f2-bullets">
            <li><span class="dot">•</span><span class="label">Goal</span><span class="text">Let humans halt/redirect
                <i>before</i> risky actions.</span></li>
            <li><span class="dot">•</span><span class="label">How</span><span class="text">Interrupt channels, intent/plan
                display, trajectory visualization.</span></li>
            <li><span class="dot">•</span><span class="label">Limit</span><span class="text">Needs constant oversight;
                weak scalability to high autonomy.</span></li>
          </ul>
        </article>
      </div>

      <!-- BOTTOM: L3–L5 -->
      <div class="f2-row f2-row-bottom">
        <article class="f2-card">
          <h3>L3 — Mimetic Reflection <span>(Foundational Resilience)</span></h3>
          <ul class="f2-bullets">
            <li><span class="dot">•</span><span class="label">Goal</span><span class="text">Internalize validated safe
                behaviors.</span></li>
            <li><span class="dot">•</span><span class="label">How</span><span class="text">Imitation learning, behavior
                cloning, curated safety playbooks.</span></li>
            <li><span class="dot">•</span><span class="label">Limit</span><span class="text">Limited generalization to
                novel tasks and combinations.</span></li>
          </ul>
        </article>

        <article class="f2-card">
          <h3>L4 — Evolutionary Reflection <span>(Adaptive Resilience)</span></h3>
          <ul class="f2-bullets">
            <li><span class="dot">•</span><span class="label">Goal</span><span class="text">Continual self-improvement;
                proactive patching.</span></li>
            <li><span class="dot">•</span><span class="label">How</span><span class="text">Continual learning, self
                red-teaming, safety-aware exploration.</span></li>
            <li><span class="dot">•</span><span class="label">Limit</span><span class="text">Empirical assurance only — no
                prior formal guarantees.</span></li>
          </ul>
        </article>

        <article class="f2-card">
          <h3>L5 — Verifiable Reflection <span>(Guaranteed Resilience)</span></h3>
          <ul class="f2-bullets">
            <li><span class="dot">•</span><span class="label">Goal</span><span class="text">Provable safety/stability of
                closed-loop behavior.</span></li>
            <li><span class="dot">•</span><span class="label">How</span><span class="text">Reachability/invariance
                analysis, control-theoretic synthesis, neuro-symbolic proofs.</span></li>
            <li><span class="dot">•</span><span class="label">Limit</span><span class="text">Model/compute-intensive;
                engineering maturity evolving.</span></li>
          </ul>
        </article>
      </div>
    </section>




  </section>
</template>

<script>
export default {
  name: 'PaperIntro',
  props: { paper: { type: Object, default: () => ({ title: '', authors: [], affiliations: [] }) } },
  data() {
    return {
      affTargetWidth: 0,
      affCnLetterSpacing: 0,
      affEnWordSpacing: 0,
      affEnLetterSpacing: 0
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.affMeasure();
      window.addEventListener('resize', this.affMeasure);
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.affMeasure);
  },
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

    ,
    /** Affiliation helpers */
    affCountGaps(s) {
      const pure = (s || '').replace(/\s+/g, '').replace(/[，。、“”‘’·—\-·・]/g, '');
      return Math.max(pure.length - 1, 1);
    },
    affCountEnSpaces(s) {
      return ((s || '').match(/ /g) || []).length;
    },
    affCountEnGaps(s) {
      const t = (s || '').trim();
      return Math.max(t.length - 1, 1);
    },
    affMeasure() {
      const cnEl = this.$refs.affCn;
      const enEl = this.$refs.affEn;
      if (!cnEl || !enEl) return;

      // 暂时清空样式以获得自然宽度
      const oldCnLS = cnEl.style.letterSpacing;
      const oldCnW = cnEl.style.width;
      const oldEnW = enEl.style.width;
      const oldEnWS = enEl.style.wordSpacing;
      const oldEnLS = enEl.style.letterSpacing;
      cnEl.style.letterSpacing = '0px';
      cnEl.style.width = 'max-content';
      enEl.style.width = 'max-content';
      enEl.style.wordSpacing = '0px';
      enEl.style.letterSpacing = '0px';
      enEl.style.width = 'max-content';

      const cnBase = cnEl.getBoundingClientRect().width || 0;
      const enW = enEl.getBoundingClientRect().width || 0;
      const tgt = Math.max(cnBase, enW);

      const gaps = this.affCountGaps(cnEl.textContent || '');
      const spacing = gaps > 0 ? (tgt - cnBase) / gaps : 0;
      const spacingClamped = Math.max(Math.min(spacing, 14), 0.5);

      this.affTargetWidth = Math.max(tgt, cnBase + spacingClamped * gaps);
      this.affCnLetterSpacing = spacingClamped;

      const finalTarget = this.affTargetWidth;
      const spaceCount = this.affCountEnSpaces(enEl.textContent || '');
      if (spaceCount > 0) {
        this.affEnWordSpacing = (finalTarget - enW) / spaceCount;
        this.affEnLetterSpacing = 0;
      } else {
        const enGaps = this.affCountEnGaps(enEl.textContent || '');
        this.affEnLetterSpacing = (finalTarget - enW) / enGaps;
        this.affEnWordSpacing = 0;
      }

      cnEl.style.letterSpacing = oldCnLS;
      cnEl.style.width = oldCnW;
      enEl.style.width = oldEnW;
      enEl.style.wordSpacing = oldEnWS;
      enEl.style.letterSpacing = oldEnLS;
      enEl.style.wordSpacing = oldEnWS;
      enEl.style.letterSpacing = oldEnLS;
    }
  }
}
</script>

<style scoped>
.intro {
  padding: 28px 0 16px;
  text-align: center;
  overflow: visible;
}

.grid.column {
  grid-template-columns: 1fr !important;
  text-align: center;
}

/* Title */
.title {
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
  font-size: clamp(16px, 1.8vw, 22px);
  /* 字体更大 */
}

.author {
  color: #3b82f6;
  /* 浅蓝 */
  text-decoration: none;
  font-weight: 500;
}

.author:hover {
  color: #2563eb;
  /* hover 更深蓝 */
  text-decoration: underline;
}

.sep {
  color: #9ca3af;
  margin: 0 .2rem;
}

.mark {
  color: #000;
  /* 星号黑色 */
  font-size: 0.7em;
  /* 缩小一点 */
  margin-left: 1px;
  /* 微调 */
}

/* Affiliation */
.affil {
  color: #6b7280;
  margin: 6px auto 14px;
  max-width: 900px;
}

/* Action buttons */
.actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 8px 0 16px;
}

.pill {
  border-radius: 999px;
  padding: 8px 14px;
  text-transform: none;
  font-weight: 600;
  background: #1f2937;
  color: #e5e7eb;
}

.pill:hover {
  filter: brightness(1.08);
}

.pill.ghost {
  background: #111827;
  border: 1px solid #334155;
  color: #cbd5e1;
}

/* Hero image */
.hero {
  border-radius: 16px;
  overflow: hidden;
  margin: 6px auto 10px;
  max-width: 1200px;
}

/* Abstract + side figure */
.grid {
  margin: 10px auto 0;
  max-width: 1100px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  text-align: left;
}

@media (min-width: 960px) {
  .grid {
    grid-template-columns: 1.2fr .8fr;
    gap: 20px;
  }
}

.subhead {
  margin: 8px 0 6px;
  font-size: 20px;
  font-weight: 800;
}

.abstract {
  margin: 0 0 8px;
  color: #111827;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: #eef2ff;
  color: #1e3a8a;
  border: 1px solid #c7d2fe;
}

.side {
  margin: 0;
  text-align: center;
}

.img {
  border-radius: 12px;
}

.cap {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
}

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
  margin-bottom: 16px;
  /* ⬅ 原来可能是 22px，可适当减小 */
}



.tags {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tag {
  font-size: 12px;
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
.figure2-section.f2-compact {
  /* 调这三项：逐渐变宽（图 < 上排 < 下排）+ 卡片宽度 */
  --f2-figure-max: 1020px;
  /* figure 更窄 */
  --f2-card-w: 336px;
  /* 小卡片稍宽，避免挤成竖排 */
  --f2-card-w-bottom: calc(var(--f2-card-w) + 36px);
  --f2-gap-top: 28px;
  /* ↑↑ 上排两卡间距更大 → 渐进式变宽 */
  --f2-gap-bottom: 14px;

  /* 子弹三列的“绝对像素”宽度，跨卡片完全对齐 */
  --f2-dot-w: 12px;
  --f2-label-w: 6.2ch;
  /* Goal./How./Limit. 列宽，必要时调 64–72px */
  --f2-col-gap: 4px;

  max-width: calc(3 * var(--f2-card-w-bottom) + 2 * var(--f2-gap-bottom));
  margin: 28px auto 0;
  padding: 0 12px;

  /* 防全局 break-all 影响 */
  word-break: normal;
}

.figure2-section {
  text-align: left;
}

.figure2-section.f2-compact * {
  word-break: normal !important;
  overflow-wrap: break-word;
  white-space: normal !important;
}

.f2-title {
  margin: 0 0 6px;
  font-size: 22px;
  line-height: 1.3;
  text-align: center;
}

.f2-lead {
  margin: 6px auto 12px;
  max-width: 70ch;
  text-align: center;
  color: #444;
  font-size: 14.5px
}

/* Figure block */
.f2-figure {
  margin: 6px auto 10px;
  max-width: var(--f2-figure-max);
  text-align: center
}

.f2-figure img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, .06)
}

.f2-figure figcaption {
  margin-top: 6px;
  font-size: .9rem;
  color: #5b5b5b
}

/* Rows：2 + 3，且“上排间距更大”制造渐进式变宽 */
.f2-row {
  display: grid;
  justify-content: center;
  margin-left: auto;
  margin-right: auto
}

.f2-row-top {
  grid-template-columns: repeat(2, var(--f2-card-w));
  gap: var(--f2-gap-top);
  width: calc(2 * var(--f2-card-w) + var(--f2-gap-top));
  margin: 12px auto 10px;
}

.f2-row-bottom {
  grid-template-columns: repeat(3, var(--f2-card-w-bottom));
  gap: var(--f2-gap-bottom);
  width: calc(3 * var(--f2-card-w-bottom) + 2 * var(--f2-gap-bottom));
  margin: 10px auto 0;
}

/* Cards */
.f2-card {
  width: var(--f2-card-w);
  border: 1px solid #ececec;
  border-radius: 12px;
  background: #fff;
  padding: 8px 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, .04);
  min-width: 0;
  line-height: 1.5;
  text-align: left;
}

.f2-row-bottom .f2-card {
  width: var(--f2-card-w-bottom);
}

.f2-card h3 {
  margin: 0 0 4px;
  font-size: 15px
}

.f2-card h3 span {
  color: #666;
  font-weight: 500;
  font-size: .92em
}

/* Bullets：3 列像素网格（• / Label / Text）—— 所有卡片完全对齐 */
.f2-bullets {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 14px
}

.f2-bullets li {
  display: grid;
  grid-template-columns: var(--f2-dot-w) var(--f2-label-w) 1fr;
  column-gap: var(--f2-col-gap);
  align-items: flex-start;
  margin: 2px 0;
  min-width: 0;
}

.f2-bullets .dot {
  display: block;
  width: var(--f2-dot-w);
  text-align: center;
  font-weight: 700;
  line-height: 1.5;
  position: relative;
  top: 2px;
}

.f2-bullets .label {
  display: block;
  width: var(--f2-label-w);
  font-weight: 700;
  white-space: nowrap;
}

.f2-bullets .text {
  display: block;
  min-width: 0
}

/* Responsive */
@media (max-width: 980px) {
  .f2-row-bottom {
    grid-template-columns: repeat(2, var(--f2-card-w));
    width: calc(2 * var(--f2-card-w) + var(--f2-gap-bottom));
  }
}

@media (max-width: 650px) {
  .f2-row-top {
    grid-template-columns: var(--f2-card-w);
    width: var(--f2-card-w)
  }

  .f2-row-bottom {
    grid-template-columns: var(--f2-card-w);
    width: var(--f2-card-w)
  }

  .f2-title {
    font-size: 20px
  }

  .f2-lead {
    font-size: 14px
  }
}


.f2-bullets .label::after {
  content: ":";
  margin-left: .25ch;
}

.affil-row {
  display: flex;
  align-items: center;
  /* 与 logo 垂直居中 */
  justify-content: center;
  /* 整体居中到版心 */
  gap: 10px;
  /* logo 与文字间距 */
  margin: 6px 0 14px;
}

.affil-logo {
  line-height: 0;
}

.affil-logo img {
  height: 40px;
  /* 需要更贴近图一可调到 36–44px */
  width: auto;
  display: block;
}

.affil-text {
  user-select: text;
  /* 文本可复制 */
  -webkit-user-select: text;
  white-space: nowrap;
  /* 禁止自动换行，确保测量准确 */
  text-align: left;
  /* 左对齐 -> 与图一一致 */
  line-height: 1.15;
}

.affil-text .cn {
  display: block;
  font-size: 14px;
  font-weight: 500;
  /* 取消粗黑，更接近图一 */
  margin-bottom: 2px;
  color: #1a1a1a;
}

.affil-text .en {
  display: block;
  font-size: 12px;
  color: rgba(0, 0, 0, .60);
}

/* 可选：暗色模式微调 */
@media (prefers-color-scheme: dark) {
  .affil-text .cn {
    color: #eaeaea;
  }

  .affil-text .en {
    color: rgba(255, 255, 255, .65);
  }
}


/* --- Affiliation (logo + two lines equal width) --- */
.aff-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 6px 0 14px;
}

.aff-logo-link {
  line-height: 0;
}

.aff-logo {
  height: 40px;
  width: auto;
  display: block;
}

.aff-names {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  white-space: nowrap;
  user-select: text;
  -webkit-user-select: text;
}

.aff-cn {
  font-size: 16px;
  font-weight: 500;
}

.aff-en {
  font-size: 12.5px;
  opacity: .82;
}


/* —— Abstract card —— */
.abs-wrap {
  --abs-max: 1040px;
  /* 宽度上限：可改 760/820/920 */
  --abs-pad: 20px;
  /* 内边距 */
  --abs-radius: 14px;
  /* 圆角 */
  --abs-shadow: 0 6px 20px rgba(0, 0, 0, .06);
  --abs-accent-1: #3b82f6;
  /* 左到右的渐变色 1（蓝） */
  --abs-accent-2: #8b5cf6;
  /* 渐变色 2（紫） */

  position: relative;
  box-sizing: border-box;
  margin: 28px auto 28px;
  max-width: var(--abs-max);
  padding: calc(var(--abs-pad) + 6px) var(--abs-pad) var(--abs-pad);
  border-radius: var(--abs-radius);
  background:
    linear-gradient(#fff, #fff) padding-box,
    linear-gradient(90deg, var(--abs-accent-1), var(--abs-accent-2)) border-box;
  border: 1px solid transparent;
  box-shadow: var(--abs-shadow);
}

.abs-badge {
  position: absolute;
  top: -10px;
  left: 16px;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: .12em;
  text-transform: uppercase;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, .08);
  color: #334155;
}

.abs-body {
  line-height: 1.7;
  font-size: 15.5px;
  color: #1f2937;
  max-width: 72ch;
  margin: 0 auto;
}

.abs-placeholder {
  color: #6b7280;
  font-style: italic;
}

@media (max-width: 640px) {
  .abs-wrap {
    --abs-max: 92vw;
    padding: 20px 14px 14px;
  }

  .abs-body {
    font-size: 14.5px;
  }

  .abs-badge {
    left: 12px;
  }
}


/* Increase vertical gap specifically between affiliation row and abstract card */
.aff-row+.abs-wrap {
  margin-top: 32px;
}


/* —— Abstract band (full-bleed, #f5f5f5) —— */

.aff-row+
/* 与机构名额外拉开 */


/* full-bleed background via pseudo-element */

.abs-inner {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

.abs-title {
  text-align: center;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: .01em;
  color: #1f2937;
  margin: 0 0 16px;
}

.abs-text {
  line-height: 1.9;
  font-size: 16px;
  color: #374151;
  text-align: justify;
  /* align both edges */
  text-justify: inter-word;
  /* better spacing for Latin text */
  -webkit-hyphens: auto;
  /* enable hyphenation */
  -ms-hyphens: auto;
  hyphens: auto;
  overflow-wrap: break-word;
  /* avoid overflow */
  word-break: normal;
  text-indent: 2em;
  /* first-line indent like print */
}

.abs-placeholder {
  color: #6b7280;
  font-style: italic;
}

@media (max-width: 640px) {

  .abs-inner {
    max-width: 92vw;
    padding: 0 14px;
  }

  .abs-title {
    font-size: 22px;
    margin-bottom: 10px;
  }

  .abs-text {
    font-size: 15px;
    line-height: 1.8;
    text-align: justify;
    text-justify: inter-word;
    -webkit-hyphens: auto;
    -ms-hyphens: auto;
    hyphens: auto;
    text-indent: 2em;
  }
}

/* Abstract 带状（本体只负责内容排版） */


/* 用 ::before 画满整屏背景条（#f5f5f5），不受父容器宽度限制 */

/* 旧浏览器兜底（不支持 100dvw 时退回 100vw） */
@supports not (width: 100dvw) {}

/* 中间正文列 */
.abs-inner {
  position: relative;
  z-index: 1;
  max-width: 900px;
  /* 可按需改窄/加宽 */
  margin: 0 auto;
  padding: 0 20px;
}


/* fix abstract background color */
.abs-band {
  background-color: #f5f5f5;
  /* width: 100%; */
}



/* ===== Full-bleed Abstract v4 (container-agnostic) ===== */
.abs-band {
  /* background: transparent; */
  padding: 48px 0 52px;
  margin: 36px 0;
  position: relative;

  /* Key: escape any parent padding by expanding to the viewport via negative margins */
  width: auto;

  /* fix abstract width */
  /* margin-left: calc(-50dvw + 50%); */
  /* margin-right: calc(-50dvw + 50%); */
}

@supports not (width: 100dvw) {
  .abs-band {
    margin-left: calc(-50vw + 50%);
    margin-right: calc(-50vw + 50%);
  }
}

/* Inner content stays centered and constrained */
.abs-inner {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Relax horizontal clipping up the tree */
:deep(html),
:deep(body),
:deep(#app),
:deep(.v-application),
:deep(.v-main) {
  overflow-x: visible !important;
}

/* ===== End ===== */
/* ===== Abstract block - minimal & darker ===== */
.abs-band {
  /* 主色 / 深度（可按需更改） */
  --abs-accent: #334155;
  /* slate-700 更清晰；想更亮用 #2563eb */
  --abs-stroke: rgba(51, 65, 85, .70);
  /* 边框颜色（更深） */
  --abs-corner: 18px;
  /* 角标长度 */
  --abs-weight: 2px;
  /* 角标粗细 */
}

.abs-inner {
  position: relative;
  padding: 28px 28px 24px;
  /* 保证四角不压到文字 */
  border-radius: 14px;
  /* background: #fff; */
  /* 更清晰的细边框 */
  /* box-shadow: 0 0 0 1px var(--abs-stroke); */
}

/* 四角极简“L”角标（更深、更稳、不会遮字） */
/* .abs-inner::before {
  content: "";
  position: absolute;
  inset: 10px;
  pointer-events: none;
  background:
    linear-gradient(var(--abs-accent), var(--abs-accent)) left top /var(--abs-corner) var(--abs-weight) no-repeat,
    linear-gradient(var(--abs-accent), var(--abs-accent)) left top /var(--abs-weight) var(--abs-corner) no-repeat,
    linear-gradient(var(--abs-accent), var(--abs-accent)) right top /var(--abs-corner) var(--abs-weight) no-repeat,
    linear-gradient(var(--abs-accent), var(--abs-accent)) right top /var(--abs-weight) var(--abs-corner) no-repeat,
    linear-gradient(var(--abs-accent), var(--abs-accent)) left bottom /var(--abs-corner) var(--abs-weight) no-repeat,
    linear-gradient(var(--abs-accent), var(--abs-accent)) left bottom /var(--abs-weight) var(--abs-corner) no-repeat,
    linear-gradient(var(--abs-accent), var(--abs-accent)) right bottom /var(--abs-corner) var(--abs-weight) no-repeat,
    linear-gradient(var(--abs-accent), var(--abs-accent)) right bottom /var(--abs-weight) var(--abs-corner) no-repeat;
  opacity: .9;
} */

/* 可选：左右极简“记号线”点缀（给 <section> 增加类 abs-band--ticks 即可） */
.abs-band.abs-band--ticks .abs-inner::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(var(--abs-accent), var(--abs-accent)) 12px 22px/14px 1px no-repeat,
    linear-gradient(var(--abs-accent), var(--abs-accent)) calc(100% - 12px) 22px/14px 1px no-repeat,
    linear-gradient(var(--abs-accent), var(--abs-accent)) 12px calc(100% - 22px)/14px 1px no-repeat,
    linear-gradient(var(--abs-accent), var(--abs-accent)) calc(100% - 12px) calc(100% - 22px)/14px 1px no-repeat;
  opacity: .55;
}

/* 标题：去长横线，改为“三点分隔”更克制 */
.abs-title {
  margin: 0 0 10px;
  text-align: center;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: .3px;
  color: #0f172a;
}

.abs-title::after {
  content: "• • •";
  display: block;
  margin: 10px auto 4px;
  line-height: 1;
  font-size: 18px;
  letter-spacing: 6px;
  color: var(--abs-accent);
  opacity: .9;
}

/* 正文排版 */
.abs-text {
  font-size: 16px;
  line-height: 1.9;
  color: #1f2937;
}

/* 暗色模式适配（可留可去） */
@media (prefers-color-scheme: dark) {
  .abs-inner {
    background: #0b0f14;
    box-shadow: 0 0 0 1px rgba(148, 163, 184, .35);
  }

  .abs-title {
    color: #e5e7eb;
  }

  .abs-text {
    color: #cbd5e1;
  }

  .abs-band {
    --abs-accent: #7dd3fc;
    --abs-stroke: rgba(148, 163, 184, .35);
  }
}

.abs-title::after {
  content: none !important;
  display: none !important;
}
</style>
