<template>
  <article class="paper-card" :style="{ '--pc-scale': String(fontScale) }">
    <!-- 顶部一行：左=标题(可省略) 右=tag(一行从右往左) -->
    <div class="top-row">
      <a class="title" :href="safeHref" target="_blank" rel="noopener noreferrer" :title="title">
        {{ title }}
      </a>
      <div class="tags-row">
        <span
          v-for="(t, i) in tagsRow"
          :key="'tag-' + i"
          class="pill"
          :class="t.kind === 'stage' ? 'pill-stage' : 'pill-principle'"
          :title="t.label"
        >{{ t.label }}</span>
      </div>
    </div>

    <!-- 底部一行：作者紧挨外链，外链在最右 -->
    <div class="foot">
      <span
        class="author"
        :title="`First author: ${firstAuthor}`"
        :aria-label="`First author: ${firstAuthor}`"
      >
        {{ firstAuthor }}
    </span>
    <span v-if="pubDateDisplay" class="date-pill" :title="pubDateDisplay">
      {{ pubDateDisplay }}
    </span>
      <a class="link-icon" :href="safeHref" target="_blank" rel="noopener noreferrer" aria-label="Open link">
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z" fill="currentColor"/>
        </svg>
      </a>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  principleTag: { type: String, required: true }, // 例：安全-抗攻击，安全-防滥用
  stageTag: { type: String, required: true },     // 例：环境感知 或 指令理解，决策规划
  firstAuthor: { type: String, required: true },
  link: { type: String, required: true },
  fontScale: { type: Number, default: 1 },
  ubDate: { type: [String, Number], default: '' },
})

/* -------- 规整 & 映射 -------- */
 const pubDateDisplay = computed(() => {
  const raw = (props.pubDate || '').toString().trim()
  if (!raw) return ''
  const r = raw.replace(/[\/-]/g, '.')
  // 2025.5 / 2025.05
  let m = r.match(/^(\d{4})\.(\d{1,2})$/)
  if (m) return `${m[1]}.${m[2].padStart(2,'0')}`
  // 25.5 / 25.05  -> 2025.05
  m = r.match(/^(\d{2})\.(\d{1,2})$/)
  if (m) return `20${m[1]}.${m[2].padStart(2,'0')}`
  // 202505 -> 2025.05
  m = r.match(/^(\d{4})(\d{2})$/)
  if (m) return `${m[1]}.${m[2]}`
  // 2505 -> 2025.05
  m = r.match(/^(\d{2})(\d{2})$/)
  if (m) return `20${m[1]}.${m[2]}`
  return r
})
const SEP = /[;,，、]\s*/g
function normalizeDash(s){ return String(s ?? '').replace(/[—–－]/g, '-').trim() }
function normalizeCnKey(s){
  return String(s || '')
    .replace(/\u3000/g, ' ')
    .replace(/[（）()]/g, '')
    .replace(/(性|度)$/, '')
    .trim()
}

const pairMap = {
  '安全-防滥用': 'Safety - Abuse Prevention',
  '安全-价值对齐': 'Safety - Value Alignment',
  '安全-抗攻击': 'Safety - Attack Resistance',
  '安全-隐私可保护': 'Safety - Privacy Protection',
  '安全-可标识': 'Safety - Identifiability',
  '可信-可解释': 'Trustworthiness - Explainability',
  '可信-可靠': 'Trustworthiness - Reliability',
  '可信-可控': 'Trustworthiness - Controllability',
  '可信-可审计': 'Trustworthiness - Auditability',
  '可信-准确': 'Trustworthiness - Accuracy',
}
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

