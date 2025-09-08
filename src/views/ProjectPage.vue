<template>
  <v-container class="project-page" fluid>
    <!-- ✅ 论文介绍模块：放在引用文献模块的上方 -->
    <paper-intro :paper="intro" class="mb-6"></paper-intro>
    <!-- 标题部分 -->
    <div class="header">
      <h1 class="title"><span class="title-decor" data-text="Awesome">Awesome</span> <span
          class="title-chip">Trustworthy</span> <span class="title-decor" data-text="Embodied-AI">Embodied-AI</span></h1>
    </div>


    <!-- 搜索和筛选区域 -->
    <div class="search-container">


      <!-- 搜索统计信息 -->
      <div class="search-stats" v-if="searchKeyword || selectedTags.length > 0">
        <v-chip small color="blue lighten-4" text-color="blue darken-3" class="ma-1">
          <v-icon small left>mdi-file-document-multiple</v-icon>
          {{ filteredPapers.length }} papers found
        </v-chip>
        <v-chip v-if="searchKeyword" small color="green lighten-4" text-color="green darken-3" class="ma-1" close
          @click:close="clearSearch">
          <v-icon small left>mdi-magnify</v-icon>
          "{{ searchKeyword }}"
        </v-chip>
      </div>

      <!-- 二维表格容器 -->
      <div class="tag-matrix-container"><tag-matrix :onTagClick="handleTagFilter" :rows-data="papers"
          @filtered="onMatrixFiltered" :key="tmxKey">
          <template #left-actions>

            <div class="search-bar">
              <v-text-field v-model="searchKeyword" class="search-input" dense outlined prepend-inner-icon="mdi-magnify"
                placeholder="Search papers by title" clearable @keyup.enter="filterPapers" hide-details />
              <v-btn class="search-btn" small elevation="0" @click="filterPapers">
                Search
              </v-btn>
            </div>

          </template>
          <template #footer-right>
            <button class="tmx-toggle" @click="showPaperList = !showPaperList">
              <template v-if="showPaperList">▲ HIDE PAPERS</template>
              <template v-else>▼ SHOW PAPERS ({{ filteredPapers.length }})</template>
            </button>
          </template>
        </tag-matrix>

        <!-- 活跃过滤器显示 -->
        <div class="active-filters" v-if="activeFilter">
          <v-divider class="my-4"></v-divider>
          <div class="text-center">
            <v-chip color="blue" dark close @click:close="clearTagFilter">
              <v-icon small left>mdi-filter</v-icon>
              {{ activeFilter }}
            </v-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- 论文列表（统一与上方容器相同的中心宽度） -->
    <div class="content-frame">
      <v-row justify="center" v-show="showPaperList">
        <v-col cols="12" lg="11" xl="11" v-for="(paper, i) in filteredPapers" :key="paper.title + (paper.date || i)">
          <PaperCard :title="paper.title" :principleTag="paper.principleTag" :stageTag="paper.stageTag"
            :firstAuthor="paper.author" :link="paper.link || '#'"
            :pubDate="String(paper.date ?? paper['发表年月'] ?? paper['发表时间'] ?? '')" :font-scale="0.90" />
        </v-col>
      </v-row>
    </div>


    <!-- 空状态提示 -->
    <v-row v-if="filteredPapers.length === 0" justify="center">
      <v-col cols="12" class="empty-state">
        <v-icon x-large color="grey lighten-1">mdi-file-search-outline</v-icon>
        <p class="mt-4">No papers found matching your criteria</p>
        <div class="mt-4">
          <v-btn color="blue lighten-2" text class="mr-3" @click="resetFilters">
            <v-icon left>mdi-refresh</v-icon>
            Reset Filters
          </v-btn>
          <v-btn color="green lighten-2" text @click="showAllPapers">
            <v-icon left>mdi-eye</v-icon>
            Show All Papers
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </v-container>




  <!-- 右下角贴边；两个“小小的”按钮 -->
  <FloatingFeedback fixed :offset-x="16" :offset-y="16" :reserve-below="0" :button-height="36" />

  <ImpactMetrics stars-repo="owner/repo" updated-repo="owner/repo"
    visitors-api="https://old-union-b7eb.3034297530.workers.dev/visitors"
    collect-api="https://old-union-b7eb.3034297530.workers.dev/collect" :top-n="5" />

  <!-- 放在页面靠底部的位置 BibTeX-->
  <v-container class="py-8">
    <v-row justify="center">
      <!-- 这里控制“窄”的程度可按需调整 -->
      <v-col cols="12" sm="11" md="10" lg="9" xl="9">
        <BibTeXSection class="mt-8" />
      </v-col>
    </v-row>
  </v-container>
</template>


<script>
import { ref, onMounted } from 'vue'
import PaperIntro from '@/components/PaperIntro.vue'
import PaperCard from '@/components/PaperCard.vue'
import TagMatrix from '@/components/TagMatrix.vue'
import csvData from '@/data/data.csv'
import SubmitPaperClient from '@/components/SubmitPaperClient.vue'
import { searchPapers } from '@/utils/paperSearch'
import { computed } from 'vue'
import BibTeXSection from '@/components/BibTeXSection.vue'
import FloatingFeedback from '@/components/FloatingFeedback.vue'
import ImpactMetrics from '@/components/ImpactMetrics.vue'

