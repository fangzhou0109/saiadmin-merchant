<template>
  <div class="art-full-height">
    <ElAlert type="info" :closable="false" show-icon class="page-tip">
      商户对接代收时，下单接口传 <code>pay_type</code>（支付类型编码，见下表），平台按金额规则、路由与授权自动匹配具体上游通道。
      无需、也不应传递内部通道编码。费率 0 表示继承默认；单笔/日限额 0 表示不限。调整请联系平台运营。
    </ElAlert>

    <ElCard class="flex flex-col flex-1 min-h-0 art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData" />

      <ArtTable rowKey="id" :loading="loading" :data="data" :columns="columns">
        <template #payTypeName="{ row }">
          {{ row.pay_type_name || payTypeMap[row.pay_type] || row.pay_type }}
        </template>
        <template #moneyRule="{ row }">{{ formatMoneyRule(row.money_rule) }}</template>
        <template #rate="{ row }">
          {{ formatMerchantRate(row.rate, row.effective_rate, row.rate_inherit) }}
        </template>
        <template #singleMin="{ row }">{{ formatLimitAmount(row.single_min) }}</template>
        <template #singleMax="{ row }">{{ formatLimitAmount(row.single_max) }}</template>
        <template #dayLimit="{ row }">{{ formatLimitAmount(row.day_limit) }}</template>
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import api from '@/api/merchant/channel'
  import {
    PAY_TYPE_MAP,
    formatLimitAmount,
    formatMerchantRate,
    formatMoneyRule
  } from '../constants'

  defineOptions({ name: 'MerchantChannelPay' })

  const payTypeMap = PAY_TYPE_MAP

  const { columns, columnChecks, data, loading, refreshData } = useTable({
    core: {
      apiFn: api.payList,
      apiParams: {},
      columnsFactory: () => [
        {
          prop: 'pay_type',
          label: '支付类型编码',
          width: 120,
          align: 'center'
        },
        {
          prop: 'pay_type_name',
          label: '支付类型',
          minWidth: 120,
          useSlot: true,
          slotName: 'payTypeName'
        },
        {
          prop: 'money_rule',
          label: '金额规则(元)',
          minWidth: 140,
          useSlot: true,
          slotName: 'moneyRule'
        },
        {
          prop: 'rate',
          label: '平台费率(%)',
          width: 160,
          align: 'right',
          useSlot: true,
          slotName: 'rate'
        },
        {
          prop: 'single_min',
          label: '单笔最小(元)',
          width: 120,
          align: 'right',
          useSlot: true,
          slotName: 'singleMin'
        },
        {
          prop: 'single_max',
          label: '单笔最大(元)',
          width: 120,
          align: 'right',
          useSlot: true,
          slotName: 'singleMax'
        },
        {
          prop: 'day_limit',
          label: '日限额(元)',
          width: 120,
          align: 'right',
          useSlot: true,
          slotName: 'dayLimit'
        }
      ]
    }
  })
</script>

<style scoped lang="scss">
  .page-tip {
    margin-bottom: 12px;

    code {
      padding: 0 4px;
      font-size: 12px;
      background: var(--el-fill-color-light);
      border-radius: 3px;
    }
  }
</style>
