<!-- SubmitPaperClient.vue  ——  drop-in 版本（只改对应模块） -->
<template>
  <!-- 顶部 CTA：行内提示 + 按钮（inline=true 时显示整行） -->
  <div v-if="inline" class="cta-row">
    <div class="cta-copy">
      Think your work fits this topic? Share it with us — we review regularly.
    </div>
    <v-tooltip location="top" text="Got a match for this topic? We’re listening.">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          :prepend-icon="prependIcon"
          :variant="variant"
          :color="color"
          :rounded="rounded"
          :size="size"
          :density="density"
          @click="dialog = true"
        >
          {{ buttonLabel }}
        </v-btn>
      </template>
    </v-tooltip>
  </div>

  <!-- 非 inline：只显示一个按钮 -->
  <v-tooltip v-else location="top" text="Got a match for this topic? We’re listening.">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        :prepend-icon="prependIcon"
        :variant="variant"
        :color="color"
        :rounded="rounded"
        :size="size"
        :density="density"
        @click="dialog = true"
      >
        {{ buttonLabel }}
      </v-btn>
    </template>
  </v-tooltip>

  <!-- Dialog -->
  <v-dialog v-model="dialog" persistent max-width="780">
    <v-card class="sheet">
      <v-card-title class="py-5">
        <div class="title-row">
          <span class="title">{{ buttonLabel }}</span>
          <span class="hint">Got a match for this topic? We’re listening.</span>
        </div>
      </v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>

        <!-- 成功页 -->
        <template v-if="success">
          <div class="success-wrap">
            <v-icon size="40" color="success">mdi-check-circle</v-icon>
            <div class="success-title">Submitted successfully</div>
            <div class="success-sub">Thanks — we review regularly.</div>
            <div class="success-actions">
              <v-btn color="primary" @click="closeDialog">Close</v-btn>
              <v-btn variant="text" @click="resetForm">Submit another</v-btn>
            </div>
          </div>
        </template>

        <!-- 表单 -->
        <v-form v-else ref="formRef" class="form-grid">
          <v-text-field v-model.trim="form.title" label="Title *" variant="outlined" density="comfortable" :rules="[req]" clearable />

          <div class="two-col">
            <v-text-field v-model.trim="form.firstAuthor" label="First author *" variant="outlined" density="comfortable" :rules="[req]" clearable />

            <!-- EN DatePicker：点击必弹，返回 YYYY-MM-DD -->
            <v-menu v-model="dateMenu" :close-on-content-click="false" location="bottom" :offset="8">
              <template #activator="{ props: menuProps }">
                <v-text-field
                  v-bind="menuProps"
                  v-model="form.date"
                  label="Date *"
                  variant="outlined"
                  density="comfortable"
                  readonly
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

          <v-text-field v-model.trim="form.authors" label="All authors (separated by ; )" variant="outlined" density="comfortable" clearable />
          <v-text-field v-model.trim="form.link" label="Link *" type="url" variant="outlined" density="comfortable" :rules="[req, validUrl]" clearable />
          <v-text-field v-model.trim="form.email" label="Email *" type="email" variant="outlined" density="comfortable" :rules="[req, validEmail]" clearable />
          <v-textarea v-model.trim="form.note" label="Notes" auto-grow variant="outlined" density="comfortable" rows="2" clearable />

          <v-divider class="my-2" />
          <div class="section">
            <div class="section-title">10 Principles</div>
            <div class="two-col">
              <v-select v-model="selectedSafety" :items="SAFETY_ITEMS" label="Safety (multi)" variant="outlined" density="comfortable" multiple chips closable-chips clearable :menu-props="{maxHeight:360}" />
              <v-select v-model="selectedTrust"  :items="TRUST_ITEMS"  label="Trustworthiness (multi)" variant="outlined" density="comfortable" multiple chips closable-chips clearable :menu-props="{maxHeight:360}" />
            </div>
            <div class="tiny-actions">
              <v-btn size="small" variant="text" @click="selectAllPrinciples">Select all</v-btn>
              <v-btn size="small" variant="text" @click="clearAllPrinciples">Clear</v-btn>
            </div>
          </div>

          <div class="section mt-6">
            <div class="section-title">4 Stages</div>
            <v-select v-model="selectedStages" :items="STAGE_ITEMS" label="Stages (multi)" variant="outlined" density="comfortable" multiple chips closable-chips clearable :menu-props="{maxHeight:360}" />
            <div class="tiny-actions">
              <v-btn size="small" variant="text" @click="selectAllStages">Select all</v-btn>
              <v-btn size="small" variant="text" @click="selectedStages = []">Clear</v-btn>
            </div>
          </div>

          <!-- Honeypot -->
          <input v-model="form.website" type="text" class="hp" autocomplete="off" tabindex="-1" aria-hidden="true" />
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-6" v-if="!success">
        <v-spacer />
        <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" class="px-5" :loading="submitting" @click="handleSubmit">Submit</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, reactive, computed } from 'vue'

