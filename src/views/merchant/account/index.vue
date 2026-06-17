<template>
  <div class="merchant-account">
    <ElCard shadow="never">
      <template #header>
        <div class="flex items-center justify-between">
          <span>API 对接信息</span>
          <ElButton type="warning" size="small" plain @click="handleResetKey">重置密钥</ElButton>
        </div>
      </template>

      <ElDescriptions v-loading="loading" :column="1" border>
        <ElDescriptionsItem label="商户号 (mch_id)">
          <span class="mono">{{ info.mch_id || '-' }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="商户名称">{{ info.name || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="MD5 签名密钥 (secret_key)">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="mono break-all">{{
              showKey ? info.secret_key || '-' : maskKey(info.secret_key)
            }}</span>
            <ElButton
              v-if="info.secret_key"
              link
              type="primary"
              size="small"
              @click="showKey = !showKey"
            >
              {{ showKey ? '隐藏' : '显示' }}
            </ElButton>
            <ElButton
              v-if="info.secret_key"
              link
              type="primary"
              size="small"
              @click="copy(info.secret_key)"
            >
              复制
            </ElButton>
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="平台 RSA 公钥（验异步通知）">
          <div class="flex flex-col gap-2">
            <pre v-if="info.platform_rsa_public_key" class="mono pre-key">{{
              info.platform_rsa_public_key
            }}</pre>
            <span v-else class="text-secondary">未配置</span>
            <div class="flex gap-2 flex-wrap">
              <ElButton
                v-if="info.platform_rsa_public_key"
                link
                type="primary"
                size="small"
                @click="copy(info.platform_rsa_public_key)"
              >
                复制
              </ElButton>
              <ElButton
                v-if="info.platform_rsa_public_key"
                link
                type="primary"
                size="small"
                @click="downloadCredentials"
              >
                下载对接包
              </ElButton>
            </div>
            <span class="text-secondary text-sm">
              sign_type=2 时用于验证平台 notify 回调签名（非下方「商户来签公钥」）
            </span>
          </div>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="单笔最小(元)">{{ info.single_min || '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="单笔最大(元)">{{ info.single_max || '-' }}</ElDescriptionsItem>
      </ElDescriptions>

      <ElAlert type="info" :closable="false" show-icon style="margin-top: 16px">
        代收与代付费率均由平台按「商户×通道」配置，门户不展示具体费率；提现手续费以实际申请时系统计算为准。
      </ElAlert>
      <ElAlert type="warning" :closable="false" show-icon style="margin-top: 12px">
        请妥善保管签名密钥，切勿泄露。重置后旧 MD5 密钥与平台 RSA
        密钥对立即失效，需同步更新服务端配置。
      </ElAlert>
    </ElCard>

    <ElCard shadow="never" style="margin-top: 16px">
      <template #header>
        <span>代付自动下发阈值</span>
      </template>

      <p class="rsa-tip">
        通过 API 提交代付（<code>/pay/transfer</code>）时，设为
        <code>0</code>（默认）表示<b>全部自动下发</b>、免人工审核；设为 <b>大于 0</b> 时，<b
          >单笔金额 ≤ 该阈值</b
        >才自动下发，超过阈值的订单转人工审核。
        <b>阈值不得超过可用余额 {{ info.balance || '0' }} 元。</b>
      </p>

      <ElForm label-width="0" @submit.prevent>
        <ElFormItem>
          <ElInput
            v-model="thresholdDraft"
            style="max-width: 280px"
            placeholder="请输入金额（元），0 表示全部自动下发"
          >
            <template #prepend>≤</template>
            <template #append>元 自动下发</template>
          </ElInput>
        </ElFormItem>
        <ElFormItem>
          <ElSpace wrap>
            <ElButton type="primary" :loading="thresholdSaving" @click="handleSaveThreshold">
              保存阈值
            </ElButton>
            <ElButton @click="thresholdDraft = info.auto_disbursement_threshold || '0'"
              >重置</ElButton
            >
          </ElSpace>
        </ElFormItem>
      </ElForm>

      <ElAlert type="info" :closable="false" show-icon style="margin-top: 4px">
        当前生效阈值：{{ info.auto_disbursement_threshold || '0' }} 元｜可用余额：{{
          info.balance || '0'
        }}
        元
      </ElAlert>
    </ElCard>

    <ElCard shadow="never" style="margin-top: 16px">
      <template #header>
        <span>商户 RSA 公钥（来签上传）</span>
      </template>

      <p class="rsa-tip">
        使用 <code>sign_type=2</code> 对接时，请在本机生成 RSA
        密钥对，<b>私钥留在你的服务器</b>，将公钥粘贴到下方并保存。
        平台用此公钥验证你的下单/查询等请求签名。
      </p>

      <ElForm label-width="0" @submit.prevent>
        <ElFormItem>
          <ElInput
            v-model="rsaPublicKeyDraft"
            type="textarea"
            :rows="8"
            placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
          />
        </ElFormItem>
        <ElFormItem>
          <ElSpace wrap>
            <ElButton type="primary" :loading="rsaSaving" @click="handleSaveRsaPublicKey">
              保存公钥
            </ElButton>
            <ElButton @click="rsaPublicKeyDraft = info.rsa_public_key || ''">重置</ElButton>
            <ElButton
              v-if="info.rsa_public_key"
              type="danger"
              plain
              @click="handleClearRsaPublicKey"
            >
              清除公钥
            </ElButton>
          </ElSpace>
        </ElFormItem>
      </ElForm>

      <ElAlert
        v-if="info.rsa_public_key"
        type="success"
        :closable="false"
        show-icon
        title="已配置商户来签公钥"
      />
    </ElCard>

    <ElDialog
      v-model="resetDialogVisible"
      title="密钥已重置 — 请更新对接配置"
      width="640px"
      :close-on-click-modal="false"
    >
      <ElAlert type="success" :closable="false" show-icon title="以下凭证仅展示一次，请立即保存" />
      <ElDescriptions :column="1" border size="small" style="margin-top: 12px">
        <ElDescriptionsItem label="MD5 密钥">
          <span class="mono break-all">{{ resetPackage.secret_key }}</span>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="平台 RSA 公钥">
          <pre class="mono pre-key">{{ resetPackage.platform_rsa_public_key || '—' }}</pre>
        </ElDescriptionsItem>
      </ElDescriptions>
      <template #footer>
        <ElButton @click="copy(resetPackage.secret_key)">复制 MD5 密钥</ElButton>
        <ElButton type="primary" @click="resetDialogVisible = false">我已保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage, ElMessageBox } from 'element-plus'
  import api from '@/api/merchant/account'

  defineOptions({ name: 'MerchantAccount' })

  const loading = ref(false)
  const info = ref<Record<string, any>>({})
  const showKey = ref(false)
  const rsaPublicKeyDraft = ref('')
  const rsaSaving = ref(false)
  const thresholdDraft = ref('0')
  const thresholdSaving = ref(false)
  const resetDialogVisible = ref(false)
  const resetPackage = ref<Record<string, any>>({})

  const maskKey = (key?: string) => {
    if (!key) return '-'
    if (key.length <= 8) return '****'
    return key.slice(0, 4) + '****' + key.slice(-4)
  }

  const copy = async (text?: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success('已复制')
    } catch {
      ElMessage.warning('复制失败，请手动复制')
    }
  }

  const downloadCredentials = () => {
    const content = [
      '=== SaiPayment 商户对接凭证 ===',
      `商户号 mch_id: ${info.value.mch_id ?? ''}`,
      '',
      '--- MD5 签名密钥 secret_key ---',
      info.value.secret_key ?? '',
      '',
      '--- 平台 RSA 公钥（验异步通知 sign_type=2）---',
      info.value.platform_rsa_public_key ?? '',
      ''
    ].join('\n')
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `merchant-${info.value.mch_id || 'credentials'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const loadInfo = async () => {
    loading.value = true
    try {
      const data = await api.apiInfo()
      if (data) {
        info.value = data
        rsaPublicKeyDraft.value = data.rsa_public_key || ''
        thresholdDraft.value = data.auto_disbursement_threshold || '0'
      }
    } finally {
      loading.value = false
    }
  }

  const handleSaveRsaPublicKey = async () => {
    rsaSaving.value = true
    try {
      await api.updateRsaPublicKey({ rsa_public_key: rsaPublicKeyDraft.value.trim() })
      ElMessage.success('RSA 公钥已保存')
      await loadInfo()
    } finally {
      rsaSaving.value = false
    }
  }

  const handleSaveThreshold = async () => {
    const val = (thresholdDraft.value ?? '').toString().trim()
    if (val === '' || isNaN(Number(val)) || Number(val) < 0) {
      ElMessage.warning('请输入不小于 0 的金额')
      return
    }
    const balance = Number(info.value.balance ?? 0)
    if (Number(val) > balance) {
      ElMessage.warning(`阈值不能超过可用余额 ${info.value.balance || '0'} 元`)
      return
    }
    thresholdSaving.value = true
    try {
      await api.updateAutoDisburseThreshold({ auto_disbursement_threshold: val })
      ElMessage.success('代付自动下发阈值已保存')
      await loadInfo()
    } finally {
      thresholdSaving.value = false
    }
  }

  const handleClearRsaPublicKey = () => {
    ElMessageBox.confirm(
      '确认清除商户来签 RSA 公钥？清除后仅可使用 MD5（sign_type=1）对接。',
      '提示',
      {
        type: 'warning'
      }
    )
      .then(async () => {
        rsaSaving.value = true
        try {
          await api.updateRsaPublicKey({ rsa_public_key: '' })
          rsaPublicKeyDraft.value = ''
          ElMessage.success('已清除')
          await loadInfo()
        } finally {
          rsaSaving.value = false
        }
      })
      .catch(() => {})
  }

  const handleResetKey = () => {
    ElMessageBox.confirm(
      '确认重置签名密钥？将重新生成 MD5 密钥与平台 RSA 密钥对，旧密钥立即失效。',
      '提示',
      { type: 'warning' }
    )
      .then(async () => {
        const result = await api.resetKey()
        if (result?.secret_key) {
          info.value.secret_key = result.secret_key
          info.value.platform_rsa_public_key = result.platform_rsa_public_key ?? ''
          showKey.value = true
          resetPackage.value = result
          resetDialogVisible.value = true
        } else {
          await loadInfo()
        }
        ElMessage.success('密钥已重置，请及时更新对接配置')
      })
      .catch(() => {})
  }

  onMounted(loadInfo)
</script>

<style scoped>
  .merchant-account {
    padding: 4px;
  }

  .mono {
    font-family: monospace;
  }

  .break-all {
    word-break: break-all;
  }

  .pre-key {
    max-height: 200px;
    padding: 8px;
    margin: 0;
    overflow: auto;
    font-size: 12px;
    word-break: break-all;
    white-space: pre-wrap;
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }

  .text-secondary {
    color: var(--el-text-color-secondary);
  }

  .text-sm {
    font-size: 12px;
    line-height: 1.5;
  }

  .rsa-tip {
    margin: 0 0 12px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }

  .rsa-tip code {
    padding: 1px 4px;
    font-size: 12px;
    background: var(--el-fill-color);
    border-radius: 4px;
  }
</style>
