<template>
  <div class="art-full-height">
    <TableSearch v-model="searchForm" @search="handleSearch" @reset="handleReset" />

    <ElCard class="flex flex-col flex-1 min-h-0 art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElButton type="primary" @click="openBind">绑定银行卡</ElButton>
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
        <template #cardNo="{ row }">{{ maskCardNo(row.card_no) }}</template>
        <template #status="{ row }">
          <ElSwitch
            :model-value="row.status === 1"
            :loading="statusLoadingId === row.id"
            inline-prompt
            active-text="开"
            inactive-text="关"
            @change="(val: string | number | boolean) => handleStatusChange(row, val === true)"
          />
        </template>
        <template #operation="{ row }">
          <ElButton type="danger" size="small" plain @click="handleUnbind(row)">解绑</ElButton>
        </template>
      </ArtTable>
    </ElCard>

    <ElDialog v-model="bindVisible" title="绑定银行卡" width="480px">
      <ElForm ref="bindRef" :model="bindForm" :rules="bindRules" label-width="100px">
        <ElFormItem label="持卡人" prop="holder_name">
          <ElInput v-model="bindForm.holder_name" placeholder="请输入持卡人姓名" />
        </ElFormItem>
        <ElFormItem label="银行卡号" prop="card_no">
          <ElInput v-model="bindForm.card_no" placeholder="请输入银行卡号" />
        </ElFormItem>
        <ElFormItem label="开户银行" prop="bank_name">
          <ElInput v-model="bindForm.bank_name" placeholder="如：工商银行" />
        </ElFormItem>
        <ElFormItem label="银行编码" prop="bank_code">
          <ElInput v-model="bindForm.bank_code" placeholder="如：ICBC（可空）" />
        </ElFormItem>
        <ElFormItem label="开户支行" prop="branch_name">
          <ElInput v-model="bindForm.branch_name" placeholder="开户支行（可空）" />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="bindVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitting" @click="submitBind">提交</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import api from '@/api/merchant/bankCard'
  import { maskCardNo } from '../constants'
  import TableSearch from './modules/table-search.vue'

  defineOptions({ name: 'MerchantBankCard' })

  /** 状态切换 loading（按行 id 标记） */
  const statusLoadingId = ref<number | undefined>()

  const createDefaultSearchForm = () => ({
    keyword: undefined,
    status: undefined,
    create_time: undefined
  })

  const searchForm = ref(createDefaultSearchForm())

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
        { prop: 'holder_name', label: '持卡人', minWidth: 120 },
        { prop: 'card_no', label: '银行卡号', minWidth: 200, useSlot: true, slotName: 'cardNo' },
        { prop: 'bank_name', label: '开户银行', minWidth: 140 },
        { prop: 'bank_code', label: '银行编码', width: 110 },
        { prop: 'branch_name', label: '开户支行', minWidth: 160 },
        { prop: 'status', label: '状态', width: 100, useSlot: true, slotName: 'status' },
        { prop: 'create_time', label: '绑定时间', width: 170, sortable: true },
        { prop: 'operation', label: '操作', width: 100, fixed: 'right', useSlot: true }
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

  const bindVisible = ref(false)
  const submitting = ref(false)
  const bindRef = ref<FormInstance>()
  const bindForm = ref<Record<string, any>>({
    holder_name: '',
    card_no: '',
    bank_name: '',
    bank_code: '',
    branch_name: ''
  })
  const bindRules = reactive<FormRules>({
    holder_name: [{ required: true, message: '请输入持卡人姓名', trigger: 'blur' }],
    card_no: [{ required: true, message: '请输入银行卡号', trigger: 'blur' }]
  })

  const openBind = () => {
    bindForm.value = { holder_name: '', card_no: '', bank_name: '', bank_code: '', branch_name: '' }
    bindVisible.value = true
  }

  const submitBind = async () => {
    if (!bindRef.value) return
    try {
      await bindRef.value.validate()
      submitting.value = true
      await api.save(bindForm.value)
      ElMessage.success('绑卡成功')
      bindVisible.value = false
      refreshData()
    } catch {
      // 校验失败 / 接口错误（接口错误由 http 拦截器提示）
    } finally {
      submitting.value = false
    }
  }

  /** 启用/停用银行卡（开关切换前二次确认） */
  const handleStatusChange = async (row: Record<string, any>, enabled: boolean) => {
    const newStatus = enabled ? 1 : 2
    if (row.status === newStatus) return
    try {
      await ElMessageBox.confirm(
        `确认${enabled ? '启用' : '停用'}银行卡【${maskCardNo(row.card_no)}】？${
          enabled ? '' : '停用后将不可用于提现。'
        }`,
        '提示',
        { type: 'warning' }
      )
      statusLoadingId.value = row.id
      await api.changeStatus({ id: row.id, status: newStatus })
      row.status = newStatus
      ElMessage.success(enabled ? '已启用' : '已停用')
    } catch {
      // 取消或接口失败：:model-value 仍绑定 row.status，开关自动回弹
    } finally {
      statusLoadingId.value = undefined
    }
  }

  const handleUnbind = (row: Record<string, any>) => {
    ElMessageBox.confirm(`确认解绑银行卡【${maskCardNo(row.card_no)}】？`, '提示', {
      type: 'warning'
    })
      .then(async () => {
        await api.delete({ id: row.id })
        ElMessage.success('解绑成功')
        refreshData()
      })
      .catch(() => {})
  }
</script>
