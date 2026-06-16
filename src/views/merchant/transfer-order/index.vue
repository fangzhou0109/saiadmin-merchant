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
            <ElButton
              type="warning"
              size="small"
              plain
              :disabled="!canRenotify(row)"
              :loading="renotifyingId === row.id"
              @click="handleRenotify(row)"
            >
              重推通知
            </ElButton>
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
  import { WITHDRAW_STATUS_MAP } from '../constants'
  import TableSearch from './modules/table-search.vue'
  import DetailDialog from './modules/detail-dialog.vue'

  defineOptions({ name: 'MerchantTransferOrder' })

  const statusMap = WITHDRAW_STATUS_MAP

  /** 仅「成功(3)/代付失败(-2)」终态可重推下游通知 */
  const canRenotify = (row: Record<string, any>) => row.status === 3 || row.status === -2

  const createDefaultSearchForm = () => ({
    withdraw_no: undefined,
    out_biz_no: undefined,
    status: undefined,
    create_time: undefined
  })

  const searchForm = ref(createDefaultSearchForm())
  const detailVisible = ref(false)
  const currentRow = ref<Record<string, any>>({})
  const renotifyingId = ref<number | string>('')

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
        { prop: 'operation', label: '操作', width: 170, fixed: 'right', useSlot: true }
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

  /** 手动重推下游通知（仅终态可推，二次确认后调用） */
  const handleRenotify = async (row: Record<string, any>) => {
    if (!canRenotify(row)) {
      ElMessage.warning('代付处理中，暂无可推送的结果通知')
      return
    }
    try {
      await ElMessageBox.confirm(
        `确认重新向下游推送该代付单（${row.withdraw_no}）的结果通知？`,
        '重推通知',
        { type: 'warning', confirmButtonText: '确认重推', cancelButtonText: '取消' }
      )
    } catch {
      return
    }
    renotifyingId.value = row.id
    try {
      const res = await api.renotify(row.id)
      ElMessage.success(res?.message || '通知已重新投递')
    } finally {
      renotifyingId.value = ''
    }
  }
</script>