function parsePrinciples(raw){
  const cleaned = normalizeDash(normalizeCnKey(raw))
  if (!cleaned) return []
  const items = cleaned.split(SEP).filter(Boolean)
  const out = []; const seen = new Set()
  for (const it of items) {
    if (it.includes('-')) {
      const [left, right] = it.split('-', 2).map(normalizeCnKey)
      const pair = `${left}-${right}`
      const en = pairMap[pair] || (catMap[left] ? `${catMap[left]} - ${specMap[right] || right}` : pair)
      if (!seen.has(en)) { seen.add(en); out.push(en) }
    } else {
      const en = specMap[it] || catMap[it] || it
      if (!seen.has(en)) { seen.add(en); out.push(en) }
    }
  }
  return out
}
function parseStages(raw){
  const cleaned = normalizeCnKey(raw)
  if (!cleaned) return []
  const items = cleaned.split(SEP).filter(Boolean)
  const out = []; const seen = new Set()
  for (const it of items) {
    const en = stageMap[it] || it
    if (!seen.has(en)) { seen.add(en); out.push(en) }
  }
  return out
}

const principleList = computed(() => parsePrinciples(props.principleTag))
const stageList     = computed(() => parseStages(props.stageTag))

// 第一行的顺序：右边先显示“阶段(蓝)”，左边接着“原则(绿)”
const tagsRow = computed(() => [
  ...stageList.value.map(label => ({ label, kind: 'stage' })),
  ...principleList.value.map(label => ({ label, kind: 'principle' })),
])

/* -------- 统一补全为绝对外链，避免被当成本站路由 -------- */
const safeHref = computed(() => {
  const raw = (props.link || '').trim()
  if (!raw) return '#'
  if (/^https?:\/\//i.test(raw)) return raw           // http/https
  if (raw.startsWith('//')) return 'https:' + raw     // 协议相对
  if (/^doi:/i.test(raw)) return 'https://doi.org/' + raw.replace(/^doi:\s*/i, '')
  if (/^10\.\d{4,9}\//.test(raw)) return 'https://doi.org/' + raw
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(raw)) return 'https://' + raw.replace(/^\/+/, '')
  return 'https://' + raw
})
</script>

<style scoped>
/* 卡片：两行布局 */
.paper-card{
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 8px 0;
  padding: 14px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,.04);
}

/* 顶部一行：标题(左) + tag(右) */
.top-row{
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

/* 标题：允许被 tag 挤占空间，最后再省略 */
.title{
  flex: 1 1 auto;
  min-width: 0;
  display: inline-block;
  margin: 0;
  font-size: calc(20px * var(--pc-scale, 1));
  font-weight: 600;
  line-height: 1.35;
  color: #0f172a;
  text-decoration: none;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.title:hover{ text-decoration: underline; }

/* tag 一行：从右往左排；不换行；左侧裁切 */
.tags-row{
  flex: 0 0 auto;
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: nowrap;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  max-width: 100%;
}

/* 胶囊 */
.pill{
  direction: ltr;
  display: inline-flex; align-items: center;
  padding: 2px 10px;
  line-height: 1.25;
  border-radius: 9999px;
  border: 1px solid var(--pill-bd, #e5e7eb);
  font-size: calc(12px * var(--pc-scale, 1));
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.pill-principle{ --pill-bd:#cfe8d7; background:#eaf7ef; color:#256c3a; }
.pill-stage    { --pill-bd:#cfe0f5; background:#eaf2fe; color:#1d4ed8; }

/* 底部一行：作者紧挨外链，整体靠右 */
.foot{
  display: flex;
  align-items: center;
  justify-content: flex-end;   /* 整体靠右 */
  gap: 8px;
  font-size: calc(13px * var(--pc-scale, 1));
  color: #4b5563;
  width: 100%;
}
.author{
  flex: 0 1 auto;            
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 发表时间小胶囊（中性灰） */
.date-pill{
  flex: 0 0 auto;
  padding: 0 8px;
  line-height: 20px;
  border-radius: 9999px;
  border: 1px solid #e5e7eb;
  background: #f3f4f6;
  color: #374151;
  font-size: calc(12px * var(--pc-scale, 1));
  white-space: nowrap;
}
.link-icon{
  flex: 0 0 auto; display:inline-flex; width:22px; height:22px;
  border-radius:9999px; align-items:center; justify-content:center;
  color:#2563eb; text-decoration:none;
}
.link-icon:hover{ background:#eff6ff; }

@media (max-width: 640px){
  .title{ font-size: calc(16px * var(--pc-scale, 1)); }
}
</style>
