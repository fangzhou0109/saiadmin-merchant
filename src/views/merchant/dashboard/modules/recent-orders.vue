<template>
  <ElCard shadow="never" class="recent-card">
    <template #header>
      <div class="recent-header">
        <span>最近订单</span>
        <RouterLink to="/merchant/order">
          <ElButton link type="primary">查看全部</ElButton>
        </RouterLink>
      </div>
    </template>
    <ElTable :data="orders" border size="small" empty-text="暂无订单">
      <ElTableColumn prop="out_trade_no" label="商户订单号" min-width="150" show-overflow-tooltip />
      <ElTableColumn prop="order_no" label="平台订单号" min-width="170" show-overflow-tooltip />
      <ElTableColumn prop="amount" label="金额(元)" width="100" align="right" />
      <ElTableColumn label="支付类型" width="100">
        <template #default="{ row }">{{ payTypeMap[row.pay_type] || row.pay_type }}</template>
      </ElTableColumn>
      <ElTableColumn label="状态" width="90" align="center">
        <template #default="{ row }">
          <ElTag :type="(statusMap[row.status]?.tagType as any) || 'info'" size="small">
            {{ statusMap[row.status]?.label || row.status }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="create_time" label="创建时间" width="170" />
    </ElTable>
  </ElCard>
</template>

<script setup lang="ts">
  import { ORDER_STATUS_MAP, PAY_TYPE_MAP } from '../../constants'

  defineProps<{
    orders: Record<string, any>[]
  }>()

  const payTypeMap = PAY_TYPE_MAP
  const statusMap = ORDER_STATUS_MAP
</script>

<style scoped lang="scss">
  .recent-card {
    margin-bottom: 16px;
  }

  .recent-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
</style>
