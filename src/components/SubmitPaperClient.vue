<template>
  <!-- 右下角固定按钮 -->
  <teleport to="body">
    <v-tooltip location="left" text="Think your work fits this topic? Share it with us — we review regularly.">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          class="share-btn-fixed"
          :prepend-icon="prependIcon"
          :variant="variant"
          :color="color"
          :rounded="rounded"
          size="small"
          density="comfortable"
          :height="46"
          @click="dialog = true"
        >
          {{ buttonLabel }}
        </v-btn>
      </template>
    </v-tooltip>
  </teleport>

  <!-- 原有提交弹窗（不变） -->
  <v-dialog v-model="dialog" @keydown.esc="closeDialog" max-width="780">
    <v-card :class="['sheet', { 'sheet-plain': success } ]">
      <v-card-title class="py-5" v-show="!success">
        <div class="title-row">
          <span class="title">{{ buttonLabel }}</span>
          <span class="hint">Got a match for this topic? We’re listening.</span>
        </div>
      </v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

        <template v-if="success">
  <div class="success-wrap">
    <div class="success-box">
      <div class="success-row">
        <v-icon size="28" color="success" class="success-icon">mdi-check-circle</v-icon>
        <div>
          <div class="success-title">Submitted successfully</div>
          <div class="success-sub">Thanks — we review regularly.</div>
        </div>
      </div>
      <div class="success-actions">
        <v-btn size="small" variant="outlined" @click="resetForm" color="success">SUBMIT ANOTHER</v-btn>
        <v-btn size="small" variant="tonal" color="success" @click="closeDialog">CLOSE</v-btn>
      </div>
    </div>
  </div>
</template>

        <v-form v-else ref="formRef" class="form-grid">
          <v-text-field v-model.trim="form.title" label="Title *" variant="outlined" density="comfortable" :rules="[req]" clearable  :maxlength="150" :counter="80" />
          <div class="two-col">
            <v-text-field v-model.trim="form.firstAuthor" label="First author *" variant="outlined" density="comfortable" :rules="[req]" clearable  :maxlength="60" :counter="60" />
            <v-menu v-model="dateMenu" :close-on-content-click="false" location="bottom" :offset="8">
              <template #activator="{ props }">
                <v-text-field
                  v-bind="props"
                  v-model="form.date"
                  label="Published date *"
                  variant="outlined"
                  density="comfortable"
                  :rules="[req, validDate]"
                  placeholder="YYYY-MM-DD"
                  prepend-inner-icon="mdi-calendar"
                />
              </template>
              <v-locale-provider locale="en">
                <v-date-picker v-model="dateTemp" hide-header @update:model-value="onPickDate" />
              </v-locale-provider>
            </v-menu>
          </div>

          <v-text-field v-model.trim="form.authors" label="All authors (separated by ; )" variant="outlined" density="comfortable" clearable  :maxlength="300" :counter="300" />
          <v-text-field v-model.trim="form.link" label="Link *" variant="outlined" density="comfortable" :rules="[req, validUrl]" clearable  :maxlength="300" :counter="300" />
          <v-text-field v-model.trim="form.email" label="Email *" variant="outlined" density="comfortable" :rules="[req, validEmail]" clearable  :maxlength="100" :counter="100" />
          <v-textarea v-model.trim="form.note" label="Notes" auto-grow variant="outlined" density="comfortable"   :maxlength="500" :counter="500" rows="2" clearable />

          <v-divider class="my-2" />
          <div class="section">
            <div class="section-title">10 Principles</div>
            <div class="two-col">
              <v-select v-model="selectedSafety" :items="SAFETY_ITEMS_UI" item-title="value" item-value="value" label="Safety (multi)" multiple variant="outlined" density="comfortable" chips closable-chips clearable :menu-props="{maxHeight:360}" />
              <v-select v-model="selectedTrust"  :items="TRUST_ITEMS_UI" item-title="value" item-value="value"  label="Trustworthiness (multi)" multiple variant="outlined" density="comfortable" chips closable-chips clearable :menu-props="{maxHeight:360}" />
            </div>
            <div class="tiny-actions">
              <v-btn size="small" variant="text" @click="selectAllPrinciples">Select all</v-btn>
              <v-btn size="small" variant="text" @click="clearAllPrinciples">Clear</v-btn>
            </div>
          </div>

          <div class="section mt-6">
            <div class="section-title">4 Stages</div>
            <v-select v-model="selectedStages" :items="STAGE_ITEMS_UI" item-title="value" item-value="value" label="Stages (multi)" multiple variant="outlined" density="comfortable" chips closable-chips clearable :menu-props="{maxHeight:360}" />
          </div>

          <div class="actions">
            <v-btn variant="text" @click="closeDialog">cancel</v-btn>
            <v-btn variant="text" @click="resetForm">reset</v-btn>
            <v-btn color="primary" :loading="submitting" @click="onSubmit">submit</v-btn>
          </div>

          <div class="csv-preview" v-if="csvRow">
            <div class="csv-title">CSV preview</div>
            <pre class="csv-box">{{ csvHeader.join(',') + '\n' + csvRow }}</pre>
          </div>

          <!-- honeypot -->
          <input class="hp" type="text" v-model="form.website" autocomplete="off" tabindex="-1" aria-hidden="true">
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, reactive, computed } from 'vue'