// === Sync feedback button width to match the Share button ===
function syncFeedbackWidth() {
  try {
    const wrappers = Array.from(document.querySelectorAll('.spc-fixed'));
    if (wrappers.length < 2) return;
    const getBottom = el => {
      const b = (el.style && el.style.bottom) ? el.style.bottom : getComputedStyle(el).bottom;
      const v = parseFloat((b || '0').replace('px', '')) || 0;
      return v;
    };
    // assume Share has larger bottom (offsetY + 84) and feedback has smaller (offsetY + 0)
    let shareWrap = null, fbWrap = null;
    wrappers.forEach(w => {
      const b = getBottom(w);
      if (b > 40) shareWrap = w; else fbWrap = w;
    });
    if (!shareWrap || !fbWrap) return;
    const btnShare = shareWrap.querySelector('.spc-btn');
    const btnFb = fbWrap.querySelector('.spc-btn');
    if (!btnShare || !btnFb) return;
    const w = Math.round(btnShare.getBoundingClientRect().width);
    if (w) btnFb.style.width = w + 'px';
  } catch (e) { /* noop */ }
}

// call once after mount, and on resize
onMounted(() => {
  const tick = () => syncFeedbackWidth();
  // run a few times to catch late hydration
  const t = setInterval(tick, 150);
  setTimeout(() => clearInterval(t), 2000);
  window.addEventListener('resize', tick, { passive: true });
});

// 把已有的数据源“取一个能用的”作为别名传给 TagMatrix
function toArr(x) { return Array.isArray(x) ? x : (Array.isArray(x?.value) ? x.value : []) }
const __paper_rows = computed(() => {
  const a = toArr(typeof filteredPapers !== 'undefined' ? filteredPapers : [])
  const b = toArr(typeof matrixFilteredRows !== 'undefined' ? matrixFilteredRows : [])
  const c = toArr(typeof papers !== 'undefined' ? papers : [])
  return a.length ? a : (b.length ? b : c)
})
const _STOP = new Set([
  'a', 'an', 'the', 'and', 'or', 'for', 'of', 'on', 'in', 'to', 'with', 'by', 'at', 'from',
  'about', 'as', 'is', 'are', 'be', 'was', 'were', 'this', 'that', 'these', 'those',
  'we', 'you', 'they', 'he', 'she', 'it', 'into', 'over', 'under', 'between', 'against',
  'without', 'within', 'across', 'per', 'via', 'using', 'use', 'than', 'then', 'there',
  'here', 'our', 'your', 'their'
])
const _norm = (s) => (s || '').toLowerCase().normalize('NFKC')
  .replace(/[_/]+/g, ' ')
  .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
  .replace(/-+/g, ' ')         // model-agnostic => model agnostic
  .replace(/\s+/g, ' ').trim()
