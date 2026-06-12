<template>
  <div class="hero-panel art-card">
    <div class="hero-main">
      <div class="hero-top">
        <div class="hero-badge">商户经营工作台</div>
        <div class="hero-toolbar">
          <RouterLink v-if="pendingTotal > 0" class="pending-chip" to="/merchant/withdraw">
            <span class="pending-dot" />
            <span>{{ pendingTotal }} 项待办</span>
          </RouterLink>
          <span v-else class="pending-chip is-clear">
            <ArtSvgIcon icon="ri:checkbox-circle-line" class="clear-icon" />
            <span>待办已清空</span>
          </span>
          <span class="toolbar-divider" />
          <ElTooltip content="刷新数据" placement="top">
            <button
              type="button"
              class="refresh-btn"
              :class="{ 'is-loading': loading }"
              :disabled="loading"
              @click="emit('refresh')"
            >
              <ArtSvgIcon icon="ri:refresh-line" />
            </button>
          </ElTooltip>
        </div>
      </div>

      <h2 class="hero-title">{{ greeting }}，{{ stats.merchant_name || '商户' }}</h2>
      <p class="hero-sub">
        商户号 <code>{{ stats.mch_id || '—' }}</code> · 账户余额与代收经营数据一览
      </p>
      <p v-if="stats.stats_time" class="hero-time">
        <ArtSvgIcon icon="ri:time-line" class="time-icon" />
        数据截至 {{ stats.stats_time }}
      </p>
    </div>

    <div class="hero-metrics">
      <RouterLink
        v-for="item in quickMetrics"
        :key="item.key"
        :to="item.path"
        class="hero-metric"
      >
        <span class="metric-label">{{ item.label }}</span>
        <span class="metric-value" :class="item.valueClass">{{ item.value }}</span>
        <span v-if="item.badge" class="metric-badge" :class="item.badgeClass">{{ item.badge }}</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { MerchantDashboardStats } from '../types'

  const props = defineProps<{
    stats: MerchantDashboardStats
    greeting: string
    loading?: boolean
  }>()

  const emit = defineEmits<{
    refresh: []
  }>()

  const formatChange = (val?: number | null) => {
    if (val === undefined || val === null) return ''
    return `${val > 0 ? '+' : ''}${val}%`
  }

  const pendingTotal = computed(() => {
    return (props.stats.pending_withdraw_count ?? 0) + (props.stats.pending_recharge_count ?? 0)
  })

  const quickMetrics = computed(() => [
    {
      key: 'balance',
      label: '可用余额',
      value: props.stats.balance ?? '0.0000',
      path: '/merchant/capital',
      valueClass: 'is-success',
      badge: `合计 ${props.stats.balance_total ?? '0.0000'}`,
      badgeClass: 'is-muted'
    },
    {
      key: 'paid',
      label: '今日实收',
      value: props.stats.today_paid_amount ?? '0.0000',
      path: '/merchant/order',
      valueClass: 'is-success',
      badge: formatChange(props.stats.paid_amount_change_pct),
      badgeClass: changeClass(props.stats.paid_amount_change_pct)
    },
    {
      key: 'order',
      label: '今日订单',
      value: String(props.stats.today_order_count ?? 0),
      path: '/merchant/order',
      valueClass: '',
      badge: `成功率 ${props.stats.today_success_rate ?? 0}%`,
      badgeClass: 'is-muted'
    },
    {
      key: 'pending',
      label: '待审提现',
      value: String(props.stats.pending_withdraw_count ?? 0),
      path: '/merchant/withdraw',
      valueClass: (props.stats.pending_withdraw_count ?? 0) > 0 ? 'is-danger' : '',
      badge:
        (props.stats.pending_withdraw_count ?? 0) > 0
          ? `${props.stats.pending_withdraw_amount ?? '0.0000'} 元`
          : '',
      badgeClass: 'is-muted'
    }
  ])

  function changeClass(val?: number | null) {
    if (val === undefined || val === null) return 'is-muted'
    if (val > 0) return 'is-up'
    if (val < 0) return 'is-down'
    return 'is-muted'
  }
</script>

<style scoped lang="scss">
  .hero-panel {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 20px;
    align-items: stretch;
    padding: 22px 24px;
    margin-bottom: 16px;
    background: linear-gradient(
      135deg,
      var(--el-color-primary-light-9) 0%,
      var(--el-bg-color) 55%,
      var(--el-fill-color-light) 100%
    );
  }

  .hero-top {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .hero-badge {
    display: inline-block;
    padding: 2px 10px;
    font-size: 12px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-8);
    border-radius: 999px;
  }

  .hero-toolbar {
    display: inline-flex;
    gap: 8px;
    align-items: center;
    padding: 4px;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 999px;
    box-shadow: 0 1px 4px rgb(0 0 0 / 4%);
  }

  .pending-chip {
    display: inline-flex;
    gap: 6px;
    align-items: center;
    padding: 4px 12px 4px 10px;
    font-size: 13px;
    color: var(--el-color-danger);
    text-decoration: none;
    border-radius: 999px;
    transition: background 0.15s;

    &:hover {
      background: var(--el-color-danger-light-9);
    }

    &.is-clear {
      color: var(--el-text-color-secondary);
      cursor: default;
    }
  }

  .pending-dot {
    width: 7px;
    height: 7px;
    background: var(--el-color-danger);
    border-radius: 50%;
    animation: pulse 1.6s ease-in-out infinite;
  }

  .clear-icon {
    font-size: 15px;
    color: var(--el-color-success);
  }

  .toolbar-divider {
    width: 1px;
    height: 16px;
    background: var(--el-border-color-lighter);
  }

  .refresh-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    font-size: 16px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    background: transparent;
    border: none;
    border-radius: 50%;
    transition: color 0.15s, background 0.15s;

    &:hover:not(:disabled) {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.65;
    }

    &.is-loading :deep(svg) {
      animation: spin 0.8s linear infinite;
    }
  }

  .hero-title {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
  }

  .hero-sub,
  .hero-time {
    margin: 6px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);

    code {
      padding: 0 4px;
      font-size: 12px;
      background: var(--el-fill-color-light);
      border-radius: 4px;
    }
  }

  .hero-time {
    display: inline-flex;
    gap: 4px;
    align-items: center;
  }

  .time-icon {
    font-size: 14px;
  }

  .hero-metrics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .hero-metric {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px 14px;
    color: inherit;
    text-decoration: none;
    background: var(--el-bg-color);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 10px;
    transition: border-color 0.15s, box-shadow 0.15s;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 4px 12px rgb(0 0 0 / 6%);
    }
  }

  .metric-label {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .metric-value {
    font-size: 20px;
    font-weight: 600;
    line-height: 1.2;
  }

  .metric-badge {
    font-size: 12px;
  }

  .is-success { color: var(--el-color-success); }
  .is-danger { color: var(--el-color-danger); }
  .is-up { color: var(--el-color-success); }
  .is-down { color: var(--el-color-danger); }
  .is-muted { color: var(--el-text-color-secondary); }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @keyframes pulse {
    50% { opacity: 0.55; transform: scale(0.85); }
  }

  @media (width <= 992px) {
    .hero-panel { grid-template-columns: 1fr; }
  }
</style>
