<template>
  <ElCard shadow="never" class="trend-card">
    <template #header>
      <div class="trend-header">
        <span>近 7 日代收趋势</span>
        <span class="trend-legend">
          <i class="dot dot-order"></i>下单金额
          <i class="dot dot-paid"></i>实收金额
        </span>
      </div>
    </template>
    <ArtLineChart
      v-if="hasData"
      height="320px"
      :data="chartSeries"
      :x-axis-data="xLabels"
      :show-area-color="true"
      :show-legend="true"
      legend-position="top"
      :colors="['#409eff', '#67c23a']"
    />
    <ElEmpty v-else description="近 7 日暂无订单数据" :image-size="80" />
  </ElCard>
</template>

<script setup lang="ts">
  import type { LineDataItem } from '@/types/component/chart'

  interface TrendItem {
    label?: string
    order_amount?: string
    paid_amount?: string
  }

  const props = defineProps<{
    trend: TrendItem[]
  }>()

  const toChartNumber = (val?: string) => {
    const num = parseFloat(val || '0')
    return Number.isFinite(num) ? num : 0
  }

  const xLabels = computed(() => props.trend.map((item) => item.label || ''))

  const orderAmounts = computed(() => props.trend.map((item) => toChartNumber(item.order_amount)))
  const paidAmounts = computed(() => props.trend.map((item) => toChartNumber(item.paid_amount)))

  const hasData = computed(() => {
    return orderAmounts.value.some((v) => v > 0) || paidAmounts.value.some((v) => v > 0)
  })

  const chartSeries = computed<LineDataItem[]>(() => [
    { name: '下单金额(元)', data: orderAmounts.value },
    { name: '实收金额(元)', data: paidAmounts.value }
  ])
</script>

<style scoped lang="scss">
  .trend-card {
    margin-bottom: 16px;
  }

  .trend-header {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 16px;
    align-items: center;
    justify-content: space-between;
  }

  .trend-legend {
    display: inline-flex;
    gap: 14px;
    align-items: center;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 4px;
    border-radius: 50%;
  }

  .dot-order {
    background: #409eff;
  }

  .dot-paid {
    background: #67c23a;
  }
</style>
