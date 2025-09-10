
<template>
  <teleport to="body">
    <button v-if="hidden" class="metrics-fab" @click.stop="onReopen" aria-label="Open metrics">ⓘ</button>

    <div v-else class="impact-card floating"
      :style="{ left: pos.x + 'px', bottom: pos.y + 'px' }"
      @mousedown="onDragStart"
      @touchstart.self.prevent="onDragStart">
      <button class="close" aria-label="Close" @click.stop="onClose">×</button>

      <!-- 第一行：基础指标 -->
      <div class="metrics">
        <div class="metric">
          <div class="label">GitHub Stars</div>
          <div class="value">{{ formatNumber(stars) }}</div>
        </div>
        <div class="metric">
          <div class="label">Last Updated</div>
          <div class="value">{{ updatedAt || '—' }}</div>
        </div>
      </div>

      <!-- 来访国家统计（可选显示） -->
      <div v-if="countries.length" class="countries">
        <div class="countries-title">来访国家统计（Top {{ topN }}）</div>
        <div class="country-list">
          <div v-for="c in countries" :key="c.code" class="country">
            <span class="flag">{{ flagEmoji(c.code) }}</span>
            <span class="name">{{ regionName(c.code) }}</span>
            <span class="count">{{ formatNumber(c.count) }}</span>
          </div>
        </div>
      </div>

      <div class="cta">{{ ctaText }}</div>
    </div>
  </teleport>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
const POS_KEY = 'IMPACT_METRICS_POS'
const HIDE_KEY = 'IMPACT_METRICS_HIDE'
const STARS_KEY = 'IMPACT_METRICS_STARS'
const UPDATED_KEY = 'IMPACT_METRICS_UPDATED'

