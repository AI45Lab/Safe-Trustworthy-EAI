<template>
  <teleport to="body">
    <!-- 右下角重开按钮 -->
    <button
      v-if="hidden"
      class="metrics-fab"
      @click.stop="onReopen"
      aria-label="Open metrics"
      title="Open metrics"
    >ⓘ</button>

    <!-- 浮动卡片（更窄版） -->
    <div
      v-else
      class="impact-card floating"
      :style="{ left: pos.x + 'px', bottom: pos.y + 'px' }"
      @mousedown="onDragStart"
      @touchstart.prevent="onDragStart"
    >
      <button class="close" aria-label="Close" title="Close" @click.stop="onClose">×</button>

      <div class="metrics">
        <div class="metric">
          <div class="label">GitHub Stars</div>
          <div class="value">{{ stars ?? '—' }}</div>
        </div>
        <div class="metric">
          <div class="label">Last Updated</div>
          <div class="value">{{ updatedAt || '—' }}</div>
        </div>
      </div>

      <p class="cta">
        {{ ctaText }}
      </p>
    </div>
  </teleport>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'ImpactMetrics',
  props: {
    starsRepo:   { type: String, default: '' },
    updatedRepo: { type: String, default: '' },
    githubToken: { type: String, default: '' },

    /* 保留但不使用，避免父组件传参告警 */
    visitorsApi: { type: String, default: '' },
    collectApi:  { type: String, default: '' },
    topN:        { type: Number, default: 5 },

    ctaText: {
      type: String,
      default:
        'If you have any comments on the advantages or disadvantages of this work, are willing to share your own research, or experience problems during use, please click the button on the right to contact us.'
    }
  },

  setup(props){
    const stars     = ref(null);
    const updatedAt = ref('');
    const hidden    = ref(false);
    const pos       = ref({ x: 16, y: 16 });

    const POS_KEY  = 'impact_metrics_pos';
    const HIDE_KEY = 'impact_metrics_hide';

    function loadState(){
      try {
        const raw = localStorage.getItem(POS_KEY);
        const p = raw ? JSON.parse(raw) : null;
        if (p && typeof p.x === 'number' && typeof p.y === 'number') pos.value = p;
      } catch {}
      try { hidden.value = localStorage.getItem(HIDE_KEY) === '1'; } catch {}
    }

    // —— 拖拽 ——
    let start = null;
    function onDragStart(e){
      const pt = ('touches' in e) ? e.touches[0] : e;
      start = { x: pt.clientX, y: pt.clientY, pos: { ...pos.value } };
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onDragEnd);
      window.addEventListener('touchmove', onDragMove, { passive: false });
      window.addEventListener('touchend', onDragEnd);
    }
    function onDragMove(e){
      if (!start) return;
      const pt = ('touches' in e) ? e.touches[0] : e;
      const dx = pt.clientX - start.x;
      const dy = pt.clientY - start.y;
      pos.value = {
        x: Math.max(0, start.pos.x + dx),
        y: Math.max(0, start.pos.y - dy)
      };
    }
    function onDragEnd(){
      start = null;
      try { localStorage.setItem(POS_KEY, JSON.stringify(pos.value)); } catch {}
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', onDragEnd);
      window.removeEventListener('touchmove', onDragMove);
      window.removeEventListener('touchend', onDragEnd);
    }
    function onClose(){
      hidden.value = true;
      try { localStorage.setItem(HIDE_KEY, '1'); } catch {}
    }
    function onReopen(){
      hidden.value = false;
      try { localStorage.removeItem(HIDE_KEY); } catch {}
    }

    // —— 拉 Stars / 更新时间 ——
    async function fetchStars(){
      if (!props.starsRepo) return;
      try {
        const r = await fetch(`https://api.github.com/repos/${props.starsRepo}`, {
          headers: props.githubToken ? { Authorization: `Bearer ${props.githubToken}` } : undefined,
        });
        if (!r.ok) return;
        const j = await r.json();
        stars.value = j?.stargazers_count ?? null;
      } catch {}
    }
    async function fetchUpdated(){
      if (!props.updatedRepo) return;
      try {
        const r = await fetch(`https://api.github.com/repos/${props.updatedRepo}`, {
          headers: props.githubToken ? { Authorization: `Bearer ${props.githubToken}` } : undefined,
        });
        if (!r.ok) return;
        const j = await r.json();
        const iso = j?.pushed_at || j?.updated_at || j?.created_at;
        updatedAt.value = iso ? new Date(iso).toLocaleString() : '';
      } catch {}
    }

    onMounted(() => {
      loadState();
      fetchStars();
      fetchUpdated();
    });

    return {
      stars, updatedAt, hidden, pos,
      onDragStart, onClose, onReopen
    }
  }
}
</script>

<style scoped>
/* —— 更窄：固定 200px —— */
.impact-card {
  position: fixed;
  z-index: 1000;
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  background: #fff;
  border: 1px solid #e6eefc;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(20,80,180,.08);
  padding: 10px 12px;            /* padding 收紧 */
}

.floating { pointer-events: auto; }

.close {
  position: absolute;
  top: 6px;
  right: 8px;
  border: none;
  background: transparent;
  font-size: 16px;               /* 关按钮更小一点 */
  cursor: pointer;
  color: #6b7c9f;
}

/* 两列仍然保留，但间距/字重收紧 */
.metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.metric {
  background: #f9fbff;
  border: 1px solid #e6eefc;
  border-radius: 8px;
  padding: 6px;                  /* 盒内边距更小 */
}
.label  { font-size: 11px; color: #6b7c9f; }
.value  {
  font-size: 12px;               /* 数值更小 */
  font-weight: 700;
  color: #1a52c5;
  line-height: 1.2;
  word-break: break-word;        /* 长时间戳可换行 */
}

/* 说明文字不撑宽卡片 */
.cta {
  margin-top: 8px;
  font-size: 11px;
  color: #445;
  line-height: 1.4;
  white-space: normal;
  word-break: break-word;
}

/* 右下角重开按钮 */
.metrics-fab {
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 1px solid #e6eefc;
  background: #fff;
  box-shadow: 0 8px 24px rgba(20,80,180,.12);
  cursor: pointer;
  font-size: 14px;
}
/* 替换原来的 .cta 样式 */
.cta {
  margin-top: 8px;
  font-size: 11px;
  color: #445;
  line-height: 1.6;
  white-space: normal;
  word-break: break-word;

  /* 让段落左右对齐、更整齐 */
  text-align: justify;         /* 两端对齐 */
  text-justify: inter-word;    /* 单词级对齐 */
  text-align-last: left;       /* 最后一行保持左对齐，避免看起来被拉伸 */
  hyphens: auto;               /* 允许自动断词，提升对齐效果（支持的浏览器会生效） */
}

</style>