const _words = (s) => _norm(s).split(' ').filter(Boolean)
const _toks = (s) => _words(s).filter(t => !_STOP.has(t) && t.length > 2)
const _containsPhrase = (titleWords, phraseTokens) => {
  if (!phraseTokens.length) return true
  for (let i = 0; i + phraseTokens.length <= titleWords.length; i++) {
    let ok = true
    for (let k = 0; k < phraseTokens.length; k++) {
      if (titleWords[i + k] !== phraseTokens[k]) { ok = false; break }
    }
    if (ok) return true
  }
  return false
}
export default {
  components: { PaperCard, TagMatrix, PaperIntro, BibTeXSection, SubmitPaperClient, FloatingFeedback },
  data() {
    return {
      matrixFilteredRows: null,
      tmxKey: 0,
      papers: [],
      searchKeyword: '',
      selectedTags: [],
      filteredPapers: [],
      activeFilter: '',
      showPaperList: true,
      showBackToTop: false,
      // ✅ 论文介绍模块的数据（示例）
      intro: {
        title: 'Towards Safe and Trustworthy Embodied AI: Foundations, Status, and Prospects',
        authors: [
          { name: 'Xin Tan', homepage: 'https://tanxincs.github.io/', symbol: '*' },
          { name: 'Bangwei Liu', homepage: '#', symbol: '*' },
          { name: 'Yicheng Bao', homepage: '#' },
          { name: 'Qijian Tian', homepage: 'https://fangzhou2000.github.io/' },
          { name: 'Zhenkun Gao', homepage: '#' },
          { name: 'Xiongbin Wu', homepage: '#' },
          { name: 'Zhihao Luo', homepage: '#' },
          { name: 'Sen Wang', homepage: '#' },
          { name: 'Yuqi Zhang', homepage: '#' },
          { name: 'Xuhong Wang', homepage: 'https://wangxuhongcn.github.io', symbol: '§' },
          { name: 'Chaochao Lu', homepage: 'https://causallu.com/', symbol: '§†' },
          { name: 'Bowen Zhou', homepage: 'https://scholar.google.com/citations?user=h3Nsz6YAAAAJ&hl=zh-CN&oi=ao', symbol: '§‡' }
        ],
        affiliation: 'Shanghai Artificial Intelligence Laboratory',

        links: {
          paper: 'https://ai45lab.github.io/Awesome-Trustworthy-Embodied-AI/',
          code:  'https://github.com/ai45lab/Awesome-Trustworthy-Embodied-AI',
          arxiv: 'https://ai45lab.github.io/Awesome-Trustworthy-Embodied-AI/',
          // project: '#',
          // dataset: '#'
        },

      }
    }
  },
  created() {
    this.processCSVData(csvData)
    this.filteredPapers = this.papers
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  computed: {
    __paper_rows() {
      const a = this.filteredPapers
      const b = this.matrixFilteredRows
      const c = this.papers
      if (Array.isArray(a) && a.length) return a
      if (Array.isArray(b) && b.length) return b
      return Array.isArray(c) ? c : []
    }
  },
  methods: {
    _isStop(w) {
      const s = (w || '').toString().toLowerCase();
      if (s.length <= 1) return true;
      // cache on instance
      if (!this.__stopSet) {
        this.__stopSet = new Set(['a', 'an', 'the', 'of', 'for', 'and', 'to', 'in', 'on', 'with', 'via', 'by', 'at', 'from', 'into', 'over', 'under', 'using']);
      }
      return this.__stopSet.has(s);
    },

    makeId(obj) {
      const o = obj || {}
      return String(o.link || o['链接'] || o['\cite{}'] || o.title || o['标题'] || '').toLowerCase().trim()
    },

    onMatrixFiltered(rows) {
      this.matrixFilteredRows = Array.isArray(rows) ? rows.map(r => r.raw || r) : null
      this.filterPapers()
    },
    // === 工具：标准化 & 分词 ===
    _norm(s) {
      return (s || '')
        .toString()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')    // 去重音
        .toLowerCase()
        .replace(/[_\-–—/\\\.,:;!?\(\)\[\]\{\}\"'`~@#$%^&*+=<>|]/g, ' ') // 符号归一
        .replace(/\s+/g, ' ')
        .trim()
    },
    _compact(s) { return this._norm(s).replace(/\s+/g, '') },

    _lev(a, b) { // 轻量 Levenshtein（只做 ≤1 的判定）——内部标准化，忽略大小写/重音/符号差异
      a = this._norm(a);
      b = this._norm(b);
      if (Math.abs(a.length - b.length) > 1) return 99
      if (a === b) return 0
      let i = 0, j = 0, edits = 0
      while (i < a.length && j < b.length) {
        if (a[i] === b[j]) { i++; j++; continue }
        edits++; if (edits > 1) return 99
        if (a.length > b.length) i++
        else if (a.length < b.length) j++
        else { i++; j++ }
      }
      if (i < a.length || j < b.length) edits++
      return edits
    },

    _tokenScore(text, token) {
      if (!token || !text) return -1
      const T = this._norm(text)
      const C = this._compact(text)
      const q = this._norm(token)
      const qC = this._compact(token)

      const words = T.split(' ')
      if (T.includes(q)) return 3.0
      if (C.includes(qC)) return 2.6
      if (words.some(w => w.startsWith(q))) return 2.2
      if (q.length >= 4 && words.some(w => this._lev(w, q) <= 1)) return 1.8
      return -1
    },

    _paperScore(p, query) {
      const phrase = this._norm(query);
      let tokensAll = phrase.split(/\s+/).filter(Boolean);
      let tokens = tokensAll.filter(t => !this._isStop(t));
      if (!tokens.length) tokens = tokensAll; // 兜底：全是停用词时仍保留

      const sumGroup = (val) => {
        const arr = Array.isArray(val) ? val : [val];
        let s = 0;
        for (const item of arr) {
          for (const tk of tokens) {
            const sc = this._tokenScore(item, tk);
            if (sc > 0) s += sc;
          }
        }
        return s;
      };

      let score = 0;

      // === 标题短语强力加权（确保“A Model …”等短语优先） ===
      const titleN = this._norm(p.title);
      if (phrase) {
        if (titleN === phrase) score += 2000; // 标题完全等于查询短语
        else if (titleN.startsWith(phrase)) score += 1200; // 短语为标题前缀
        else if ((' ' + titleN + ' ').includes(' ' + phrase + ' ')) score += 900; // 词边界包含
        else if (titleN.includes(phrase)) score += 800;  // 任意位置包含
      }

      // 字段权重：标题 > 分类/方法/应用/任务 > 关键词 > 作者 > 联系方式
      score += 12 * sumGroup(p.title);
      score += 6 * (sumGroup(p.macros) + sumGroup(p.apps) + sumGroup(p.tasks) + sumGroup(p.method));
      score += 4 * sumGroup(p.keywords);
      score += 3 * sumGroup(p.author);
      score += 1 * sumGroup(p.contact);
      return score;
    },

    handleScroll() {
      this.showBackToTop = window.scrollY > 300
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    resetFilters() {
      this.searchKeyword = ''
      this.selectedTags = []
      this.activeFilter = ''
      this.filteredPapers = this.papers

      this.matrixFilteredRows = null;
      this.tmxKey += 1;
    },
    clearSearch() {
      this.searchKeyword = ''
      this.filterPapers()
    },
    clearTagFilter() {
      this.activeFilter = ''
      this.filterPapers()
    },
    showAllPapers() {
      this.resetFilters()
    },
    processCSVData(rawData) {
      this.papers = rawData
        .map(row => {
          const safeSplit = v => (v || '')
            .toString()
            .split(/[;、，,\s]+/)
            .map(s => s.trim())
            .filter(Boolean);

          return {
            title: row['标题'] || '',
            date: row['发表年月'] || '',
            author: row['一作'] || '',
            authorOrg: row['一作单位'] || '',
            principleTag: row['10大原则'] || '',
            stageTag: row['4个阶段'] || '',
            contact: row['通讯'] || '',
            contactOrg: row['通讯单位'] || '',
            macros: safeSplit(row['宏观维度']),
            apps: safeSplit(row['应用维度']),
            tasks: safeSplit(row['具身任务']),
            method: safeSplit(row['方法论']),
            link: row['链接'] || ''
          }
        })
        .filter(paper => paper.title.trim() !== '')
    },

    // ✅ 核心过滤
    filterPapers() {
      let rows = Array.isArray(this.papers) ? this.papers.slice() : [];

      // Intersect with TagMatrix filtered rows if present
      if (Array.isArray(this.matrixFilteredRows) && this.matrixFilteredRows.length) {
        const ids = new Set(this.matrixFilteredRows.map(o => this.makeId(o)));
        rows = rows.filter(p => ids.has(this.makeId(p)));
      }

      // 标签过滤（保持原有 activeFilter 语义）
      if (this.activeFilter && this.activeFilter.includes('/')) {
        const [tag1, tag2] = this.activeFilter.split('/');
        rows = rows.filter(p =>
          Array.isArray(p?.macros) && p.macros.includes(tag1) &&
          Array.isArray(p?.apps) && p.apps.includes(tag2)
        );
      }
      const qRaw = (this.searchKeyword || '').trim()
      if (!qRaw) { this.filteredPapers = rows; return }

      // 使用严格版搜索（已“无停用词 + 连续短语硬门槛”）
      const res = searchPapers(rows, qRaw, 60)
      console.info('[ProjectPage] search called:', qRaw, '=>', res.length, 'items')
      this.filteredPapers = res
      return

    },

    handleTagFilter(tag1, tag2) {
      this.activeFilter = `${tag1}/${tag2}`
      this.filterPapers()
    }
  },

  watch: {
    searchKeyword() { this.filterPapers() }
  }

}
</script>

<style scoped>
/* Remove v-container left/right padding so full-bleed sections can reach viewport edges */
.project-page {
  padding-left: 0 !important;
  padding-right: 0 !important;}

/* 标题容器居中 */
.header {
  text-align: center;
  padding-block: clamp(24px, 6vw, 60px); padding-inline: 0;
  margin-bottom: clamp(12px, 3vw, 30px);margin-left: auto;
  margin-right: auto;
  margin-top: clamp(16px, 4.5vw, 64px);
}

/* 标题样式 - 超大字号，更吸引眼球 */
.title {

  position: relative;
  z-index: 0;
  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans';
  font-size: clamp(1.8rem, 5.2vw, 4.4rem);
  font-weight: 900;
  line-height: 1.04;
  letter-spacing: -0.02em;
  color: #f9fbff;
  text-align: center;
  margin: 0 auto;
  -webkit-text-stroke: 0.6px rgba(148, 163, 184, .28);
  /* slate-400, very light */
  text-shadow:
    0 1px 0 rgba(255, 255, 255, .55),
    /* subtle top highlight */
    0 10px 28px rgba(2, 6, 23, .06);
  /* far ambient */


  white-space: nowrap; overflow: visible;
}

/* 发光动画效果 */
@keyframes titleGlow {
  0% {
    text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
  }

  100% {
    text-shadow: 0 0 40px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.2);
  }
}


.title::before {
  content: '';
  position: absolute;
  inset: -8% -6% auto -6%;
  top: -22px;
  height: 80%;
  margin: 0 auto;
  left: 50%;
  transform: translateX(-50%);
  z-index: -1;
  background:
    radial-gradient(40% 60% at 25% 40%, rgba(16, 185, 129, .22), transparent 60%),
    radial-gradient(45% 60% at 65% 50%, rgba(34, 211, 238, .20), transparent 62%),
    radial-gradient(35% 55% at 50% 20%, rgba(99, 102, 241, .18), transparent 58%);
  filter: blur(28px);
  opacity: .95;
  pointer-events: none;
}

.title::after {

  content: '';
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -18px;
  width: min(44vw, 420px);
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(16, 185, 129, .18), rgba(56, 189, 248, .18), rgba(99, 102, 241, .18));
  filter: blur(5px);

}

/* 标题图标样式 - 更大更醒目 */
.title .v-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-right: 20px;
  /* 从15px增加到20px */
  font-size: 4.5rem !important;
  /* 从3rem增加到4.5rem */
  vertical-align: middle;
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3));
  /* 添加阴影效果 */
}

