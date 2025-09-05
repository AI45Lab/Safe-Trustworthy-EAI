<template>
  <section class="mt-8">
    <div class="bibtex-header">
      <h2 class="bibtex-title">BibTeX</h2>
      <v-btn size="small" variant="text" @click="copy" :loading="copying">
        {{ copying ? 'Copied' : 'Copy' }}
      </v-btn>
    </div>

    <!-- 只有这一层框 -->
    <div class="bibtex-box">
      <pre class="bibtex-pre"><code>{{ bibtex }}</code></pre>
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  type: { type: String, default: 'misc' },
  keyId: { type: String, default: 'your_key_here' },
  title: { type: String, default: '<< Put Your Paper Title Here >>' },
  authors: { type: Array, default: () => ['Xin Tan', 'Bangwei Liu', 'Yicheng Bao','Qijian Tian','Zhenkun Gao','Xiongbin Wu','Zhihao Luo','Sen Wang','Yuqi Zhang','Xuhong Wang','Chaochao Lu','Bowen Zhou'] },
  year: { type: [String, Number], default: '2025' },
  eprint: { type: String, default: '2501.xxxxx' },
  archivePrefix: { type: String, default: 'arXiv' },
  primaryClass: { type: String, default: 'cs.LG' },
  url: { type: String, default: 'https://arxiv.org/abs/2501.xxxxx' }
})

const bibtex = computed(() => `@${props.type}{${props.keyId},
  title={${props.title}},
  author={${props.authors.join(' and ')}},
  year={${props.year}},
  eprint={${props.eprint}},
  archivePrefix={${props.archivePrefix}},
  primaryClass={${props.primaryClass}},
  url={${props.url}},
}`)

const copying = ref(false)
const copy = async () => {
  try {
    copying.value = true
    await navigator.clipboard.writeText(bibtex.value)
  } finally {
    setTimeout(() => (copying.value = false), 700)
  }
}
</script>

<style scoped>
.bibtex-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.bibtex-title {
  margin: 0;
  font-weight: 700;
  font-size: 28px;
}

/* 更浅的灰：背景更白，边框非常淡 */
/* 比刚才更深一点，但仍然清爽 */
.bibtex-box {
  background: #f5f5f5;        /* 中浅灰，和白底有明显区分 */
  border: 1px solid #cfd8e3;  /* 边框稍深，轮廓更清楚 */
  border-radius: 12px;
  padding: 14px 16px;
  overflow-x: auto;
  box-shadow: 0 1px 2px rgba(16,24,40,.04); /* 轻微阴影，别太重 */
}

.bibtex-pre {
  margin: 0;
  white-space: pre;
  line-height: 1.6;
  font-size: 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
}

/* （可选）更素的滚动条 */
.bibtex-box::-webkit-scrollbar { height: 6px; }
.bibtex-box::-webkit-scrollbar-thumb { background: #d8dee6; border-radius: 8px; }
.bibtex-box::-webkit-scrollbar-track { background: transparent; }

/* （可选）暗色模式适配，防止过亮 */
@media (prefers-color-scheme: dark) {
  .bibtex-box {
    background: #0f172a;
    border-color: #1e293b;
  }
  .bibtex-pre { color: #e5e7eb; }
}
</style>
