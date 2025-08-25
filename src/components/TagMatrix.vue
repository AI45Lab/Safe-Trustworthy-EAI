
<template>
  <section class="tmx" :style="rootStyle">
    <!-- Header -->
    
<div class="tmx__toolbar">
  <div class="tmx__title">
    <span class="bar" aria-hidden="true"></span>
    <h2>Filter by Categories</h2>
  </div>

  <div class="tmx__spacer"></div>

  <div class="tmx__cta-right">
    <span class="tmx-desc">Think your work fits this topic? <b>Share it with us — we review regularly.</b></span>
    <SubmitPaperClient
      buttonLabel="Share your paper ✨"
      :showHint="false"
      variant="outlined"
      color="primary"
      rounded="pill"
      density="comfortable"
      size="default"
      prependIcon=""
    />
  </div>
</div>



    <!-- Legend -->
    <div class="tmx__legend">
      <span class="dot safety"></span><span>Safety</span>
      <span class="separator">•</span>
      <span class="dot trust"></span><span>Trustworthiness</span>
    </div>

    <!-- Matrix -->
    <div class="tmx__matrixWrap">
      <div class="tmx__matrix" :class="fitClass">
        <!-- corner -->
        <div class="corner"></div>

        <!-- column headers -->
        <template v-for="col in columns" :key="'col-'+col.en">
          <div class="colhead" :class="col.kind">
            <span class="colhead__text" :title="col.en">{{ shortCol(col.en) }}</span>
          </div>
        </template>

        <!-- rows -->
        <template v-for="row in rowsDef" :key="'row-'+row.en">
          <div class="rowhead">
            <span class="rowhead__text">{{ row.en }}</span>
          </div>

          <!-- cells -->
          <template v-for="col in columns" :key="row.en + '-' + col.en">
            <button
              class="cell"
              :class="{ active: isActive(row.en, col.en), safety: col.kind==='safety', trust: col.kind==='trust' }"
              :title="cellTitle(row.en, col.en)"
              @click="toggle(row.en, col.en)"
            >
              <span class="count">{{ cellCount(row.en, col.en) }}</span>
            </button>
          </template>
        </template>
      </div>
    </div>

    <!-- Active chips -->
    <div class="chips" v-if="pairChips.length">
      <button class="chip" v-for="c in pairChips" :key="c.key" @click="removePairChip(c)">
        {{ c.rowEn }} × {{ shortCol(c.colEn) }}
        <span class="x">✕</span>
      </button>
      <button class="chip" @click="clearAll">Clear all</button>
    </div>

    <!-- Summary -->
    <div class="tmx__summary">
      <strong>{{ filtered.length }}</strong> paper(s) match current filters
    </div>
  </section>
</template>

<script setup>
import SubmitPaperClient from '@/components/SubmitPaperClient.vue'
import { computed, reactive, ref, watch } from 'vue'

/* ======================
   Props & Emits
====================== */
const props = defineProps({
  fitPage: { type: Boolean, default: true },

  colMin: { type: Number, default: 128 },
  rowLabelWidth: { type: Number, default: 210 },
rows: { type: Array, default: () => [] },      // alternative input key
  rowsData: { type: Array, default: () => [] },  // preferred input key
  placeholder: { type: String, default: 'Search papers, authors, tags…' },
  showSearch: { type: Boolean, default: false },
  onTagClick: { type: Function, default: null }, // ignored here; accepted to avoid extraneous prop warning
})
const emit = defineEmits(['filtered'])



const fitClass = computed(() => (props.fitPage ? 'full' : '')); 
const rootStyle = computed(() => ({ '--tmx-col-min': props.colMin + 'px', '--tmx-row-label-w': props.rowLabelWidth + 'px' }));
const rowsInput = computed(() => (props.rows && props.rows.length ? props.rows : (props.rowsData || [])))

/* ======================
   Dictionaries
====================== */
const catMap  = { '安全':'Safety', '可信':'Trustworthiness' }
const specMap = {
  '防滥用':'Abuse Prevention','价值对齐':'Value Alignment','抗攻击':'Attack Resistance',
  '隐私可保护':'Privacy Protection','可标识':'Identifiability','可解释':'Explainability',
  '可靠':'Reliability','可控':'Controllability','可审计':'Auditability','准确':'Accuracy',
}
const stageMap = {
  '指令理解':'Instruction Understanding',
  '环境感知':'Environment Perception',
  '物理交互':'Physical Interaction',
  '决策规划':'Action Planning',
}

