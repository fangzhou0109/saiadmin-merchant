<template>
  <div class="stat-overview">
    <ElRow :gutter="16">
      <ElCol v-for="item in primaryCards" :key="item.key" :xs="12" :sm="12" :lg="6">
        <div class="stat-card art-card">
          <div class="stat-card-icon" :class="item.iconClass">
            <ArtSvgIcon :icon="item.icon" />
          </div>
          <div class="stat-card-body">
            <div class="stat-label">{{ item.label }}</div>
            <div class="stat-value" :class="item.valueClass">{{ item.value }}</div>
            <div v-if="item.hint" class="stat-hint">{{ item.hint }}</div>
          </div>
        </div>
      </ElCol>
    </ElRow>

    <ElRow :gutter="16" class="summary-row">
      <ElCol :xs="24" :md="8">
        <ElCard shadow="never" class="summary-card">
          <template #header>今日代收</template>
          <div class="kv"><span>下单笔数</span><b>{{ stats.today_order_count }}</b></div>
          <div class="kv"><span>下单金额(元)</span><b>{{ stats.today_order_amount }}</b></div>
          <div class="kv"><span>已支付笔数</span><b class="text-success">{{ stats.today_paid_count }}</b></div>
          <div class="kv"><span>实收金额(元)</span><b class="text-success">{{ stats.today_paid_amount }}</b></div>
          <div class="kv"><span>待支付 / 失败关闭</span>
            <b>{{ stats.today_pending_count }} / {{ stats.today_failed_count }}</b>
          </div>
          <div class="kv"><span>支付成功率</span><b>{{ formatRate(stats.today_success_rate) }}</b></div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :md="8">
        <ElCard shadow="never" class="summary-card">
          <template #header>本月累计</template>
          <div class="kv"><span>下单笔数</span><b>{{ stats.month_order_count }}</b></div>
          <div class="kv"><span>下单金额(元)</span><b>{{ stats.month_order_amount }}</b></div>
          <div class="kv"><span>已支付笔数</span><b>{{ stats.month_paid_count }}</b></div>
          <div class="kv"><span>实收金额(元)</span><b>{{ stats.month_paid_amount }}</b></div>
        </ElCard>
      </ElCol>
      <ElCol :xs="24" :md="8">
        <ElCard shadow="never" class="summary-card">
          <template #header>实收环比（较昨日）</template>
          <div class="kv"><span>昨日实收(元)</span><b>{{ stats.yesterday_paid_amount }}</b></div>
          <div class="kv"><span>今日实收(元)</span><b>{{ stats.today_paid_amount }}</b></div>
          <div class="kv">
            <span>环比变化</span>
            <b :class="changeClass">{{ formatChange(stats.paid_amount_change_pct) }}</b>
          </div>
          <div class="kv"><span>待审核提现</span><b class="text-danger">{{ stats.pending_withdraw_count }} 笔</b></div>
          <div class="kv"><span>待审核充值</span><b class="text-warning">{{ stats.pending_recharge_count }} 笔</b></div>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  interface DashboardStats {
    balance?: string
    balance_freeze?: string
    balance_total?: string
    today_order_count?: number
    today_paid_amount?: string
    today_success_rate?: number
    pending_withdraw_count?: number
    pending_recharge_count?: number
    today_order_amount?: string
    today_paid_count?: number
    today_pending_count?: number
    today_failed_count?: number
    month_order_count?: number
    month_order_amount?: string
    month_paid_count?: number
    month_paid_amount?: string
    yesterday_paid_amount?: string
    paid_amount_change_pct?: number | null
  }

  const props = defineProps<{
    stats: DashboardStats
  }>()

  const formatRate = (val?: number) => {
    if (val === undefined || val === null) return '0%'
    return `${val}%`
  }

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

  const primaryCards = computed(() => [
    {
      key: 'balance',
      label: '可用余额(元)',
      value: props.stats.balance ?? '0.0000',
      icon: 'ri:wallet-3-line',
      iconClass: 'icon-success',
      valueClass: 'text-success'
    },
    {
      key: 'freeze',
      label: '冻结余额(元)',
      value: props.stats.balance_freeze ?? '0.0000',
      icon: 'ri:lock-line',
      iconClass: 'icon-warning',
      valueClass: 'text-warning'
    },
    {
      key: 'total',
      label: '账户合计(元)',
      value: props.stats.balance_total ?? '0.0000',
      icon: 'ri:coins-line',
      iconClass: 'icon-primary',
      valueClass: ''
    },
    {
      key: 'today_paid',
      label: '今日实收(元)',
      value: props.stats.today_paid_amount ?? '0.0000',
      icon: 'ri:money-cny-circle-line',
      iconClass: 'icon-primary',
      valueClass: 'text-success',
      hint: `成功率 ${formatRate(props.stats.today_success_rate)}`
    },
    {
      key: 'today_order',
      label: '今日订单(笔)',
      value: String(props.stats.today_order_count ?? 0),
      icon: 'ri:file-list-3-line',
      iconClass: 'icon-info',
      valueClass: ''
    },
    {
      key: 'pending_withdraw',
      label: '待审提现(笔)',
      value: String(props.stats.pending_withdraw_count ?? 0),
      icon: 'ri:hand-coin-line',
      iconClass: 'icon-danger',
      valueClass: 'text-danger'
    },
    {
      key: 'pending_recharge',
      label: '待审充值(笔)',
      value: String(props.stats.pending_recharge_count ?? 0),
      icon: 'ri:bank-card-line',
      iconClass: 'icon-warning',
      valueClass: 'text-warning'
    },
    {
      key: 'month_paid',
      label: '本月实收(元)',
      value: props.stats.month_paid_amount ?? '0.0000',
      icon: 'ri:bar-chart-grouped-line',
      iconClass: 'icon-info',
      valueClass: '',
      hint: `${props.stats.month_paid_count ?? 0} 笔已支付`
    }
  ])
</script>

<style scoped lang="scss">
  .stat-card {
    position: relative;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    min-height: 96px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .stat-card-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    font-size: 20px;
    border-radius: 10px;
  }

  .icon-success {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }

  .icon-warning {
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
  }

  .icon-danger {
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }

  .icon-primary {
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  .icon-info {
    color: var(--el-color-info);
    background: var(--el-fill-color-light);
  }

  .stat-label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .stat-value {
    margin-top: 6px;
    font-size: 24px;
    font-weight: 600;
    line-height: 1.2;
  }

  .stat-hint {
    margin-top: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .summary-row {
    margin-top: 4px;
  }

  .summary-card {
    margin-bottom: 16px;
  }

  .kv {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    font-size: 13px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    span {
      color: var(--el-text-color-secondary);
    }
  }

  .text-success {
    color: var(--el-color-success);
  }

  .text-warning {
    color: var(--el-color-warning);
  }

  .text-danger {
    color: var(--el-color-danger);
  }
</style>