/* 响应式设计 - 移动设备上的标题调整 */
@media (max-width: 768px) {
  .title {
    font-size: 3rem;
    /* 移动设备上稍小一些 */
  
  white-space: nowrap; overflow: visible;
}

  .title .v-icon {
    font-size: 3rem !important;
    margin-right: 15px;
  }

  .title::after {
    width: clamp(56px, 20vw, 80px);
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 2.2rem;
    padding: 0 10px 25px 0;
  
  white-space: nowrap; overflow: visible;
}

  .title .v-icon {
    font-size: 2.2rem !important;
    margin-right: 10px;
  }
}

/* 搜索区域整体样式优化 */
.search-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(59, 130, 246, 0.15);
  padding: 35px 25px;
  border-radius: 24px;
  box-shadow:
    0 12px 35px rgba(59, 130, 246, 0.08),
    0 4px 15px rgba(0, 0, 0, 0.04);
  margin: 0 auto 40px auto;
  max-width: 1560px;
  /* 由 1400 -> 1560：扩大整体内容宽度，右侧更宽以达居中 */box-sizing: border-box;

  overflow: clip;
}

/* 搜索行样式 - 更宽敞的布局 */
.search-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  max-width: 1560px;
  /* 由 1100 -> 1200 */
  margin: 0 auto 30px auto;
}

