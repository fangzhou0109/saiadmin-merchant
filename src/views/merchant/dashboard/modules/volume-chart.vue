<template>
  <ElCard shadow="never" class="volume-card">
    <template #header>
      <div class="volume-header">
        <span>近 7 日订单量</span>
        <span class="volume-legend">
          <i class="dot dot-order"></i>下单笔数
          <i class="dot dot-paid"></i>支付笔数
        </span>
      </div>
    </template>
    <ArtBarChart
      v-if="hasData"
      height="300px"
      :data="chartSeries"
      :x-axis-data="xLabels"
      :show-axis-line="false"
      :show-legend="true"
      legend-position="top"
      :colors="['#409eff', '#67c23a']"
      bar-width="28%"
    />
    <ElEmpty v-else description="近 7 日暂无订单量数据" :image-size="80" />
  </ElCard>
</template>

<script setup lang="ts">
  import type { BarDataItem } from '@/types/component/chart'
  import type { TrendItem } from '../types'

  const props = defineProps<{ trend: TrendItem[] }>()

  const xLabels = computed(() => props.trend.map((item) => item.label || ''))
  const orderCounts = computed(() => props.trend.map((item) => item.order_count ?? 0))
  const paidCounts = computed(() => props.trend.map((item) => item.paid_count ?? 0))
  const hasData = computed(() => orderCounts.value.some((v) => v > 0) || paidCounts.value.some((v) => v > 0))
  const chartSeries = computed<BarDataItem[]>(() => [
    { name: '下单笔数', data: orderCounts.value },
    { name: '支付笔数', data: paidCounts.value }
  ])
</script>

<style scoped lang="scss">
  .volume-card { margin-bottom: 16px; }
  .volume-header { display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; justify-content: space-between; }
  .volume-legend { display: inline-flex; gap: 14px; align-items: center; font-size: 12px; color: var(--el-text-color-secondary); }
  .dot { display: inline-block; width: 8px; height: 8px; margin-right: 4px; border-radius: 50%; }
  .dot-order { background: #409eff; }
  .dot-paid { background: #67c23a; }
</style>
