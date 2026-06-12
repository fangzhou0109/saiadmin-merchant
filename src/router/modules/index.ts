import { AppRouteRecord } from '@/types/router'
import { merchantRoutes } from './merchant'

/**
 * 导出所有模块化路由
 *
 * 商户门户：仅商户中心（前端固定菜单）。
 * 结果页/异常页演示菜单已移除；403/404/500 仍由 staticRoutes 提供（无侧栏入口）。
 */
export const routeModules: AppRouteRecord[] = [merchantRoutes]
