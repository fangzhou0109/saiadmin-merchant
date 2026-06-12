<template>
  <ElDrawer v-model="visible" title="提现详情" size="680px" @open="handleOpen">
    <ElDescriptions v-loading="loading" :column="1" border>
      <ElDescriptionsItem label="提现单号">{{ detail.withdraw_no }}</ElDescriptionsItem>
      <ElDescriptionsItem label="提现金额">{{ detail.amount }} 元</ElDescriptionsItem>
      <ElDescriptionsItem label="手续费">{{ detail.fee }} 元</ElDescriptionsItem>
      <ElDescriptionsItem label="到账金额">{{ detail.real_amount }} 元</ElDescriptionsItem>
      <ElDescriptionsItem label="状态">
        <ElTag :type="(statusMap[detail.status]?.tagType as any) || 'info'" size="small">
          {{ statusMap[detail.status]?.label || detail.status }}
        </ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="代付单号">{{ detail.transfer_no || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="审核时间">{{ detail.audit_time || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="审核备注">{{ detail.audit_remark || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="备注">{{ detail.remark || '-' }}</ElDescriptionsItem>
      <ElDescriptionsItem label="申请时间">{{ detail.create_time || '-' }}</ElDescriptionsItem>
    </ElDescriptions>

    <ElAlert
      v-if="!detail.account_no"
      class="snapshot-missing-alert"
      type="warning"
      :closable="false"
      show-icon
      title="该提现单无银行卡快照（多为历史单据），无法展示申请时收款信息。"
    />
    <!-- 收款银行卡：仅展示申请时落库快照 -->
    <ElCard class="bank-card-panel" shadow="never">
      <template #header>
        <div class="bank-card-panel__title">
          <ArtSvgIcon icon="ri:bank-card-line" />
          <span>收款银行卡</span>
          <ElTag v-if="detail.account_no" size="small" type="info">申请快照</ElTag>
        </div>
      </template>
      <ElDescriptions :column="1" border>
        <ElDescriptionsItem label="收款人">{{ detail.account_name || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="银行卡号">
          <span class="account-no-full">{{ detail.account_no || '-' }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="开户银行">{{ detail.bank_name || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="银行编码">{{ detail.bank_code || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="开户支行">{{ detail.branch_name || '-' }}</ElDescriptionsItem>
      </ElDescriptions>
    </ElCard>
  </ElDrawer>
</template>

<script setup lang="ts">
  import api from '@/api/merchant/withdraw'
  import { WITHDRAW_STATUS_MAP } from '../../constants'

  interface Props {
    modelValue: boolean
    withdraw?: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: boolean): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    withdraw: undefined
  })
  const emit = defineEmits<Emits>()

  const statusMap = WITHDRAW_STATUS_MAP
  const loading = ref(false)
  const detail = ref<Record<string, any>>({})

  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })

  /** 打开时拉取详情（含银行卡快照补全） */
  const handleOpen = async () => {
    detail.value = { ...(props.withdraw || {}) }
    const id = props.withdraw?.id
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

<style scoped>
  .snapshot-missing-alert {
    margin-top: 16px;
  }

  .bank-card-panel {
    margin-top: 16px;
    border: 1px solid var(--el-color-primary-light-7);
  }

  .bank-card-panel__title {
    display: flex;
    gap: 8px;
    align-items: center;
    font-weight: 600;
  }

  .account-no-full {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.5px;
    color: var(--el-color-primary);
    word-break: break-all;
  }
</style>
