<!-- 系统 Logo（LQPAY） -->
<template>
  <div class="art-logo flex-cc" :class="{ 'art-logo--round': round }" :style="wrapStyle">
    <img :src="logoSrc" alt="LQPAY" class="art-logo__img" />
  </div>
</template>

<script setup lang="ts">
  import logoSrc from '@imgs/common/logo.png'

  defineOptions({ name: 'ArtLogo' })

  interface Props {
    /** logo 边长（px） */
    size?: number | string
    /** 圆形裁切展示（登录页品牌区等场景，图片铺满正圆） */
    round?: boolean
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 36,
    round: false
  })

  const wrapStyle = computed(() => {
    const n = Number(props.size) || 36
    return { width: `${n}px`, height: `${n}px` }
  })
</script>

<style scoped lang="scss">
  .art-logo__img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* 圆形 Logo：容器与图片均正圆，图片 cover 铺满 */
  .art-logo--round {
    flex-shrink: 0;
    overflow: hidden;
    background: linear-gradient(145deg, #0c1526 0%, #1a2744 100%);
    border: 2px solid rgb(56 189 248 / 32%);
    border-radius: 50%;
    box-shadow:
      0 0 28px rgb(14 165 233 / 22%),
      inset 0 0 20px rgb(56 189 248 / 8%);

    .art-logo__img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
  }
</style>