/** Tag options */
const SAFETY_ITEMS = [
  'Abuse Prevention',
  'Value Alignment',
  'Attack Resistance',
  'Privacy Protection',
  'Identifiability',
]
const TRUST_ITEMS = [
  'Explainability',
  'Reliability',
  'Controllability',
  'Auditability',
  'Accuracy',
]
const STAGE_ITEMS = [
  'Instruction Understanding',
  'Environment Perception',
  'Physical Interaction',
  'Action Planning',
]

/** —— 默认 Google Form 映射（你这份表单） —— */
const ACTION_DEFAULT =
  'https://docs.google.com/forms/d/e/1FAIpQLSec_LEQfgy-xU4g7_omJkLQ47_P3_KL0CwQoHE9Fx42BK2u5Q/formResponse'

const MAP_DEFAULT = {
  title:        'entry.931829232',
  first_author: 'entry.1122694689',
  date: {
    year:  'entry.2082229660_year',
    month: 'entry.2082229660_month',
    day:   'entry.2082229660_day',
  },
  all_authors:  'entry.2129090214',
  link:         'entry.1326436553',
  email:        'entry.116538169',
  notes:        'entry.482465552',
  principles:   'entry.1880683480',
  stages:       'entry.1980712044',
}

export default {
  name: 'SubmitPaperClient',
  props: {
    /** UI */
    inline: { type: Boolean, default: false },     // true 时渲染“提示+按钮”整行
    buttonLabel: { type: String, default: 'Share your paper ✨' },
    variant: { type: String, default: 'outlined' },
    color: { type: String, default: 'primary' },
    rounded: { type: [Boolean, String, Number], default: 'xl' },
    size: { type: String, default: 'default' },
    density: { type: String, default: 'default' },
    prependIcon: { type: String, default: 'mdi-send' },

    /** 覆盖默认 Google Form */
    gfAction: { type: String, default: '' },
    gfMap: { type: Object, default: () => ({}) },
  },
  setup(props) {
    const dialog = ref(false)
    const error = ref('')
    const success = ref(false)
    const submitting = ref(false)

    const formRef = ref(null)
    const form = reactive({
      title: '',
      firstAuthor: '',
      date: '',
      authors: '',
      link: '',
      email: '',
      note: '',
      website: '', // honeypot
    })

    // Use defaults if no props provided
    const act = computed(() => props.gfAction || ACTION_DEFAULT)
    const map = computed(() =>
      (props.gfMap && Object.keys(props.gfMap).length) ? props.gfMap : MAP_DEFAULT
    )

    // Date picker (EN)
    const dateMenu = ref(false)
    const dateTemp = ref(null)
    const onPickDate = (v) => {
      const d = v instanceof Date ? v : new Date(v)
      if (isNaN(d)) return
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      form.date = `${y}-${m}-${day}`
      dateMenu.value = false
    }

    // Selections
    const selectedSafety = ref([])
    const selectedTrust = ref([])
    const selectedStages = ref([])
    const pickedPrinciples = computed(() => [...selectedSafety.value, ...selectedTrust.value])

    // Validation
    const req = v => !!(v && String(v).trim()) || 'Required'
    const validUrl = v => {
      try {
        const u = new URL(String(v))
        return ['http:', 'https:'].includes(u.protocol) || 'Use http/https'
      } catch { return 'Invalid URL' }
    }
    const validEmail = v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())) || 'Invalid email'
    const validDate = v => {
      if (!v) return 'Required'
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'YYYY-MM-DD'
      const d = new Date(v + 'T00:00:00')
      const today = new Date(); today.setHours(0,0,0,0)
      if (d > today) return 'Date cannot be in the future'
      return true
    }

    // CSV (给管理员导出时可用；用户不显示)
    const defaultHeader = computed(() => {
      const base = ['Title','First Author','Date','All Authors','Link','Email','Notes','10 Principles','4 Stages']
      const pCols = [...SAFETY_ITEMS, ...TRUST_ITEMS].map(p => `P:${p}`)
      const sCols = STAGE_ITEMS.map(s => `S:${s}`)
      return [...base, ...pCols, ...sCols]
    })
    const header = computed(() => defaultHeader.value)
    const csvHeaderLine = computed(() => header.value.join(','))
    const csvRow = ref('')
    const sanitizeCSV = s => {
      const str = (s ?? '').toString().replaceAll('\n', ' ').replaceAll('\r', '')
      return '"' + str.replaceAll('"', '""') + '"'
    }
    const buildRow = () => {
      const principlesStr = pickedPrinciples.value.join('; ')
      const stagesStr = selectedStages.value.join('; ')
      const core = [
        form.title, form.firstAuthor, form.date, form.authors, form.link, form.email, form.note, principlesStr, stagesStr,
      ]
      const pBinaries = [...SAFETY_ITEMS, ...TRUST_ITEMS].map(p => (pickedPrinciples.value.includes(p) ? '1' : '0'))
      const sBinaries = STAGE_ITEMS.map(s => (selectedStages.value.includes(s) ? '1' : '0'))
      return [...core, ...pBinaries, ...sBinaries].map(sanitizeCSV).join(',')
    }

    // Submit
    const handleSubmit = async () => {
      error.value = ''
      success.value = false

      if (form.website?.trim()) { error.value = 'Submission blocked (bot check)'; return }

      const need = [form.title, form.firstAuthor, form.date, form.link, form.email]
      if (!need.every(v => !!(v && String(v).trim()))) {
        error.value = 'Please complete Title / First author / Date / Link / Email'
        return
      }
      const dv = validDate(form.date); if (dv !== true) { error.value = dv; return }
      const uv = validUrl(form.link); if (uv !== true) { error.value = uv; return }
      const ev = validEmail(form.email); if (ev !== true) { error.value = ev; return }

      csvRow.value = buildRow()

      try {
        submitting.value = true
        const params = new URLSearchParams()
        const m = map.value
        const join = arr => (Array.isArray(arr) ? arr.join('; ') : (arr || ''))

        if (m.title)         params.append(m.title,        form.title)
        if (m.first_author)  params.append(m.first_author, form.firstAuthor)
        if (m.date) {
          if (typeof m.date === 'string') params.append(m.date, form.date)
          else {
            const [y, mn, d] = String(form.date).split('-')
            m.date.year  && params.append(m.date.year,  y)
            m.date.month && params.append(m.date.month, mn)
            m.date.day   && params.append(m.date.day,   d)
          }
        }
        if (m.all_authors)   params.append(m.all_authors, form.authors)
        if (m.link)          params.append(m.link,        form.link)
        if (m.email)         params.append(m.email,       form.email)
        if (m.notes)         params.append(m.notes,       form.note)
        if (m.principles)    params.append(m.principles,  join(pickedPrinciples.value))
        if (m.stages)        params.append(m.stages,      join(selectedStages.value))

        await fetch(act.value, { method: 'POST', mode: 'no-cors', body: params })
        success.value = true
      } catch (e) {
        error.value = 'Submit failed: ' + (e?.message || e)
      } finally {
        submitting.value = false
      }
    }

    const selectAllPrinciples = () => {
      selectedSafety.value = SAFETY_ITEMS.slice()
      selectedTrust.value = TRUST_ITEMS.slice()
    }
    const clearAllPrinciples = () => { selectedSafety.value = []; selectedTrust.value = [] }
    const selectAllStages = () => { selectedStages.value = STAGE_ITEMS.slice() }

    const closeDialog = () => { dialog.value = false }
    const resetForm = () => {
      Object.assign(form, { title: '', firstAuthor: '', date: '', authors: '', link: '', email: '', note: '', website: '' })
      selectedSafety.value = []; selectedTrust.value = []; selectedStages.value = []
      success.value = false
    }

    return {
      dialog, error, success, submitting, formRef, form,
      selectedSafety, selectedTrust, selectedStages, pickedPrinciples,
      csvHeaderLine, csvRow,
      handleSubmit, selectAllPrinciples, clearAllPrinciples, selectAllStages,
      closeDialog, resetForm,
      dateMenu, dateTemp, onPickDate,
      SAFETY_ITEMS, TRUST_ITEMS, STAGE_ITEMS,
      req, validUrl, validDate, validEmail,
      // UI props
      inline: props.inline, buttonLabel: props.buttonLabel,
      variant: props.variant, color: props.color, rounded: props.rounded,
      size: props.size, density: props.density, prependIcon: props.prependIcon,
    }
  },
}
</script>

