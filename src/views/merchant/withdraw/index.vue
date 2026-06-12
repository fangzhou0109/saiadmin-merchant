<template>
  <div class="art-full-height">
    <TableSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="flex flex-col flex-1 min-h-0 art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="openApply">申请提现</ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        rowKey="id"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @sort-change="handleSortChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #status="{ row }">
          <ElTag :type="(statusMap[row.status]?.tagType as any) || 'info'" size="small">
            {{ statusMap[row.status]?.label || row.status }}
          </ElTag>
        </template>
        <template #operation="{ row }">
          <ElButton type="primary" size="small" plain @click="openDetail(row)">详情</ElButton>
        </template>
      </ArtTable>
    </ElCard>

    <DetailDialog v-model="detailVisible" :withdraw="currentRow" />

    <ElDialog v-model="applyVisible" title="申请提现" width="460px" @open="loadApplyDialogData">
      <!-- 打开弹窗时拉取最新余额，可提现金额 = 可用余额 balance -->
      <div v-loading="balanceLoading" class="balance-panel">
        <div class="balance-main">
          <span class="balance-label">当前可提现金额(元)</span>
          <span class="balance-value">{{ accountBalance.balance }}</span>
        </div>
        <div class="balance-sub">
          冻结余额(元)：<b>{{ accountBalance.balance_freeze }}</b>
          <span class="balance-hint">（审核中提现已占用，不可重复提现）</span>
        </div>
      </div>

      <ElForm ref="applyRef" :model="applyForm" :rules="applyRules" label-width="100px">
        <ElFormItem label="提现金额" prop="amount">
          <ElInputNumber
            v-model="applyForm.amount"
            :min="0"
            :max="availableAmount"
            :precision="2"
            :step="100"
            controls-position="right"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="收款银行卡" prop="bank_card_id">
          <ElSelect v-model="applyForm.bank_card_id" placeholder="请选择银行卡" style="width: 100%">
            <ElOption
              v-for="c in bankCards"
              :key="c.id"
              :label="`${c.holder_name} ${c.card_no} (${c.bank_name || '-'})`"
              :value="c.id"
            />
          </ElSelect>
        </ElFormItem>
        <ElAlert type="info" :closable="false" show-icon>
          提现需平台审核，审核通过后由系统代付到卡。手续费按代付费率扣取。
        </ElAlert>
      </ElForm>
      <template #footer>
        <ElButton @click="applyVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="submitApply">提交申请</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import api from '@/api/merchant/withdraw'
  import bankCardApi from '@/api/merchant/bankCard'
  import dashboardApi from '@/api/merchant/dashboard'
  import { WITHDRAW_STATUS_MAP } from '../constants'
  import TableSearch from './modules/table-search.vue'
  import DetailDialog from './modules/detail-dialog.vue'

  defineOptions({ name: 'MerchantWithdraw' })

  const statusMap = WITHDRAW_STATUS_MAP

  const createDefaultSearchForm = () => ({
    withdraw_no: undefined,
    status: undefined,
    create_time: undefined
  })

  const searchForm = ref(createDefaultSearchForm())
  const detailVisible = ref(false)
  const currentRow = ref<Record<string, any>>({})

  const {
    columns,
    columnChecks,
    data,
    loading,
    getData,
    searchParams,
    pagination,
    resetSearchParams,
    handleSortChange,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: api.list,
      columnsFactory: () => [
        { prop: 'withdraw_no', label: '提现单号', minWidth: 200 },
        { prop: 'amount', label: '提现金额(元)', width: 120, align: 'right' },
        { prop: 'fee', label: '手续费(元)', width: 110, align: 'right' },
        { prop: 'real_amount', label: '到账金额(元)', width: 120, align: 'right' },
        { prop: 'account_name', label: '收款人', width: 100 },
        { prop: 'bank_name', label: '开户银行', minWidth: 120 },
        { prop: 'account_no', label: '银行卡号', minWidth: 200 },
        { prop: 'status', label: '状态', width: 100, useSlot: true, slotName: 'status' },
        { prop: 'transfer_no', label: '代付单号', minWidth: 160 },
        { prop: 'audit_time', label: '审核时间', width: 170 },
        { prop: 'create_time', label: '申请时间', width: 170, sortable: true },
        { prop: 'operation', label: '操作', width: 90, fixed: 'right', useSlot: true }
      ]
    }
  })

  const handleSearch = (params: Record<string, any>) => {
    Object.assign(searchParams, params)
    getData()
  }

  const handleReset = () => {
    searchForm.value = createDefaultSearchForm()
    resetSearchParams()
  }

  const openDetail = (row: Record<string, any>) => {
    currentRow.value = row
    detailVisible.value = true
  }

  const applyVisible = ref(false)
  const submitting = ref(false)
  const balanceLoading = ref(false)
  const applyRef = ref<FormInstance>()
  const bankCards = ref<any[]>([])
  const accountBalance = ref({ balance: '0.0000', balance_freeze: '0.0000' })
  const applyForm = ref<{ amount: number; bank_card_id: number | undefined }>({
    amount: 0,
    bank_card_id: undefined
  })

  /** 可提现金额数值（用于输入框上限与前端校验） */
  const availableAmount = computed(
    () => parseFloat(accountBalance.value.balance || '0') || 0
  )

  const applyRules = reactive<FormRules>({
    amount: [
      { required: true, message: '请输入提现金额', trigger: 'blur' },
      {
        validator: (_rule, value, callback) => {
          const amount = Number(value)
          if (!amount || amount <= 0) {
            callback(new Error('提现金额必须大于 0'))
            return
          }
          if (amount > availableAmount.value) {
            callback(
              new Error(`提现金额不能超过可提现余额 ${accountBalance.value.balance} 元`)
            )
            return
          }
          callback()
        },
        trigger: 'blur'
      }
    ],
    bank_card_id: [{ required: true, message: '请选择收款银行卡', trigger: 'change' }]
  })

  const openApply = () => {
    applyForm.value = { amount: 0, bank_card_id: undefined }
    applyVisible.value = true
  }

  /** 弹窗打开：并行加载银行卡与最新账户余额 */
  const loadApplyDialogData = async () => {
    balanceLoading.value = true
    try {
      const [page, stats] = await Promise.all([
        bankCardApi.list({ page: 1, limit: 100 }),
        dashboardApi.stats()
      ])
      // 仅展示启用中的银行卡供提现选择
      bankCards.value = (page?.data ?? []).filter((c: Record<string, any>) => c.status === 1)
      if (stats) {
        accountBalance.value = {
          balance: stats.balance ?? '0.0000',
          balance_freeze: stats.balance_freeze ?? '0.0000'
        }
      }
    } finally {
      balanceLoading.value = false
    }
  }

  const submitApply = async () => {
    if (!applyRef.value) return
    try {
      await applyRef.value.validate()
      submitting.value = true
      await api.apply({
        amount: applyForm.value.amount,
        bank_card_id: applyForm.value.bank_card_id
      })
      ElMessage.success('提现申请已提交')
      applyVisible.value = false
      refreshData()
    } catch {
      // 校验失败或接口报错（接口错误由 http 拦截器提示）
    } finally {
      submitting.value = false
    }
  }
</script>

<style scoped>
  .balance-panel {
    margin-bottom: 16px;
    padding: 14px 16px;
    border-radius: 8px;
    background: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color-lighter);
  }
  .balance-main {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }
  .balance-label {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
  .balance-value {
    font-size: 24px;
    font-weight: 600;
    color: var(--el-color-success);
  }
  .balance-sub {
    margin-top: 8px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
  .balance-hint {
    margin-left: 4px;
    color: var(--el-text-color-placeholder);
  }
</style>
