<!-- 商户门户工作台：经营概览 -->
<template>
  <div v-loading="loading" class="merchant-dashboard">
    <HeroPanel
      :stats="stats"
      :greeting="greeting"
      :loading="loading"
      @refresh="loadStats"
    />

    <section class="dashboard-section">
      <h3 class="section-title">核心指标</h3>
      <KpiStrip :stats="stats" />
    </section>

    <section class="dashboard-section">
      <h3 class="section-title">经营明细</h3>
      <BusinessPanels :stats="stats" />
    </section>

    <section class="dashboard-section">
      <h3 class="section-title">趋势分析</h3>
      <ElRow :gutter="16">
        <ElCol :xs="24" :xl="14">
          <TrendChart :trend="stats.trend_7d || []" />
        </ElCol>
        <ElCol :xs="24" :xl="10">
          <VolumeChart :trend="stats.trend_7d || []" />
        </ElCol>
      </ElRow>
    </section>

    <section class="dashboard-section insight-section">
      <h3 class="section-title">结构洞察</h3>
      <ElRow :gutter="16" class="insight-row">
        <ElCol :xs="24" :lg="12" class="insight-col">
          <PayTypeChart :dist="stats.pay_type_dist_today || []" />
        </ElCol>
        <ElCol :xs="24" :lg="12" class="insight-col">
          <AccountOverview :stats="stats" />
        </ElCol>
      </ElRow>
      <ElRow :gutter="16" class="insight-row">
        <ElCol :xs="24" :lg="12" class="insight-col">
          <PendingTasks :stats="stats" />
        </ElCol>
        <ElCol :xs="24" :lg="12" class="insight-col">
          <QuickActions />
        </ElCol>
      </ElRow>
    </section>

    <section class="dashboard-section">
      <h3 class="section-title">实时动态</h3>
      <ElRow :gutter="16">
        <ElCol :xs="24" :xl="15">
          <RecentOrders :orders="stats.recent_orders || []" />
        </ElCol>
        <ElCol :xs="24" :xl="9">
          <PendingAudits
            :withdraws="stats.recent_pending_withdraws || []"
            :recharges="stats.recent_pending_recharges || []"
          />
        </ElCol>
      </ElRow>
    </section>
  </div>
</template>

<script setup lang="ts">
  import api from '@/api/merchant/dashboard'
  import withdrawApi from '@/api/merchant/withdraw'
  import rechargeApi from '@/api/merchant/recharge'
  import {
    mapRechargeQueueRows,
    mapWithdrawQueueRows,
    normalizeDashboardStats,
    shouldPatchPendingRecharge,
    shouldPatchPendingWithdraw,
    sumAmountStrings
  } from './utils'
  import HeroPanel from './modules/hero-panel.vue'
  import KpiStrip from './modules/kpi-strip.vue'
  import BusinessPanels from './modules/business-panels.vue'
  import TrendChart from './modules/trend-chart.vue'
  import VolumeChart from './modules/volume-chart.vue'
  import PayTypeChart from './modules/pay-type-chart.vue'
  import AccountOverview from './modules/account-overview.vue'
  import PendingTasks from './modules/pending-tasks.vue'
  import QuickActions from './modules/quick-actions.vue'
  import RecentOrders from './modules/recent-orders.vue'
  import PendingAudits from './modules/pending-audits.vue'
  import type { MerchantDashboardStats } from './types'
  import { useCommon } from '@/hooks/core/useCommon'

  defineOptions({ name: 'MerchantDashboard' })

  const loading = ref(false)

  const createDefaultStats = (): MerchantDashboardStats => ({
    stats_time: '',
    mch_id: '',
    merchant_name: '',
    balance: '0.0000',
    balance_freeze: '0.0000',
    balance_total: '0.0000',
    today_order_count: 0,
    today_order_amount: '0.0000',
    today_paid_count: 0,
    today_paid_amount: '0.0000',
    today_fee_amount: '0.0000',
    today_pending_count: 0,
    today_failed_count: 0,
    today_success_rate: 0,
    yesterday_paid_count: 0,
    yesterday_paid_amount: '0.0000',
    paid_amount_change_pct: null,
    order_count_change_pct: null,
    month_order_count: 0,
    month_order_amount: '0.0000',
    month_paid_count: 0,
    month_paid_amount: '0.0000',
    month_fee_amount: '0.0000',
    pending_withdraw_count: 0,
    pending_withdraw_amount: '0.0000',
    pending_recharge_count: 0,
    pending_recharge_amount: '0.0000',
    trend_7d: [],
    pay_type_dist_today: [],
    recent_orders: [],
    recent_pending_withdraws: [],
    recent_pending_recharges: []
  })

  const stats = ref<MerchantDashboardStats>(createDefaultStats())

  const greeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return '上午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  })

  /** 待审数据兜底：从提现/充值列表按 status=0 补全金额与队列 */
  const patchPendingStats = async () => {
    const tasks: Promise<void>[] = []

    if (shouldPatchPendingWithdraw(stats.value)) {
      tasks.push(
        withdrawApi.list({ page: 1, limit: 20, status: 0 }).then((page) => {
          const rows = page?.data ?? []
          if (!rows.length) return
          stats.value.pending_withdraw_amount = sumAmountStrings(rows)
          if (!(stats.value.recent_pending_withdraws?.length)) {
            stats.value.recent_pending_withdraws = mapWithdrawQueueRows(rows)
          }
        })
      )
    }

    if (shouldPatchPendingRecharge(stats.value)) {
      tasks.push(
        rechargeApi.list({ page: 1, limit: 20, status: 0 }).then((page) => {
          const rows = page?.data ?? []
          if (!rows.length) return
          stats.value.pending_recharge_amount = sumAmountStrings(rows)
          if (!(stats.value.recent_pending_recharges?.length)) {
            stats.value.recent_pending_recharges = mapRechargeQueueRows(rows)
          }
        })
      )
    }

    if (tasks.length) {
      await Promise.allSettled(tasks)
    }
  }

  const loadStats = async () => {
    loading.value = true
    try {
      const data = await api.stats()
      stats.value = normalizeDashboardStats(createDefaultStats(), data)
      await patchPendingStats()
    } finally {
      loading.value = false
    }
  }

  const { scrollToTop } = useCommon()
  scrollToTop()

  onMounted(loadStats)
</script>

<style scoped lang="scss">
  .merchant-dashboard {
    padding: 4px 4px 20px;
  }

  .dashboard-section {
    margin-bottom: 8px;
  }

  .section-title {
    margin: 0 0 12px 2px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);

    &::before {
      display: inline-block;
      width: 3px;
      height: 14px;
      margin-right: 8px;
      vertical-align: -2px;
      content: '';
      background: var(--el-color-primary);
      border-radius: 2px;
    }
  }

  .insight-section {
    .insight-row { margin-bottom: 0; }

    .insight-col {
      display: flex;
      margin-bottom: 16px;

      :deep(.insight-card) {
        display: flex;
        flex: 1;
        flex-direction: column;
        width: 100%;
        margin-bottom: 0;

        .el-card__body {
          display: flex;
          flex: 1;
          flex-direction: column;
        }
      }
    }
  }
</style>
