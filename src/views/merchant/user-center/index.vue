<template>
  <div v-loading="loading" class="merchant-user-center">
    <ElRow :gutter="16">
      <ElCol :xs="24" :lg="8">
        <ElCard shadow="never" class="profile-card">
          <div class="profile-head">
            <div class="avatar-upload-wrap">
              <SaImageUpload
                v-model="avatar"
                :width="88"
                :height="88"
                :limit="1"
                :show-tips="false"
                round
                :disabled="avatarSaving"
                @change="handleAvatarChange"
              />
            </div>
            <p class="avatar-hint">点击上传头像，支持 JPG/PNG，不超过 5MB</p>
            <h2 class="profile-name">{{ profile.name || '商户' }}</h2>
            <p class="profile-mch">商户号 {{ profile.mch_id || '—' }}</p>
            <ElTag :type="profile.status === 1 ? 'success' : 'danger'" size="small">
              {{ profile.status === 1 ? '正常' : '已停用' }}
            </ElTag>
          </div>

          <div class="profile-list">
            <div class="profile-item">
              <span class="label">门户登录名</span>
              <span class="value mono">{{ profile.login_name || '—' }}</span>
            </div>
            <div class="profile-item">
              <span class="label">可用余额(元)</span>
              <span class="value text-success">{{ profile.balance || '0.0000' }}</span>
            </div>
            <div class="profile-item">
              <span class="label">冻结余额(元)</span>
              <span class="value text-warning">{{ profile.balance_freeze || '0.0000' }}</span>
            </div>
            <div class="profile-item">
              <span class="label">代付默认费率</span>
              <span class="value">{{ profile.rate_transfer || '0.0000' }}%</span>
            </div>
            <div class="profile-item">
              <span class="label">单笔限额(元)</span>
              <span class="value">{{ profile.single_min || '0' }} ~ {{ profile.single_max || '0' }}</span>
            </div>
            <div class="profile-item">
              <span class="label">IP 白名单</span>
              <span class="value">
                <template v-if="profile.ip_whitelist_status === 1">
                  <span class="mono break-all">{{ profile.ip_whitelist || '未配置' }}</span>
                </template>
                <ElTag v-else type="info" size="small">未启用</ElTag>
              </span>
            </div>
          </div>

          <div class="quick-links">
            <RouterLink to="/merchant/dashboard">
              <ElButton plain>返回首页</ElButton>
            </RouterLink>
            <RouterLink to="/merchant/account">
              <ElButton type="primary" plain>API 密钥</ElButton>
            </RouterLink>
          </div>
        </ElCard>
      </ElCol>

      <ElCol :xs="24" :lg="16">
        <ElCard shadow="never" class="section-card">
          <template #header>账户说明</template>
          <ElAlert type="info" :closable="false" show-icon>
            商户名称、费率、限额、IP 白名单由平台运营配置，门户暂不支持自助修改。API 签名密钥请在
            <RouterLink to="/merchant/account">API 密钥</RouterLink> 页查看或重置。
          </ElAlert>
        </ElCard>

        <ElCard shadow="never" class="section-card">
          <template #header>修改门户登录密码</template>
          <p class="pwd-tip">
            此处修改的是<strong>商户门户登录密码</strong>（login_name），与 API 对接用的 MD5/RSA 密钥无关。
          </p>
          <ElForm
            ref="pwdFormRef"
            :model="pwdForm"
            :rules="pwdRules"
            label-width="100px"
            class="pwd-form"
            @submit.prevent
          >
            <ElFormItem label="当前密码" prop="oldPassword">
              <ElInput
                v-model="pwdForm.oldPassword"
                type="password"
                show-password
                autocomplete="current-password"
                style="max-width: 360px"
              />
            </ElFormItem>
            <ElFormItem label="新密码" prop="newPassword">
              <ElInput
                v-model="pwdForm.newPassword"
                type="password"
                show-password
                autocomplete="new-password"
                style="max-width: 360px"
              />
            </ElFormItem>
            <ElFormItem label="确认新密码" prop="confirmPassword">
              <ElInput
                v-model="pwdForm.confirmPassword"
                type="password"
                show-password
                autocomplete="new-password"
                style="max-width: 360px"
              />
            </ElFormItem>
            <ElFormItem>
              <ElButton type="primary" :loading="savingPwd" @click="handleModifyPassword">
                保存新密码
              </ElButton>
              <ElButton @click="resetPwdForm">重置</ElButton>
            </ElFormItem>
          </ElForm>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { fetchGetUserInfo, modifyPassword, updateMerchantAvatar } from '@/api/auth'
  import { useUserStore } from '@/store/modules/user'

  defineOptions({ name: 'MerchantUserCenter' })

  const userStore = useUserStore()
  const loading = ref(false)
  const savingPwd = ref(false)
  const avatarSaving = ref(false)
  const pwdFormRef = ref<FormInstance>()

  const profile = ref<Record<string, any>>({})
  const avatar = ref('')

  const pwdForm = reactive({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const pwdRules: FormRules = {
    oldPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, max: 64, message: '长度在 6 到 64 个字符', trigger: 'blur' }
    ],
    confirmPassword: [{ required: true, message: '请确认新密码', trigger: 'blur' }]
  }

  const loadProfile = async () => {
    loading.value = true
    try {
      profile.value = (await fetchGetUserInfo()) || {}
      avatar.value = (profile.value.avatar as string) || ''
    } finally {
      loading.value = false
    }
  }

  /** 头像变更：上传接口已落库；删除时调用 updateAvatar 清空 */
  const handleAvatarChange = async (val: string | string[]) => {
    const url = Array.isArray(val) ? (val[0] || '') : (val || '')
    avatarSaving.value = true
    try {
      if (!url) {
        await updateMerchantAvatar('')
        ElMessage.success('头像已清除')
      }
      profile.value.avatar = url
      userStore.setAvatar(url)
    } catch {
      avatar.value = (profile.value.avatar as string) || ''
    } finally {
      avatarSaving.value = false
    }
  }

  const resetPwdForm = () => {
    pwdForm.oldPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    pwdFormRef.value?.clearValidate()
  }

  const handleModifyPassword = async () => {
    await pwdFormRef.value?.validate()
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      ElMessage.error('确认密码与新密码不一致')
      return
    }

    savingPwd.value = true
    try {
      await modifyPassword({
        oldPassword: pwdForm.oldPassword,
        newPassword: pwdForm.newPassword,
        confirmPassword: pwdForm.confirmPassword
      })
      ElMessage.success('密码修改成功，请使用新密码登录')
      resetPwdForm()
    } finally {
      savingPwd.value = false
    }
  }

  onMounted(loadProfile)
