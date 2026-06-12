<!-- 授权页右上角：主题 / 语言切换（支持支付风深色背景） -->
<template>
  <div class="auth-topbar" :class="{ 'auth-topbar--payment': isPayment }">
    <div class="auth-topbar__brand">
      <LoginBrandBlock v-if="isPayment" size="topbar" />
      <template v-else>
        <ArtLogo class="icon" size="40" />
        <h1 class="auth-topbar__name">{{ AppConfig.systemInfo.name }}</h1>
      </template>
    </div>

    <div class="auth-topbar__actions">
      <div v-if="!isPayment" class="color-picker-expandable relative flex-c max-sm:!hidden">
        <div
          class="color-dots absolute right-0 rounded-full flex-c gap-2 rounded-5 px-2.5 py-2 pr-9 pl-2.5 opacity-0"
        >
          <div
            v-for="(color, index) in mainColors"
            :key="color"
            class="color-dot relative size-5 c-p flex-cc rounded-full opacity-0"
            :class="{ active: color === systemThemeColor }"
            :style="{ background: color, '--index': index }"
            @click="changeThemeColor(color)"
          >
            <ArtSvgIcon v-if="color === systemThemeColor" icon="ri:check-fill" class="text-white" />
          </div>
        </div>
        <div class="toolbar-btn palette-btn relative z-[2] h-8 w-8 c-p flex-cc tad-300">
          <ArtSvgIcon icon="ri:palette-line" class="toolbar-icon" />
        </div>
      </div>

      <ElDropdown
        v-if="shouldShowLanguage"
        @command="changeLanguage"
        popper-class="langDropDownStyle"
      >
        <div class="toolbar-btn language-btn h-8 w-8 c-p flex-cc tad-300">
          <ArtSvgIcon icon="ri:translate-2" class="toolbar-icon toolbar-icon--lang" />
        </div>
        <template #dropdown>
          <ElDropdownMenu>
            <div v-for="lang in languageOptions" :key="lang.value" class="lang-btn-item">
              <ElDropdownItem
                :command="lang.value"
                :class="{ 'is-selected': locale === lang.value }"
              >
                <span class="menu-txt">{{ lang.label }}</span>
                <ArtSvgIcon icon="ri:check-fill" class="text-base" v-if="locale === lang.value" />
              </ElDropdownItem>
            </div>
          </ElDropdownMenu>
        </template>
      </ElDropdown>

      <div
        v-if="shouldShowThemeToggle"
        class="toolbar-btn theme-btn h-8 w-8 c-p flex-cc tad-300"
        @click="themeAnimation"
      >
        <ArtSvgIcon
          :icon="isDark ? 'ri:sun-fill' : 'ri:moon-line'"
          class="toolbar-icon"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import { useSettingStore } from '@/store/modules/setting'
  import { useUserStore } from '@/store/modules/user'
  import { useHeaderBar } from '@/hooks/core/useHeaderBar'
  import { themeAnimation } from '@/utils/ui/animation'
  import { languageOptions } from '@/locales'
  import { LanguageEnum } from '@/enums/appEnum'
  import AppConfig from '@/config'

  defineOptions({ name: 'AuthTopBar' })

  interface Props {
    /** payment：登录页深色科技风，隐藏调色盘并调整按钮样式 */
    variant?: 'default' | 'payment'
  }

  const props = withDefaults(defineProps<Props>(), {
    variant: 'default'
  })

  const isPayment = computed(() => props.variant === 'payment')

  const settingStore = useSettingStore()
  const userStore = useUserStore()
  const { isDark, systemThemeColor } = storeToRefs(settingStore)
  const { shouldShowThemeToggle, shouldShowLanguage } = useHeaderBar()
  const { locale } = useI18n()

  const mainColors = AppConfig.systemMainColor
  const color = systemThemeColor

  const changeLanguage = (lang: LanguageEnum) => {
    if (locale.value === lang) return
    locale.value = lang
    userStore.setLanguage(lang)
  }

  const changeThemeColor = (color: string) => {
    if (systemThemeColor.value === color) return
    settingStore.setElementTheme(color)
    settingStore.reload()
  }
</script>

<style scoped lang="scss">
  .auth-topbar {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    padding: 18px 20px 0;
  }

  .auth-topbar__brand {
    display: none;
    gap: 10px;
    align-items: center;
    margin-right: auto;
  }

  .auth-topbar__name {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .auth-topbar__actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .toolbar-btn {
    border-radius: 8px;
    transition: background 0.2s;
  }

  .toolbar-icon {
    font-size: 20px;
    color: var(--art-gray-800);
    transition: color 0.3s;

    &--lang {
      font-size: 19px;
    }
  }

  /* 支付风深色背景：小屏顶栏展示品牌（宽屏由左侧 hero + 登录卡品牌承担） */
  .auth-topbar--payment {
    justify-content: space-between;
    padding-top: 20px;
    padding-bottom: 4px;

    .auth-topbar__brand {
      display: none;
    }

    .toolbar-btn {
      background: rgb(15 23 42 / 50%);
      border: 1px solid rgb(56 189 248 / 12%);

      &:hover {
        background: rgb(15 23 42 / 75%);
        border-color: rgb(56 189 248 / 28%);
      }
    }

    .toolbar-icon {
      color: #94a3b8;
    }
  }

  @media only screen and (width <= 1180px) {
    .auth-topbar--payment .auth-topbar__brand {
      display: flex;
    }

    .auth-topbar--payment .auth-topbar__name {
      color: #f1f5f9;
    }
  }

  .color-dots {
    pointer-events: none;
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 12px var(--art-gray-300);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;
    transform: translateX(10px);
  }

  .color-dot {
    box-shadow: 0 2px 4px rgb(0 0 0 / 15%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transition-delay: calc(var(--index) * 0.05s);
    transform: translateX(20px) scale(0.8);
  }

  .color-dot:hover {
    box-shadow: 0 4px 8px rgb(0 0 0 / 20%);
    transform: translateX(0) scale(1.1);
  }

  .color-picker-expandable:hover .color-dots {
    pointer-events: auto;
    opacity: 1;
    transform: translateX(0);
  }

  .color-picker-expandable:hover .color-dot {
    opacity: 1;
    transform: translateX(0) scale(1);
  }

  .dark .color-dots {
    background-color: var(--art-gray-200);
    box-shadow: none;
  }

  .color-picker-expandable:hover .palette-btn :deep(.art-svg-icon) {
    color: v-bind(color);
  }
</style>
