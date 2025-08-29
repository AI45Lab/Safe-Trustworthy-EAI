<template>
  <!-- Fixed bottom-right floating container -->
  <teleport v-if="false" to="body">
    <div class="spc-fixed" :style="fixedStyle">
      <!-- Top button (original) -->
      <template v-if="tooltip">
        <v-tooltip :text="tooltip" :location="tooltipLocation" open-on-hover>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="spc-btn"
              :variant="variant" :color="color" :rounded="rounded" :elevation="elevation"
              :size="size" :density="density" :height="buttonHeight"
              @click="openVerify"
            >{{ buttonLabel }}</v-btn>
          </template>
        </v-tooltip>
      </template>
      <v-btn
        v-else
        class="spc-btn"
        :variant="variant" :color="color" :rounded="rounded" :elevation="elevation"
        :size="size" :density="density" :height="buttonHeight"
        @click="openVerify"
      >{{ buttonLabel }}</v-btn>

      <!-- Bottom button (help) -->
      <v-btn
        class="spc-btn"
        :variant="variant" :color="color" :rounded="rounded" :elevation="elevation"
        :size="size" :density="density" :height="buttonHeight"
        @click="openVerifyTo(helpUrl)"
      >{{ helpLabel }}</v-btn>
    </div>
  </teleport>

  <!-- Non-fixed (inline) -->
  <div v-if="false" class="spc-inline">
    <template v-if="tooltip">
      <v-tooltip :text="tooltip" :location="tooltipLocation" open-on-hover>
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            class="spc-btn"
            :variant="variant" :color="color" :rounded="rounded" :elevation="elevation"
            :size="size" :density="density" :height="buttonHeight"
            @click="openVerify"
          >{{ buttonLabel }}</v-btn>
        </template>
      </v-tooltip>
    </template>
    <v-btn
      v-else
      class="spc-btn"
      :variant="variant" :color="color" :rounded="rounded" :elevation="elevation"
      :size="size" :density="density" :height="buttonHeight"
      @click="openVerify"
    >{{ buttonLabel }}</v-btn>

    <v-btn
      class="spc-btn mt-2"
      :variant="variant" :color="color" :rounded="rounded" :elevation="elevation"
      :size="size" :density="density" :height="buttonHeight"
      @click="openVerifyTo(helpUrl)"
    >{{ helpLabel }}</v-btn>
  </div>

  <!-- Verification dialog -->
  <v-dialog v-model="showVerify" max-width="440" persistent>
    <v-card>
      <v-card-title class="text-h6">Verification</v-card-title>
      <v-card-text>
        <div class="text-body-2 mb-3">
          Please complete a quick check so we know you're human.
        </div>

        <!-- Provider widgets -->
        <div class="d-flex justify-center my-2" v-show="mode==='turnstile'">
          <div ref="turnstileEl" class="cf-turnstile"></div>
        </div>
        <div class="d-flex justify-center my-2" v-show="mode==='hcaptcha'">
          <div ref="hcaptchaEl"></div>
        </div>
        <div v-if="mode==='basic'" class="my-2">
          <div class="text-body-2 mb-3">Quick math check:</div>
          <v-text-field v-model.trim="basicAnswer" :label="basicQuestion" type="number"
                        hide-details density="comfortable" />
        </div>

        <div v-if="errorMsg" class="text-error text-caption mt-2">{{ errorMsg }}</div>
        <div v-if="hintMsg" class="text-caption mt-2">{{ hintMsg }}</div>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="closeVerify" :disabled="verifying">Cancel</v-btn>
        <v-btn variant="tonal" color="primary" :loading="verifying" :disabled="!canSubmit" @click="submitOrRefresh">
          {{ actionLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, nextTick } from 'vue'

export default {
  name: 'SubmitPaperClient',
  props: {
    /** Button look & text */
    buttonLabel:    { type: String, default: 'SHARE YOUR IDEA ✨' },
    variant:        { type: String, default: 'outlined' },
    color:          { type: String, default: 'primary' },
    rounded:        { type: [Boolean, String, Number], default: 'xl' },
    elevation:      { type: [String, Number], default: 2 },
    size:           { type: String, default: 'default' },
    density:        { type: String, default: 'comfortable' },
    buttonHeight:   { type: [String, Number], default: 56 },
    tooltip:        { type: String, default: 'Think your work fits this topic? Share it with us — we review regularly.' },
    tooltipLocation:{ type: String, default: 'left' },

    /** Destination (top button) */
    href:           { type: String, default: '' },
    gfView:         { type: String, default: '' },
    gfAction:       { type: String, default: '' }, // /formResponse -> /viewform
    openInNewTab:   { type: Boolean, default: true },
    redirectDelay:  { type: Number, default: 0 },

    /** Position */
    fixed:       { type: Boolean, default: true },
    align:       { type: String, default: 'right' }, // 'right' | 'left'
    offsetX:     { type: Number, default: 24 },
    offsetY:     { type: Number, default: 24 },
    zIndex:      { type: Number, default: 2140 },
    reserveBelow:{ type: Number, default: 160 },

    /** Providers */
    preferred:         { type: String, default: 'basic' }, // 'turnstile' | 'hcaptcha' | 'basic'
    turnstileSiteKey:  { type: String, default: '' },
    hcaptchaSiteKey:   { type: String, default: '' },

    /** Optional server verification */
    verifyEndpoint:  { type: String, default: '' },
    verifyMethod:    { type: String, default: 'POST' },
    verifyWithCreds: { type: Boolean, default: false },
  },
  setup(props){
    // redirect url for top button
    const viewUrl = computed(() => {
      if (props.href) return props.href
      if (props.gfView) return props.gfView
      if (props.gfAction) {
        try { return String(props.gfAction).replace('/formResponse', '/viewform') } catch {}
      }
      return 'https://docs.google.com/forms/d/1LdZXCC7ufWNOgulFCSBNwlx0mXTF73tQ38Uyq-MxykQ'
    })

    // help button config (bottom button)
    const helpUrl   = 'https://docs.google.com/forms/d/1ucW4QVJ77C7z9qEn34bsy_2YIYbF52z5l8Q-gsUKn6s'
    const helpLabel = 'MEET SOME TROUBLES'

    // fixed style
    const fixedStyle = computed(() => {
      const style = { position: 'fixed', zIndex: String(props.zIndex) }
      const shift = props.offsetY + props.reserveBelow
      if (props.align === 'left') style.left = props.offsetX + 'px'
      else style.right = props.offsetX + 'px'
      style.bottom = shift + 'px'
      return style
    })

    // dialog state
    const showVerify  = ref(false)
    const mode        = ref(props.preferred || 'basic')
    const turnstileEl = ref(null)
    const hcaptchaEl  = ref(null)
    const widgetId    = ref(null)
    const widgetReady = ref(false)
    const verifying   = ref(false)
    const errorMsg    = ref('')
    const hintMsg     = ref('')

    // basic math fallback
    const a = Math.floor(10 + Math.random()*40)
    const b = Math.floor(10 + Math.random()*40)
    const basicQuestion = `What is ${a} + ${b}?`
    const basicAnswer   = ref('')

    // per-click override for bottom button
    const overrideUrl = ref('')
    // remember: skip future verifications after first success
    const VERIFY_KEY = 'spc_verified_once'
    const VERIFY_TTL = 1000*60*60*24*30 // 30 days
    function isVerified(){
      try{
        const raw = localStorage.getItem(VERIFY_KEY)
        if(!raw) return false
        const t = JSON.parse(raw).t || 0
        return Date.now() - t < VERIFY_TTL
      }catch{ return false }
    }
    function markVerified(){
      try{ localStorage.setItem(VERIFY_KEY, JSON.stringify({t:Date.now()})) }catch{}
    }


    function openVerify(){
      if (isVerified()) { proceed(); return }
      errorMsg.value=''; hintMsg.value=''; widgetReady.value=false
      showVerify.value = true
      mode.value = props.preferred || 'basic'
      nextTick(() => mountPreferred())
    }
    function openVerifyTo(url){
      overrideUrl.value = url || ''
      if (isVerified()) { proceed(); return }
      openVerify()
    }
    function closeVerify(){
      showVerify.value = false
      cleanup()
    }

    const canSubmit = computed(() => {
      if (mode.value === 'basic') {
        return String(Number(a + b)) === String(basicAnswer.value || '')
      }
      return widgetReady.value && !verifying.value
    })
    const actionLabel = computed(() => verifying.value ? 'Verifying...' : 'Verify & Continue')

    async function submitOrRefresh(){
      if (!canSubmit.value) return
      verifying.value = true
      try{
        // If you need server-side verification, hook here with fetch(props.verifyEndpoint)
        proceed()
      } catch (e){
        errorMsg.value = 'Verification error. Please try again.'
      } finally {
        verifying.value = false
      }
    }

    function proceed(){
      setTimeout(() => {
        markVerified()
        const target = props.openInNewTab ? '_blank' : '_self'
        const finalUrl = overrideUrl.value || viewUrl.value
        window.open(finalUrl, target, 'noopener')
        overrideUrl.value = ''
      }, props.redirectDelay || 0)
      showVerify.value = false
      cleanup()
    }

    function cleanup(){
      try{
        if (widgetId.value && window.hcaptcha) window.hcaptcha.reset(widgetId.value)
      }catch{}
      widgetId.value = null
      widgetReady.value = false
    }
    async function mountPreferred(){
      if (mode.value === 'turnstile'){
        try{
          await loadTurnstile()
          widgetReady.value=true
          hintMsg.value=''
        }catch{
          mode.value='basic'
        }
      } else if (mode.value === 'hcaptcha'){
        try{
          await loadHcaptcha()
          widgetReady.value=true
          hintMsg.value=''
        }catch{
          mode.value='basic'
        }
      } else {
        widgetReady.value=true
        hintMsg.value=''
      }
    }

    function loadTurnstile(){
      return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return reject()
        if (window.turnstile) return resolve()
        const id = 'cf-turnstile-script'
        if (document.getElementById(id)) return resolve()
        const s = document.createElement('script')
        s.id = id
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
        s.async = true; s.defer = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('turnstile load error'))
        document.head.appendChild(s)
        setTimeout(() => { if(!window.turnstile) reject(new Error('turnstile timeout')) }, 6000)
      })
    }
    function loadHcaptcha(){
      return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return reject()
        if (window.hcaptcha) return resolve()
        const id = 'hcaptcha-script'
        if (document.getElementById(id)) return resolve()
        const s = document.createElement('script')
        s.id = id
        s.src = 'https://js.hcaptcha.com/1/api.js'
        s.async = true; s.defer = true
        s.onload = () => resolve()
        s.onerror = () => reject(new Error('hcaptcha load error'))
        document.head.appendChild(s)
        setTimeout(() => { if(!window.hcaptcha) reject(new Error('hcaptcha timeout')) }, 6000)
      })
    }

    return {
      // urls & labels
      viewUrl, helpUrl, helpLabel, fixedStyle,
      // dialog & state
      showVerify, mode, turnstileEl, hcaptchaEl, widgetReady, verifying, errorMsg, hintMsg,
      basicQuestion, basicAnswer,
      // actions
      openVerify, openVerifyTo, closeVerify, submitOrRefresh, canSubmit, actionLabel,
    }
  }
}
</script>
.spc-btn {
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  border-radius: 9999px;       /* 保持圆角 */
  min-width: 260px;            /* 固定宽度，保证两个按钮一样长 */
  padding: 0 24px;
  height: 56px;                /* 高度统一 */
  color: var(--v-theme-primary); /* 保留原来的字体颜色逻辑 */
  background-color: #fff;        /* 白底 */
  border: 1px solid #1E88E5;     /* 关键：细细的一条浅蓝线（你可以改成更浅的蓝色 #42a5f5） */
  box-shadow: none !important;   /* 去掉阴影 */
}

