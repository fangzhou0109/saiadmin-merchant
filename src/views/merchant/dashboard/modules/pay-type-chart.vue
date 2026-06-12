<template>
  <ElCard shadow="never" class="insight-card pay-type-card">
    <template #header>
      <div class="card-header">
        <span>今日支付类型分布</span>
        <span class="sub">按已支付笔数</span>
      </div>
    </template>
    <ArtRingChart
      v-if="hasData"
      height="280px"
      :data="chartData"
      :show-legend="true"
      legend-position="right"
      :center-text="centerText"
    />
    <ElEmpty v-else description="今日暂无已支付订单" :image-size="80" />
  </ElCard>
</template>

<script setup lang="ts">
  import { PAY_TYPE_MAP } from '@/views/merchant/constants'
  import type { PayTypeDistItem } from '../types'

  const props = defineProps<{ dist: PayTypeDistItem[] }>()

  const chartData = computed(() =>
    props.dist.map((item) => ({
      name: PAY_TYPE_MAP[item.pay_type] || `类型${item.pay_type}`,
      value: item.order_count
    }))
  )
  const totalCount = computed(() => chartData.value.reduce((sum, item) => sum + item.value, 0))
  const hasData = computed(() => totalCount.value > 0)
  const centerText = computed(() => `${totalCount.value}\n笔`)
</script>

<style scoped lang="scss">
  .pay-type-card { min-height: 360px; }
  .pay-type-card :deep(.el-card__body) { display: flex; flex: 1; flex-direction: column; justify-content: center; min-height: 300px; }
  .card-header { display: flex; gap: 8px; align-items: baseline; justify-content: space-between; }
  .sub { font-size: 12px; color: var(--el-text-color-secondary); }
</style>
