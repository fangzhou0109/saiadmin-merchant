import request from '@/utils/http'

/**
 * 商户门户 - 账户/API 密钥 API（/mapi/account）
 */
export default {
  /** 获取对接 API 信息（商户号 + 签名密钥 + 费率等） */
  apiInfo() {
    return request.get<Api.Common.ApiData>({
      url: '/mapi/account/apiInfo'
    })
  },

  /** 重置 API 签名密钥（返回 secret_key + platform_rsa_public_key） */
  resetKey() {
    return request.post<any>({
      url: '/mapi/account/resetKey'
    })
  },

  /** 保存商户来签 RSA 公钥（sign_type=2 时平台验签用） */
  updateRsaPublicKey(data: { rsa_public_key: string }) {
    return request.post<any>({
      url: '/mapi/account/updateRsaPublicKey',
      data
    })
  },

  /** 设置 API 代付自动下发阈值（元，0=回落全局/全部转人工） */
  updateAutoDisburseThreshold(data: { auto_disbursement_threshold: string }) {
    return request.post<any>({
      url: '/mapi/account/updateAutoDisburseThreshold',
      data
    })
  }
}
