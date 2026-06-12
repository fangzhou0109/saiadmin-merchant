import request from '@/utils/http'

/**
 * 商户门户 - 通道 API（/mapi/channel）
 *
 * 只读展示当前商户已开启的代收/代付通道（后端按 token 商户ID 强制过滤）。
 */
export default {
  /** 已开启代收通道列表 */
  payList() {
    return request.get<Api.Common.ApiData>({
      url: '/mapi/channel/payList'
    })
  },

  /** 已开启代付通道列表 */
  transferList() {
    return request.get<Api.Common.ApiData>({
      url: '/mapi/channel/transferList'
    })
  }
}
