<template>
  <div class="test-panel">
    <ElTabs v-model="testTab" type="card" class="inner-tabs">
      <ElTabPane label="测试下单" name="submit">
        <ElAlert type="info" :closable="false" show-icon class="tip-block">
          本页为<strong>门户沙箱</strong>（<code>/mapi/integration/*</code>），免网关签名。PHP 等外部 Demo 须直连「对接说明」中的
          <strong>网关基址</strong>（含 <code>/prod/pay</code> 前缀），二者 URL 不同。notify_url 留空默认
          <code>{{ defaultNotifyUrl || '/pay/test/notify' }}</code>。
        </ElAlert>

        <ElForm
          ref="submitRef"
          :model="submitForm"
          :rules="submitRules"
          label-width="120px"
          class="test-form"
          @submit.prevent
        >
          <ElFormItem label="支付类型" prop="pay_type">
            <ElSelect v-model="submitForm.pay_type" placeholder="选择 pay_type" style="width: 260px">
              <ElOption
                v-for="item in payTypeOptions"
                :key="item.value"
                :label="`${item.value} · ${item.label}`"
                :value="item.value"
              />
            </ElSelect>
            <RouterLink to="/merchant/channel-pay" class="link-hint">查看已开通代收通道</RouterLink>
          </ElFormItem>
          <ElFormItem label="金额(元)" prop="amount">
            <ElInputNumber
              v-model="submitForm.amount"
              :min="0.01"
              :precision="2"
              :step="10"
              controls-position="right"
              style="width: 260px"
            />
          </ElFormItem>
          <ElFormItem label="商户订单号">
            <ElInput v-model="submitForm.out_trade_no" placeholder="留空自动生成" clearable style="width: 360px" />
          </ElFormItem>
          <ElFormItem label="异步通知 URL">
            <ElInput
              v-model="submitForm.notify_url"
              :placeholder="`留空使用 ${defaultNotifyUrl || '测试地址'}`"
              clearable
              style="width: 100%; max-width: 560px"
            />
          </ElFormItem>
          <ElFormItem label="商品名称">
            <ElInput v-model="submitForm.commodity_name" clearable style="width: 360px" />
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" :loading="submitting" @click="handleTestSubmit">提交测试下单</ElButton>
            <ElButton @click="resetSubmit">重置</ElButton>
          </ElFormItem>
        </ElForm>

        <ResultBlock v-if="submitResult" title="下单结果" :data="submitResult" type="submit" />
      </ElTabPane>

      <ElTabPane label="测试查单" name="query">
        <ElForm
          ref="queryRef"
          :model="queryForm"
          :rules="queryRules"
          label-width="120px"
          class="test-form"
          @submit.prevent
        >
          <ElFormItem label="商户订单号" prop="order_id">
            <ElInput v-model="queryForm.order_id" placeholder="out_trade_no / order_id" clearable style="width: 360px" />
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" :loading="querying" @click="handleTestQuery">查询</ElButton>
          </ElFormItem>
        </ElForm>
        <ResultBlock v-if="queryResult" title="查单结果" :data="queryResult" type="query" />
      </ElTabPane>

      <ElTabPane label="回调记录" name="notify">
        <ElAlert type="success" :closable="false" show-icon class="tip-block">
          仅展示发往测试 notify 地址且属于本商户的最近回调。使用自定义 notify_url 时请在你自己的服务器查看日志。
        </ElAlert>
        <div class="notify-toolbar">
          <ElInput
            v-model="notifyFilter.out_trade_no"
            placeholder="按商户订单号筛选"
            clearable
            style="width: 220px"
          />
          <ElButton :loading="notifyLoading" @click="loadNotifyLogs">刷新</ElButton>
        </div>
        <ElTable v-loading="notifyLoading" :data="notifyLogs" border size="small" empty-text="暂无记录">
          <ElTableColumn prop="received_at" label="接收时间" width="170" />
          <ElTableColumn prop="order_id" label="商户订单号" min-width="160" show-overflow-tooltip />
          <ElTableColumn prop="order_no" label="平台订单号" min-width="180" show-overflow-tooltip />
          <ElTableColumn prop="money" label="金额(分)" width="100" align="right" />
          <ElTableColumn label="验签" width="90" align="center">
            <template #default="{ row }">
              <ElTag :type="row.sign_ok ? 'success' : 'danger'" size="small">
                {{ row.sign_ok ? '通过' : '失败' }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="sign_message" label="说明" min-width="140" show-overflow-tooltip />
        </ElTable>
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import api from '@/api/merchant/integration'
  import { PAY_TYPE_OPTIONS } from '../../constants'
  import ResultBlock from './test-result-block.vue'

  const testTab = ref('submit')
  const payTypeOptions = PAY_TYPE_OPTIONS
  const defaultNotifyUrl = ref('')

  const submitRef = ref<FormInstance>()
  const submitting = ref(false)
  const submitResult = ref<Record<string, any> | null>(null)
  const submitForm = reactive({
    pay_type: 3,
    amount: 1,
    out_trade_no: '',
    notify_url: '',
    commodity_name: '商户门户测试下单'
  })
  const submitRules: FormRules = {
    pay_type: [{ required: true, message: '请选择支付类型', trigger: 'change' }],
    amount: [{ required: true, message: '请填写金额', trigger: 'blur' }]
  }

  const queryRef = ref<FormInstance>()
  const querying = ref(false)
  const queryResult = ref<Record<string, any> | null>(null)
  const queryForm = reactive({ order_id: '' })
  const queryRules: FormRules = {
    order_id: [{ required: true, message: '请填写商户订单号', trigger: 'blur' }]
  }

  const notifyLoading = ref(false)
  const notifyLogs = ref<Record<string, any>[]>([])
  const notifyFilter = reactive({ out_trade_no: '' })

  const loadDefaultNotify = async () => {
    try {
      const res: any = await api.testNotifyRecent({ limit: 1 })
      defaultNotifyUrl.value = res?.default_notify_url ?? ''
    } catch {
      defaultNotifyUrl.value = ''
    }
  }

  const handleTestSubmit = async () => {
    if (!submitRef.value) return
    await submitRef.value.validate()
    submitting.value = true
    try {
      const res = await api.testSubmit({
        pay_type: submitForm.pay_type,
        amount: submitForm.amount,
        out_trade_no: submitForm.out_trade_no || undefined,
        notify_url: submitForm.notify_url || undefined,
        commodity_name: submitForm.commodity_name || undefined
      })
      submitResult.value = res as Record<string, any>
      if (res?.out_trade_no) {
        queryForm.order_id = res.out_trade_no
      }
      ElMessage.success('测试下单成功')
    } finally {
      submitting.value = false
    }
  }

  const resetSubmit = () => {
    submitRef.value?.resetFields()
    submitForm.amount = 1
    submitForm.pay_type = 3
    submitForm.commodity_name = '商户门户测试下单'
    submitForm.out_trade_no = ''
    submitForm.notify_url = ''
    submitResult.value = null
  }

  const handleTestQuery = async () => {
    if (!queryRef.value) return
    await queryRef.value.validate()
    querying.value = true
    try {
      queryResult.value = (await api.testQuery({ order_id: queryForm.order_id })) as Record<string, any>
      ElMessage.success('查询成功')
    } finally {
      querying.value = false
    }
  }

  const loadNotifyLogs = async () => {
    notifyLoading.value = true
    try {
      const res: any = await api.testNotifyRecent({
        limit: 30,
        out_trade_no: notifyFilter.out_trade_no || undefined
      })
      notifyLogs.value = res?.items ?? []
      if (!defaultNotifyUrl.value) {
        defaultNotifyUrl.value = res?.default_notify_url ?? ''
      }
    } finally {
      notifyLoading.value = false
    }
  }

  watch(testTab, (tab) => {
    if (tab === 'notify') {
      loadNotifyLogs()
    }
  })

  onMounted(() => {
    loadDefaultNotify()
  })
</script>

<style scoped lang="scss">
  .test-panel {
    padding-bottom: 8px;
  }

  .tip-block {
    margin-bottom: 16px;

    code {
      padding: 0 4px;
      font-size: 12px;
      background: var(--el-fill-color-light);
      border-radius: 3px;
    }
  }

  .test-form {
    max-width: 640px;
  }

  .link-hint {
    margin-left: 12px;
    font-size: 13px;
  }

  .notify-toolbar {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }
</style>
