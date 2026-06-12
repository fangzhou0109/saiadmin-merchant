<!-- 支付渠道平台 · 运营后台登录 -->
<template>
  <div class="payment-login-page">
    <div class="login-bg-layer" aria-hidden="true">
      <div class="bg-grid" />
      <div class="bg-orb orb-1" />
      <div class="bg-orb orb-2" />
    </div>

    <LoginLeftView />

    <div class="login-panel">
      <AuthTopBar variant="payment" />

      <div class="login-card-wrap">
        <div class="login-card">
          <div class="card-header">
            <h3 class="card-title">{{ $t('login.title') }}</h3>
            <p class="card-subtitle">{{ $t('login.subTitle') }}</p>
          </div>

          <ElForm
            ref="formRef"
            class="login-form pay-login-form"
            :model="formData"
            :rules="rules"
            :key="formKey"
            @keyup.enter="handleSubmit"
          >
            <ElFormItem prop="username">
              <ElInput
                v-model.trim="formData.username"
                class="pay-input"
                :placeholder="$t('login.placeholder.username')"
                size="large"
              >
                <template #prefix>
                  <ArtSvgIcon icon="ri:user-3-line" class="input-icon" />
                </template>
              </ElInput>
            </ElFormItem>

            <ElFormItem prop="password">
              <ElInput
                v-model.trim="formData.password"
                class="pay-input"
                :placeholder="$t('login.placeholder.password')"
                type="password"
                autocomplete="off"
                show-password
                size="large"
              >
                <template #prefix>
                  <ArtSvgIcon icon="ri:lock-2-line" class="input-icon" />
                </template>
              </ElInput>
            </ElFormItem>

            <ElFormItem prop="code">
              <div class="captcha-row">
                <ElInput
                  v-model.trim="formData.code"
                  class="pay-input captcha-input"
                  :placeholder="$t('login.placeholder.code')"
                  autocomplete="off"
                  size="large"
                >
                  <template #prefix>
                    <ArtSvgIcon icon="ri:shield-keyhole-line" class="input-icon" />
                  </template>
                </ElInput>
                <button type="button" class="captcha-btn" title="点击刷新验证码" @click="refreshCaptcha">
                  <img :src="captcha" alt="验证码" class="captcha-img" />
                </button>
              </div>
            </ElFormItem>

            <div class="form-options">
              <ElCheckbox v-model="formData.rememberPassword" class="remember-check">
                {{ $t('login.rememberPwd') }}
              </ElCheckbox>
            </div>

            <ElButton
              class="submit-btn"
              type="primary"
              size="large"
              :loading="loading"
              v-ripple
              @click="handleSubmit"
            >
              <ArtSvgIcon v-if="!loading" icon="ri:login-circle-line" class="btn-icon" />
              {{ $t('login.btnText') }}
            </ElButton>
          </ElForm>

          <div class="security-foot">
            <ArtSvgIcon icon="ri:shield-check-fill" />
            <span>{{ $t('login.securityTip') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { useI18n } from 'vue-i18n'
  import { HttpError } from '@/utils/http/error'
  import { fetchCaptcha, fetchLogin, fetchGetUserInfo } from '@/api/auth'
  import { ElNotification, type FormInstance, type FormRules } from 'element-plus'

  defineOptions({ name: 'Login' })

  const { t, locale } = useI18n()
  const formKey = ref(0)

  watch(locale, () => {
    formKey.value++
  })

  const userStore = useUserStore()
  const router = useRouter()

  const captcha = ref(
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  )

  const formRef = ref<FormInstance>()

  const formData = reactive({
    username: '',
    password: '',
    code: '',
    uuid: '',
    rememberPassword: true
  })

  const rules = computed<FormRules>(() => ({
    username: [{ required: true, message: t('login.placeholder.username'), trigger: 'blur' }],
    password: [{ required: true, message: t('login.placeholder.password'), trigger: 'blur' }],
    code: [{ required: true, message: t('login.placeholder.code'), trigger: 'blur' }]
  }))

  const loading = ref(false)

  onMounted(() => {
    refreshCaptcha()
  })

  const refreshCaptcha = async () => {
    try {
      const res = await fetchCaptcha()
      formData.uuid = res.uuid
      captcha.value = res.image
      formData.code = ''
    } catch (error) {
      console.error('[Login] captcha load failed:', error)
    }
  }

  const handleSubmit = async () => {
    if (!formRef.value) return

    try {
      const valid = await formRef.value.validate()
      if (!valid) return

      loading.value = true

      const { access_token, refresh_token } = await fetchLogin({
        username: formData.username,
        password: formData.password,
        code: formData.code,
        uuid: formData.uuid
      })

      if (!access_token) {
        throw new Error('Login failed - no token received')
      }

      userStore.setToken(access_token, refresh_token)
      const userInfo = await fetchGetUserInfo()
      userStore.setUserInfo(userInfo)
      userStore.setLoginStatus(true)

      showLoginSuccessNotice(userInfo)
      router.push('/')
    } catch (error) {
      if (!(error instanceof HttpError)) {
        console.error('[Login] Unexpected error:', error)
      }
    } finally {
      await refreshCaptcha()
      loading.value = false
    }
  }

  /** 登录成功提示用显示名：优先商户名称，其次登录名/商户号 */
  const resolveDisplayName = (user: Record<string, any>) =>
    user?.name || user?.realname || user?.login_name || user?.mch_id || user?.username || formData.username

  const showLoginSuccessNotice = (userInfo: Record<string, any>) => {
    const name = resolveDisplayName(userInfo)
    setTimeout(() => {
      ElNotification({
        title: t('login.success.title'),
        type: 'success',
        duration: 2500,
        zIndex: 10000,
        message: t('login.success.message', { name })
      })
    }, 150)
  }
</script>

<style scoped>
  @import './style.css';
</style>

<style lang="scss" scoped>
  /* Element Plus 表单项深色科技风覆写 */
  .pay-login-form {
    :deep(.el-form-item) {
      margin-bottom: 20px;
    }

    :deep(.el-input__wrapper) {
      height: 44px;
      background: rgb(15 23 42 / 55%);
      border: 1px solid rgb(56 189 248 / 15%);
      border-radius: 10px;
      box-shadow: none !important;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    :deep(.el-input__wrapper:hover),
    :deep(.el-input__wrapper.is-focus) {
      border-color: rgb(56 189 248 / 40%);
      box-shadow: 0 0 0 2px rgb(56 189 248 / 8%) !important;
    }

    :deep(.el-input__inner) {
      color: #e2e8f0;

      &::placeholder {
        color: #64748b;
      }
    }

    :deep(.el-checkbox__label) {
      color: #94a3b8;
    }

    :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
      background-color: #0ea5e9;
      border-color: #0ea5e9;
    }
  }
</style>
