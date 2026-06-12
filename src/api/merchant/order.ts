import request from '@/utils/http'

/**
 * 商户门户 - 订单 API（/mapi/order）
 *
 * 仅能查本商户订单（后端按 token 商户ID 强制过滤）。
 */
export default {
  /** 订单列表 */
  list(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({
      url: '/mapi/order/index',
      params
    })
  },

  /** 订单详情 */
  read(id: number | string) {
    return request.get<Api.Common.ApiData>({
      url: '/mapi/order/read?id=' + id
    })
  }
}
