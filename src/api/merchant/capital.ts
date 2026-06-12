import request from '@/utils/http'

/**
 * 商户门户 - 资金流水 API（/mapi/capital）
 *
 * 仅本商户：列表 / 导出（merchant_id 由后端按 token 强制）。
 */
export default {
  /** 资金流水列表 */
  list(params: Record<string, any>) {
    return request.get<Api.Common.ApiPage>({
      url: '/mapi/capital/index',
      params
    })
  }
}