/* 鼠标悬停时稍微变深 */
.spc-btn:hover {
  background-color: #f5faff;
  border-color: #1565c0;
}


<style scoped>
/* ==== UI-only patch (do NOT change your logic) ==== */

/* 1) Hide the inline duplicate (only keep the fixed bottom-right pair) */
.spc-inline{ display:none !important; }

/* 2) Bottom-right vertical stack; container itself doesn't block clicks */
.spc-fixed{
  display:flex;
  flex-direction:column;
  align-items:flex-end;
  gap:8px;
  pointer-events:none;
}
/* Only buttons are interactive */
.v-btn.spc-btn{ pointer-events:auto; cursor:pointer; }

/* 3) Smaller buttons, auto width (wrap content), neat border */
.v-btn.spc-btn{
  width:auto !important;     /* same length as text; change to 220px for fixed width */
  min-width:0 !important;
  height:32px;
  padding:0 12px;
  border-radius:9999px;
  white-space:nowrap;
  box-shadow:none !important;
}

/* Single thin outline; color follows currentColor (your theme color) */
.v-btn.v-btn--variant-outlined.spc-btn{
  border-width:1px !important;
  border-style:solid !important;
  border-color:currentColor !important;
}

/* Remove extra rings/highlights that can look like a second border */
.v-btn.spc-btn::before,
.v-btn.spc-btn::after{ content:none !important; box-shadow:none !important; }
.v-btn.spc-btn:focus,
.v-btn.spc-btn:focus-visible{ outline:none !important; box-shadow:none !important; }
/* Optional: turn off ripple halo to avoid border jitter (keeps click) */
.v-btn.spc-btn .v-ripple__container{ display:none !important; }
</style>
