import request from '@/utils/http'

/**
 * 商户门户 - 提现 API（/mapi/withdraw）
 *
 * 列表/详情仅本商户；申请复用后端提现状态机（冻结余额→建待审核单）。
 */
export default {
  /** 提现列表 */
  list(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({
      url: '/mapi/withdraw/index',
      params
    })
  },

  /** 发起提现申请 */
  apply(params: Record<string, any>) {
    return request.post<any>({
      url: '/mapi/withdraw/apply',
      data: params
    })
  },

  /** 提现详情 */
  read(id: number | string) {
    return request.get<Api.Common.ApiData>({
      url: '/mapi/withdraw/read?id=' + id
    })
  }
}
