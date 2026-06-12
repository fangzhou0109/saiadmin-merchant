<template>
  <ElRow :gutter="16">
    <ElCol v-for="item in cards" :key="item.key" :xs="12" :sm="12" :lg="6">
      <RouterLink :to="item.path" class="kpi-card art-card">
        <div class="kpi-icon" :class="item.iconClass">
          <ArtSvgIcon :icon="item.icon" />
        </div>
        <div class="kpi-body">
          <div class="kpi-label">{{ item.label }}</div>
          <div class="kpi-value" :class="item.valueClass">{{ item.value }}</div>
          <div class="kpi-footer">
            <span v-if="item.hint" class="kpi-hint">{{ item.hint }}</span>
            <span v-if="item.change" class="kpi-change" :class="item.changeClass">{{ item.change }}</span>
          </div>
        </div>
      </RouterLink>
    </ElCol>
  </ElRow>
</template>

<script setup lang="ts">
  import type { MerchantDashboardStats } from '../types'

  const props = defineProps<{
    stats: MerchantDashboardStats
  }>()

  const formatRate = (val?: number) => `${val ?? 0}%`

  const formatChange = (val?: number | null) => {
    if (val === undefined || val === null) return ''
    return `较昨日 ${val > 0 ? '+' : ''}${val}%`
  }

  const changeClass = (val?: number | null) => {
    if (val === undefined || val === null) return ''
    if (val > 0) return 'text-success'
    if (val < 0) return 'text-danger'
    return ''
  }

  const cards = computed(() => [
    {
      key: 'balance',
      label: '可用余额(元)',
      value: props.stats.balance ?? '0.0000',
      path: '/merchant/capital',
      icon: 'ri:wallet-3-line',
      iconClass: 'icon-success',
      valueClass: 'text-success',
      hint: `冻结 ${props.stats.balance_freeze ?? '0.0000'}`,
      change: '',
      changeClass: ''
    },
    {
      key: 'today_paid',
      label: '今日实收(元)',
      value: props.stats.today_paid_amount ?? '0.0000',
      path: '/merchant/order',
      icon: 'ri:money-cny-circle-line',
      iconClass: 'icon-success',
      valueClass: 'text-success',
      hint: `成功率 ${formatRate(props.stats.today_success_rate)}`,
      change: formatChange(props.stats.paid_amount_change_pct),
      changeClass: changeClass(props.stats.paid_amount_change_pct)
    },
    {
      key: 'today_order',
      label: '今日订单(笔)',
      value: String(props.stats.today_order_count ?? 0),
      path: '/merchant/order',
      icon: 'ri:file-list-3-line',
      iconClass: 'icon-info',
      valueClass: '',
      hint: `已支付 ${props.stats.today_paid_count ?? 0} 笔`,
      change: formatChange(props.stats.order_count_change_pct),
      changeClass: changeClass(props.stats.order_count_change_pct)
    },
    {
      key: 'month_paid',
      label: '本月实收(元)',
      value: props.stats.month_paid_amount ?? '0.0000',
      path: '/merchant/order',
      icon: 'ri:bar-chart-grouped-line',
      iconClass: 'icon-primary',
      valueClass: '',
      hint: `${props.stats.month_paid_count ?? 0} 笔已支付`,
      change: '',
      changeClass: ''
    }
  ])
</script>

<style scoped lang="scss">
  .kpi-card {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    min-height: 108px;
    padding: 16px;
    margin-bottom: 16px;
    color: inherit;
    text-decoration: none;
    transition: transform 0.15s, box-shadow 0.15s;

    &:hover {
      box-shadow: 0 6px 16px rgb(0 0 0 / 8%);
      transform: translateY(-2px);
    }
  }

  .kpi-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    font-size: 20px;
    border-radius: 12px;
  }

  .icon-success { color: var(--el-color-success); background: var(--el-color-success-light-9); }
  .icon-primary { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  .icon-info { color: var(--el-color-info); background: var(--el-fill-color-light); }

  .kpi-label { font-size: 13px; color: var(--el-text-color-secondary); }
  .kpi-value { margin-top: 6px; font-size: 26px; font-weight: 600; line-height: 1.2; }
  .kpi-footer { display: flex; flex-wrap: wrap; gap: 6px 10px; margin-top: 6px; font-size: 12px; }
  .kpi-hint { color: var(--el-text-color-secondary); }
  .text-success { color: var(--el-color-success); }
  .text-danger { color: var(--el-color-danger); }
</style>
