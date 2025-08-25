<template>
  <v-container class="project-page" fluid>
    <!-- ✅ 论文介绍模块：放在引用文献模块的上方 -->
    <paper-intro :paper="intro" class="mb-6"></paper-intro>
    <!-- 标题部分 -->
    <div class="header">
      <h1 class="title">
        <v-icon large class="title-icon">mdi-database-search</v-icon>
        Awesome Trustworthy Embodied-AI
      </h1>
    </div>


    <!-- 搜索和筛选区域 -->
    <div class="search-container">
      <v-row class="search-row" align="center">
        <v-text-field
          v-model="searchKeyword"
          class="search-input"
          outlined
          prepend-inner-icon="mdi-magnify"
          placeholder="Search papers by title, author, or keywords..."
          clearable
          @keyup.enter="filterPapers"
          hide-details
        >
          <template v-slot:prepend>
            <div class="csv-icon">📄</div>
          </template>
        </v-text-field>
        <v-btn 
          class="search-btn"
          dark
          elevation="0"
          @click="filterPapers"
        >
          <v-icon left>mdi-database-search</v-icon>
          Search
        </v-btn>
      </v-row>

      <!-- 搜索统计信息 -->
      <div class="search-stats" v-if="searchKeyword || selectedTags.length > 0">
        <v-chip 
          small 
          color="blue lighten-4" 
          text-color="blue darken-3"
          class="ma-1"
        >
          <v-icon small left>mdi-file-document-multiple</v-icon>
          {{ filteredPapers.length }} papers found
        </v-chip>
        <v-chip 
          v-if="searchKeyword"
          small 
          color="green lighten-4" 
          text-color="green darken-3"
          class="ma-1"
          close
          @click:close="clearSearch"
        >
          <v-icon small left>mdi-magnify</v-icon>
          "{{ searchKeyword }}"
        </v-chip>
      </div>

      <!-- 二维表格容器 -->
      <div class="tag-matrix-container">
        <h3 class="text-center mb-4">
          <v-icon color="blue darken-2">mdi-grid</v-icon>
          Filter by Categories
          <div class="csv-icon">📊</div>
        </h3>
        <tag-matrix :onTagClick="handleTagFilter"></tag-matrix>
        
        <!-- 活跃过滤器显示 -->
        <div class="active-filters" v-if="activeFilter">
          <v-divider class="my-4"></v-divider>
          <div class="text-center">
            <v-chip 
              color="blue" 
              dark 
              close
              @click:close="clearTagFilter"
            >
              <v-icon small left>mdi-filter</v-icon>
              {{ activeFilter }}
            </v-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- 论文列表 -->
    <v-container>
      <v-row justify="center">
        <v-col cols="12" lg="9" v-for="paper in filteredPapers" :key="paper.title + paper.date">
          <paper-card :paper="paper"></paper-card>
        </v-col>
      </v-row>
      
      <!-- 空状态提示 -->
      <v-row v-if="filteredPapers.length === 0" justify="center">
        <v-col cols="12" class="empty-state">
          <v-icon x-large color="grey lighten-1">mdi-file-search-outline</v-icon>
          <p class="mt-4">No papers found matching your criteria</p>
          <div class="mt-4">
            <v-btn 
              color="blue lighten-2" 
              text
              class="mr-3"
              @click="resetFilters"
            >
              <v-icon left>mdi-refresh</v-icon>
              Reset Filters
            </v-btn>
            <v-btn 
              color="green lighten-2" 
              text
              @click="showAllPapers"
            >
              <v-icon left>mdi-eye</v-icon>
              Show All Papers
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- 返回顶部按钮 -->
    <v-btn
      v-show="showBackToTop"
      fab
      dark
      fixed
      bottom
      right
      color="blue darken-2"
      @click="scrollToTop"
      class="back-to-top-btn"
    >
      <v-icon>mdi-chevron-up</v-icon>
    </v-btn>
  </v-container>
</template>

<script>
import PaperIntro from '@/components/PaperIntro.vue'
import PaperCard from '@/components/PaperCard.vue'
import TagMatrix from '@/components/TagMatrix.vue'
import csvData from '@/data/paper_list.csv'

