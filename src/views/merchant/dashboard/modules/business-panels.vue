<template>
  <ElRow :gutter="16">
    <ElCol :xs="24" :lg="8">
      <ElCard shadow="never" class="panel-card">
        <template #header>
          <div class="panel-header">
            <span>今日代收</span>
            <RouterLink to="/merchant/order"><ElButton link type="primary">订单</ElButton></RouterLink>
          </div>
        </template>
        <div class="kv"><span>下单笔数 / 金额</span><b>{{ stats.today_order_count }} / {{ stats.today_order_amount }}</b></div>
        <div class="kv"><span>已支付笔数</span><b class="text-success">{{ stats.today_paid_count }}</b></div>
        <div class="kv"><span>实收金额(元)</span><b class="text-success">{{ stats.today_paid_amount }}</b></div>
        <div class="kv"><span>手续费支出(元)</span><b class="text-warning">{{ stats.today_fee_amount }}</b></div>
        <div class="kv"><span>待支付 / 失败关闭</span><b>{{ stats.today_pending_count }} / {{ stats.today_failed_count }}</b></div>
        <div class="kv"><span>支付成功率</span><b>{{ formatRate(stats.today_success_rate) }}</b></div>
      </ElCard>
    </ElCol>

    <ElCol :xs="24" :lg="8">
      <ElCard shadow="never" class="panel-card">
        <template #header>
          <div class="panel-header">
            <span>本月累计</span>
            <RouterLink to="/merchant/capital"><ElButton link type="primary">流水</ElButton></RouterLink>
          </div>
        </template>
        <div class="kv"><span>下单笔数</span><b>{{ stats.month_order_count }}</b></div>
        <div class="kv"><span>下单金额(元)</span><b>{{ stats.month_order_amount }}</b></div>
        <div class="kv"><span>已支付笔数</span><b>{{ stats.month_paid_count }}</b></div>
        <div class="kv"><span>实收金额(元)</span><b class="text-success">{{ stats.month_paid_amount }}</b></div>
        <div class="kv"><span>手续费支出(元)</span><b class="text-warning">{{ stats.month_fee_amount }}</b></div>
      </ElCard>
    </ElCol>

    <ElCol :xs="24" :lg="8">
      <ElCard shadow="never" class="panel-card">
        <template #header>
          <div class="panel-header">
            <span>账户与待办</span>
            <RouterLink to="/merchant/withdraw"><ElButton link type="primary">提现</ElButton></RouterLink>
          </div>
        </template>
        <div class="kv"><span>可用余额(元)</span><b class="text-success">{{ stats.balance }}</b></div>
        <div class="kv"><span>冻结余额(元)</span><b class="text-warning">{{ stats.balance_freeze }}</b></div>
        <div class="kv"><span>账户合计(元)</span><b>{{ stats.balance_total }}</b></div>
        <div class="kv"><span>昨日实收(元)</span><b>{{ stats.yesterday_paid_amount }}</b></div>
        <div class="kv">
          <span>实收环比</span>
          <b :class="changeClass">{{ formatChange(stats.paid_amount_change_pct) }}</b>
        </div>
        <div class="kv">
          <span>待审提现</span>
          <b class="text-danger">{{ stats.pending_withdraw_count }} 笔 / {{ stats.pending_withdraw_amount }} 元</b>
        </div>
        <div class="kv">
          <span>待审充值</span>
          <b class="text-warning">{{ stats.pending_recharge_count }} 笔 / {{ stats.pending_recharge_amount }} 元</b>
        </div>
      </ElCard>
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
  .panel-card { margin-bottom: 16px; }
  .panel-header { display: flex; align-items: center; justify-content: space-between; }
  .kv {
    display: flex;
    gap: 12px;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    &:last-child { border-bottom: none; }
    span { flex-shrink: 0; color: var(--el-text-color-secondary); }
    b { text-align: right; }
  }
  .text-success { color: var(--el-color-success); }
  .text-warning { color: var(--el-color-warning); }
  .text-danger { color: var(--el-color-danger); }
</style>
