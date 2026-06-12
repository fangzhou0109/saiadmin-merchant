<template>
  <ElCard shadow="never" class="audit-card">
    <template #header>
      <div class="card-header">
        <span>待审队列</span>
        <RouterLink :to="activeTab === 'withdraw' ? '/merchant/withdraw' : '/merchant/recharge'">
          <ElButton link type="primary">全部</ElButton>
        </RouterLink>
      </div>
    </template>
    <ElTabs v-model="activeTab" class="audit-tabs">
      <ElTabPane :label="`提现(${withdrawCount})`" name="withdraw">
        <ElTable :data="withdraws" size="small" class="audit-table" empty-text="暂无待审提现">
          <ElTableColumn prop="withdraw_no" label="提现单号" min-width="150" show-overflow-tooltip />
          <ElTableColumn prop="amount" label="金额" width="100" align="right" />
          <ElTableColumn prop="create_time" label="时间" width="160" show-overflow-tooltip />
        </ElTable>
      </ElTabPane>
      <ElTabPane :label="`充值(${rechargeCount})`" name="recharge">
        <ElTable :data="recharges" size="small" class="audit-table" empty-text="暂无待审充值">
          <ElTableColumn prop="recharge_no" label="充值单号" min-width="150" show-overflow-tooltip />
          <ElTableColumn prop="amount" label="金额" width="100" align="right" />
          <ElTableColumn prop="create_time" label="时间" width="160" show-overflow-tooltip />
        </ElTable>
      </ElTabPane>
    </ElTabs>
  </ElCard>
</template>

<script setup lang="ts">
  import type { PendingRechargeItem, PendingWithdrawItem } from '../types'

  const props = defineProps<{
    withdraws: PendingWithdrawItem[]
    recharges: PendingRechargeItem[]
  }>()

  const withdrawCount = computed(() => props.withdraws?.length ?? 0)
  const rechargeCount = computed(() => props.recharges?.length ?? 0)

  const activeTab = ref('withdraw')

  // 有待审提现时默认展示提现 Tab
  watch(
    () => props.withdraws,
    (list) => {
      if (list?.length) {
        activeTab.value = 'withdraw'
      } else if (props.recharges?.length) {
        activeTab.value = 'recharge'
      }
    },
    { immediate: true, deep: true }
  )
</script>

<style scoped lang="scss">
  .audit-card { margin-bottom: 16px; }
  .card-header { display: flex; align-items: center; justify-content: space-between; }
  .audit-tabs { margin-top: -8px; }

  .audit-table {
    min-height: 180px;
  }
</style>