/* ======================
   Columns & Rows
====================== */
const columns = [
  // Safety (green)
  { cn: '安全-防滥用', en: 'Safety - Abuse Prevention',   kind: 'safety' },
  { cn: '安全-价值对齐', en: 'Safety - Value Alignment',   kind: 'safety' },
  { cn: '安全-抗攻击',  en: 'Safety - Attack Resistance', kind: 'safety' },
  { cn: '安全-隐私可保护', en: 'Safety - Privacy Protection', kind: 'safety' },
  { cn: '安全-可标识',  en: 'Safety - Identifiability',   kind: 'safety' },
  // Trust (blue)
  { cn: '可信-可解释', en: 'Trustworthiness - Explainability', kind: 'trust' },
  { cn: '可信-可靠',   en: 'Trustworthiness - Reliability',   kind: 'trust' },
  { cn: '可信-可控',   en: 'Trustworthiness - Controllability',kind: 'trust' },
  { cn: '可信-可审计', en: 'Trustworthiness - Auditability',   kind: 'trust' },
  { cn: '可信-准确',   en: 'Trustworthiness - Accuracy',       kind: 'trust' },
]
const rowsDef = [
  { cn: '指令理解', en: 'Instruction Understanding' },
  { cn: '环境感知', en: 'Environment Perception' },
  { cn: '物理交互', en: 'Physical Interaction' },
  { cn: '决策规划', en: 'Action Planning' },
]

// strip prefixes for display
function shortCol(s){
  return String(s).replace(/^\s*Safety\s*-\s*/i,'').replace(/^\s*Trustworthiness\s*-\s*/i,'').trim()
}

/* ======================
   Parse helpers
====================== */
const SEP = /[;,，、]\s*/g
function normalizeCnKey(s){
  return String(s || '')
    .replace(/\u3000/g, ' ')
    .replace(/[（）()]/g, '')
    .replace(/(性|度)$/,'')
    .trim()
}
function parsePrinciplesCn(raw){
  const cleaned = normalizeCnKey(raw)
  if (!cleaned) return []
  const items = cleaned.split(SEP).filter(Boolean)
  const out = []; const seen = new Set()
  for (const it of items){
    const t = it.includes('-') ? it : (catMap[it] ? it : null)
    const val = t ? it : it // allow either full pair or single term
    if (!seen.has(val)){ seen.add(val); out.push(val) }
  }
  return out
}
function parseStagesCn(raw){
  const cleaned = normalizeCnKey(raw)
  if (!cleaned) return []
  return cleaned.split(SEP).filter(Boolean)
}

function toEnPrinciple(cn){
  const s = normalizeCnKey(cn)
  if (!s) return ''
  if (s.includes('-')){
    const [cat, spec] = s.split('-', 2)
    const catEn = catMap[cat] || cat
    const specEn = specMap[spec] || spec
    return `${catEn} - ${specEn}`
  }
  return specMap[s] || catMap[s] || s
}
function toEnStage(cn){ return stageMap[cn] || cn }

/* ======================
   Local state
====================== */
const query = ref('')
const KSEP = '__@@__'
function pairKey(rowEn, colEn){ return `${rowEn}${KSEP}${colEn}` }
const activePairs = reactive(new Set())

/* ======================
   Normalize incoming rows
====================== */
const normalized = computed(() => {
  return (rowsInput.value || []).map(row => {
    const title = row.title || row['标题'] || row['题目'] || ''
    const link = row.link || row.url || row.href || row['外链'] || row['链接'] || row['论文链接'] || row['原文链接'] || row['地址'] || row['source'] || row['Source'] || row['paperUrl'] || row['pdf'] || row['arXiv'] || ''
    const firstAuthor = row.firstAuthor || row['一作'] || row['第一作者'] || ''
    const date = row.date || row['发表年月'] || row['发表时间'] || ''
    const principleCn = row.principleTag || row['10大原则'] || row['原则'] || ''
    const stageCn     = row.stageTag || row['4个阶段'] || row['阶段'] || ''

    const principleCnList = parsePrinciplesCn(principleCn)
    const stageCnList     = parseStagesCn(stageCn)
    const principleEnList = principleCnList.map(toEnPrinciple).filter(Boolean)
    const stageEnList     = stageCnList.map(toEnStage).filter(Boolean)

    return {
      raw: row,
      title, link, firstAuthor, date,
      principleEnList,
      stageEnList,
      haystack: [title, firstAuthor, principleEnList.join(' '), stageEnList.join(' ')].join(' ').toLowerCase(),
    }
  })
})

