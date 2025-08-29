
<template>
  <teleport to="body">
    <button v-if="hidden" class="metrics-fab" @click.stop="onReopen" aria-label="Open metrics">ⓘ</button>

    <div v-else class="impact-card floating"
      :style="{ left: pos.x + 'px', bottom: pos.y + 'px' }"
      @mousedown="onDragStart"
      @touchstart.prevent="onDragStart">
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
import { ref, onMounted, onBeforeUnmount, nextTick, computed} from 'vue'
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
    visitorsApi: { type: String, default: 'https://old-union-b7eb.3034297530.workers.dev/visitors' },
    collectApi:  { type: String, default: 'https://old-union-b7eb.3034297530.workers.dev/collect' },
    topN:        { type: Number, default: 5 },
    ctaText:     { type: String, default: '如果您对这项工作的优势或不足有任何看法，愿意分享您的工作，或在使用中遇到问题，欢迎点击下方按钮与我们交流。' },
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
    // props 可能没传或传了空串，这里做兜底解析
    const RESOLVED_VISITORS_API = computed(() =>
      (props.visitorsApi && props.visitorsApi.trim())
        ? props.visitorsApi.trim()
        : 'https://old-union-b7eb.3034297530.workers.dev/visitors'
    )

    const RESOLVED_COLLECT_API = computed(() =>
      (props.collectApi && props.collectApi.trim())
        ? props.collectApi.trim()
        : 'https://old-union-b7eb.3034297530.workers.dev/collect'
    )

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
        const d = await ghGet(`https://api.github.com/repos/${props.starsRepo}`)
        if(d && d.stargazers_count!=null){
          stars.value = d.stargazers_count
          try{ localStorage.setItem(STARS_KEY, String(stars.value)) }catch{}
        }
      }catch{}
    }
    async function fetchUpdated(){
      if(!props.updatedRepo) return
      try{
        const d = await ghGet(`https://api.github.com/repos/${props.updatedRepo}`)
        const iso = d && (d.pushed_at || d.updated_at || d.created_at)
        if(iso){
          const dt=new Date(iso)
          const y=dt.getFullYear(), m=String(dt.getMonth()+1).padStart(2,'0'), day=String(dt.getDate()).padStart(2,'0')
          const hh=String(dt.getHours()).padStart(2,'0'), mm=String(dt.getMinutes()).padStart(2,'0')
          updatedAt.value = `${y}-${m}-${day} ${hh}:${mm}`
          try{ localStorage.setItem(UPDATED_KEY, updatedAt.value) }catch{}
        }
      }catch{}
    }
    async function fetchVisitors(){
      if(!props.visitorsApi) return
      try{
        const r = await fetch(RESOLVED_VISITORS_API.value, { cache: 'no-store' })
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
        await fetch(RESOLVED_COLLECT_API.value,{method:'POST',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
      }catch{}
    }

    onMounted(async ()=>{
    // === auto-injected: do not remove (minimal) ===
    const __resolvedVisitors = (props?.visitorsApi && props.visitorsApi.trim()) || 'https://old-union-b7eb.3034297530.workers.dev/visitors';
    const __resolvedCollect  = (props?.collectApi  && props.collectApi.trim())  || 'https://old-union-b7eb.3034297530.workers.dev/collect';

    try { fetch(__resolvedCollect, { method: 'POST', keepalive: true }).catch(()=>{}); } catch {}

    ;(async () => {
      try {
        const __r = await fetch(__resolvedVisitors, { cache: 'no-store' });
        if (__r && __r.ok) {
          const __j = await __r.json();
          const __dict = Array.isArray(__j)
            ? Object.fromEntries(__j.filter(Boolean).map(x => [String(x.code || '').toUpperCase(), Number(x.count || 0)]))
            : (__j || {});

          // 尝试写入 visitors.value（若存在）
          try { if (typeof visitors !== 'undefined' && visitors && 'value' in visitors) visitors.value = __dict; } catch {}

          // 尝试写入 countries / countries.value（若你的模板使用该变量）
          try {
            if (typeof countries !== 'undefined') {
              const __arr = Object.entries(__dict).map(([code, count]) => ({ code, count }));
              if (Array.isArray(countries)) {
                countries.splice(0, countries.length, ...__arr);
              } else if (countries && 'value' in countries) {
                countries.value = __arr;
              }
            }
          } catch {}
        }
      } catch {}
    })();
    // === /auto-injected ===

    console.log('[ImpactMetrics] visitorsApi=', RESOLVED_VISITORS_API.value, 'collectApi=', RESOLVED_COLLECT_API.value)
    // —— 强制上报一次（不依赖组件内部函数名）——
try {
  fetch(RESOLVED_COLLECT_API?.value ?? props.collectApi ?? '', {
    method: 'POST',
    keepalive: true,
  }).catch(() => {});
} catch {}

// —— 强制拉取统计（不依赖组件内部函数名）——
try {
  fetch(RESOLVED_VISITORS_API?.value ?? props.visitorsApi ?? '', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(j => {
      // 兼容 { "JP":2 } 或 [{code:"JP",count:2}]
      if (Array.isArray(j)) {
        visitors.value = Object.fromEntries(
          j.filter(Boolean).map(x => [String(x.code || '').toUpperCase(), Number(x.count || 0)])
        )
      } else if (j && typeof j === 'object') {
        visitors.value = j
      }
    })
    .catch(() => {});
} catch {}

// —— 双保险：下一轮事件循环再各跑一次 —— 
setTimeout(() => {
  try { fetch(RESOLVED_COLLECT_API?.value ?? props.collectApi ?? '', { method:'POST', keepalive:true }).catch(()=>{}); } catch {}
  try {
    fetch(RESOLVED_VISITORS_API?.value ?? props.visitorsApi ?? '', { cache:'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(j => {
        if (Array.isArray(j)) {
          visitors.value = Object.fromEntries(
            j.filter(Boolean).map(x => [String(x.code || '').toUpperCase(), Number(x.count || 0)])
          )
        } else if (j && typeof j === 'object') {
          visitors.value = j
        }
      })
      .catch(()=>{});
  } catch {}
}, 0);

    try { if (typeof fetchVisitors==='function') fetchVisitors(); } catch(e){}
    try { if (typeof collectVisit==='function') collectVisit(); } catch(e){}
    setTimeout(()=>{ try{ if (typeof fetchVisitors==='function') fetchVisitors(); }catch(e){} try{ if (typeof collectVisit==='function') collectVisit(); }catch(e){} }, 0);

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
