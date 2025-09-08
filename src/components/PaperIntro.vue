<template>
  <section class="intro">
    <!-- Title -->
    <h1 class="title">
      {{ paper.title }}
    </h1>

    <!-- Authors -->
    <div class="authors">
    <!-- 
      直接在HTML中手动列出每一位作者。
      - 名字和符号包裹在 <a> 标签内。
      - 符号本身放在 <sup> 标签内。
      - 作者之间的逗号用 <span class="sep"> 分隔。
    -->
    <a href="https://tanxincs.github.io/" target="_blank" class="author">Xin&nbsp;Tan<sup>*</sup></a><span class="sep">, </span>
    <a href="#" target="_blank" class="author">Bangwei&nbsp;Liu<sup>*</sup></a><span class="sep">, </span>
    <a href="#" target="_blank" class="author">Yicheng&nbsp;Bao</a><span class="sep">, </span>
    <a href="https://fangzhou2000.github.io/" target="_blank" class="author">Qijian&nbsp;Tian</a><span class="sep">, </span>
    <a href="#" target="_blank" class="author">Zhenkun&nbsp;Gao</a><span class="sep">, </span>
    <a href="#" target="_blank" class="author">Xiongbin&nbsp;Wu</a><span class="sep">, </span>
    <a href="#" target="_blank" class="author">Zhihao&nbsp;Luo</a><span class="sep">, </span>
    <br /> <!-- 在这里手动换行 -->
    <a href="#" target="_blank" class="author">Sen&nbsp;Wang</a><span class="sep">, </span>
    <a href="#" target="_blank" class="author">Yuqi&nbsp;Zhang</a><span class="sep">, </span>
    <a href="https://wangxuhongcn.github.io" target="_blank" class="author">Xuhong&nbsp;Wang<sup>&sect;</sup></a><span class="sep">, </span>
    <a href="https://causallu.com/" target="_blank" class="author">Chaochao&nbsp;Lu<sup>&sect;&dagger;</sup></a><span class="sep">, </span>
    <a href="https://scholar.google.com/citations?user=h3Nsz6YAAAAJ&hl=zh-CN&oi=ao" target="_blank" class="author">Bowen&nbsp;Zhou<sup>&sect;&Dagger;</sup></a>
  </div>


    <!-- Affiliation -->
    <!-- Affiliation -->
    <div class="aff-row">
      <!-- 上海人工智能实验室 -->
      <div class="aff-item">
        <a href="https://www.shlab.org.cn/" target="_blank" rel="noopener" class="aff-logo-link"
          aria-label="Shanghai AI Lab">
          <img src="@/assets/ailab.png" alt="Shanghai Artificial Intelligence Laboratory" class="aff-logo" />
        </a>
        <div class="aff-names" title="">
          <!-- 关键：不再绑定 :style 宽度/间距，由 CSS 控制等宽 -->
          <div ref="affCn1" class="aff-cn">上海人工智能实验室</div>
          <div ref="affEn1" class="aff-en">Shanghai Artificial Intelligence Laboratory</div>
        </div>
      </div>

      <!-- 华东师范大学 -->
      <div class="aff-item">
        <a href="https://www.ecnu.edu.cn/" target="_blank" rel="noopener" class="aff-logo-link"
          aria-label="East China Normal University">
          <img src="@/assets/ecnu.png" alt="East China Normal University" class="aff-logo" />
        </a>
        <div class="aff-names" title="">
          <div ref="affCn2" class="aff-cn">华东师范大学</div>
          <div ref="affEn2" class="aff-en">East China Normal University</div>
        </div>
      </div>

      <!-- 清华大学 -->
      <div class="aff-item">
        <a href="https://www.tsinghua.edu.cn/" target="_blank" rel="noopener" class="aff-logo-link"
          aria-label="Tsinghua University">
          <img src="@/assets/thu.png" alt="Tsinghua University" class="aff-logo" />
        </a>
        <div class="aff-names" title="">
          <div ref="affCn3" class="aff-cn">清华大学</div>
          <div ref="affEn3" class="aff-en">Tsinghua University</div>
        </div>
      </div>
    </div>
    <!-- Visual + English Introduction -->

    <!-- 在作者信息后添加按钮 -->
    <div class="actions" v-if="paper.links">
      <a v-if="paper.links.paper && paper.links.paper !== '#'" :href="paper.links.paper" target="_blank"
        class="action-btn">
        <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
        Paper(Coming Soon)
      </a>

      <a v-if="paper.links.code && paper.links.code !== '#'" :href="paper.links.code" target="_blank" class="action-btn">
        <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
        </svg>
        GitHub
      </a>

      <a v-if="paper.links.arxiv && paper.links.arxiv !== '#'" :href="paper.links.arxiv" target="_blank"
        class="action-btn">
        <i class="ai ai-arxiv"></i>
        arXiv(Coming Soon)
      </a>
    </div>
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
      <v-img :src="withBase('images/figure1.png')" contain class="full-img" />
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
        <img :src="withBase('images/figure2.png')" alt="Figure 2: The five levels of Make Safe EAI" />
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
import { withBase } from '@/utils/base'
import { ref } from 'vue';
export default {
  name: 'PaperIntro',
  props: { paper: { type: Object, default: () => ({ title: '', authors: [], affiliations: [] }) } },
  setup() {
    // 1. 把 authors 的定义放在 setup 函数内部
    const authors = ref([
      { name: 'Xin Tan',      nameHtml: 'Xin Tan<sup>*</sup>',                  homepage: 'https://tanxincs.github.io/' },
      { name: 'Bangwei Liu',  nameHtml: 'Bangwei Liu<sup>*</sup>',                homepage: '#' },
      { name: 'Yicheng Bao',  nameHtml: 'Yicheng Bao',                          homepage: '#' },
      { name: 'Qijian Tian',  nameHtml: 'Qijian Tian',                          homepage: 'https://fangzhou2000.github.io/' },
      { name: 'Zhenkun Gao',  nameHtml: 'Zhenkun Gao',                          homepage: '#' },
      { name: 'Xiongbin Wu',  nameHtml: 'Xiongbin Wu',                          homepage: '#' },
      { name: 'Zhihao Luo',   nameHtml: 'Zhihao Luo',                           homepage: '#' },
      { name: 'Sen Wang',     nameHtml: 'Sen Wang',                             homepage: '#' },
      { name: 'Yuqi Zhang',   nameHtml: 'Yuqi Zhang',                           homepage: '#' },
      { name: 'Xuhong Wang',  nameHtml: 'Xuhong Wang<sup>&sect;</sup>',           homepage: 'https://wangxuhongcn.github.io' },
      { name: 'Chaochao Lu',  nameHtml: 'Chaochao Lu<sup>&sect;&dagger;</sup>',   homepage: 'https://causallu.com/' },
      { name: 'Bowen Zhou',   nameHtml: 'Bowen Zhou<sup>&sect;&Dagger;</sup>',    homepage: 'https://scholar.google.com/citations?user=h3Nsz6YAAAAJ&hl=zh-CN&oi=ao' }
    ]);

    // 2. 必须把 authors 返回，这样 template 才能使用它
    return {
      authors
    };
  },
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
      this.equalizeAffPerItem();
      window.addEventListener('resize', this.equalizeAffPerItem, { passive: true });
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.equalizeAffPerItem);
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
    withBase,
    // 用这个替换你现在的 equalizeAffPerItem / affMeasure（名字随你，mounted/resize 调它）
    equalizeAffPerItem() {
      const items = this.$el.querySelectorAll('.aff-item');

      items.forEach((item) => {
        const box = item.querySelector('.aff-names');
        const cn = item.querySelector('.aff-cn');
        const en = item.querySelector('.aff-en');
        const logo = item.querySelector('.aff-logo');
        if (!box || !cn || !en) return;

        // 复位：取自然宽度
        [cn, en].forEach((el) => {
          el.style.width = 'auto';
          el.style.letterSpacing = '0px';
          el.style.wordSpacing = '0px';
          el.style.paddingRight = '0px';
          el.style.whiteSpace = 'nowrap';
          el.style.display = 'inline-block'; // 允许 padding-right 精确补偿
        });
        box.style.width = 'auto';
        box.style.flex = '0 0 auto';

        // 当前可用宽度（避免小屏被撑开）
        const cs = getComputedStyle(item);
        const gapPx = parseFloat(cs.columnGap || cs.gap || '0');
        const itemW = Math.round(item.getBoundingClientRect().width);
        const logoW = logo ? Math.round(logo.getBoundingClientRect().width) : 0;
        const avail = Math.max(0, itemW - logoW - gapPx - 2); // -2 容错

        // 自然宽
        const cnW = Math.ceil(cn.scrollWidth);
        const enW = Math.ceil(en.scrollWidth);
        const want = Math.max(cnW, enW);

        // 目标宽度：不超过可用（小屏时避免“logo↔文字远”）
        const target = Math.min(want, avail > 0 ? avail : want);
        box.style.width = target + 'px';

        // === 中文：按字间距拉伸，并用 padding-right 吃掉浮点误差 ===
        const cnPure = (cn.textContent || '').replace(/\s+/g, '').replace(/[，。、“”‘’·—\-・]/g, '');
        const cnGaps = Math.max(cnPure.length - 1, 0);
        const cnDelta = target - cnW;
        let cnPad = 0;
        if (cnGaps > 0 && cnDelta > 0) {
          let ls = cnDelta / cnGaps;          // 理论字间距
          ls = Math.min(Math.max(ls, 0), 10); // 上限 10px，避免难看
          const filled = ls * cnGaps;
          cnPad = Math.max(0, target - (cnW + filled)); // 浮点误差补偿
          cn.style.letterSpacing = ls.toFixed(3) + 'px';
        }
        cn.style.paddingRight = cnPad.toFixed(3) + 'px';
        cn.style.width = target + 'px';

        // === 英文：优先词间距，无空格再用字间距，同样做误差补偿 ===
        const enText = en.textContent || '';
        const spaces = (enText.match(/ /g) || []).length;
        const enDelta = target - enW;
        let enPad = 0;
        if (enDelta > 0) {
          if (spaces > 0) {
            let ws = enDelta / spaces;
            ws = Math.min(Math.max(ws, 0), 18); // 上限 18px
            const filled = ws * spaces;
            enPad = Math.max(0, target - (enW + filled));
            en.style.wordSpacing = ws.toFixed(3) + 'px';
          } else {
            const letters = enText.replace(/\s+/g, '');
            const gaps = Math.max(letters.length - 1, 0);
            if (gaps > 0) {
              let ls = enDelta / gaps;
              ls = Math.min(Math.max(ls, 0), 6); // 英文字间距上限 6px
              const filled = ls * gaps;
              enPad = Math.max(0, target - (enW + filled));
              en.style.letterSpacing = ls.toFixed(3) + 'px';
            }
          }
        }
        en.style.paddingRight = enPad.toFixed(3) + 'px';
        en.style.width = target + 'px';
      });
    },


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
      // 清空之前可能残留的内联样式，交给 CSS 计算 max-content 宽度
      const cnEls = [this.$refs.affCn1, this.$refs.affCn2, this.$refs.affCn3].filter(Boolean);
      const enEls = [this.$refs.affEn1, this.$refs.affEn2, this.$refs.affEn3].filter(Boolean);
      [...cnEls, ...enEls].forEach((el) => {
        if (!el) return;
        el.style.width = '';
        el.style.letterSpacing = '';
        el.style.wordSpacing = '';
      });

      // 保留原有变量以兼容其它代码路径，但这里不再参与计算
      this.affTargetWidth = 0;
      this.affCnLetterSpacing = 0;
      this.affEnWordSpacing = 0;
      this.affEnLetterSpacing = 0;
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
  color: #2d3748;
  /* 浅蓝 */
  text-decoration: none;
  font-weight: 500;
}