/* 搜索输入框样式 - 更宽美观 */
.search-input {
  flex: 1;
  max-width: none;
  /* 由 630 -> 680 */
}

.search-input .v-input__slot {
  background: white !important;
  border-radius: 16px !important;
  box-shadow:
    0 6px 20px rgba(59, 130, 246, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04) !important;
  border: 1.5px solid rgba(59, 130, 246, 0.15) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  min-height: 52px !important;
  /* 稍微减少高度 */
}

.search-input .v-input__slot:hover {
  border-color: rgba(59, 130, 246, 0.35) !important;
  box-shadow:
    0 8px 25px rgba(59, 130, 246, 0.12),
    0 3px 12px rgba(0, 0, 0, 0.06) !important;
  transform: translateY(-1px);
}

.search-input .v-input--is-focused .v-input__slot {
  border-color: #3b82f6 !important;
  box-shadow:
    0 10px 30px rgba(59, 130, 246, 0.15),
    0 4px 15px rgba(0, 0, 0, 0.08),
    0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  transform: translateY(-2px);
}

/* 搜索按钮样式 - 更紧凑精致 */
.search-btn {
  min-width: 120px;
  /* 从140px减少到120px */
  height: 52px;
  /* 从56px减少到52px */
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
  border-radius: 16px;
  /* 与输入框保持一致 */
  box-shadow:
    0 6px 20px rgba(59, 130, 246, 0.25),
    0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: none;
  position: relative;
  overflow: hidden;
}

.search-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 25px rgba(59, 130, 246, 0.35),
    0 4px 15px rgba(0, 0, 0, 0.1);
}

.search-btn:hover::before {
  left: 100%;
}

.search-btn:active {
  transform: translateY(0);
}

/* 输入框内图标样式优化 */
.search-input .v-input__prepend-inner .v-input__icon {
  color: rgba(59, 130, 246, 0.6) !important;
}

.search-input .v-input--is-focused .v-input__prepend-inner .v-input__icon {
  color: #3b82f6 !important;
}

/* CSV装饰图标优化 */
.csv-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 6px;
  font-size: 11px;
  font-weight: bold;
  margin-left: 6px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

/* 统一内容中心宽度（与 search-container 一致） */
.content-frame,
.tag-matrix-container {
  position: relative;
  max-width: 1380px;
  /* 由 1400 -> 1560：右边更宽，视觉居中 */
  margin: 16px auto 40px;box-sizing: border-box;
}

/* 响应式设计 */
@media (max-width: 1768px) {
  .search-container {
    max-width: 95%;
    padding: 25px 20px;
    margin: 0 auto 30px auto;box-sizing: border-box;

  overflow: clip;
}

  .search-row {
    flex-direction: column;
    gap: 15px;
    max-width: 100%;
  }

  .search-input {
    max-width: 100%;
  }

  .search-btn {
    min-width: 100%;
    max-width: 300px;
  }
}

.search-stats {
  text-align: center;
  margin-top: 20px;
  margin-bottom: -10px;
}

.active-filters {
  margin-top: 15px;
}

.back-to-top-btn {
  z-index: 999;
}

.csv-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5em; height: 1.5em;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 8px;
}

/* === Search input polish === */
.search-row {
  gap: 12px;
  margin: 0 auto 24px auto;
}

.search-input .v-input__control {
  border-radius: 999px;
}

.search-input .v-field {
  border-radius: 999px !important;
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  min-height: clamp(44px, 6vw, 60px);
}

.search-input .v-field__outline {
  --v-field-border-opacity: 0;
}

.search-input .v-field__overlay {
  background: transparent !important;
}

.search-input input {
  font-size: 1.05rem;
}

.search-input .v-field__prepend-inner .v-icon {
  opacity: .6;
}

.search-input .v-input__prepend-inner {
  margin-right: 6px;
}

