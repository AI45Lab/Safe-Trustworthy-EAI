<template>
  <div class="smart-search">
    <input
      class="input"
      :placeholder="placeholder"
      v-model="inner"
      @input="$emit('update:modelValue', inner)"
      @keydown.enter.prevent
    />
    <div class="hint">支持：模糊匹配、子序列匹配、首字母缩略词（NLP→Natural Language Processing）、短错别字容错</div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{ modelValue: string, placeholder?: string }>()
const emit = defineEmits(['update:modelValue'])
const inner = ref(props.modelValue || '')
watch(() => props.modelValue, v => inner.value = v)
</script>

<style scoped>
.smart-search { display: flex; flex-direction: column; gap: 6px; }
.input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  outline: none;
  font-size: 14px;
}
.input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }
.hint { font-size: 12px; color: #6b7280; }
</style>