const SAFETY_ITEMS  = ['Abuse Prevention','Value Alignment','Attack Resistance','Privacy Protection','Identifiability']
const TRUST_ITEMS   = ['Explainability','Reliability','Controllability','Auditability','Accuracy']
const STAGE_ITEMS  = ['Instruction Understanding','Environment Perception','Physical Interaction','Action Planning']
// Map primitive arrays to objects for Vuetify item-title/item-value
const SAFETY_ITEMS_UI = SAFETY_ITEMS.map(v=>({ value:v }))

const TRUST_ITEMS_UI  = TRUST_ITEMS.map(v=>({ value:v }))

const STAGE_ITEMS_UI  = STAGE_ITEMS.map(v=>({ value:v }))

const ACTION_DEFAULT = 'https://docs.google.com/forms/d/e/1FAIpQLSec_LEQfgy-xU4g7_omJkLQ47_P3_KL0CwQoHE9Fx42BK2u5Q/formResponse'
const MAP_DEFAULT = {
  title:'entry.931829232',
  first_author:'entry.1122694689',
  date:{year:'entry.2082229660_year',month:'entry.2082229660_month',day:'entry.2082229660_day'},
  all_authors:'entry.2129090214',
  link:'entry.1326436553',
  email:'entry.116538169',
  notes:'entry.482465552',
  principles:'entry.1880683480',
  stages:'entry.1980712044'
}

