<template>
  <div class="art-full-height">
    <TableSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="flex flex-col flex-1 min-h-0 art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData" />

      <ArtTable
        ref="tableRef"
        rowKey="id"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @sort-change="handleSortChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
        <template #payType="{ row }">{{ payTypeMap[row.pay_type] || row.pay_type }}</template>
        <template #status="{ row }">
          <ElTag :type="(statusMap[row.status]?.tagType as any) || 'info'" size="small">
            {{ statusMap[row.status]?.label || row.status }}
          </ElTag>
        </template>
        <template #settleStatus="{ row }">
          <ElTag :type="(settleStatusMap[row.settle_status]?.tagType as any) || 'info'" size="small">
            {{ settleStatusMap[row.settle_status]?.label || row.settle_status }}
          </ElTag>
        </template>
        <template #notifyStatus="{ row }">
          <ElTag :type="(notifyStatusMap[row.notify_status]?.tagType as any) || 'info'" size="small">
            {{ notifyStatusMap[row.notify_status]?.label || row.notify_status }}
          </ElTag>
        </template>
        <template #operation="{ row }">
          <ElButton type="primary" size="small" plain @click="openDetail(row)">详情</ElButton>
        </template>
      </ArtTable>
    </ElCard>

    <DetailDialog v-model="detailVisible" :order="currentOrder" />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import api from '@/api/merchant/order'
  import {
    PAY_TYPE_MAP,
    ORDER_STATUS_MAP,
    SETTLE_STATUS_MAP,
    NOTIFY_STATUS_MAP
  } from '../constants'
  import TableSearch from './modules/table-search.vue'
  import DetailDialog from './modules/detail-dialog.vue'

  defineOptions({ name: 'MerchantOrder' })

  const payTypeMap = PAY_TYPE_MAP
  const statusMap = ORDER_STATUS_MAP
  const settleStatusMap = SETTLE_STATUS_MAP
  const notifyStatusMap = NOTIFY_STATUS_MAP

  /** 默认搜索条件（与后端 /mapi/order/index 搜索器字段对齐） */
  const createDefaultSearchForm = () => ({
    order_no: undefined,
    out_trade_no: undefined,
    pay_type: undefined,
    status: undefined,
    create_time: undefined,
    pay_time: undefined
  })

  const searchForm = ref(createDefaultSearchForm())
  const detailVisible = ref(false)
  const currentOrder = ref<Record<string, any>>({})

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
        { prop: 'order_no', label: '平台订单号', minWidth: 200 },
        { prop: 'out_trade_no', label: '商户订单号', minWidth: 180 },
        { prop: 'amount', label: '金额(元)', width: 110, align: 'right' },
        { prop: 'fee', label: '手续费(元)', width: 110, align: 'right' },
        { prop: 'real_amount', label: '实收(元)', width: 110, align: 'right' },
        { prop: 'rate', label: '费率(%)', width: 90, align: 'right' },
        { prop: 'pay_type', label: '支付类型', width: 110, useSlot: true, slotName: 'payType' },
        { prop: 'status', label: '订单状态', width: 100, useSlot: true, slotName: 'status' },
        {
          prop: 'settle_status',
          label: '入账状态',
          width: 100,
          useSlot: true,
          slotName: 'settleStatus'
        },
        {
          prop: 'notify_status',
          label: '通知状态',
          width: 100,
          useSlot: true,
          slotName: 'notifyStatus'
        },
        { prop: 'create_time', label: '创建时间', width: 170, sortable: true },
        { prop: 'pay_time', label: '支付时间', width: 170 },
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
    currentOrder.value = row
    detailVisible.value = true
  }
</script>
