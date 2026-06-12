import request from '@/utils/http'

/**
 * 商户门户 - API 对接说明与沙箱测试（/mapi/integration）
 */
export default {
  /** 对接文档上下文（网关地址、白名单、默认测试 notify 等） */
  docs() {
    return request.get<Api.Common.ApiData>({
      url: '/mapi/integration/docs'
    })
  },

  /** 沙箱测试下单（免网关签名，走生产选路） */
  testSubmit(data: Record<string, any>) {
    return request.post<Api.Common.ApiData>({
      url: '/mapi/integration/testSubmit',
      data
    })
  },

  /** 沙箱测试查单 */
  testQuery(data: Record<string, any>) {
    return request.post<Api.Common.ApiData>({
      url: '/mapi/integration/testQuery',
      data
    })
  },

  /** 测试异步通知接收记录（仅本商户） */
  testNotifyRecent(params?: Record<string, any>) {
    return request.get<Api.Common.ApiData>({
      url: '/mapi/integration/testNotifyRecent',
      params
    })
  },

  /** 生成带签名的网关请求示例（curl + 待签串） */
  buildSignSample(data: Record<string, any>) {
    return request.post<Api.Common.ApiData>({
      url: '/mapi/integration/buildSignSample',
      data
    })
  }
}