export default {
  components: { PaperCard, TagMatrix, PaperIntro },
  data() {
    return {
      papers: [],
      searchKeyword: '',
      selectedTags: [],
      filteredPapers: [],
      activeFilter: '',
      showBackToTop: false,
        // ✅ 论文介绍模块的数据（示例）
    intro: {
        title: 'Towards Safe and Trustworthy Embodied AI: Foundations, Status, and Prospects',
        authors: [
          { name: 'Xin Tan',  homepage: 'https://faculty.ecnu.edu.cn/_s16/tx2/main.psp', symbol: '*' },
          { name: 'Bangwei Liu', homepage: '#', symbol: '*' },
          { name: 'Yicheng Bao', homepage: '#' },
          { name: 'Qijian Tian', homepage: '#' },
          { name: 'Zhenkun Gao', homepage: '#' },
          { name: 'Xiongbin Wu', homepage: '#' },
          { name: 'Zhihao Luo', homepage: '#' },
          { name: 'Sen Wang', homepage: '#' },
          { name: 'Yuqi Zhang', homepage: '#' },
          { name: 'Xuhong Wang', homepage: '#', symbol: '†' },
          { name: 'Chaochao Lu', homepage: '#', symbol: '§' }
        ],
        affiliation: 'Shanghai Artificial Intelligence Laboratory',

        links: {
          paper:  '#',
          code:  '#',
          project: '#',
          dataset: '#'
        },
       
      }
    }
  },
  created() {
    this.processCSVData(csvData)
    this.filteredPapers = this.papers
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      this.showBackToTop = window.scrollY > 300
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    resetFilters() {
      this.searchKeyword = ''
      this.selectedTags = []
      this.activeFilter = ''
      this.filteredPapers = this.papers
    },
    clearSearch() {
      this.searchKeyword = ''
      this.filterPapers()
    },
    clearTagFilter() {
      this.activeFilter = ''
      this.filterPapers()
    },
    showAllPapers() {
      this.resetFilters()
    },
    processCSVData(rawData) {
      this.papers = rawData
        .map(row => {
          // 处理可能为空的字段
          const safeSplit = (str) => 
            str ? str.split(',').map(s => s.trim()).filter(Boolean) : []
          
          return {
            title: row['标题'] || '',
            date: row['发表年月'] || '',
            author: row['一作'] || '',
            authorOrg: row['一作单位'] || '',
            contact: row['通讯'] || '',
            contactOrg: row['通讯单位'] || '',
            macros: safeSplit(row['宏观维度']),
            apps: safeSplit(row['应用维度']),
            tasks: safeSplit(row['具身任务']),
            method: safeSplit(row['方法论']),
            link: row['链接'] || ''
          }
        })
        // 过滤掉没有标题的论文
        .filter(paper => paper.title.trim() !== '')
    },
    filterPapers() {
      let filtered = this.papers

      // 应用搜索关键词过滤
      if (this.searchKeyword) {
        const keyword = this.searchKeyword.toLowerCase()
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(keyword) ||
          p.author.toLowerCase().includes(keyword) ||
          p.contact.toLowerCase().includes(keyword) ||
          p.macros.some(tag => tag.toLowerCase().includes(keyword)) ||
          p.apps.some(tag => tag.toLowerCase().includes(keyword)) ||
          p.tasks.some(tag => tag.toLowerCase().includes(keyword)) ||
          p.method.some(tag => tag.toLowerCase().includes(keyword))
        )
      }

      // 应用标签过滤
      if (this.activeFilter) {
        const [tag1, tag2] = this.activeFilter.split('/')
        filtered = filtered.filter(p =>
          p.macros.includes(tag1) && p.apps.includes(tag2)
        )
      }

      this.filteredPapers = filtered
    },
    handleTagFilter(tag1, tag2) {
      this.activeFilter = `${tag1}/${tag2}`
      this.filterPapers()
    }
  },
  watch: {
    searchKeyword() {
      // 实时搜索
      if (this.searchKeyword.length > 2 || this.searchKeyword.length === 0) {
        this.filterPapers()
      }
    }
  }
}
</script>

<style scoped>
/* 标题容器居中 */
.header {
  text-align: center;
  padding: 60px 0;
  margin-bottom: 30px;
}

/* 标题样式 - 超大字号，更吸引眼球 */
.title {
  font-family: 'Inter', sans-serif;
  font-size: 4.5rem;  /* 从3rem增加到4.5rem */
  font-weight: 800;   /* 从700增加到800 */
  text-align: center;
  background: linear-gradient(135deg, #1e3a8a, #3b82f6, #06b6d4);  /* 添加第三个颜色 */
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;  /* 移除原有margin */
  padding: 0 20px 30px 0;
  position: relative;
  letter-spacing: -0.03em;  /* 稍微减少字间距 */
  line-height: 1.1;  /* 调整行高 */
  text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);  /* 添加发光效果 */
  animation: titleGlow 3s ease-in-out infinite alternate;  /* 添加动画 */
}

/* 发光动画效果 */
@keyframes titleGlow {
  0% {
    text-shadow: 0 0 30px rgba(59, 130, 246, 0.3);
  }
  100% {
    text-shadow: 0 0 40px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.2);
  }
}

