<template>
  <div class="authors">
    <template v-for="(a, i) in authors" :key="a.name">
      <a
        class="author"
        :href="a.homepage || '#'"
        target="_blank"
        rel="noopener"
      >
        {{ a.name }}
      </a>
      <sup
        v-if="a.symbol"
        class="author-mark"
        :aria-label="a.symbol"
        :title="a.symbol"
      >
        {{ a.symbol }}
      </sup>
      <span v-if="i !== authors.length - 1">{{ separator }}</span>
    </template>
  </div>
</template>

<script>
export default {
  name: "AuthorList",
  props: {
    authors: {
      type: Array,
      required: true, // 形如 [{ name, homepage, symbol }]
    },
    separator: {
      type: String,
      default: ", ", // 作者之间的分隔符
    },
  },
};
</script>

<style scoped>
.authors {
  line-height: 1.6;
  word-break: keep-all;
}

.author {
  text-decoration: none;
}

/* 重点：只给角标单独换成论文风的衬线字体 */
.author-mark {
  margin-left: 2px;
  vertical-align: super;
  line-height: 0;
  font-size: 0.65em;
  font-family: var(--author-mark-font, "Times New Roman", Times,
      "STIX Two Text", "Libertinus Serif", "Latin Modern Roman", Georgia, serif);
  font-variant-ligatures: none;
}
</style>
