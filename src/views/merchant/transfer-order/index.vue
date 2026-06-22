<template>
  <div class="art-full-height">
    <TableSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="flex flex-col flex-1 min-h-0 art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData" />

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
          <div class="flex gap-2">
            <ElButton type="primary" size="small" plain @click="openDetail(row)">详情</ElButton>
            <template v-if="canAudit(row)">
              <ElButton
                type="success"
                size="small"
                plain
                :loading="auditingId === row.id"
                @click="handleDisburse(row)"
              >
                审核下发
              </ElButton>
              <ElButton
                type="danger"
                size="small"
                plain
                :loading="auditingId === row.id"
                @click="handleReject(row)"
              >
                拒绝
              </ElButton>
            </template>
          </div>
        </template>
      </ArtTable>
    </ElCard>

    <DetailDialog v-model="detailVisible" :withdraw="currentRow" />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import api from '@/api/merchant/transferOrder'
  import { useUserStore } from '@/store/modules/user'
  import { WITHDRAW_STATUS_MAP } from '../constants'
  import TableSearch from './modules/table-search.vue'
  import DetailDialog from './modules/detail-dialog.vue'

  defineOptions({ name: 'MerchantTransferOrder' })

  const statusMap = WITHDRAW_STATUS_MAP
  const userStore = useUserStore()

  /** 是否已开通「代付自审」（平台授予，透传自 /mapi/auth/info） */
  const selfAuditEnabled = computed(
    () => Number((userStore.getUserInfo as any)?.transfer_self_audit) === 1
  )

  /** 仅自审商户且「待审核(0)」状态可审核下发/拒绝 */
  const canAudit = (row: Record<string, any>) => selfAuditEnabled.value && row.status === 0

  const createDefaultSearchForm = () => ({
    withdraw_no: undefined,
    out_biz_no: undefined,
    status: undefined,
    create_time: undefined
  })

  const searchForm = ref(createDefaultSearchForm())
  const detailVisible = ref(false)
  const currentRow = ref<Record<string, any>>({})
  const auditingId = ref<number | string>('')

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
        { prop: 'withdraw_no', label: '平台代付单号', minWidth: 200 },
        { prop: 'out_biz_no', label: '商户代付单号', minWidth: 200 },
        { prop: 'amount', label: '代付金额(元)', width: 120, align: 'right' },
        { prop: 'fee', label: '手续费(元)', width: 110, align: 'right' },
        { prop: 'real_amount', label: '到账金额(元)', width: 120, align: 'right' },
        { prop: 'account_name', label: '收款人', width: 100 },
        { prop: 'bank_name', label: '开户银行', minWidth: 120 },
        { prop: 'account_no', label: '银行卡号', minWidth: 200 },
        { prop: 'status', label: '状态', width: 100, useSlot: true, slotName: 'status' },
        { prop: 'transfer_no', label: '上游代付单号', minWidth: 160 },
        { prop: 'create_time', label: '进单时间', width: 170, sortable: true },
        { prop: 'operation', label: '操作', width: 140, fixed: 'right', useSlot: true }
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

  /** 审核下发：确认后用平台已授权代付通道出款（仅待审核单可操作） */
  const handleDisburse = async (row: Record<string, any>) => {
    if (!canAudit(row)) return
    try {
      await ElMessageBox.confirm(
        `确认审核通过并下发该代付单（${row.withdraw_no}），金额 ${row.amount} 元？`,
        '审核下发',
        { type: 'warning', confirmButtonText: '确认下发', cancelButtonText: '取消' }
      )
    } catch {
      return
    }
    auditingId.value = row.id
    try {
      const res = await api.audit({ id: row.id, action: 'disburse' })
      ElMessage.success(res?.message || '已提交代付')
      refreshData()
    } finally {
      auditingId.value = ''
    }
  }

  /** 拒绝：填写拒绝原因后解冻退款（仅待审核单可操作） */
  const handleReject = async (row: Record<string, any>) => {
    if (!canAudit(row)) return
    let remark = ''
    try {
      const { value } = await ElMessageBox.prompt('请填写拒绝原因（可选）', '拒绝代付单', {
        confirmButtonText: '确认拒绝',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '拒绝原因将记录到审核备注'
      })
      remark = value || ''
    } catch {
      return
    }
    auditingId.value = row.id
    try {
      const res = await api.audit({ id: row.id, action: 'reject', remark })
      ElMessage.success(res?.message || '已拒绝并解冻退款')
      refreshData()
    } finally {
      auditingId.value = ''
    }
  }
</script>