<style scoped>
/* —— CTA 行 —— */
.cta-row{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin:6px 0 10px; }
.cta-copy{ font-weight:600; color:#1f2937; opacity:.9; }
@media (max-width: 960px){ .cta-row{ flex-direction:column; align-items:flex-start; gap:8px; } }

/* —— Layout —— */
.title-row { display:flex; flex-direction:column; gap:6px; }
.title { font-weight:650; font-size:18px; }
.hint { opacity:.7; font-size:13px; }
.form-grid { display:grid; grid-template-columns:1fr; gap:14px; }
.two-col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
@media (max-width:560px){ .two-col{ grid-template-columns:1fr; } }

/* —— Aesthetic：圆润 + 蓝绿描线 —— */
.sheet{
  border-radius:22px;
  background:#fff;
  border:1.6px solid transparent;
  background-image:linear-gradient(#fff,#fff), linear-gradient(135deg, rgba(96,165,250,.78), rgba(52,211,153,.78));
  background-origin:border-box;
  background-clip:padding-box, border-box;
  box-shadow:0 12px 28px rgba(2,132,199,.09), 0 6px 16px rgba(16,185,129,.07);
}
:deep(.v-field){
  border-radius:14px !important;
  border:1px solid transparent;
  background-image:linear-gradient(#fff,#fff), linear-gradient(135deg, rgba(96,165,250,.55), rgba(52,211,153,.55));
  background-origin:border-box;
  background-clip:padding-box, border-box;
}
:deep(.v-field--focused){ box-shadow:0 0 0 5px rgba(96,165,250,.12), 0 0 0 1px rgba(52,211,153,.14); }

/* —— 成功页 —— */
.success-wrap{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; padding:24px 8px; text-align:center; }
.success-title{ font-weight:700; font-size:18px; margin-top:6px; }
.success-sub{ opacity:.75; }
.success-actions{ margin-top:12px; display:flex; gap:8px; }

/* Honeypot */
.hp{ position:absolute; left:-9999px; width:1px; height:1px; opacity:0; }
</style>
