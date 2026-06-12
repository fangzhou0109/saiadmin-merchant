<template>
  <ElCard shadow="never" class="insight-card quick-card">
    <template #header>快捷入口</template>
    <div class="quick-grid">
      <RouterLink
        v-for="item in actions"
        :key="item.path"
        :to="item.path"
        class="quick-item"
      >
        <ArtSvgIcon :icon="item.icon" class="quick-icon" />
        <span class="quick-label">{{ item.label }}</span>
      </RouterLink>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
  const actions = [
    { label: '我的订单', path: '/merchant/order', icon: 'ri:file-list-3-line' },
    { label: '提现', path: '/merchant/withdraw', icon: 'ri:hand-coin-line' },
    { label: '充值', path: '/merchant/recharge', icon: 'ri:bank-card-line' },
    { label: '资金流水', path: '/merchant/capital', icon: 'ri:exchange-funds-line' },
    { label: '代收通道', path: '/merchant/channel-pay', icon: 'ri:bank-card-2-line' },
    { label: 'API 密钥', path: '/merchant/account', icon: 'ri:key-2-line' }
  ]
</script>

<style scoped lang="scss">
  .quick-card { min-height: 320px; }
  .quick-card :deep(.el-card__body) { display: flex; flex: 1; flex-direction: column; justify-content: center; }
  .quick-grid {
    display: grid;
    flex: 1;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    align-content: center;
  }
  .quick-item {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: center;
    justify-content: center;
    min-height: 72px;
    padding: 12px 6px;
    color: var(--el-text-color-primary);
    text-decoration: none;
    background: var(--el-fill-color-light);
    border-radius: 8px;
    transition: background 0.15s, color 0.15s;
    &:hover { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  }
  .quick-icon { font-size: 22px; }
  .quick-label { font-size: 12px; line-height: 1.3; text-align: center; }
  @media (width <= 768px) {
    .quick-grid { grid-template-columns: repeat(2, 1fr); }
  }
</style>
