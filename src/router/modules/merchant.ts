import { AppRouteRecord } from '@/types/router'

/**
 * 商户门户菜单（前端固定静态菜单）
 *
 * 与平台后台不同，商户门户菜单不依赖后端 /core/system/menu 动态下发，
 * 而是前端写死——商户只见自助业务：首页、订单、代收/代付通道、提现、银行卡、充值、资金流水、API 密钥、API 对接。
 * 顶层用布局组件 `/index/index` 包裹，子项为各业务页（component 映射到 src/views/merchant/*）。
 */
export const merchantRoutes: AppRouteRecord = {
  name: 'Merchant',
  path: '/merchant',
  component: '/index/index',
  meta: {
    title: '商户中心',
    icon: 'ri:store-2-line'
  },
  children: [
    {
      path: 'dashboard',
      name: 'MerchantDashboard',
      component: '/merchant/dashboard',
      meta: { title: '首页', icon: 'ri:dashboard-line', keepAlive: false, fixedTab: true }
    },
    {
      path: 'order',
      name: 'MerchantOrder',
      component: '/merchant/order',
      meta: { title: '我的订单', icon: 'ri:file-list-3-line', keepAlive: true }
    },
    {
      path: 'channel-pay',
      name: 'MerchantChannelPay',
      component: '/merchant/channel-pay',
      meta: { title: '代收通道', icon: 'ri:bank-card-2-line', keepAlive: true }
    },
    {
      path: 'channel-transfer',
      name: 'MerchantChannelTransfer',
      component: '/merchant/channel-transfer',
      meta: { title: '代付通道', icon: 'ri:swap-line', keepAlive: true }
    },
    {
      path: 'transfer-order',
      name: 'MerchantTransferOrder',
      component: '/merchant/transfer-order',
      meta: { title: '代付订单', icon: 'ri:send-plane-line', keepAlive: true }
    },
    {
      path: 'withdraw',
      name: 'MerchantWithdraw',
      component: '/merchant/withdraw',
      meta: { title: '提现', icon: 'ri:hand-coin-line', keepAlive: true }
    },
    {
      path: 'bankcard',
      name: 'MerchantBankCard',
      component: '/merchant/bankcard',
      meta: { title: '银行卡', icon: 'ri:bank-card-line', keepAlive: true }
    },
    {
      path: 'recharge',
      name: 'MerchantRecharge',
      component: '/merchant/recharge',
      meta: { title: '充值', icon: 'ri:wallet-3-line', keepAlive: true }
    },
    {
      path: 'capital',
      name: 'MerchantCapital',
      component: '/merchant/capital',
      meta: { title: '资金流水', icon: 'ri:exchange-funds-line', keepAlive: true }
    },
    {
      path: 'account',
      name: 'MerchantAccount',
      component: '/merchant/account',
      meta: { title: 'API 密钥', icon: 'ri:key-2-line', keepAlive: false }
    },
    {
      path: 'integration',
      name: 'MerchantIntegration',
      component: '/merchant/integration',
      meta: { title: 'API 对接', icon: 'ri:file-code-line', keepAlive: true }
    },
    {
      path: 'user-center',
      name: 'MerchantUserCenter',
      component: '/merchant/user-center',
      meta: {
        title: '个人中心',
        isHide: true,
        isHideTab: true,
        keepAlive: false
      }
    }
  ]
}
