<template>
  <div class="art-full-height">
    <TableSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="flex flex-col flex-1 min-h-0 art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="openApply">申请充值</ElButton>
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
        <template #rechargeType="{ row }">{{
          typeMap[row.recharge_type] || row.recharge_type
        }}</template>
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

    <DetailDialog v-model="detailVisible" :recharge="currentRow" />

    <ElDialog v-model="applyVisible" title="申请充值" width="460px">
      <ElForm ref="applyRef" :model="applyForm" :rules="applyRules" label-width="100px">
        <ElFormItem label="充值金额" prop="amount">
          <ElInputNumber
            v-model="applyForm.amount"
            :min="0"
            :precision="2"
            :step="100"
            controls-position="right"
            style="width: 100%"
          />
        </ElFormItem>
        <ElFormItem label="充值方式" prop="recharge_type">
          <ElSelect v-model="applyForm.recharge_type" style="width: 100%">
            <ElOption v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
          </ElSelect>
        </ElFormItem>
        <ElFormItem label="备注" prop="remark">
          <ElInput
            v-model="applyForm.remark"
            type="textarea"
            :rows="2"
            placeholder="如转账凭证号等"
          />
        </ElFormItem>
        <ElAlert type="info" :closable="false" show-icon>
          充值需平台审核，审核通过后金额计入可用余额。
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
  import api from '@/api/merchant/recharge'
  import {
    RECHARGE_STATUS_MAP,
    RECHARGE_TYPE_MAP,
    RECHARGE_TYPE_OPTIONS
  } from '../constants'
  import TableSearch from './modules/table-search.vue'
  import DetailDialog from './modules/detail-dialog.vue'

  defineOptions({ name: 'MerchantRecharge' })

  const statusMap = RECHARGE_STATUS_MAP
  const typeMap = RECHARGE_TYPE_MAP
  const typeOptions = RECHARGE_TYPE_OPTIONS

  const createDefaultSearchForm = () => ({
    recharge_no: undefined,
    recharge_type: undefined,
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
        { prop: 'recharge_no', label: '充值单号', minWidth: 200 },
        { prop: 'amount', label: '充值金额(元)', width: 130, align: 'right' },
        {
          prop: 'recharge_type',
          label: '充值方式',
          width: 110,
          useSlot: true,
          slotName: 'rechargeType'
        },
        { prop: 'status', label: '状态', width: 100, useSlot: true, slotName: 'status' },
        { prop: 'remark', label: '申请备注', minWidth: 160 },
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
  const applyRef = ref<FormInstance>()
  const applyForm = ref<{ amount: number; recharge_type: number; remark: string }>({
    amount: 0,
    recharge_type: 2,
    remark: ''
  })
  const applyRules = reactive<FormRules>({
    amount: [{ required: true, message: '请输入充值金额', trigger: 'blur' }]
  })

  const openApply = () => {
    applyForm.value = { amount: 0, recharge_type: 2, remark: '' }
    applyVisible.value = true
  }

  const submitApply = async () => {
    if (!applyRef.value) return
    try {
      await applyRef.value.validate()
      submitting.value = true
      await api.apply(applyForm.value)
      ElMessage.success('充值申请已提交')
      applyVisible.value = false
      refreshData()
    } catch {
      // 校验失败 / 接口错误
    } finally {
      submitting.value = false
    }
  }
</script>
