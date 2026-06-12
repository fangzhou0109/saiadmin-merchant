<!-- 登录页品牌展示：左侧主品牌 / 小屏顶栏（大圆形 Logo + LQPAY） -->
<template>
  <div class="login-brand" :class="`login-brand--${size}`">
    <div class="login-brand__logo-wrap" :style="ringStyle">
      <span class="login-brand__ring" aria-hidden="true" />
      <span class="login-brand__glow" aria-hidden="true" />
      <ArtLogo :size="logoSize" round class="login-brand__logo" />
    </div>

    <div class="login-brand__text">
      <h1 class="login-brand__name">{{ brandName }}</h1>
      <span v-if="badge && size === 'hero'" class="login-brand__badge">{{ badge }}</span>
      <p v-if="tagline" class="login-brand__tagline">{{ tagline }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import AppConfig from '@/config'

  defineOptions({ name: 'LoginBrandBlock' })

  interface Props {
    /** hero=左侧主品牌 / topbar=小屏顶栏 */
    size?: 'hero' | 'topbar'
    /** 副标签，如「运营管理中心」（仅 hero 展示） */
    badge?: string
    /** 补充说明一行 */
    tagline?: string
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'hero',
    badge: '',
    tagline: ''
  })

  const brandName = AppConfig.systemInfo.name

  /** 圆形 Logo 直径（hero 加大以突出品牌） */
  const logoSize = computed(() => (props.size === 'hero' ? 96 : 48))

  /** 外圈光晕比 Logo 大一圈，保持同心 */
  const ringStyle = computed(() => {
    const logo = logoSize.value
    const ring = logo + (props.size === 'hero' ? 24 : 14)
    return { width: `${ring}px`, height: `${ring}px` }
  })
</script>

<style lang="scss" scoped>
  .login-brand {
    display: flex;
    gap: 22px;
    align-items: center;
  }

  .login-brand__logo-wrap {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .login-brand__ring {
    position: absolute;
    inset: 0;
    border: 1.5px solid rgb(56 189 248 / 35%);
    border-radius: 50%;
    animation: brandRingPulse 3s ease-in-out infinite;
  }

  .login-brand__glow {
    position: absolute;
    inset: 6%;
    border-radius: 50%;
    background: radial-gradient(circle, rgb(14 165 233 / 45%) 0%, transparent 70%);
    filter: blur(8px);
    animation: brandGlowBreath 4s ease-in-out infinite;
  }

  .login-brand__logo {
    position: relative;
    z-index: 2;
  }

  .login-brand__text {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .login-brand__name {
    margin: 0;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    background: linear-gradient(135deg, #fff 0%, #7dd3fc 45%, #38bdf8 70%, #818cf8 100%);
    background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 20px rgb(56 189 248 / 22%));
  }

  .login-brand__badge {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 500;
    color: #7dd3fc;
    letter-spacing: 0.06em;
    background: linear-gradient(90deg, rgb(14 165 233 / 14%), rgb(99 102 241 / 10%));
    border: 1px solid rgb(56 189 248 / 28%);
    border-radius: 20px;
  }

  .login-brand__tagline {
    margin: 0;
    font-size: 12px;
    color: #64748b;
    letter-spacing: 0.04em;
  }

  /* 左侧主品牌 */
  .login-brand--hero {
    gap: 24px;
    padding: 22px 28px;
    margin-bottom: 36px;
    background: linear-gradient(135deg, rgb(15 23 42 / 65%) 0%, rgb(15 23 42 / 35%) 100%);
    border: 1px solid rgb(56 189 248 / 18%);
    border-radius: 18px;
    box-shadow:
      0 0 40px rgb(14 165 233 / 8%),
      inset 0 1px 0 rgb(255 255 255 / 6%);

    .login-brand__name {
      font-size: 40px;
      letter-spacing: 0.14em;
    }

    .login-brand__badge {
      margin-top: 2px;
      font-size: 12px;
    }
  }

  /* 小屏顶栏紧凑品牌 */
  .login-brand--topbar {
    gap: 12px;

    .login-brand__name {
      font-size: 22px;
      letter-spacing: 0.1em;
    }
  }

  @keyframes brandRingPulse {
    0%,
    100% {
      opacity: 0.55;
      transform: scale(1);
    }

    50% {
      opacity: 1;
      transform: scale(1.04);
    }
  }

  @keyframes brandGlowBreath {
    0%,
    100% {
      opacity: 0.55;
      transform: scale(1);
    }

    50% {
      opacity: 1;
      transform: scale(1.08);
    }
  }
</style>
