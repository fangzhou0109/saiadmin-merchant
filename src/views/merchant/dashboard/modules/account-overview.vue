<template>
  <ElCard shadow="never" class="insight-card account-card">
    <template #header>
      <div class="card-header">
        <span>账户概览</span>
        <RouterLink to="/merchant/capital"><ElButton link type="primary">流水</ElButton></RouterLink>
      </div>
    </template>
    <div class="balance-grid">
      <div class="balance-item is-available">
        <span class="label">可用余额(元)</span>
        <span class="value">{{ stats.balance ?? '0.0000' }}</span>
      </div>
      <div class="balance-item is-freeze">
        <span class="label">冻结余额(元)</span>
        <span class="value">{{ stats.balance_freeze ?? '0.0000' }}</span>
      </div>
      <div class="balance-item is-total">
        <span class="label">账户合计(元)</span>
        <span class="value">{{ stats.balance_total ?? '0.0000' }}</span>
      </div>
    </div>
    <div class="fee-block">
      <div class="kv"><span>今日手续费(元)</span><b class="text-warning">{{ stats.today_fee_amount ?? '0.0000' }}</b></div>
      <div class="kv"><span>本月手续费(元)</span><b class="text-warning">{{ stats.month_fee_amount ?? '0.0000' }}</b></div>
      <div class="kv"><span>今日实收环比</span><b :class="changeClass">{{ formatChange(stats.paid_amount_change_pct) }}</b></div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import type { MerchantDashboardStats } from '../types'

  const props = defineProps<{ stats: MerchantDashboardStats }>()

  const formatChange = (val?: number | null) => {
    if (val === undefined || val === null) return '—'
    return `${val > 0 ? '+' : ''}${val}%`
  }

  const changeClass = computed(() => {
    const val = props.stats.paid_amount_change_pct
    if (val === undefined || val === null) return ''
    if (val > 0) return 'text-success'
    if (val < 0) return 'text-danger'
    return ''
  })
</script>

<style scoped lang="scss">
  .account-card { min-height: 360px; }
  .account-card :deep(.el-card__body) { display: flex; flex: 1; flex-direction: column; justify-content: center; min-height: 300px; }
  .card-header { display: flex; align-items: center; justify-content: space-between; }
  .balance-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
  .balance-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 14px 12px;
    border-radius: 10px;
    .label { font-size: 12px; color: var(--el-text-color-secondary); }
    .value { font-size: 18px; font-weight: 600; }
  }
  .is-available { background: var(--el-color-success-light-9); .value { color: var(--el-color-success); } }
  .is-freeze { background: var(--el-color-warning-light-9); .value { color: var(--el-color-warning); } }
  .is-total { background: var(--el-color-primary-light-9); .value { color: var(--el-color-primary); } }
  .fee-block .kv {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    font-size: 13px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    &:last-child { border-bottom: none; }
    span { color: var(--el-text-color-secondary); }
  }
  .text-success { color: var(--el-color-success); }
  .text-danger { color: var(--el-color-danger); }
  .text-warning { color: var(--el-color-warning); }

  @media (width <= 768px) {
    .balance-grid { grid-template-columns: 1fr; }
  }
</style>
