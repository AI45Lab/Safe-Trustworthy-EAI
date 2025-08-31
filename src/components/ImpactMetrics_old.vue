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
      <div v-if="countries.length" class="countries-section">
        <div class="section-header">Top Visitors</div>
        <div class="country-grid">
          <div v-for="c in countries.slice(0, 4)" :key="c.code" class="country">
            <span class="flag">{{ flagEmoji(c.code) }}</span>
            <span class="count">{{ formatNumber(c.count) }}</span>
          </div>
        </div>
        <!-- 总统计信息 -->
        <div class="total-stats">
          <div class="total-metric">
            <div class="label">Countries</div>
            <div class="value">{{ totalCountries }}</div>
          </div>
          <div class="total-metric">
            <div class="label">Total Visits</div>
            <div class="value">{{ formatNumber(totalVisits) }}</div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, nextTick, computed} from 'vue'
const POS_KEY = 'IMPACT_METRICS_POS'
const HIDE_KEY = 'IMPACT_METRICS_HIDE'
const STARS_KEY = 'IMPACT_METRICS_STARS'
const UPDATED_KEY = 'IMPACT_METRICS_UPDATED'
const VISITORS_KEY = 'IMPACT_METRICS_VISITORS'

export default {
  name: 'ImpactMetrics',
  props: {
    starsRepo:   { type: String, default: '' },
    updatedRepo: { type: String, default: '' },
    githubToken: { type: String, default: '' },
    ipinfoToken: { type: String, default: 'd0464380c91435' },
    visitorsApi: { type: String, default: '' },
    collectApi:  { type: String, default: '' },
    topN:        { type: Number, default: 5 },
    ctaText:     { type: String, default: '如果您对这项工作的优势或不足有任何看法，愿意分享您的工作，或在使用中遇到问题，欢迎点击下方按钮与我们交流。' },
  },
  setup(props){
    // 所有reactive变量先定义
    const stars     = ref(null)
    const updatedAt = ref('')
    const countries = ref([])
    const hidden    = ref(false)
    const pos       = ref({ x: 16, y: 16 })
    const visitors  = ref({})
    const start = ref({x:0,y:0})
    const origin= ref({x:16,y:16})
    const dragging = ref(false)

    // 计算属性
    const totalCountries = computed(() => Object.keys(visitors.value).length)
    const totalVisits = computed(() => Object.values(visitors.value).reduce((sum, count) => sum + count, 0))

    // 工具函数
    const clamp = (v,a,b)=>Math.min(Math.max(v,a),b)
    function formatNumber(n){ if(n==null) return '—'; if(n>=1_000_000) return (n/1_000_000).toFixed(1)+'m'; if(n>=1_000) return (n/1_000).toFixed(1)+'k'; return String(n) }
    function regionName(code){ try{ const dn=new Intl.DisplayNames([navigator.language||'zh-CN'],{type:'region'}); return dn.of(code)||code }catch{ return code } }
    function flagEmoji(code){ if(!code||code.length!==2) return '🏳️'; const up=code.toUpperCase(); const A=0x1F1E6; return String.fromCodePoint(A+up.charCodeAt(0)-65)+String.fromCodePoint(A+up.charCodeAt(1)-65) }

    // 拖拽相关函数
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
    
    // 显示/隐藏相关函数
    function onClose(){ hidden.value=true; try{ localStorage.setItem(HIDE_KEY,'1') }catch{} }
    function onReopen(){ hidden.value=false; try{ localStorage.removeItem(HIDE_KEY) }catch{} }
    function loadState(){
      try{ const p=JSON.parse(localStorage.getItem(POS_KEY)||'null'); if(p&&typeof p.x==='number'&&typeof p.y==='number') pos.value=p }catch{}
      try{ hidden.value = localStorage.getItem(HIDE_KEY)==='1' }catch{}
    }

    // GitHub相关函数
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

    // 访客统计相关函数
    function updateCountriesList(){
      const arr = Object.entries(visitors.value)
        .map(([code, count]) => ({
          code: String(code).toUpperCase(),
          count: Number(count) || 0
        }))
        .filter(x => x.code && x.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)
      
      countries.value = arr
      console.log('[ImpactMetrics] Updated countries list:', arr)
    }

    function loadVisitorsFromCache(){
      try{
        const stored = localStorage.getItem(VISITORS_KEY)
        if(stored){
          visitors.value = JSON.parse(stored)
          console.log('[ImpactMetrics] Loaded visitors from cache:', visitors.value)
        } else {
          // 如果没有缓存数据，为了测试添加一些初始数据
          visitors.value = { 'JP': 1 }
          console.log('[ImpactMetrics] No cached data, using initial test data')
        }
        updateCountriesList()
      }catch(e){
        console.warn('[ImpactMetrics] Failed to load visitors from cache:', e)
        // 出错时也添加测试数据
        visitors.value = { 'JP': 1 }
        updateCountriesList()
      }
    }

    async function getVisitorLocation(){
      if(!props.ipinfoToken) {
        console.warn('[ImpactMetrics] No IPinfo token provided')
        return null
      }
      try{
        console.log('[ImpactMetrics] Fetching location from IPinfo...')
        const response = await fetch(`https://ipinfo.io/json?token=${props.ipinfoToken}`)
        if(!response.ok) throw new Error(`IPinfo API failed: ${response.status}`)
        const data = await response.json()
        console.log('[ImpactMetrics] IPinfo response:', data)
        return data.country || null
      }catch(e){
        console.warn('[ImpactMetrics] Failed to get location from IPinfo:', e)
        return null
      }
    }

    async function collectVisit(){
      try{
        const countryCode = await getVisitorLocation()
        console.log('[ImpactMetrics] Detected country:', countryCode)
        
        if(!countryCode) {
          console.warn('[ImpactMetrics] No country code detected')
          return
        }

        // 从localStorage读取当前统计
        let currentVisitors = {...visitors.value}

        // 更新统计
        currentVisitors[countryCode] = (currentVisitors[countryCode] || 0) + 1
        visitors.value = currentVisitors

        console.log('[ImpactMetrics] Updated visitors:', currentVisitors)

        // 保存到localStorage
        try{
          localStorage.setItem(VISITORS_KEY, JSON.stringify(currentVisitors))
        }catch{}

        // 更新显示的国家列表
        updateCountriesList()
      }catch(e){
        console.warn('[ImpactMetrics] Failed to collect visit:', e)
      }
    }

    // 初始化缓存数据
    try{
      const s = localStorage.getItem(STARS_KEY); if (s) stars.value = Number(s);
      const u = localStorage.getItem(UPDATED_KEY); if (u) updatedAt.value = u;
      const v = localStorage.getItem(VISITORS_KEY); if (v) visitors.value = JSON.parse(v);
    }catch{}

    onMounted(async ()=>{
      console.log('[ImpactMetrics] Component mounted, ipinfoToken:', props.ipinfoToken ? 'provided' : 'not provided')
      
      loadState()
      loadVisitorsFromCache()
      
      await nextTick()
      
      fetchStars()
      fetchUpdated()
      
      setTimeout(() => {
        collectVisit()
      }, 100)
    })
    
    onBeforeUnmount(()=>onDragEnd())
  
    return { 
      stars, updatedAt, countries, hidden, pos, 
      onDragStart, onDragEnd, onClose, onReopen, 
      formatNumber, regionName, flagEmoji, 
      totalCountries, totalVisits,
      topN: props.topN 
    }
  }
}
</script>

