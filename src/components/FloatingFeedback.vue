<template>
  <!-- Fixed bottom-right floating container (unchanged logic) -->
  <teleport v-if="fixed" to="body">
    <div class="spc-fixed" :style="fixedStyle">
      <ImpactMetrics v-if="showImpact"
        class="mb-2"
        :stars-repo="starsRepo"
        :updated-repo="updatedRepo"
        :visitors-api="visitorsApi"
        :collect-api="collectApi"
        :github-token="githubToken"
        :cta-text="impactCtaText"
      />
      <!-- Top button with optional tooltip -->
      <template v-if="tooltip">
        <v-tooltip :text="tooltip" :location="tooltipLocation" open-on-hover>
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              class="spc-btn"
              :variant="variant" :color="color" :rounded="rounded" :elevation="0"
              :size="size" :density="density" :height="buttonHeight"
              @click="openVerify"
            >{{ buttonLabel }}</v-btn>
          </template>
        </v-tooltip>
      </template>
      <v-btn v-else
        class="spc-btn"
        :variant="variant" :color="color" :rounded="rounded" :elevation="0"
        :size="size" :density="density" :height="buttonHeight"
        @click="openVerify"
      >{{ buttonLabel }}</v-btn>

      <!-- Bottom button (no tooltip) -->
      <v-btn
        class="spc-btn"
        :variant="variant" :color="color" :rounded="rounded" :elevation="0"
        :size="size" :density="density" :height="buttonHeight"
        @click="openVerifyTo(helpUrl)"
      >{{ helpLabel }}</v-btn>
    </div>
  </teleport>

  <!-- Non-fixed (inline) fallback -->
  <div v-else class="spc-inline">
    <v-btn
      class="spc-btn"
      :variant="variant" :color="color" :rounded="rounded" :elevation="0"
      :size="size" :density="density" :height="buttonHeight"
      @click="openVerify"
    >{{ buttonLabel }}</v-btn>

    <v-btn
      class="spc-btn"
      :variant="variant" :color="color" :rounded="rounded" :elevation="0"
      :size="size" :density="density" :height="buttonHeight"
      @click="openVerifyTo(helpUrl)"
    >{{ helpLabel }}</v-btn>
  </div>

  <!-- Verification dialog (unchanged) -->
  <v-dialog v-model="showVerify" max-width="440" persistent>
    <v-card>
      <v-card-title class="text-h6">Verification</v-card-title>
      <v-card-text>
        <div class="text-body-2 mb-3">Please complete a quick check so we know you're human.</div>

        <div class="d-flex justify-center my-2" v-show="mode==='basic'">
          <v-text-field v-model.trim="basicAnswer" :label="basicQuestion" type="number"
                        hide-details density="comfortable" />
        </div>
        <div v-if="errorMsg" class="text-error text-caption mt-2">{{ errorMsg }}</div>
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
import { ref, computed } from 'vue'
import ImpactMetrics from './ImpactMetrics.vue'

