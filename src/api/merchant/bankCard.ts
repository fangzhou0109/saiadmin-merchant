import request from '@/utils/http'

/**
 * 商户门户 - 银行卡 API（/mapi/bankCard）
 *
 * 仅本商户：列表 / 绑卡（卡号 Luhn 校验）/ 启停 / 解绑。
 */
export default {
  /** 银行卡列表 */
  list(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({
      url: '/mapi/bankCard/index',
      params
    })
  },

  /** 绑定银行卡（归属商户由后端按 token 强制，返回首现卡标记） */
  save(params: Record<string, any>) {
    return request.post<any>({
      url: '/mapi/bankCard/save',
      data: params
    })
  },

  /** 启用/停用银行卡 { id, status: 1正常|2停用 } */
  changeStatus(params: Record<string, any>) {
    return request.post<any>({
      url: '/mapi/bankCard/changeStatus',
      data: params
    })
  },

  /** 解绑银行卡 */
  delete(params: Record<string, any>) {
    return request.del<any>({
      url: '/mapi/bankCard/destroy',
      data: params
    })
  }
}
