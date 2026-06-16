import request from '@/utils/http'

/**
 * 商户门户 - 代付订单 API（/mapi/transferOrder）
 *
 * 下游通过服务端 API 调代付（/pay/transfer）产生的代付单（source=2），列表/详情仅本商户；
 * 只读查询 + 手动重推下游通知（漏收平台代付结果回调时补推）。
 */
export default {
  /** 代付订单列表 */
  list(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({
      url: '/mapi/transferOrder/index',
      params
    })
  },

  /** 代付订单详情 */
  read(id: number | string) {
    return request.get<Api.Common.ApiData>({
      url: '/mapi/transferOrder/read?id=' + id
    })
  },

  /** 手动重推下游通知（仅终态可推） */
  renotify(id: number | string) {
    return request.post<any>({
      url: '/mapi/transferOrder/renotify',
      data: { id }
    })
  }
}
