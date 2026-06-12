import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

/**
 * 获取登录验证码（图形）
 */
export function fetchCaptcha() {
  return request.get<Api.Auth.CaptchaResponse>({
    url: '/mapi/auth/captcha'
  })
}

/**
 * 商户门户登录（独立商户 JWT + 图形验证码）
 *
 * 后端 /mapi/auth/login 接收 { login_name, password, code, uuid }，返回 { token:{access_token,...}, merchant }。
 * 这里把 username 映射为 login_name，并把 token 字段平铺返回，兼容登录页的 { access_token, refresh_token } 解构。
 */
export async function fetchLogin(params: {
  username: string
  password: string
  code: string
  uuid: string
}) {
  const data: any = await request.post<any>({
    url: '/mapi/auth/login',
    params: {
      login_name: params.username,
      password: params.password,
      code: params.code,
      uuid: params.uuid
    }
  })
  const token = data?.token || {}
  return {
    access_token: token.access_token,
    refresh_token: token.refresh_token,
    merchant: data?.merchant
  } as any
}

/**
 * 获取当前商户信息
 *
 * 后端 /mapi/auth/info 返回商户安全资料；映射成前端 UserInfo 结构（id/username/roles/buttons）。
 * 商户门户菜单为前端静态固定，故 roles/buttons 留空。
 */
export async function fetchGetUserInfo() {
  const m: any = await request.get<any>({
    url: '/mapi/auth/info'
  })
  return {
    id: m?.id,
    username: m?.mch_id,
    realname: m?.name || m?.mch_id,
    name: m?.name,
    login_name: m?.login_name,
    mch_id: m?.mch_id,
    avatar: m?.avatar || '',
    // 前端静态菜单模式：无需后端角色/按钮权限
    roles: [],
    buttons: [],
    // 透传商户业务字段，供首页/账户页展示
    ...m
  } as any
}

/**
 * 商户登出（JWT 无状态，前端丢弃 token 即可；调用后端仅作语义化）
 */
export function fetchLogout() {
  return request.post<any>({
    url: '/mapi/auth/logout'
  })
}

/**
 * 修改资料
 * @param params 修改资料参数
 * @returns 响应
 */
export function updateUserInfo(params: Record<string, any>) {
  return request.post<any>({
    url: '/core/user/updateInfo',
    params
  })
}

/**
 * 修改门户登录密码（商户 /mapi/auth/modifyPassword）
 */
export function modifyPassword(params: {
  oldPassword: string
  newPassword: string
  confirmPassword?: string
}) {
  return request.post<any>({
    url: '/mapi/auth/modifyPassword',
    data: {
      old_password: params.oldPassword,
      new_password: params.newPassword
    }
  })
}

/**
 * 获取登录日志
 * @returns 登录日志数组
 */
export function fetchGetLogin(params: Record<string, any>) {
  return request.get<Api.Common.ApiPage>({
    url: '/core/system/getLoginLogList',
    params
  })
}

/**
 * 获取操作日志
 * @returns 操作日志数组
 */
export function fetchGetOperate(params: Record<string, any>) {
  return request.get<Api.Common.ApiPage>({
    url: '/core/system/getOperationLogList',
    params
  })
}

/**
 * 清理缓存（商户门户无平台缓存可清，返回空，避免命中需后台权限的 /core 接口）
 */
export function fetchClearCache() {
  return Promise.resolve<any>({})
}

/**
 * 获取字典数据
 *
 * 商户门户不依赖平台数据字典（页面用本地常量），直接返回空，
 * 避免请求 /core/system/dictAll（商户 token 无权访问 /core/*，会 401 阻断登录流程）。
 */
export function fetchGetDictList() {
  return Promise.resolve<any>([])
}

/**
 * 获取菜单列表
 * @returns 菜单数组
 */
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/core/system/menu'
  })
}

/**
 * 上传商户头像（multipart，上传后自动写入 sa_pay_merchant.avatar）
 */
export function uploadImage(params: FormData) {
  return request.post<any>({
    url: '/mapi/auth/uploadAvatar',
    data: params
  })
}

/**
 * 更新商户头像 URL（传空字符串清除）
 */
export function updateMerchantAvatar(avatar: string) {
  return request.post<any>({
    url: '/mapi/auth/updateAvatar',
    data: { avatar }
  })
}

/**
 * 上传文件
 * @param params
 * @returns
 */
export function uploadFile(params: any) {
  return request.post<any>({
    url: '/core/system/uploadFile',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    params
  })
}

/**
 * 切片上传
 * @param params
 * @returns
 */
export function chunkUpload(params: any) {
  return request.post<any>({
    url: '/core/system/chunkUpload',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    params
  })
}

/**
 * 资源分类
 * @param params
 * @returns
 */
export function getResourceCategory(params: any) {
  return request.get<Api.Common.ApiData[]>({
    url: '/core/system/getResourceCategory',
    params
  })
}

/**
 * 图片资源列表
 * @param params
 * @returns
 */
export function getResourceList(params: any) {
  return request.get<Api.Common.ApiPage>({
    url: '/core/system/getResourceList',
    params
  })
}

/**
 * 用户列表
 * @param params
 * @returns
 */
export function getUserList(params: any) {
  return request.get<Api.Common.ApiPage>({
    url: '/core/system/getUserList',
    params
  })
}