.search-input .v-field.v-field--focused {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, .15) inset;
}

.search-btn {
  min-height: clamp(42px, 5.5vw, 56px);
  border-radius: 999px;
  padding: 0 18px;
  font-size: 1.05rem;
}

/* Remove any stray CSV icon styles just in case */
.csv-icon {
  display: none !important;
}


/* Harmonize theme hues */
.search-input .v-field.v-field--focused {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, .15) inset;
}

/* blue-600 */
.search-btn {
  background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
}

/* blue-600 to blue-700 */

/* --- Search button: minimal outline style --- */
.search-btn {
  background: #ffffff !important;
  color: #1d4ed8 !important;
  /* blue-700 text */
  border: 1px solid #c7d2fe !important;
  /* indigo-200 border */
  box-shadow: 0 2px 6px rgba(29, 78, 216, .08);
}

.search-btn:hover {
  background: #eff6ff !important;
}

.search-btn:active {
  background: #dbeafe !important;
}

/* Tighten container spacing */
.search-container {
  padding: 20px 24px;box-sizing: border-box;

  overflow: clip;
}

.search-row {
  margin: 0 auto 16px auto;
}


/* === Harmonize page title (remove glowing icon, tighter spacing) === */
.title {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;

  white-space: nowrap; overflow: visible;
}

.title-icon {
  display: none !important;
}

/* hide any leftover icon */

/* === Refined title aesthetics === */
.title {
  letter-spacing: 0.02em;
  text-shadow: 0 1px 0 rgba(255, 255, 255, .25), 0 8px 24px rgba(37, 99, 235, .18);

  white-space: nowrap; overflow: visible;
}

.title::after {
  content: "";
  display: block;
  width: clamp(72px, 12vw, 110px);
  margin: 14px auto 0;
  background: linear-gradient(90deg, #22d3ee, #2563eb);
  box-shadow: 0 6px 24px rgba(37, 99, 235, .25);
}


.title-chip {
  display: inline-block;
  padding: clamp(.12em, .14em + .3vw, .22em) clamp(.36em, .4em + .5vw, .72em);
  margin: 0 clamp(.04em, .05em + .3vw, .14em);
  border-radius: 999px;
  background: linear-gradient(110deg, rgba(16, 185, 129, .95), rgba(34, 211, 238, .95));
  color: #fff;
  box-shadow:
    0 18px 40px rgba(16, 185, 129, .18),
    0 8px 22px rgba(34, 211, 238, .16),
    inset 0 1px 0 rgba(255, 255, 255, .35),
    inset 0 -1px 0 rgba(0, 0, 0, .08);
  border: 1px solid rgba(255, 255, 255, .25);
  backdrop-filter: saturate(140%) blur(3px);
  position: relative;
  overflow: hidden;

  -webkit-text-stroke: 0 transparent;
  text-shadow: none;

}

.title-chip::after {
  content: '';
  position: absolute;
  top: -30%;
  left: -35%;
  width: 40%;
  height: 160%;
  transform: rotate(20deg);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, .55), rgba(255, 255, 255, 0));
  filter: blur(6px);
  animation: chipSheen 4.8s linear infinite;
  opacity: .65;
}

