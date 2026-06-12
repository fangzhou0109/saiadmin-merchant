<template>
  <div v-loading="loading" class="docs-panel">
    <ElAlert type="info" :closable="false" show-icon class="tip-block">
      代收对接请使用下方<strong>网关地址</strong>与<strong>支付类型 pay_type</strong>（见
      <RouterLink to="/merchant/channel-pay">代收通道</RouterLink>），无需传递内部通道编码。密钥管理见
      <RouterLink to="/merchant/account">API 密钥</RouterLink>。
    </ElAlert>

    <ElAlert type="success" :closable="false" show-icon class="tip-block demo-alert">
      <div class="demo-alert-body">
        <div class="demo-alert-text">
          <strong>PHP 源码 Demo</strong>：含 Web 控制台与可运行的下单、查单、异步通知示例（
          <code>PaySign.php</code> 签名库）。解压后复制 <code>config.example.php</code> 为 <code>config.php</code>，
          <code>gateway_base</code> 请填上方「网关基址」，勿省略 <code>/prod</code> 等前缀。门户「接口测试」走
          <code>/mapi</code> 沙箱，PHP Demo 则直连网关 URL。
        </div>
        <div class="demo-alert-actions">
          <ElButton
            type="primary"
            :disabled="!docs?.php_demo_available"
            @click="downloadPhpDemo"
          >
            下载 PHP Demo 源码包
          </ElButton>
          <ElButton
            v-if="docs?.php_demo_download_url"
            link
            type="primary"
            @click="copy(docs.php_demo_download_url)"
          >
            复制下载链接
          </ElButton>
        </div>
      </div>
      <p v-if="docs && !docs.php_demo_available" class="demo-unavailable-hint">
        平台暂未提供 Demo 压缩包（<code>{{ docs.php_demo_filename || 'merchant-php.zip' }}</code>），请联系运营上传至服务器
        <code>public/</code> 目录。
      </p>
    </ElAlert>

    <ElDescriptions v-if="docs" :column="1" border class="desc-block" title="对接概览">
      <ElDescriptionsItem label="商户号 (mch_id)">
        <span class="mono">{{ docs.mch_id }}</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="网关基址">
        <span class="mono break-all">{{ docs.gateway_base_url }}</span>
        <ElButton link type="primary" size="small" @click="copy(docs.gateway_base_url)">复制</ElButton>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="下单地址">
        <span class="mono break-all">{{ docs.submit_order_url }}</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="查单地址">
        <span class="mono break-all">{{ docs.query_order_url }}</span>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="IP 白名单">
        <template v-if="docs.ip_whitelist_status === 1">
          <span class="mono">{{ docs.ip_whitelist || '（未配置，将拒绝网关请求）' }}</span>
        </template>
        <ElTag v-else type="info" size="small">未启用</ElTag>
      </ElDescriptionsItem>
      <ElDescriptionsItem label="签名时间窗">
        {{ docs.time_window_seconds }} 秒（参数 time 与服务器时间偏差超限将拒单）
      </ElDescriptionsItem>
      <ElDescriptionsItem label="PHP Demo 源码">
        <template v-if="docs.php_demo_available">
          <ElButton type="primary" size="small" @click="downloadPhpDemo">
            下载 {{ docs.php_demo_filename || 'merchant-php.zip' }}
          </ElButton>
          <span class="mono break-all demo-url-text">{{ docs.php_demo_download_url }}</span>
        </template>
        <ElTag v-else type="info" size="small">暂未上传</ElTag>
      </ElDescriptionsItem>
    </ElDescriptions>

    <ElCollapse v-model="openSections" class="section-collapse">
      <ElCollapseItem title="签名规则（MD5 / RSA）" name="sign">
        <ol class="doc-list">
          <li>剔除 <code>sign</code>、<code>sign_type</code> 后，对其余参数按 key 升序拼接为 <code>key=value&amp;</code>（空值也参与）。</li>
          <li>末尾追加 <code>key={secret_key}</code> 得到待签串。</li>
          <li><code>sign_type=1</code>（MD5）：<code>sign = strtoupper(md5(待签串))</code>。</li>
          <li>
            <code>sign_type=2</code>（RSA）：商户用私钥对「待签串」做 SHA256 签名后 base64；平台用你上传的
            <strong>商户 RSA 公钥</strong>验签。异步通知由平台私钥签名，你用<strong>平台 RSA 公钥</strong>验签。
          </li>
          <li>请求须为 <code>application/x-www-form-urlencoded</code> POST。</li>
        </ol>
      </ElCollapseItem>

      <ElCollapseItem title="下单接口 POST /pay/submitOrder" name="submit">
        <ElTable :data="submitFields" border size="small" class="field-table">
          <ElTableColumn prop="name" label="参数" width="140" />
          <ElTableColumn prop="required" label="必填" width="70" align="center" />
          <ElTableColumn prop="desc" label="说明" min-width="280" />
        </ElTable>
        <p class="note-text">成功返回：<code>order_no</code>、<code>pay_url</code>、<code>upstream_no</code>、<code>amount</code>（元）。</p>
      </ElCollapseItem>

      <ElCollapseItem title="查单接口 POST /pay/query" name="query">
        <ElTable :data="queryFields" border size="small" class="field-table">
          <ElTableColumn prop="name" label="参数" width="140" />
          <ElTableColumn prop="required" label="必填" width="70" align="center" />
          <ElTableColumn prop="desc" label="说明" min-width="280" />
        </ElTable>
        <p class="note-text">
          返回：<code>order_no</code>、<code>out_trade_no</code>、<code>amount</code>、<code>status</code>、
          <code>trade_status</code>（NOTPAY/SUCCESS/FAILED/CLOSED）、<code>pay_time</code>。
        </p>
      </ElCollapseItem>

      <ElCollapseItem title="异步通知（平台 → 商户 notify_url）" name="notify">
        <ElTable :data="notifyFields" border size="small" class="field-table">
          <ElTableColumn prop="name" label="参数" width="140" />
          <ElTableColumn prop="desc" label="说明" min-width="320" />
        </ElTable>
        <p class="note-text">
          验签通过后须响应纯文本 <code>SUCCESS</code>（大小写敏感），否则平台会重试。
        </p>
      </ElCollapseItem>

      <ElCollapseItem title="生成签名请求示例" name="sample">
        <ElForm :model="sampleForm" label-width="120px" class="sample-form" @submit.prevent>
          <ElFormItem label="示例类型">
            <ElRadioGroup v-model="sampleForm.action">
              <ElRadioButton label="submit">下单</ElRadioButton>
              <ElRadioButton label="query">查单</ElRadioButton>
            </ElRadioGroup>
          </ElFormItem>
          <template v-if="sampleForm.action === 'submit'">
            <ElFormItem label="支付类型">
              <ElSelect v-model="sampleForm.pay_type" style="width: 220px">
                <ElOption
                  v-for="item in payTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="金额(元)">
              <ElInputNumber v-model="sampleForm.amount" :min="0.01" :precision="2" :step="1" />
            </ElFormItem>
            <ElFormItem label="商户订单号">
              <ElInput v-model="sampleForm.order_id" placeholder="留空自动生成" clearable />
            </ElFormItem>
          </template>
          <template v-else>
            <ElFormItem label="商户订单号">
              <ElInput v-model="sampleForm.order_id" placeholder="必填" clearable />
            </ElFormItem>
          </template>
          <ElFormItem>
            <ElButton type="primary" :loading="sampleLoading" @click="handleBuildSample">
              生成 curl 示例
            </ElButton>
          </ElFormItem>
        </ElForm>
        <template v-if="sampleResult">
          <div class="sample-block">
            <div class="sample-label">待签串</div>
            <pre class="mono pre-block">{{ sampleResult.sign_string }}</pre>
            <ElButton link type="primary" size="small" @click="copy(sampleResult.sign_string)">复制</ElButton>
          </div>
          <div class="sample-block">
            <div class="sample-label">curl 命令</div>
            <pre class="mono pre-block">{{ sampleResult.curl_example }}</pre>
            <ElButton link type="primary" size="small" @click="copy(sampleResult.curl_example)">复制</ElButton>
          </div>
        </template>
      </ElCollapseItem>
    </ElCollapse>
  </div>
