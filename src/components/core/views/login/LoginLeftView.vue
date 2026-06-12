<!-- 登录页左侧：支付渠道科技风品牌展示区 -->
<template>
  <div class="payment-showcase">
    <div class="showcase-inner">
      <LoginBrandBlock size="hero" :badge="$t('login.leftView.badge')" />

      <div class="headline-block">
        <h2 class="headline">{{ $t('login.leftView.title') }}</h2>
        <p class="headline-desc">{{ $t('login.leftView.subTitle') }}</p>
      </div>

      <ul class="feature-list">
        <li v-for="(item, index) in featureList" :key="index" class="feature-item">
          <ArtSvgIcon icon="ri:shield-check-line" class="feature-icon" />
          <span>{{ item }}</span>
        </li>
      </ul>

      <!-- 支付链路示意：商户 → 平台 → 通道 → 清算 -->
      <div class="flow-panel">
        <div class="flow-title">
          <ArtSvgIcon icon="ri:route-line" />
          <span>{{ $t('login.leftView.flowTitle') }}</span>
        </div>
        <div class="flow-track">
          <div v-for="(step, index) in flowSteps" :key="step.key" class="flow-step-wrap">
            <div class="flow-step">
              <div class="flow-node">
                <ArtSvgIcon :icon="step.icon" />
              </div>
              <span class="flow-label">{{ step.label }}</span>
            </div>
            <div v-if="index < flowSteps.length - 1" class="flow-connector">
              <span class="flow-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div class="stats-row">
        <div v-for="stat in statList" :key="stat.key" class="stat-card">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 背景装饰：网格 + 光晕 -->
    <div class="showcase-grid" aria-hidden="true" />
    <div class="showcase-glow glow-a" aria-hidden="true" />
    <div class="showcase-glow glow-b" aria-hidden="true" />
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'

  defineOptions({ name: 'LoginLeftView' })

  const { t, tm } = useI18n()

  /** 能力标签（i18n 数组）；as unknown 规避 vue-i18n tm 深层类型推导 TS2589 */
  const featureList = computed((): string[] => {
    const raw = tm('login.leftView.features') as unknown
    return Array.isArray(raw) ? (raw as string[]) : []
  })

  /** 支付链路四节点 */
  const flowSteps = computed(() => [
    { key: 'merchant', icon: 'ri:store-2-line', label: t('login.leftView.flow.merchant') },
    { key: 'platform', icon: 'ri:server-line', label: t('login.leftView.flow.platform') },
    { key: 'channel', icon: 'ri:exchange-funds-line', label: t('login.leftView.flow.channel') },
    { key: 'settle', icon: 'ri:bank-line', label: t('login.leftView.flow.settle') }
  ])

  /** 底部数据指标（装饰性展示） */
  const statList = computed(() => [
    { key: 'channels', value: t('login.leftView.stats.channels'), label: t('login.leftView.stats.channelsLabel') },
    { key: 'uptime', value: t('login.leftView.stats.uptime'), label: t('login.leftView.stats.uptimeLabel') },
    { key: 'tps', value: t('login.leftView.stats.tps'), label: t('login.leftView.stats.tpsLabel') }
  ])
</script>

<style lang="scss" scoped>
  .payment-showcase {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(145deg, #060d1f 0%, #0a1628 45%, #0d2137 100%);
  }

  .showcase-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgb(56 189 248 / 6%) 1px, transparent 1px),
      linear-gradient(90deg, rgb(56 189 248 / 6%) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, #000 20%, transparent 100%);
  }

  .showcase-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;

    &.glow-a {
      top: -80px;
      left: -60px;
      width: 360px;
      height: 360px;
      background: rgb(14 165 233 / 22%);
    }

    &.glow-b {
      right: -40px;
      bottom: -60px;
      width: 320px;
      height: 320px;
      background: rgb(99 102 241 / 18%);
    }
  }

  .showcase-inner {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
    padding: 48px 56px 40px;
    animation: showcaseFadeIn 0.8s ease-out forwards;
  }

  .headline-block {
    margin-bottom: 28px;
  }

  .headline {
    margin: 0 0 12px;
    font-size: 32px;
    font-weight: 700;
    line-height: 1.3;
    color: #fff;
  }

  .headline-desc {
    max-width: 480px;
    margin: 0;
    font-size: 15px;
    line-height: 1.7;
    color: rgb(148 163 184 / 90%);
  }

  .feature-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    padding: 0;
    margin: 0 0 32px;
    list-style: none;
  }

  .feature-item {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 8px 14px;
    font-size: 13px;
    color: #cbd5e1;
    background: rgb(15 23 42 / 55%);
    border: 1px solid rgb(56 189 248 / 15%);
    border-radius: 8px;
    backdrop-filter: blur(8px);
    transition: border-color 0.25s;

    &:hover {
      border-color: rgb(56 189 248 / 35%);
    }
  }

  .feature-icon {
    font-size: 15px;
    color: #38bdf8;
  }

  .flow-panel {
    padding: 20px 22px;
    margin-bottom: 28px;
    background: rgb(15 23 42 / 45%);
    border: 1px solid rgb(56 189 248 / 12%);
    border-radius: 14px;
    backdrop-filter: blur(12px);
  }

  .flow-title {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 18px;
    font-size: 13px;
    font-weight: 500;
    color: #94a3b8;
  }

  .flow-track {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
  }

  .flow-step-wrap {
    display: flex;
    flex: 1;
    align-items: center;
  }

  .flow-step {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    min-width: 72px;
  }

  .flow-node {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    font-size: 20px;
    color: #38bdf8;
    background: linear-gradient(135deg, rgb(56 189 248 / 18%), rgb(99 102 241 / 12%));
    border: 1px solid rgb(56 189 248 / 30%);
    border-radius: 12px;
    box-shadow: 0 0 20px rgb(56 189 248 / 10%);
  }

  .flow-label {
    font-size: 12px;
    color: #94a3b8;
    text-align: center;
    white-space: nowrap;
  }

  .flow-connector {
    position: relative;
    flex: 1;
    height: 2px;
    margin: 0 4px;
    margin-top: 21px;
    overflow: hidden;
    background: linear-gradient(90deg, rgb(56 189 248 / 10%), rgb(56 189 248 / 35%), rgb(56 189 248 / 10%));
    border-radius: 2px;
  }

  .flow-pulse {
    position: absolute;
    top: 0;
    left: -30%;
    width: 30%;
    height: 100%;
    background: linear-gradient(90deg, transparent, #38bdf8, transparent);
    animation: flowPulse 2.4s ease-in-out infinite;
  }

  .stats-row {
    display: flex;
    gap: 16px;
  }

  .stat-card {
    flex: 1;
    padding: 14px 16px;
    background: rgb(15 23 42 / 40%);
    border: 1px solid rgb(56 189 248 / 10%);
    border-radius: 10px;
  }

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    color: #38bdf8;
  }

  .stat-label {
    margin-top: 4px;
    font-size: 12px;
    color: #64748b;
  }

  @keyframes showcaseFadeIn {
    from {
      opacity: 0;
      transform: translateX(-24px);
    }

    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes flowPulse {
    0% {
      left: -30%;
    }

    100% {
      left: 130%;
    }
  }

  @media only screen and (width <= 1180px) {
    .payment-showcase {
      display: none;
    }
  }
</style>