@keyframes chipSheen {
  0% {
    left: -35%;
  }

  100% {
    left: 110%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .title-chip::after {
    animation: none;
    opacity: .25;
  }
}


/* 高级轮廓：双重描边 + 细微彩色内沿 */
.title-decor {

  position: relative;
  /* Pastel gradient fill + soft highlight band */
  color: transparent;
  background-image:
    linear-gradient(90deg, #f8fbff 0%, #e9fbff 32%, #eef2ff 68%, #f8fbff 100%),
    linear-gradient(180deg, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, .55) 50%, rgba(255, 255, 255, 0) 60%);
  background-size: 200% 100%, 100% 100%;
  background-position: 0% 0, 0 0;
  -webkit-background-clip: text;
  background-clip: text;

  /* Light main rim + gentle ambient */
  -webkit-text-stroke: 0.8px rgba(148, 163, 184, .34);
  text-shadow:
    0 0 .4px rgba(148, 163, 184, .28),
    0 10px 24px rgba(2, 6, 23, .06);

  /* Slow sheen */
  animation: titleSheen 12s linear infinite;

}

/* 外层淡色轮廓（更宽，柔和） */
.title-decor::before {

  content: attr(data-text);
  position: absolute;
  inset: 0;
  color: transparent;
  -webkit-text-stroke: 2.2px rgba(203, 213, 225, .65);
  /* outer soft rim: slate-300 */
  filter: blur(.4px);
  pointer-events: none;

}

/* 内沿高光（细线，青绿，提升精致感） */
.title-decor::after {

  content: attr(data-text);
  position: absolute;
  inset: 0;
  color: transparent;
  -webkit-text-stroke: 0.7px rgba(56, 189, 248, .44);
  /* inner cyan highlight */
  pointer-events: none;

}

.tmx-toggle {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
}

.tmx-toggle:hover {
  color: #0f172a;
  text-decoration: underline;
}

/* end of toggle styles */

@media (max-width: 1280px) {
  .search-container { width: 100% !important; }
  .tag-matrix-container { max-width: 100% !important; width: 100% !important; }
}

/* Make tables use full width without squishing columns too early */
.tag-matrix-container table { width: 100%; table-layout: auto; }


/* Make the intro cards slightly smaller and prevent collisions on narrower widths */
paper-intro { display:block; }

:deep(paper-intro) { 
  font-size: clamp(.88rem, 1vw, 1rem);
}

@media (max-width: 1600px) {
  :deep(paper-intro) { transform: scale(.94); transform-origin: top center; }
}
@media (max-width: 1440px) {
  :deep(paper-intro) { transform: scale(.9); transform-origin: top center; }
}
@media (max-width: 1280px) {
  :deep(paper-intro) { transform: scale(.86); }
}


/* ==== Fix: prevent overlap in Figure 2 cards (second row) ====
   将第二行的卡片布局统一成与第一行一致，并在页面缩放时避免重叠。
   注意：全部写成 :deep(...) 选择器，仅影响 paper-intro 内的 figure2。
============================================================== */
:deep(.figure2-section) {
  --f2-gap: 16px;
}

/* 顶部/底部两行统一使用自适应网格；缩放/缩放回时不会因为像素取整出现错位 */
:deep(.figure2-section .f2-row-top),
:deep(.figure2-section .f2-row-bottom) {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  grid-auto-rows: 1fr;
  gap: var(--f2-gap);
  align-items: stretch;
}

/* 卡片统一为常规文档流元素，去掉可能造成重叠的定位/位移/固定宽高 */
:deep(.figure2-section .f2-card) {
  position: static !important;
  transform: none !important;
  margin: 0 !important;
  width: 100% !important;
  max-width: none !important;
  height: auto !important;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 第二行卡片强制继承第一行的样式（防止“紧凑/特殊”样式导致高度异常） */
:deep(.figure2-section .f2-row-bottom .f2-card) {
  min-height: auto !important;
}

/* 保险起见，避免内容强制不换行导致撑开或重叠 */
:deep(.figure2-section.f2-compact *) {
  word-break: normal !important;
  overflow-wrap: break-word !important;
  white-space: normal !important;
}


</style>

<style scoped>
/* Enlarge the main frame so the whole 10-column matrix fits on common screens */
.project-page {
  /* max-width: 1680px !important; */
  /* 整体更窄 */
  /* width: min(96vw, 1480px); */
  margin-left: auto;
  margin-right: auto;}

/* 让搜索框稍微窄一点点 */
.search-input {
  width: 100%;
  max-width: none;
  min-width: 280px;
  flex: 1 1 auto;
}


/* 让 Search 按钮更圆（胶囊形） */
.search-btn {
  border-radius: 9999px !important;
  /* 更圆 */
  padding: 0 22px !important;
  /* 轻微加宽保持视觉平衡，可按需调 */
}


/* --- Placeholder link hardening: disable click & hover for empty/# links (works inside child components via :deep) --- */
:deep(a[href="#"]),
:deep(a[href=""]),
:deep(a[href^="javascript:"]),
:deep(a[aria-disabled="true"]),
:deep(a[data-disabled="true"]) {
  pointer-events: none;
  cursor: default;
  text-decoration: none;
}

:deep(a[href="#"]:hover),
:deep(a[href=""]:hover),
:deep(a[href^="javascript:"]:hover),
:deep(a[aria-disabled="true"]:hover),
:deep(a[data-disabled="true"]:hover) {
  text-decoration: none;
}


/* === zoom-safe inline search row === */
.search-container {
  width: min(1200px, 100% - 48px);
  margin: 0 auto 24px;box-sizing: border-box;

  overflow: clip;
}

.search-row {
  width: 100%;
  min-width: 0;
}

.search-input {
  width: 100%;
  max-width: none;
}

.search-btn {
  height: clamp(40px, 6vh, 48px);
  border-radius: 9999px;
  padding: 0 18px;
}

@media (max-width: 960px) {
  .search-btn {
    width: 100%;
  }
}

/* === Compact search bar tweaks (v2) === */
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-start;
  flex: 0 0 auto;
  margin-left: 0;
  /* background-color: red; */
  width: 100%;
}
.search-input {
  width: 100% !important; max-width: none; flex: 1 1 auto;
  /* smaller input */
  max-width: 100%;
  box-sizing: border-box;
  /* flex shrink override removed */
  flex: 1 1 auto;
}

.search-btn {
  min-width: 88px;
  height: 40px;
  padding: 0 14px;
  flex: 0 0 auto;
}

/* Optional: attach visual */
.search-input .v-input__slot {
  border-top-right-radius: 0 !important;
  border-bottom-right-radius: 0 !important;
}

.search-btn {
  border-top-left-radius: 0 !important;
  border-bottom-left-radius: 0 !important;
  /* remove negative margin to avoid overflow clipping */
  margin-left: 0 !important;
}

@media (max-width: 640px) {
  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: flex-end;
    justify-content: flex-start;
    max-width: 100%;
  }

  .search-input {
    width: 100% !important;
  }
}

