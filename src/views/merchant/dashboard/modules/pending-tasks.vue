<template>
  <ElCard shadow="never" class="insight-card pending-card">
    <template #header>
      <div class="card-header">
        <span>待办事项</span>
        <span v-if="totalCount > 0" class="header-badge">{{ totalCount }}</span>
      </div>
    </template>
    <div class="task-list">
      <RouterLink
        v-for="item in tasks"
        :key="item.key"
        :to="item.path"
        class="task-item"
        :class="{ 'task-item--alert': item.count > 0 }"
      >
        <div class="task-left">
          <ArtSvgIcon :icon="item.icon" class="task-icon" :class="item.iconClass" />
          <div>
            <div class="task-label">{{ item.label }}</div>
            <div v-if="item.sub" class="task-sub">{{ item.sub }}</div>
          </div>
        </div>
        <ElBadge :value="item.count" :hidden="item.count <= 0" :type="item.badgeType" />
      </RouterLink>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  import type { MerchantDashboardStats } from '../types'

  const props = defineProps<{ stats: MerchantDashboardStats }>()

  const tasks = computed(() => [
    {
      key: 'withdraw',
      label: '待审核提现',
      sub:
        (props.stats.pending_withdraw_count ?? 0) > 0
          ? `合计 ${props.stats.pending_withdraw_amount ?? '0.0000'} 元`
          : '',
      count: props.stats.pending_withdraw_count ?? 0,
      path: '/merchant/withdraw',
      icon: 'ri:hand-coin-line',
      iconClass: 'icon-danger',
      badgeType: 'danger' as const
    },
    {
      key: 'recharge',
      label: '待审核充值',
      sub:
        (props.stats.pending_recharge_count ?? 0) > 0
          ? `合计 ${props.stats.pending_recharge_amount ?? '0.0000'} 元`
          : '',
      count: props.stats.pending_recharge_count ?? 0,
      path: '/merchant/recharge',
      icon: 'ri:wallet-3-line',
      iconClass: 'icon-warning',
      badgeType: 'warning' as const
    }
  ])

  const totalCount = computed(() => tasks.value.reduce((sum, item) => sum + item.count, 0))
</script>

<style scoped lang="scss">
  .pending-card { min-height: 320px; }
  .card-header { display: flex; gap: 8px; align-items: center; justify-content: space-between; }
  .header-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: var(--el-color-danger);
    border-radius: 999px;
  }
  .task-list { display: flex; flex: 1; flex-direction: column; gap: 10px; justify-content: center; }
  .task-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    color: var(--el-text-color-primary);
    text-decoration: none;
    background: var(--el-fill-color-light);
    border-radius: 8px;
    transition: background 0.15s, color 0.15s;
    &:hover { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
    &--alert { background: var(--el-color-danger-light-9); }
  }
  .task-left { display: flex; gap: 10px; align-items: center; }
  .task-icon { font-size: 18px; }
  .icon-danger { color: var(--el-color-danger); }
  .icon-warning { color: var(--el-color-warning); }
  .task-label { font-size: 14px; }
  .task-sub { margin-top: 2px; font-size: 12px; color: var(--el-text-color-secondary); }
</style>