.author:hover {
  color: #546a9e;
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
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  margin: 16px 0 20px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 50px;
  background: #2d3748;
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.action-btn:hover {
  background: #4a5568;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 55, 72, 0.4);
}

.action-btn:active {
  transform: translateY(0);
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 响应式 */
@media (max-width: 640px) {
  .actions {
    gap: 8px;
  }

  .action-btn {
    padding: 8px 16px;
    font-size: 13px;
  }

  .btn-icon {
    width: 14px;
    height: 14px;
  }
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
  gap: 40px;
  /* 增加机构之间的间距，防止重叠 */
  margin: 6px 0 14px;
  flex-wrap: wrap;
}

.aff-item {
  display: flex;
  align-items: center;
  gap: 0px;
  /* 非常小的间距，或者设为0完全紧贴 */
  margin: 4px 0;
}

.aff-logo-link {
  line-height: 0;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
}

.aff-logo {
  height: 40px;
  width: auto;
  display: block;
  margin: 0;
  padding: 0;
}

.aff-names {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  white-space: nowrap;
  user-select: text;
  -webkit-user-select: text;
  min-width: 0;
  margin: 0;
  padding: 0;
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

/* 小屏幕适配 */
/* 小屏幕适配 */
/* 小屏幕适配 */
/* 小屏幕适配 */
@media (max-width: 768px) {
  .aff-row {
    flex-direction: column;
    gap: 30px;
  }

  .aff-item {
    justify-content: center;
    width: 100%;
    gap: 0;
    /* 小屏幕上也完全紧贴 */
  }

  .aff-logo {
    height: 36px;
  }

  .aff-cn {
    font-size: 15px;
  }

  .aff-en {
    font-size: 12px;
  }

}

@media (max-width: 480px) {
  .aff-row {
    gap: 24px;
  }

  .aff-item {
    gap: 0;
    /* 超小屏幕也完全紧贴 */
  }

  .aff-logo {
    height: 32px;
  }

  .aff-cn {
    font-size: 14px;
  }

  .aff-en {
    font-size: 11px;
  }

}

/* —— Affiliation（唯一权威版本） —— */
.aff-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 40px;
  margin: 6px 0 14px;
}

.aff-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  column-gap: 8px;
}

/* logo 贴文字 */
.aff-logo {
  flex: 0 0 auto;
  height: 40px;
  width: auto;
  display: block;
}

.aff-names {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  white-space: nowrap;
  text-align: center;
  line-height: 1.25;
  width: auto;
}

.aff-cn,
.aff-en {
  display: inline-block;
  white-space: nowrap;
}

.aff-cn {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 3px;
}

.aff-en {
  font-size: 12.5px;
  opacity: .82;
}

/* 小屏收紧（但不再设置 min-width） */
@media (max-width: 768px) {
  .aff-row {
    gap: 24px;
    flex-direction: column;
  }

  .aff-item {
    width: 100%;
    justify-content: center;
    gap: 6px;
    column-gap: 6px;
  }

  .aff-logo {
    height: 36px;
  }

  .aff-cn {
    font-size: 15px;
    margin-bottom: 2px;
  }

  .aff-en {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .aff-row {
    gap: 20px;
  }

  .aff-item {
    gap: 4px;
    column-gap: 4px;
  }

  .aff-logo {
    height: 32px;
  }

  .aff-cn {
    font-size: 14px;
  }

  .aff-en {
    font-size: 11px;
  }
}

.authors .mark-container {
  vertical-align: super;
  line-height: 0;
  color: #000;
  display: inline-block;
}

.authors .mark-container span {
  display: inline-block;

  /* 关键：底部对齐 */
}

.authors .section-char {
  font-size: 0.9em;
  transform: scale(0.7);
  /* §缩放到80% */
  transform-origin: center bottom;
  /* 从底部缩放 */
  top: -0.8em;
}

.authors .normal-char {
  font-size: 0.9em;
}
.author {
  color: #2d3748; /* 这是一个示例深蓝色，请改成您想要的颜色 */
  text-decoration: none;
}
.author:hover {
  text-decoration: underline;
}


/* 
  ==================================================================
  这是最关键的一行代码：
  我们专门选中 .author 内部的 <sup> 标签（也就是角标）
  并只修改它的样式。
  ==================================================================
*/
.author sup {
  /* 1. 将角标的颜色强制设置为黑色 */
  color: black;

  /* 
    2. (强烈推荐保留) 修正符号大小不一致的问题。
    这会让 § † ‡ 等符号使用更适合它们的字体来渲染，看起来就统一了。
  */
  font-family: 'Times New Roman', serif;
}


/* 其他辅助样式 */
.authors {
  line-height: 1.8;
}
.sep {
  /* 让逗号和作者名字颜色一致 */
  color: #34495e; 
}
</style>