/* === Search button pill style & alignment with external CTA === */
.search-btn {
  height: 44px !important;
  /* match pill buttons */
  min-width: 100px;
  padding: 0 18px !important;
  border-radius: 9999px !important;
  /* capsule */
  line-height: 44px;
}

/* keep input compact */
.search-input {
  width: 380px !important;
}

/* ensure baseline alignment inside bar */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
}

/* undo any previous left-corner flattening */
.search-input .v-input__slot {
  border-top-right-radius: var(--v-border-radius) !important;
  border-bottom-right-radius: var(--v-border-radius) !important;
}

/* === align Search with external CTA visually (same row height & offset) === */
.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
  /* nudge down to align with CTA row */
}

/* unify input height with 44px pill button */
.search-input .v-input__slot {
  min-height: 44px !important;
}

.search-input input {
  line-height: 44px !important;
  height: 44px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}

/* === Align "Search" with right edge so it vertically lines up with the CTA below === */
.search-container {
  width: 77%;box-sizing: border-box;

  overflow: clip;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: flex-end;
  max-width: none !important;
  width: 100% !important;
  justify-content: flex-end !important;
  /* push input+button to the right */
  padding-right: 12px;
  /* match card inner padding */
  margin-left: auto;
  /* ensure right alignment in centered layout */
}

/* keep the input compact */
.search-input {
  flex: 1 1 auto;
  width: 100% !important;
  max-width: none;
  min-width: 280px;
  /* flex reset removed */
  flex: 1 1 auto;
}

/* Hide the right-side CTA line inside TagMatrix header (generic, non-invasive) */
::v-deep(tag-matrix > div:first-child > div:last-child),
::v-deep(tag-matrix .header-right),
::v-deep(tag-matrix .text-right),
::v-deep(tag-matrix .cta),
::v-deep(tag-matrix .cta-line) {
  display: none !important;
}

/* Mobile: keep search visible and stack when needed */
@media (max-width: 1024px) {
  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: flex-end;
    top: -32px;
    /* background-color: blue; */

  }

  .search-input {
    /* max-width: 100%; */
    max-width: 100%;
  }

  .search-btn {
    width: 20px;
  }
}

@media (max-width: 640px) {
  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: flex-end;
    top: -24px;
    flex-wrap: wrap !important;
    justify-content: stretch;
    }

  .search-input {
    min-width: 0;
    flex: 1 1 100%;
  }
}

/* 让该页的 v-container 真正无左右留白（Vuetify 会默认加 24px） */
:deep(.v-container.project-page) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* 祖先容器允许横向溢出，否则 100vw 的背景会被裁掉 */
:deep(#app),
:deep(.v-application),
:deep(.v-application--wrap),
:deep(main) {
  overflow-x: visible !important;
}


.tmx-toggle {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 14px;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
}

.tmx-toggle:hover {
  color: #0f172a;
  text-decoration: underline;
}

/* end of toggle styles */



@media (max-width: 1280px) {
  .search-container { width: 100% !important; }
  .tag-matrix-container { max-width: 100% !important; width: 100% !important; }
}

/* Make tables use full width without squishing columns too early */
.tag-matrix-container table { width: 100%; table-layout: auto; }


/* Make the intro cards slightly smaller and prevent collisions on narrower widths */
paper-intro { display:block; }

:deep(paper-intro) { 
  font-size: clamp(.88rem, 1vw, 1rem);
}

@media (max-width: 1600px) {
  :deep(paper-intro) { transform: scale(.94); transform-origin: top center; }
}
@media (max-width: 1440px) {
  :deep(paper-intro) { transform: scale(.9); transform-origin: top center; }
}
@media (max-width: 1280px) {
  :deep(paper-intro) { transform: scale(.86); }
}




/* ==== Fix: prevent overlap in Figure 2 cards (second row) ====
   将第二行的卡片布局统一成与第一行一致，并在页面缩放时避免重叠。
   注意：全部写成 :deep(...) 选择器，仅影响 paper-intro 内的 figure2。
============================================================== */
:deep(.figure2-section) {
  --f2-gap: 16px;
}

/* 顶部/底部两行统一使用自适应网格；缩放/缩放回时不会因为像素取整出现错位 */
:deep(.figure2-section .f2-row-top),
:deep(.figure2-section .f2-row-bottom) {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  grid-auto-rows: 1fr;
  gap: var(--f2-gap);
  align-items: stretch;
}

/* 卡片统一为常规文档流元素，去掉可能造成重叠的定位/位移/固定宽高 */
:deep(.figure2-section .f2-card) {
  position: static !important;
  transform: none !important;
  margin: 0 !important;
  width: 100% !important;
  max-width: none !important;
  height: auto !important;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/* 第二行卡片强制继承第一行的样式（防止“紧凑/特殊”样式导致高度异常） */
:deep(.figure2-section .f2-row-bottom .f2-card) {
  min-height: auto !important;
}

/* 保险起见，避免内容强制不换行导致撑开或重叠 */
:deep(.figure2-section.f2-compact *) {
  word-break: normal !important;
  overflow-wrap: break-word !important;
  white-space: normal !important;
}


</style>