.title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;  /* 从80px增加到120px */
  height: 4px;   /* 从3px增加到4px */
  background: linear-gradient(90deg, #3b82f6, #1d4ed8, #06b6d4);
  border-radius: 3px;
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.4);  /* 添加阴影 */
}

/* 标题图标样式 - 更大更醒目 */
.title .v-icon {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-right: 20px;  /* 从15px增加到20px */
  font-size: 4.5rem !important;  /* 从3rem增加到4.5rem */
  vertical-align: middle;
  filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.3));  /* 添加阴影效果 */
}

/* 响应式设计 - 移动设备上的标题调整 */
@media (max-width: 768px) {
  .title {
    font-size: 3rem;  /* 移动设备上稍小一些 */
  }
  
  .title .v-icon {
    font-size: 3rem !important;
    margin-right: 15px;
  }
  
  .title::after {
    width: 80px;
  }
}

@media (max-width: 480px) {
  .title {
    font-size: 2.2rem;
    padding: 0 10px 25px 0;
  }
  
  .title .v-icon {
    font-size: 2.2rem !important;
    margin-right: 10px;
  }
}

/* 搜索区域整体样式优化 */
.search-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(59, 130, 246, 0.15);
  padding: 35px 25px;
  border-radius: 24px;
  box-shadow: 
    0 12px 35px rgba(59, 130, 246, 0.08),
    0 4px 15px rgba(0, 0, 0, 0.04);
  margin: 0 auto 40px auto;
  max-width: 1200px;  /* 从800px增加到1200px */
}

/* 搜索行样式 - 更宽敞的布局 */
.search-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  max-width: 870px;  /* 从580px增加到870px (增加50%) */
  margin: 0 auto 30px auto;
}

/* 搜索输入框样式 - 更宽美观 */
.search-input {
  flex: 1;
  max-width: 630px;  /* 从420px增加到630px (增加50%) */
}
.search-input .v-input__slot {
  background: white !important;
  border-radius: 16px !important;
  box-shadow: 
    0 6px 20px rgba(59, 130, 246, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04) !important;
  border: 1.5px solid rgba(59, 130, 246, 0.15) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  min-height: 52px !important;  /* 稍微减少高度 */
}

.search-input .v-input__slot:hover {
  border-color: rgba(59, 130, 246, 0.35) !important;
  box-shadow: 
    0 8px 25px rgba(59, 130, 246, 0.12),
    0 3px 12px rgba(0, 0, 0, 0.06) !important;
  transform: translateY(-1px);
}

.search-input .v-input--is-focused .v-input__slot {
  border-color: #3b82f6 !important;
  box-shadow: 
    0 10px 30px rgba(59, 130, 246, 0.15),
    0 4px 15px rgba(0, 0, 0, 0.08),
    0 0 0 3px rgba(59, 130, 246, 0.1) !important;
  transform: translateY(-2px);
}

/* 搜索按钮样式 - 更紧凑精致 */
.search-btn {
  min-width: 120px;  /* 从140px减少到120px */
  height: 52px;      /* 从56px减少到52px */
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.02em;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
  border-radius: 16px;  /* 与输入框保持一致 */
  box-shadow: 
    0 6px 20px rgba(59, 130, 246, 0.25),
    0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: none;
  position: relative;
  overflow: hidden;
}

.search-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 8px 25px rgba(59, 130, 246, 0.35),
    0 4px 15px rgba(0, 0, 0, 0.1);
}

.search-btn:hover::before {
  left: 100%;
}

.search-btn:active {
  transform: translateY(0);
}

/* 输入框内图标样式优化 */
.search-input .v-input__prepend-inner .v-input__icon {
  color: rgba(59, 130, 246, 0.6) !important;
}

.search-input .v-input--is-focused .v-input__prepend-inner .v-input__icon {
  color: #3b82f6 !important;
}

/* CSV装饰图标优化 */
.csv-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 6px;
  font-size: 11px;
  font-weight: bold;
  margin-left: 6px;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

/* 响应式设计 */
@media (max-width: 1768px) {
  .search-container {
    max-width: 95%;
    padding: 25px 20px;
    margin: 0 auto 30px auto;
  }
  
  .search-row {
    flex-direction: column;
    gap: 15px;
    max-width: 100%;
  }
  
  .search-input {
    max-width: 100%;
  }
  
  .search-btn {
    min-width: 100%;
    max-width: 300px;
  }
}

.search-stats {
  text-align: center;
  margin-top: 20px;
  margin-bottom: -10px;
}

.active-filters {
  margin-top: 15px;
}

.back-to-top-btn {
  z-index: 999;
}

.csv-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  margin-left: 8px;
}
</style>