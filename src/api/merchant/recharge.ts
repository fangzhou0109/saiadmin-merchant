import request from '@/utils/http'

/**
 * 商户门户 - 充值 API（/mapi/recharge）
 *
 * 列表/详情仅本商户；申请建待审核单（不动余额），平台审核通过后入账。
 */
export default {
  /** 充值列表 */
  list(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({
      url: '/mapi/recharge/index',
      params
    })
  },

  /** 发起充值申请 */
  apply(params: Record<string, any>) {
    return request.post<any>({
      url: '/mapi/recharge/apply',
      data: params
    })
  },

  /** 充值详情 */
  read(id: number | string) {
    return request.get<Api.Common.ApiData>({
      url: '/mapi/recharge/read?id=' + id
    })
  }
}