export default {
  components: { ImpactMetrics },
  name: 'FloatingFeedback',
  props: {
    /* Impact metrics sources */
    starsRepo:   { type: String, default: 'PanQY25/Trustworthy-Embodied-AI' },
    updatedRepo: { type: String, default: 'PanQY25/Trustworthy-Embodied-AI' },
    visitorsApi: { type: String, default: '' },
    collectApi:  { type: String, default: '' },
    githubToken: { type: String, default: '' },
    impactCtaText: { type: String, default: 'If you have any comments on the advantages or disadvantages of this work, are willing to share your own research, or experience problems during use, please click the button on the right to contact us.'
 },
    stackWidth:  { type: Number, default: 210 },
    showImpact:  { type: Boolean, default: true },

    tooltip:        { type: String, default: 'Think your work fits this topic? Share it with us — we review regularly.' },
    tooltipLocation:{ type: String, default: 'left' },
    buttonLabel:    { type: String, default: 'SHARE YOUR IDEA ✨' },
    helpLabel:      { type: String, default: 'MEET SOME TROUBLES' },
    variant:        { type: String, default: 'outlined' },
    color:          { type: String, default: 'primary' },
    rounded:        { type: [Boolean, String, Number], default: 'xl' },
    elevation:      { type: [String, Number], default: 0 },
    size:           { type: String, default: 'default' },
    density:        { type: String, default: 'comfortable' },
    buttonHeight:   { type: [String, Number], default: 44 },  // smaller
    fixed:          { type: Boolean, default: true },
    align:          { type: String, default: 'right' },
    offsetX:        { type: Number, default: 24 },
    offsetY:        { type: Number, default: 24 },
    zIndex:         { type: Number, default: 2140 },
    reserveBelow:   { type: Number, default: 160 },
  },
  setup(props){
    const viewUrl = 'https://docs.google.com/forms/d/1LdZXCC7ufWNOgulFCSBNwlx0mXTF73tQ38Uyq-MxykQ'
    const helpUrl = 'https://docs.google.com/forms/d/1ucW4QVJ77C7z9qEn34bsy_2YIYbF52z5l8Q-gsUKn6s'

    const fixedStyle = computed(() => {
      const style = { position: 'fixed', zIndex: String(props.zIndex) }
      const shift = props.offsetY + props.reserveBelow
      if (props.align === 'left') style.left = props.offsetX + 'px'
      else style.right = props.offsetX + 'px'
      style.bottom = shift + 'px'
      style.width = (props.stackWidth||320) + 'px'
      return style
    })

    const showVerify = ref(false)
    const verifying = ref(false)
    const errorMsg = ref('')
    const nextUrl = ref('')

    const VERIFY_KEY = 'spc_verified_once'
    const VERIFY_TTL = 1000*60*60*24*30 // 30 days
    function isVerified(){
      try{
        const raw = localStorage.getItem(VERIFY_KEY)
        if(!raw) return false
        const t = JSON.parse(raw).t || 0
        return Date.now() - t < VERIFY_TTL
      }catch{return false}
    }
    function markVerified(){
      try{ localStorage.setItem(VERIFY_KEY, JSON.stringify({t:Date.now()})) }catch{}
    }
    const a = Math.floor(10 + Math.random()*40)
    const b = Math.floor(10 + Math.random()*40)
    const basicQuestion = `What is ${a} + ${b}?`
    const basicAnswer = ref('')

    function openVerify(){
      if(isVerified()){
        window.open(viewUrl, '_blank', 'noopener')
        return
      }
      nextUrl.value = viewUrl
      showVerify.value = true
    }
    function openVerifyTo(){
      if(isVerified()){
        window.open(helpUrl, '_blank', 'noopener')
        return
      }
      nextUrl.value = helpUrl
      showVerify.value = true
    }
    function closeVerify(){ showVerify.value = false }

    const canSubmit = computed(() => String(Number(a+b)) === String(basicAnswer.value || ''))
    const actionLabel = computed(() => verifying.value ? 'Verifying...' : 'Verify & Continue')

    function submitOrRefresh(){
      if (!canSubmit.value) return
      verifying.value = true
      setTimeout(() => {
        markVerified()
        const url = nextUrl.value || viewUrl
        window.open(url, '_blank', 'noopener')
showVerify.value = false
        verifying.value = false
      }, 200)
    }

    return {
      helpUrl, fixedStyle, showVerify, verifying, errorMsg, basicQuestion, basicAnswer,
      openVerify, openVerifyTo, closeVerify, submitOrRefresh, canSubmit, actionLabel,
    }
  }
}
</script>

/* === 只保留一条细边框；不改颜色/验证/逻辑 === */

/* 去掉所有阴影，避免“第二圈线/毛边” */
.v-btn.spc-btn {
  box-shadow: none !important;
}

/* 去掉 Vuetify 伪元素造成的额外描边/高亮 */
.v-btn.spc-btn::before,
.v-btn.spc-btn::after {
  content: none !important;
  box-shadow: none !important;
}

/* outlined 形态下，强制只有 1px 的单线描边；
   颜色使用 currentColor，跟随你原来设置的 color（不改变你的主题颜色） */
.v-btn.v-btn--variant-outlined.spc-btn {
  border-width: 1px !important;
  border-style: solid !important;
  border-color: currentColor !important;
}

/* 去掉焦点/键盘导航的外圈，避免出现第二条线 */
.v-btn.spc-btn:focus,
.v-btn.spc-btn:focus-visible {
  outline: none !important;
  box-shadow: none !important;
}

/* —— 可选：让两个按钮一样长、稍微小一点（不需要可删除这两行） —— */
.spc-btn {
  min-width: 240px;   /* 两个按钮长度一致；可调 220/260 */
  height: 44px;       /* 稍微小一号；也可不改 */
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
  width:100% !important;     /* same length as text; change to 220px for fixed width */
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