/* ======================
   Filtering & counts
====================== */
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const base = normalized.value.filter(p => !q || p.haystack.includes(q))
  if (!activePairs.size) return base
  return base.filter(p => {
    for (const key of activePairs){
      const [rowEn, colEn] = key.split(KSEP)
      if (p.stageEnList.includes(rowEn) && p.principleEnList.includes(colEn)) return true
    }
    return false
  })
})
watch(filtered, (arr) => emit('filtered', arr.map(x => ({
  ...x.raw,
  // ensure a normalized `link` prop for downstream PaperCard
  link: x.raw?.link || x.link || x.raw?.url || x.raw?.href || x.raw?.['外链'] || x.raw?.['链接'] ||
        x.raw?.['论文链接'] || x.raw?.['原文链接'] || x.raw?.['地址'] || x.raw?.source || x.raw?.Source ||
        x.raw?.paperUrl || x.raw?.pdf || x.raw?.arXiv || ''
}))), { immediate: true })

function cellCount(rowEn, colEn){
  return normalized.value.reduce((acc, p) => {
    return acc + (p.stageEnList.includes(rowEn) && p.principleEnList.includes(colEn) ? 1 : 0)
  }, 0)
}
function isActive(rowEn, colEn){ return activePairs.has(pairKey(rowEn, colEn)) }
function toggle(rowEn, colEn){
  const k = pairKey(rowEn, colEn)
  if (activePairs.has(k)) activePairs.delete(k)
  else activePairs.add(k)
}
function cellTitle(rowEn, colEn){
  const n = cellCount(rowEn, colEn)
  return `${rowEn} × ${colEn} — ${n} paper${n===1?'':'s'}`
}

/* ======================
   Chips
====================== */
const pairChips = computed(() => {
  const out = []
  for (const key of activePairs){
    const [rowEn, colEn] = key.split(KSEP)
    out.push({ key, rowEn, colEn })
  }
  return out
})
function removePairChip(chip){ activePairs.delete(chip.key) }
function clearAll(){ activePairs.clear(); query.value = '' }
</script>

<style scoped>
/* Layout */
.tmx{ display:flex; flex-direction:column; gap: 10px; }