<style scoped>
.impact-card{
  width:220px;
  max-width:92vw;
  background:#fff;
  border:1px solid #e6eefc;
  border-radius:16px;
  box-shadow:0 6px 14px rgba(20,80,180,.08);
  padding:10px;
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

.metrics{ display:grid; grid-template-columns:repeat(2,1fr); gap:6px; margin-bottom:10px; }
.metric{ background:linear-gradient(180deg,#f7faff,#fff); border:1px solid #e7edf9; border-radius:12px; padding:6px 8px; text-align:center; }
.metric .label{ font-size:9px; color:#6b7c9f; letter-spacing:.3px; }
.metric .value{ font-size:13px; font-weight:700; color:#1a52c5; margin-top:2px; }

.countries-section {
  margin-top: 4px;
}

.section-header {
  font-size: 9px;
  color: #6b7c9f;
  letter-spacing: 0.3px;
  text-align: center;
  margin-bottom: 6px;
}

.country-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 4px;
  margin-bottom: 8px;
}

.country {
  background:#f7faff; 
  border:1px solid #e7edf9; 
  border-radius:8px; 
  padding:3px 4px; 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  gap:3px;
}

.flag { font-size:11px; }
.count { font-size:10px; color:#1a52c5; font-weight:600; }

.total-stats { 
  display:grid; 
  grid-template-columns:1fr 1fr; 
  gap:6px; 
  margin-top: 4px;
}

.total-metric { 
  background:linear-gradient(180deg,#f7faff,#fff); 
  border:1px solid #e7edf9; 
  border-radius:12px; 
  padding:5px 8px; 
  text-align:center; 
}

.total-metric .label { font-size:8.5px; color:#6b7c9f; letter-spacing:.3px; }
.total-metric .value { font-size:12.5px; font-weight:700; color:#1a52c5; margin-top:2px; }
.section-header {
  font-size: 10px;
  color: #6b7c9f;
  letter-spacing: 0.3px;
  text-align: center;
  margin-bottom: 6px;
}

.country {
  background:#f7faff; 
  border:1px solid #e7edf9; 
  border-radius:8px; 
  padding:4px; 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  gap:4px;
}

.flag { font-size: 13px; }
.count { font-size: 12px; color:#1a52c5; font-weight:600; }

</style>
