<template>
  <div class="result-block">
    <div class="result-title">{{ title }}</div>
    <ElDescriptions :column="2" border size="small">
      <template v-if="type === 'submit'">
        <ElDescriptionsItem label="平台订单号">{{ data.order_no }}</ElDescriptionsItem>
        <ElDescriptionsItem label="商户订单号">{{ data.out_trade_no }}</ElDescriptionsItem>
        <ElDescriptionsItem label="选路模式">
          <ElTag :type="data.pick_mode === 'route' ? 'primary' : 'success'" size="small">
            {{ data.pick_mode === 'route' ? '综合路由' : '通道直连' }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="手续费">{{ data.fee || '—' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="实收金额">{{ data.real_amount || '—' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="上游单号">{{ data.upstream_no || '—' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="notify_url" :span="2">{{ data.notify_url || '—' }}</ElDescriptionsItem>
      </template>
      <template v-else>
        <ElDescriptionsItem label="平台订单号">{{ data.order_no }}</ElDescriptionsItem>
        <ElDescriptionsItem label="商户订单号">{{ data.out_trade_no }}</ElDescriptionsItem>
        <ElDescriptionsItem label="金额(元)">{{ data.amount }}</ElDescriptionsItem>
        <ElDescriptionsItem label="状态">
          <ElTag :type="statusTag" size="small">{{ statusLabel }}</ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="trade_status">{{ data.trade_status }}</ElDescriptionsItem>
        <ElDescriptionsItem label="支付时间">{{ data.pay_time || '—' }}</ElDescriptionsItem>
      </template>
    </ElDescriptions>
    <div v-if="data.pay_url" class="pay-url-box">
      <span class="pay-url-label">支付链接：</span>
      <ElLink type="primary" :href="data.pay_url" target="_blank">{{ data.pay_url }}</ElLink>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ORDER_STATUS_MAP } from '../../constants'

  const props = defineProps<{
    title: string
    data: Record<string, any>
    type: 'submit' | 'query'
  }>()

  const statusMeta = computed(() => {
    const st = Number(props.data.status)
    return ORDER_STATUS_MAP[st] || { label: String(st), tagType: 'info' }
  })
  const statusLabel = computed(() => statusMeta.value.label)
  const statusTag = computed(() => statusMeta.value.tagType as 'success' | 'info' | 'warning' | 'danger')
</script>

<style scoped lang="scss">
  .result-block {
    margin-top: 16px;
    max-width: 880px;
  }

  .result-title {
    margin-bottom: 10px;
    font-weight: 600;
  }

  .pay-url-box {
    margin-top: 12px;
    word-break: break-all;
  }

  .pay-url-label {
    color: var(--el-text-color-secondary);
  }
</style>