export default {
  name: 'SubmitPaperClient',
  props: {
    buttonLabel: { type: String, default: 'Share your paper ✨' },
    variant: { type: String, default: 'outlined' },
    color: { type: String, default: 'primary' },
    rounded: { type: [Boolean, String, Number], default: 'xl' },
    size: { type: String, default: 'small' },
    density: { type: String, default: 'comfortable' },
    prependIcon: { type: String, default: 'mdi-send' },
    gfAction: { type: String, default: '' },
    gfMap: { type: Object, default: () => ({}) },
  },
  setup(props) {
    // Close the form when pressing ESC
    if (typeof window !== 'undefined') {
      const _escHandler = (e) => { if (e.key === 'Escape') dialog.value = false }
      window.addEventListener('keydown', _escHandler)
      // remove on unmount
      try { onBeforeUnmount(() => window.removeEventListener('keydown', _escHandler)) } catch {}
    }
    const dialog = ref(false)
    const error = ref('')
    const success = ref(false)
    const submitting = ref(false)

    const formRef = ref(null)
    const form = reactive({ title:'', firstAuthor:'', date:'', authors:'', link:'', email:'', note:'', website:'' })
    const act = computed(() => props.gfAction || ACTION_DEFAULT)
    const map = computed(() => (props.gfMap && Object.keys(props.gfMap).length) ? props.gfMap : MAP_DEFAULT)

    const dateMenu = ref(false)
    const dateTemp = ref(null)
    const onPickDate = (v)=>{ const d=v instanceof Date?v:new Date(v); const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), dd=String(d.getDate()).padStart(2,'0'); form.date=`${y}-${m}-${dd}`; dateMenu.value=false }

    const selectedSafety = ref([]); const selectedTrust = ref([]); const selectedStages = ref([])
    const pickedPrinciples = computed(()=>[...selectedSafety.value, ...selectedTrust.value])

    const req = (v)=>(!!v && String(v).trim().length>0) || 'Required'
    const validEmail = (v)=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Invalid email'
    const validUrl = (v)=>{ try{ new URL(v); return true } catch{ return 'Invalid URL' } }
    const validDate = (v)=>/^\d{4}-\d{2}-\d{2}$/.test(v) || 'Invalid date (YYYY-MM-DD)'

    const csvHeader = computed(()=>{
      const base=['Title','First Author','Date','All Authors','Link','Email','Notes','10 Principles','4 Stages']
      const pCols=[...SAFETY_ITEMS,...TRUST_ITEMS].map(p=>`P:${p}`)
      const sCols=STAGE_ITEMS.map(s=>`S:${s}`)
      return [...base,...pCols,...sCols]
    })
    const csvRow = ref('')
    const buildRow = ()=>{
      const esc=(s)=>`"${String(s??'').replace(/"/g,'""')}"`
      const join=(a)=>esc(Array.isArray(a)?a.join('; '):(a||'')) 
      const picks=pickedPrinciples.value
      const pCols=SAFETY_ITEMS.concat(TRUST_ITEMS).map(p=>picks.includes(p)?'1':'')
      const sCols=STAGE_ITEMS.map(s=>selectedStages.value.includes(s)?'1':'')
      return [esc(form.title),esc(form.firstAuthor),esc(form.date),esc(form.authors),esc(form.link),esc(form.email),esc(form.note),join(picks),join(selectedStages.value),...pCols,...sCols].join(',')
    }

    const onSubmit = async ()=>{
      error.value=''; success.value=false
      const rv=req(form.title); if(rv!==true){ error.value=rv; return }
      const fv=req(form.firstAuthor); if(fv!==true){ error.value=fv; return }
      const dv=validDate(form.date); if(dv!==true){ error.value=dv; return }
      const uv=validUrl(form.link); if(uv!==true){ error.value=uv; return }
      const ev=validEmail(form.email); if(ev!==true){ error.value=ev; return }
      csvRow.value=buildRow()
      try{
        submitting.value=true
        const params=new URLSearchParams(); const m=map.value; const join=(a)=>Array.isArray(a)?a.join('; '):(a||'')
        if(m.title) params.append(m.title,form.title)
        if(m.first_author) params.append(m.first_author,form.firstAuthor)
        if(m.date){
          if(typeof m.date==='string') params.append(m.date,form.date)
          else {
            const [y,mn,d]=String(form.date).split('-')
            m.date.year&&params.append(m.date.year,y)
            m.date.month&&params.append(m.date.month,mn)
            m.date.day&&params.append(m.date.day,d)
          }
        }
        if(m.all_authors) params.append(m.all_authors,form.authors)
        if(m.link) params.append(m.link,form.link)
        if(m.email) params.append(m.email,form.email)
        if(m.notes) params.append(m.notes,form.note)
        if(m.principles) params.append(m.principles,join(pickedPrinciples.value))
        if(m.stages) params.append(m.stages,join(selectedStages.value))
        await fetch(act.value,{method:'POST',mode:'no-cors',body:params})
        success.value=true; formRef.value?.resetValidation?.()
      }catch(e){ error.value='Network error. Please try again.' } finally{ submitting.value=false }
    }

    const closeDialog=()=>{ dialog.value=false }
    const resetForm=()=>{ error.value=''; success.value=false; for(const k of Object.keys(form)) form[k]=''; selectedSafety.value=[]; selectedTrust.value=[]; selectedStages.value=[]; csvRow.value='' }
    const selectAllPrinciples=()=>{ selectedSafety.value=[...SAFETY_ITEMS]; selectedTrust.value=[...TRUST_ITEMS] }
    const clearAllPrinciples=()=>{ selectedSafety.value=[]; selectedTrust.value=[] }

    return {dialog,error,success,submitting, formRef,form, dateMenu,dateTemp,onPickDate, selectedSafety,selectedTrust,selectedStages, selectAllPrinciples,clearAllPrinciples, pickedPrinciples, req,validEmail,validUrl,validDate, onSubmit,closeDialog,resetForm, csvHeader,csvRow, SAFETY_ITEMS, TRUST_ITEMS, STAGE_ITEMS, SAFETY_ITEMS_UI, TRUST_ITEMS_UI, STAGE_ITEMS_UI }
  },
}
</script>