export default {
  name: 'ImpactMetrics',
  props: {
    starsRepo:   { type: String, default: '' },
    updatedRepo: { type: String, default: '' },
    githubToken: { type: String, default: '' },
    visitorsApi: { type: String, default: '' },
    collectApi:  { type: String, default: '' },
    topN:        { type: Number, default: 5 },
    ctaText:     { type: String, default: '' },
  },
  setup(props){
    const stars     = ref(null)
    const updatedAt = ref('')
    const countries = ref([])
    const hidden    = ref(false)
    const pos       = ref({ x: 16, y: 16 })

    // 先加载缓存，避免出现 '—'
    try{
      const s = localStorage.getItem(STARS_KEY); if (s) stars.value = Number(s);
      const u = localStorage.getItem(UPDATED_KEY); if (u) updatedAt.value = u;
    }catch{}

    const clamp = (v,a,b)=>Math.min(Math.max(v,a),b)
    const start = ref({x:0,y:0})
    const origin= ref({x:16,y:16})
    const dragging = ref(false)

    function onDragStart(e){
      dragging.value = true
      const t = e.touches ? e.touches[0] : e
      start.value = { x:t.clientX, y:t.clientY }
      origin.value = { ...pos.value }
      window.addEventListener('mousemove', onDragMove)
      window.addEventListener('mouseup', onDragEnd)
      window.addEventListener('touchmove', onDragMove, { passive:false })
      window.addEventListener('touchend', onDragEnd)
    }
    function onDragMove(e){
      if (!dragging.value) return
      const t = e.touches ? e.touches[0] : e
      const dx = t.clientX - start.value.x
      const dy = t.clientY - start.value.y
      const W = window.innerWidth, H = window.innerHeight
      const card = document.querySelector('.impact-card')
      const cardW = card ? card.offsetWidth : 210
      const cardH = card ? card.offsetHeight: 160
      pos.value.x = clamp(origin.value.x + dx, 8, Math.max(8, W - cardW - 8))
      pos.value.y = clamp(origin.value.y - dy, 8, Math.max(8, H - cardH - 8))
      e.preventDefault?.()
    }
    function onDragEnd(){
      if (!dragging.value) return
      dragging.value = false
      try{ localStorage.setItem(POS_KEY, JSON.stringify(pos.value)) }catch{}
      window.removeEventListener('mousemove', onDragMove)
      window.removeEventListener('mouseup', onDragEnd)
      window.removeEventListener('touchmove', onDragMove)
      window.removeEventListener('touchend', onDragEnd)
    }
    function onClose(){ hidden.value=true; try{ localStorage.setItem(HIDE_KEY,'1') }catch{} }
    function onReopen(){ hidden.value=false; try{ localStorage.removeItem(HIDE_KEY) }catch{} }
    function loadState(){
      try{ const p=JSON.parse(localStorage.getItem(POS_KEY)||'null'); if(p&&typeof p.x==='number'&&typeof p.y==='number') pos.value=p }catch{}
      try{ hidden.value = localStorage.getItem(HIDE_KEY)==='1' }catch{}
    }

    function formatNumber(n){ if(n==null) return '—'; if(n>=1_000_000) return (n/1_000_000).toFixed(1)+'m'; if(n>=1_000) return (n/1_000).toFixed(1)+'k'; return String(n) }
    function regionName(code){ try{ const dn=new Intl.DisplayNames([navigator.language||'zh-CN'],{type:'region'}); return dn.of(code)||code }catch{ return code } }
    function flagEmoji(code){ if(!code||code.length!==2) return '🏳️'; const up=code.toUpperCase(); const A=0x1F1E6; return String.fromCodePoint(A+up.charCodeAt(0)-65)+String.fromCodePoint(A+up.charCodeAt(1)-65) }

    
    // ====== Static JSON reader for GitHub metrics (generated by GitHub Actions) ======
    let BASE = '/';
    try {
      // Vite: import.meta.env.BASE_URL（如果存在）
      BASE = (import.meta && import.meta.env && import.meta.env.BASE_URL) || BASE;
    } catch (e) { /* ignore non-ESM env */ }
    // Vue CLI: process.env.BASE_URL（如存在则覆盖）
    if (typeof process !== 'undefined' && process.env && process.env.BASE_URL) {
      BASE = process.env.BASE_URL || BASE;
    }
    let __IMPACT_JSON_CACHE = null;
function metricsURL() {
  try {
    const b = document.querySelector('base')?.getAttribute('href')
            || location.pathname.replace(/[^/]*$/, ''); // 当前目录
    return (b.endsWith('/') ? b : b + '/') + 'impact_metrics.json';
  } catch { return 'impact_metrics.json'; }
}
    async function readStaticMetrics(repo) {
  try {
    if (!__IMPACT_JSON_CACHE) {
      const res = await fetch(metricsURL(), { cache: 'no-cache' });
      if (!res.ok) throw 0;
      __IMPACT_JSON_CACHE = await res.json();
    }
    const wanted = (repo || '').trim();
    if (!wanted) return null;
    if (__IMPACT_JSON_CACHE[wanted]) return __IMPACT_JSON_CACHE[wanted];
    // 大小写不敏感匹配，容错键名差异
    const lower = wanted.toLowerCase();
    for (const k of Object.keys(__IMPACT_JSON_CACHE)) {
      if (k.toLowerCase() === lower) return __IMPACT_JSON_CACHE[k];
    }
    return null;
  } catch { return null; }
}
async function ghGet(url){
      const baseHeaders={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}
      try{ const r=await fetch(url,{headers:baseHeaders,mode:'cors'}); if(r.ok) return await r.json() }catch{}
      if(props.githubToken){
        for(const scheme of [`Bearer ${props.githubToken}`,`token ${props.githubToken}`]){
          try{ const r=await fetch(url,{headers:{...baseHeaders,'Authorization':scheme},mode:'cors'}); if(r.ok) return await r.json() }catch{}
        }
      }
      return null
    }

    
async function fetchStars(){
      if(!props.starsRepo) return
      try{
        const stat = await readStaticMetrics(props.starsRepo)
        if(stat && stat.stargazers_count!=null){
          stars.value = Number(stat.stargazers_count)
          try{ localStorage.setItem(STARS_KEY, String(stars.value)) }catch{}
          return
        }
      }catch{}
      try{
        const d = await ghGet(`https://api.github.com/repos/${props.starsRepo}`)
        if(d && d.stargazers_count!=null){
          stars.value = d.stargazers_count
          try{ localStorage.setItem(STARS_KEY, String(stars.value)) }catch{}
        }
      }catch{}
    }

    
// 如果你文件里还没有 IS_PROD，可在文件顶部加这一行：
// const IS_PROD = (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production');

async function fetchUpdated() {
  if (!props.updatedRepo) return;

  try {
    // 1) 生产优先读静态 JSON
    let iso = null;
    const stat = await readStaticMetrics(props.updatedRepo);
    if (stat) {
      // 优先级：updated_at → pushed_at → created_at
      iso = stat.updated_at || stat.pushed_at || stat.created_at;
    }

    // 2) 本地开发才回退 GitHub API（线上不回退，避免403/限流）
    if (!iso && !IS_PROD) {
      try {
        const r = await fetch(`https://api.github.com/repos/${(props.updatedRepo || '').trim()}`, {
          headers: {
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });
        if (r.ok) {
          const d = await r.json();
          iso = d?.updated_at || d?.pushed_at || d?.created_at;
        }
      } catch {}
    }

    // 3) 渲染
    if (iso) {
      const dt = new Date(iso);
      // 和你原来显示格式保持一致（本地时区，精确到分钟）
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      const hh = String(dt.getHours()).padStart(2, '0');
      const mm = String(dt.getMinutes()).padStart(2, '0');
      updatedAt.value = `${y}-${m}-${d} ${hh}:${mm}`;
      try { localStorage.setItem('IMPACT_METRICS_UPDATED', updatedAt.value); } catch {}
    }
  } catch {}
}


    async function fetchVisitors(){
      if(!props.visitorsApi) return
      try{
        const r = await fetch(props.visitorsApi,{cache:'no-store'})
        if(!r.ok) throw 0
        const data = await r.json()
        let arr=[]
        if(Array.isArray(data)) arr=data
        else if(Array.isArray(data.countries)) arr=data.countries
        else if(data && typeof data==='object') arr=Object.entries(data).map(([code,count])=>({code:String(code).toUpperCase(),count:Number(count)||0}))
        countries.value = arr
          .filter(x=>x && x.code && x.count>0)
          .map(x=>({code:String(x.code).toUpperCase(),count:Number(x.count)||0}))
          .sort((a,b)=>b.count-a.count)
          .slice(0, props.topN)
      }catch{ countries.value=[] }
    }
    async function collectVisit(){
      if(!props.collectApi) return
      try{
        const body={ href:location.href, referrer:document.referrer||'', tz:Intl.DateTimeFormat().resolvedOptions().timeZone||'', lang:navigator.language||'', ua:navigator.userAgent||'' }
        await fetch(props.collectApi,{method:'POST',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      }catch{}
    }

    onMounted(async ()=>{
      loadState()
      // 延迟到下一帧，避免某些 SSR/旧浏览器环境初始化冲突
      await nextTick()
      fetchStars(); fetchUpdated(); fetchVisitors(); collectVisit();
    })
    onBeforeUnmount(()=>onDragEnd())

    return { stars, updatedAt, countries, hidden, pos, onDragStart, onDragEnd, onClose, onReopen, formatNumber, regionName, flagEmoji, topN: props.topN }
  }
}

</script>

<style scoped>
.impact-card{
  width:210px;
  max-width:92vw;
  background:#fff;
  border:1px solid #e6eefc;
  border-radius:16px;
  box-shadow:0 6px 14px rgba(20,80,180,.08);
  padding:6px;
}
.impact-card *{ word-wrap:break-word; overflow-wrap:anywhere; }

.floating{ position:fixed; z-index:1000; bottom:16px; left:16px; }
.close{
  position:absolute; right:8px; top:6px;
  width:20px; height:20px; border:none; border-radius:10px;
  background:#eef3ff; color:#3659b5; cursor:pointer;
}
.close:hover{ background:#e5ecff; }

.metrics-fab{
  position:fixed; z-index:1000; bottom:16px; left:16px;
  width:36px; height:36px; border-radius:18px;
  border:1px solid #d7e3ff; background:#f3f7ff; color:#3659b5;
  box-shadow:0 4px 10px rgba(20,80,180,.12); cursor:pointer;
}
.metrics-fab:hover{ background:#e9f0ff; }

.metrics{ display:grid; grid-template-columns:repeat(2,1fr); gap:2px; margin-bottom:6px; }
.metric{ background:linear-gradient(180deg,#f7faff,#fff); border:1px solid #e7edf9; border-radius:12px; padding:4px 6px; text-align:center; }
.metric .label{ font-size:8.5px; color:#6b7c9f; letter-spacing:.3px; }
.metric .value{ font-size:12.5px; font-weight:700; color:#1a52c5; margin-top:2px; }

.countries{ margin-top:2px; }
.countries-title{ font-size:9px; color:#6b7c9f; margin:4px 2px; }
.country-list{ display:grid; grid-template-columns:1fr 1fr; gap:4px 6px; }
.country{ background:#fff; border:1px dashed #e7edf9; border-radius:10px; padding:4px 6px; display:flex; align-items:center; gap:4px; }
.flag{ font-size:13px; }
.name{ font-size:10px; color:#2a3653; flex:1; }
.count{ font-size:10px; color:#1a52c5; font-weight:700; }

.cta{ margin-top:6px; padding:8px 10px; background:#f7fbff; border:1px dashed #e2eaff; color:#2a3653; border-radius:10px; font-size:10px; line-height:1.4; }
</style>