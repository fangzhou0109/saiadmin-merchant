<template>
  <div class="art-full-height">
    <ElAlert type="info" :closable="false" show-icon class="page-tip">
      代付出款由平台在提现审核通过后自动匹配上游通道，商户提现申请<strong>无需传递通道编码</strong>。
      下表展示已开通的代付能力类型及代付费率；提现手续费预览优先取「算费默认」行，无代付通道时使用商户全局保底费率。
    </ElAlert>

    <ElCard class="flex flex-col flex-1 min-h-0 art-table-card" shadow="never">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData" />

      <ArtTable rowKey="id" :loading="loading" :data="data" :columns="columns">
        <template #channelBizName="{ row }">
          {{ row.channel_biz_name || channelBizMap[row.channel_biz] || row.channel_biz }}
        </template>
        <template #moneyRule="{ row }">{{ formatMoneyRule(row.money_rule) }}</template>
        <template #rateTransfer="{ row }">
          {{
            formatMerchantRate(
              row.rate_transfer,
              row.effective_rate_transfer,
              row.rate_inherit
            )
          }}
        </template>
        <template #feeDefault="{ row }">
          <ElTag v-if="row.is_fee_default === 1" type="success" size="small">算费默认</ElTag>
          <span v-else class="text-secondary">-</span>
        </template>
      </ArtTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import api from '@/api/merchant/channel'
  import { CHANNEL_BIZ_MAP, formatMerchantRate, formatMoneyRule } from '../constants'

  defineOptions({ name: 'MerchantChannelTransfer' })

  const channelBizMap = CHANNEL_BIZ_MAP

  const { columns, columnChecks, data, loading, refreshData } = useTable({
    core: {
      apiFn: api.transferList,
      apiParams: {},
      columnsFactory: () => [
        {
          prop: 'channel_biz',
          label: '代付能力编码',
          width: 120,
          align: 'center'
        },
        {
          prop: 'channel_biz_name',
          label: '代付能力',
          minWidth: 120,
          useSlot: true,
          slotName: 'channelBizName'
        },
        {
          prop: 'money_rule',
          label: '金额规则(元)',
          minWidth: 140,
          useSlot: true,
          slotName: 'moneyRule'
        },
        {
          prop: 'rate_transfer',
          label: '代付费率(%)',
          width: 180,
          align: 'right',
          useSlot: true,
          slotName: 'rateTransfer'
        },
        {
          prop: 'is_fee_default',
          label: '提现算费',
          width: 110,
          align: 'center',
          useSlot: true,
          slotName: 'feeDefault'
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

  .text-secondary {
    color: var(--el-text-color-secondary);
  }
</style>