<style scoped>
/* 右下角固定按钮 */
.share-btn-fixed{
  position: fixed;
  right: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom));
  z-index: 2147483647;
}

/* ===== 以下为原有表单样式（未改） ===== */
.sheet{ border-radius:18px; overflow:hidden; }
.title-row{ display:flex; flex-direction:column; gap:4px; }
.title{ font-weight:800; font-size:20px; }
.hint{ font-size:13px; opacity:.7; }
.form-grid{ display:grid; gap:12px; }
.two-col{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.section{ display:flex; flex-direction:column; gap:10px; }
.section-title{ font-weight:700; }
.tiny-actions{ display:flex; gap:8px; margin-top:-4px; }
.actions{ display:grid; grid-template-columns:1fr auto 1fr; align-items:center; margin-top:4px; gap:8px; }
.actions > :nth-child(1){ justify-self:start; }
.actions > :nth-child(2){ justify-self:center; }
.actions > :nth-child(3){ justify-self:end; }
.csv-preview{ margin-top:12px; }
.csv-title{ font-weight:700; margin-bottom:6px; }
.csv-box{ font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace; font-size:12px; background:#f7fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px; overflow:auto; }
:deep(.v-card){ border-radius:16px; }
:deep(.v-btn){ border-radius:9999px; font-weight:700; letter-spacing:.2px; position:relative; z-index:1; }
:deep(.v-overlay__scrim){ backdrop-filter: blur(3px); }
:deep(.v-field){ border-radius:14px !important; border:1px solid transparent; }
:deep(.v-field--focused){ box-shadow:0 0 0 5px rgba(96,165,250,.12), 0 0 0 1px rgba(52,211,153,.14); }
/* Success view – compact, white background, only green border */
.success-center{
  text-align: center;
}
.success-alert{
  display: inline-block;
  background: #fff;
  padding: 12px 16px;
  border-radius: 12px;
}
.success-head{
  display: flex;
  align-items: center;
  gap: 10px;
  justify-content: center;
}
.success-title{
  font-size: 18px;
  font-weight: 800;
  letter-spacing: .2px;
  line-height: 1.2;
}
.success-sub{
  color: #64748b;
  margin-top: 2px;
}
.success-actions{
  margin-top: 12px;
  display: flex;
  gap: 10px;
  justify-content: center;
}
/* remove any leftover icon slot spacing */
.success-alert :deep(.v-alert__prepend){
  display: none !important;
}
/* Success view – outlined green, white fill, compact width */
.success-wrap{ text-align:center; }
.success-box{
  width: 560px;
  max-width: calc(100% - 48px);
  margin: 0 auto;
  background: #fff;
  border: 2px solid rgb(var(--v-theme-success));
  border-radius: 14px;
  padding: 14px 18px;
}
.success-row{ display:flex; align-items:center; gap:12px; justify-content:center; }
.success-title{ font-size:20px; font-weight:800; color: rgb(var(--v-theme-success)); line-height:1.2; }
.success-sub{ color:#64748b; margin-top:2px; }
.success-actions{ margin-top:12px; display:flex; gap:12px; justify-content:center; }

.sheet-plain{
  background: transparent !important;
  box-shadow: none !important;
}
/* Harmonize success colors: green accents, softer tones */
.success-icon{
  background: rgba(var(--v-theme-success), .12);
  border-radius: 9999px;
  padding: 6px;
  line-height: 0;
}
/* Optional: slightly tint on hover for outlined success button */
.success-actions :deep(.v-btn--variant-outlined){
  transition: background-color .15s ease;
}
.success-actions :deep(.v-btn--variant-outlined:hover){
  background: rgba(var(--v-theme-success), .06);
}
</style>
