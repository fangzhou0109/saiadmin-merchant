<template>
  <div class="merchant-integration">
    <ElCard shadow="never" class="integration-card">
      <ElTabs v-model="activeTab" class="integration-tabs">
        <ElTabPane label="对接说明" name="docs">
          <DocsPanel />
        </ElTabPane>
        <ElTabPane label="接口测试" name="test">
          <TestPanel />
        </ElTabPane>
      </ElTabs>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import DocsPanel from './modules/docs-panel.vue'
  import TestPanel from './modules/test-panel.vue'

  defineOptions({ name: 'MerchantIntegration' })

  const activeTab = ref('docs')
</script>

<style scoped lang="scss">
  /**
   * 文档型长页面：不使用 art-full-height（会锁死视口高度导致无法下划）。
   * 内容随高度自然撑开，由布局 #app-main 统一滚动（与 account 页一致）。
   */
  .merchant-integration {
    padding-bottom: 16px;
  }

  .integration-card {
    :deep(.el-card__body) {
      padding-top: 8px;
    }
  }

  .integration-tabs {
    :deep(.el-tabs__content) {
      padding-top: 4px;
      overflow: visible;
    }

    :deep(.el-tab-pane) {
      overflow: visible;
    }
  }
</style>
