import type { MerchantDashboardStats, PendingRechargeItem, PendingWithdrawItem } from './types'

/**
 * 合并接口数据与默认值，确保列表字段始终为数组
 */
export function normalizeDashboardStats(
  defaults: MerchantDashboardStats,
  data?: Record<string, any> | null
): MerchantDashboardStats {
  if (!data) {
    return { ...defaults }
  }

  return {
    ...defaults,
    ...data,
    trend_7d: Array.isArray(data.trend_7d) ? data.trend_7d : defaults.trend_7d ?? [],
    pay_type_dist_today: Array.isArray(data.pay_type_dist_today)
      ? data.pay_type_dist_today
      : defaults.pay_type_dist_today ?? [],
    recent_orders: Array.isArray(data.recent_orders) ? data.recent_orders : defaults.recent_orders ?? [],
    recent_pending_withdraws: Array.isArray(data.recent_pending_withdraws)
      ? data.recent_pending_withdraws
      : defaults.recent_pending_withdraws ?? [],
    recent_pending_recharges: Array.isArray(data.recent_pending_recharges)
      ? data.recent_pending_recharges
      : defaults.recent_pending_recharges ?? []
  }
}

/** 金额字符串简单累加（兜底补全用，展示级精度） */
export function sumAmountStrings(rows: Array<Record<string, any>>, field = 'amount'): string {
  let total = 0
  for (const row of rows) {
    const num = parseFloat(String(row[field] ?? '0'))
    if (Number.isFinite(num)) {
      total += num
    }
  }
  return total.toFixed(4)
}

export function mapWithdrawQueueRows(rows: Array<Record<string, any>>): PendingWithdrawItem[] {
  return rows.slice(0, 5).map((row) => ({
    id: Number(row.id) || 0,
    withdraw_no: String(row.withdraw_no ?? ''),
    amount: String(row.amount ?? '0.0000'),
    create_time: String(row.create_time ?? '')
  }))
}

export function mapRechargeQueueRows(rows: Array<Record<string, any>>): PendingRechargeItem[] {
  return rows.slice(0, 5).map((row) => ({
    id: Number(row.id) || 0,
    recharge_no: String(row.recharge_no ?? ''),
    amount: String(row.amount ?? '0.0000'),
    create_time: String(row.create_time ?? '')
  }))
}

/**
 * 判断待审提现统计是否需要从列表接口兜底补全
 * （兼容旧版后端未返回金额/队列字段，或金额聚合异常为 0）
 */
export function shouldPatchPendingWithdraw(stats: MerchantDashboardStats): boolean {
  const count = stats.pending_withdraw_count ?? 0
  if (count <= 0) return false

  const amount = stats.pending_withdraw_amount ?? '0.0000'
  const queueEmpty = !(stats.recent_pending_withdraws?.length)
  const amountInvalid = amount === '0.0000' || amount === '0' || amount === '0.00'

  return queueEmpty || (count > 0 && amountInvalid)
}

export function shouldPatchPendingRecharge(stats: MerchantDashboardStats): boolean {
  const count = stats.pending_recharge_count ?? 0
  if (count <= 0) return false

  const amount = stats.pending_recharge_amount ?? '0.0000'
  const queueEmpty = !(stats.recent_pending_recharges?.length)
  const amountInvalid = amount === '0.0000' || amount === '0' || amount === '0.00'

  return queueEmpty || (count > 0 && amountInvalid)
}
