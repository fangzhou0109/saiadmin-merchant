import request from '@/utils/http'

/**
 * 商户门户 - 首页统计 API（/mapi/dashboard）
 */
export default {
  /** 首页统计（余额/今日订单/待审核提现等） */
  stats() {
    return request.get<Api.Common.ApiData>({
      url: '/mapi/dashboard/stats'
    })
  }
}
