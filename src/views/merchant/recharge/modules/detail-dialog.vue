<template>
  <ElDrawer v-model="visible" title="充值详情" size="640px" @open="handleOpen">
    <ElDescriptions v-loading="loading" :column="1" border>
      <ElDescriptionsItem label="充值单号">{{ detail.recharge_no }}</ElDescriptionsItem>
      <ElDescriptionsItem label="充值金额">{{ detail.amount }} 元</ElDescriptionsItem>
      <ElDescriptionsItem label="充值方式">
        {{ typeMap[detail.recharge_type] || detail.recharge_type }}
      </ElDescriptionsItem>
      <ElDescriptionsItem label="状态">
        <ElTag :type="(statusMap[detail.status]?.tagType as any) || 'info'" size="small">
          {{ statusMap[detail.status]?.label || detail.status }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="审核时间">{{ detail.audit_time || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="审核备注">{{ detail.audit_remark || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="申请备注">{{ detail.remark || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="申请时间">{{ detail.create_time || '-' }}</ElDescriptionsItem>
    </ElDescriptions>
  </ElDrawer>
</template>

<script setup lang="ts">
  import api from '@/api/merchant/recharge'
  import { RECHARGE_STATUS_MAP, RECHARGE_TYPE_MAP } from '../../constants'

  interface Props {
    modelValue: boolean
    recharge?: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: boolean): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    recharge: undefined
  })
  const emit = defineEmits<Emits>()

  const statusMap = RECHARGE_STATUS_MAP
  const typeMap = RECHARGE_TYPE_MAP
  const loading = ref(false)
  const detail = ref<Record<string, any>>({})

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  const handleOpen = async () => {
    detail.value = { ...(props.recharge || {}) }
    const id = props.recharge?.id
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