/* Toolbar */
.tmx__toolbar{ display:flex; align-items:center; justify-content:space-between; gap:10px; flex-wrap:wrap; padding-right: var(--edge-r,24px); }
.tmx__spacer{ flex:1 1 auto; }
.tmx__title{ display:flex; align-items:center; gap:10px; }
.tmx__title .bar{ width:6px; height:20px; border-radius:3px; background:linear-gradient(180deg, #10b981, #60a5fa); }
.tmx__title h2{ font-size: 20px; font-weight:700; color:#0f172a; letter-spacing:0.2px; }

/* Search */
.tmx__search{ position:relative; display:flex; align-items:center; gap:8px; padding:6px 10px; border:1px solid #e5e7eb; border-radius:10px; background:#fff; box-shadow:0 1px 2px rgba(15,23,42,.05); min-width:280px; }
.tmx__search .icon{ width:18px; height:18px; opacity:.6 }
.tmx__search input{ border:none; outline:none; font-size:13px; width:240px; color:#0f172a }
.tmx__search .clear{ border:0; background:transparent; cursor:pointer; color:#64748b }


/* Neutral pill button for the CTA */
.tmx__cta-right :deep(.spc-btn){
  min-width: 168px;
  height: 52px;
  padding: 0 20px;
  font-weight: 600;
  font-size: 0.98rem;
  letter-spacing: 0.02em;
  border-radius: 9999px;
  background: #ffffff !important;
  color: #111827 !important; /* slate-900 */
  border: 1px solid rgba(15,23,42,.08) !important; /* subtle border */
  box-shadow:
    0 6px 20px rgba(15,23,42,.06),
    0 2px 8px rgba(15,23,42,.04);
  text-transform: none;
}
.tmx__cta-right :deep(.spc-btn:hover){
  box-shadow:
    0 10px 30px rgba(15,23,42,.12),
    0 4px 12px rgba(15,23,42,.06);
  transform: translateY(-1px);
}
.tmx__cta-right :deep(.spc-btn:active){ transform: translateY(0); }


/* Outlined blue style to match the top Search button */
.tmx__cta-right :deep(.spc-btn){
  height: 52px;
  padding: 0 20px;
  font-weight: 600;
  font-size: 0.98rem;
  letter-spacing: 0.02em;
  border-radius: 9999px;
  background: transparent !important;
  color: #2563eb !important;
  border: 1.5px solid #3b82f6 !important;
  box-shadow: none;
  text-transform: none;
}
.tmx__cta-right :deep(.spc-btn:hover){
  background: rgba(59,130,246,.06) !important;
}


.tmx__cta-right{ display:flex; align-items:center; gap:12px; margin-left:auto; margin-right:0; }
.tmx__cta-right :deep(.spc-btn){ margin-left:auto; }

/* Legend */
.tmx__legend{ display:flex; align-items:center; gap: 6px; color:#334155; font-size:13px; }
.tmx__legend .dot{ width:10px; height:10px; border-radius:50% }
.tmx__legend .dot.safety{ background:#10b981 }
.tmx__legend .dot.trust{ background:#3b82f6 }
.tmx__legend .separator{ opacity:.4; margin:0 6px }

/* Matrix container (larger frame, hide scrollbar) */
.tmx__matrixWrap{ overflow-x:auto; padding-bottom:8px; margin-bottom:8px;}
/* Grid: left sticky header + 10 narrow columns */
.tmx__matrix{
  display:grid;
  grid-template-columns: var(--tmx-row-label-w, 210px) repeat(10, minmax(var(--tmx-col-min, 128px), 1fr));
  border:1px solid #e5e7eb; border-radius:12px; background:#ffffff; overflow:visible;
}
.corner{ background:linear-gradient(180deg, rgba(16,185,129,.08), rgba(59,130,246,.08)); border-right:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; }

/* Headers */
.colhead{ padding: 16px 10px;  border-left:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; font-weight:600; font-size: 15px; color:#0f172a; position:relative; }
.colhead.safety::before{ content:''; position:absolute; inset:0 0 auto 0; height:3px; background:#10b981 }
.colhead.trust::before{ content:''; position:absolute; inset:0 0 auto 0; height:3px; background:#3b82f6 }
.colhead__text{ display:block; line-height:1.15; }

/* Row headers */
.rowhead{ padding: 16px;  border-top:1px solid #e5e7eb; border-right:1px solid #e5e7eb; font-weight:600; font-size: 16px; color:#0f172a; background:#f8fafc; position:sticky; left:0; z-index:1; }

/* Cells */
.cell{
  position:relative; display:flex; align-items:center; justify-content:center;
  padding: 16px 12px; border-top:1px solid #e5e7eb; border-left:1px solid #e5e7eb; background:#ffffff;
  cursor:pointer; transition: background .15s ease, transform .06s ease;
 font-size: 15px;}
.cell:hover{ background:#f8fafc; transform: translateZ(0); }
.cell.active::after{ content:''; position:absolute; inset:3px; border:2px solid #10b981; border-radius:8px; pointer-events:none; }
.cell.trust.active::after{ border-color:#3b82f6; }
.count{ font-variant-numeric: tabular-nums; font-weight:700; color:#0f172a;  font-size: 16px;}

/* Chips */
.chips{ display:flex; gap:8px; flex-wrap:wrap }
.chip{ border:1px solid #e5e7eb; border-radius:999px; padding:6px 10px; background:#fff; cursor:pointer; }
.chip .x{ margin-left:6px; color:#9aa4b2 }

/* Summary */
.tmx__summary{ font-size: 14px; color:#334155; }
.tmx__summary strong{ font-size:1rem }

/* Responsive */
@media (max-width: 1180px){ .tmx__matrix{ grid-template-columns: 160px repeat(10, minmax(102px,1fr)); } }
@media (max-width: 980px){ .tmx__matrix{ grid-template-columns: 140px repeat(10, minmax(96px,1fr)); } }
@media (max-width: 820px){ .tmx__matrix{ grid-template-columns: 120px repeat(10, minmax(92px,1fr)); } }

/* Fit-page mode: no horizontal scroll, squeeze columns evenly */
.tmx__matrix.full{
  grid-template-columns: var(--tmx-row-label-w, 210px) repeat(10, minmax(0, 1fr));
}
/* Make header text wrap nicely */
.colhead{ text-align:center; }
.colhead__text{ display:block; line-height:1.2; word-break:normal; overflow-wrap: anywhere; }
/* Hide horizontal scrollbar area in wrapper since we squeeze to fit */
.tmx__matrixWrap{ overflow-x: hidden; }


/* 3-column header under the big search: left title (unchanged), center description, right CTA */
.tmx__title{ display:flex; align-items:center; gap:16px; }
.tmx__title-left{ flex: 0 0 auto; }
.tmx__title-center{ flex: 1 1 auto; display:flex; justify-content:center; }
.tmx__title-right{ flex: 0 0 auto; display:flex; justify-content:flex-end; }
.tmx-desc{ font-size:1.2rem; font-weight:600; color:rgba(15,23,42,.9); white-space:nowrap; }
.tmx__cta-right{ display:flex; align-items:center; }
.tmx-cta .spc-btn{ height:48px; padding:0 20px; border-radius:9999px; font-weight:600; white-space:nowrap; }
/* Responsive */
@media (max-width: 960px){
  .tmx__title{ flex-wrap:wrap; }
  .tmx__title-center{ order: 3; width:100%; justify-content:flex-start; }
  .tmx__title-right{ order: 2; width:auto; }
  .tmx__title-left{ order: 1; }
  .tmx-desc{ white-space:normal; }
}

</style>