</template>

<script setup lang="ts">
  import { ElMessage } from 'element-plus'
  import api from '@/api/merchant/integration'
  import { PAY_TYPE_OPTIONS } from '../../constants'

  const loading = ref(false)
  const docs = ref<Record<string, any> | null>(null)
  const openSections = ref(['sign', 'submit'])
  const payTypeOptions = PAY_TYPE_OPTIONS

  const sampleForm = reactive({
    action: 'submit',
    pay_type: 3,
    amount: 1,
    order_id: ''
  })
  const sampleLoading = ref(false)
  const sampleResult = ref<Record<string, any> | null>(null)

  const submitFields = [
    { name: 'mch_id', required: '是', desc: '商户号' },
    { name: 'pay_type', required: '是', desc: '支付类型编码 1~7，与代收通道列表一致' },
    { name: 'money', required: '是', desc: '订单金额，单位分（正整数）' },
    { name: 'order_id', required: '是', desc: '商户订单号，同商户下唯一' },
    { name: 'notify_url', required: '是', desc: '异步通知地址，须可公网访问' },
    { name: 'time', required: '是', desc: 'Unix 秒级时间戳' },
    { name: 'sign', required: '是', desc: '签名' },
    { name: 'sign_type', required: '否', desc: '1=MD5（默认），2=RSA' },
    { name: 'return_url', required: '否', desc: '支付完成同步跳转' },
    { name: 'commodity_name', required: '否', desc: '商品名称' },
    { name: 'extra', required: '否', desc: '透传字段，通知原样带回' },
    { name: 'client_ip', required: '否', desc: '用户 IP，建议填写' }
  ]

  const queryFields = [
    { name: 'mch_id', required: '是', desc: '商户号' },
    { name: 'order_id', required: '是', desc: '商户订单号' },
    { name: 'time', required: '是', desc: 'Unix 秒级时间戳' },
    { name: 'sign', required: '是', desc: '签名' },
    { name: 'sign_type', required: '否', desc: '1=MD5（默认），2=RSA' }
  ]

  const notifyFields = [
    { name: 'order_id', desc: '商户订单号' },
    { name: 'order_no', desc: '平台订单号' },
    { name: 'money', desc: '订单金额（分）' },
    { name: 'mch_id', desc: '商户号' },
    { name: 'status', desc: '固定 success（支付成功通知）' },
    { name: 'extra', desc: '下单透传' },
    { name: 'time', desc: '通知时间戳' },
    { name: 'sign / sign_type', desc: '平台签名，商户须验签后回 SUCCESS' }
  ]

  const copy = async (text?: string) => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success('已复制')
    } catch {
      ElMessage.error('复制失败')
    }
  }

  /** 下载 PHP Demo 压缩包（静态文件，经平台反代 public 目录提供） */
  const downloadPhpDemo = () => {
    const url = docs.value?.php_demo_download_url
    if (!url) {
      ElMessage.warning('下载地址未配置')
      return
    }
    if (!docs.value?.php_demo_available) {
      ElMessage.warning('平台暂未上传 Demo 压缩包，请联系运营')
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const loadDocs = async () => {
    loading.value = true
    try {
      docs.value = (await api.docs()) as Record<string, any>
    } finally {
      loading.value = false
    }
  }

  const handleBuildSample = async () => {
    if (sampleForm.action === 'query' && !sampleForm.order_id.trim()) {
      ElMessage.warning('请填写商户订单号')
      return
    }
    sampleLoading.value = true
    try {
      sampleResult.value = (await api.buildSignSample({
        action: sampleForm.action,
        pay_type: sampleForm.pay_type,
        amount: sampleForm.amount,
        order_id: sampleForm.order_id || undefined,
        notify_url: docs.value?.default_test_notify_url
      })) as Record<string, any>
    } finally {
      sampleLoading.value = false
    }
  }

  onMounted(loadDocs)
</script>

<style scoped lang="scss">
  .docs-panel {
    padding-bottom: 16px;
  }

  .tip-block {
    margin-bottom: 16px;
  }

  .demo-alert-body {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: flex-start;
    justify-content: space-between;
  }

  .demo-alert-text {
    flex: 1;
    min-width: 240px;
    line-height: 1.6;
  }

  .demo-alert-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
    align-items: center;
  }

  .demo-unavailable-hint {
    margin: 10px 0 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }

  .demo-url-text {
    display: block;
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .desc-block {
    margin-bottom: 16px;
  }

  .section-collapse {
    border: none;

    :deep(.el-collapse-item__header) {
      font-weight: 600;
    }
  }

  .doc-list {
    margin: 0;
    padding-left: 20px;
    line-height: 1.8;
    color: var(--el-text-color-regular);

    code {
      padding: 0 4px;
      font-size: 12px;
      background: var(--el-fill-color-light);
      border-radius: 3px;
    }
  }

  .field-table {
    margin-bottom: 8px;
  }

  .note-text {
    margin: 8px 0 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    line-height: 1.6;

    code {
      padding: 0 4px;
      background: var(--el-fill-color-light);
      border-radius: 3px;
    }
  }

  .sample-form {
    max-width: 520px;
  }

  .sample-block {
    margin-top: 12px;
  }

  .sample-label {
    margin-bottom: 6px;
    font-weight: 600;
  }

  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  .pre-block {
    margin: 0 0 4px;
    padding: 10px 12px;
    font-size: 12px;
    line-height: 1.5;
    word-break: break-all;
    white-space: pre-wrap;
    background: var(--el-fill-color-light);
    border-radius: 6px;
  }

  .break-all {
    word-break: break-all;
  }

  .field-hint {
    margin: 6px 0 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 1.5;

    code {
      padding: 0 4px;
      background: var(--el-fill-color-light);
      border-radius: 3px;
    }
  }
</style>
