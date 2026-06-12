<template>
  <ElDrawer v-model="visible" title="订单详情" size="640px" @open="handleOpen">
    <ElDescriptions v-loading="loading" :column="1" border>
      <ElDescriptionsItem label="平台订单号">{{ detail.order_no }}</ElDescriptionsItem>
      <ElDescriptionsItem label="商户订单号">{{ detail.out_trade_no }}</ElDescriptionsItem>
      <ElDescriptionsItem label="支付类型">
        {{ payTypeMap[detail.pay_type] || detail.pay_type }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="订单金额">{{ detail.amount }} 元</ElDescriptionsItem>
      <ElDescriptionsItem label="手续费">{{ detail.fee }} 元</ElDescriptionsItem>
      <ElDescriptionsItem label="实收金额">{{ detail.real_amount }} 元</ElDescriptionsItem>
      <ElDescriptionsItem label="费率快照">{{ detail.rate }} %</ElDescriptionsItem>
      <ElDescriptionsItem label="费率来源">
        {{ rateSourceMap[detail.rate_source] || detail.rate_source || '-' }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="订单状态">
        <ElTag :type="(orderStatusMap[detail.status]?.tagType as any) || 'info'" size="small">
          {{ orderStatusMap[detail.status]?.label || detail.status }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="入账状态">
        <ElTag :type="(settleStatusMap[detail.settle_status]?.tagType as any) || 'info'" size="small">
          {{ settleStatusMap[detail.settle_status]?.label || detail.settle_status }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="通知状态">
        <ElTag :type="(notifyStatusMap[detail.notify_status]?.tagType as any) || 'info'" size="small">
          {{ notifyStatusMap[detail.notify_status]?.label || detail.notify_status }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="商品名称">{{ detail.commodity_name || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="用户端IP">{{ detail.client_ip || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="透传参数">{{ detail.extra || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="异步通知地址">{{ detail.notify_url || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="同步跳转地址">{{ detail.return_url || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="过期时间">{{ detail.expire_time || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="支付时间">{{ detail.pay_time || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="创建时间">{{ detail.create_time || '-' }}</ElDescriptionsItem>
    </ElDescriptions>
  </ElDrawer>
</template>

<script setup lang="ts">
  import api from '@/api/merchant/order'
  import {
    PAY_TYPE_MAP,
    ORDER_STATUS_MAP,
    SETTLE_STATUS_MAP,
    NOTIFY_STATUS_MAP,
    RATE_SOURCE_MAP
  } from '../../constants'

  interface Props {
    modelValue: boolean
    order?: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: boolean): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    order: undefined
  })
  const emit = defineEmits<Emits>()

  const payTypeMap = PAY_TYPE_MAP
  const orderStatusMap = ORDER_STATUS_MAP
  const settleStatusMap = SETTLE_STATUS_MAP
  const notifyStatusMap = NOTIFY_STATUS_MAP
  const rateSourceMap = RATE_SOURCE_MAP

  const loading = ref(false)
  const detail = ref<Record<string, any>>({})

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /** 抽屉打开时拉取最新详情（pay_time / notify_status 等以服务端为准） */
  const handleOpen = async () => {
    detail.value = { ...(props.order || {}) }
    const id = props.order?.id
    if (!id) return
    loading.value = true
    try {
      const data = await api.read(id)
      if (data) {
        detail.value = data
      }
    } finally {
      loading.value = false
    }
  }
</script>