</script>

<style scoped lang="scss">
  .merchant-user-center {
    padding: 4px 4px 16px;
  }

  .profile-card,
  .section-card {
    margin-bottom: 16px;
  }

  .profile-head {
    padding: 8px 0 16px;
    text-align: center;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  .avatar-upload-wrap {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;

    :deep(.sa-image-upload) {
      display: inline-flex;
      justify-content: center;
    }
  }

  .avatar-hint {
    margin: 0 0 12px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .profile-name {
    margin: 0 0 6px;
    font-size: 20px;
    font-weight: 600;
  }

  .profile-mch {
    margin: 0 0 10px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }

  .profile-list {
    padding: 12px 0;
  }

  .profile-item {
    display: flex;
    gap: 12px;
    justify-content: space-between;
    padding: 10px 0;
    font-size: 13px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      border-bottom: none;
    }

    .label {
      flex-shrink: 0;
      color: var(--el-text-color-secondary);
    }

    .value {
      text-align: right;
    }
  }

  .quick-links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    padding-top: 8px;
  }

  .pwd-tip {
    margin: 0 0 16px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-secondary);
  }

  .pwd-form {
    max-width: 520px;
  }

  .mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  }

  .break-all {
    word-break: break-all;
  }

  .text-success {
    color: var(--el-color-success);
  }

  .text-warning {
    color: var(--el-color-warning);
  }
</style>
