import request from '@/utils/http'

/**
 * 商户门户 - 代付订单 API（/mapi/transferOrder）
 *
 * 下游通过服务端 API 调代付（/pay/transfer）产生的代付单（source=2），列表/详情仅本商户。
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

  /**
   * 商户自助审核代付单（需平台开通「代付自审」开关）
   * @param data { id, action: 'disburse'|'reject', remark? }
   */
  audit(data: { id: number | string; action: 'disburse' | 'reject'; remark?: string }) {
    return request.post<any>({
      url: '/mapi/transferOrder/audit',
      data
    })
  }
}
