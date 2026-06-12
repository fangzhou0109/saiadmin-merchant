# 商户门户（saiadmin-merchant）— AI 编码代理指南

**商户自助门户**，由 `saiadmin-artd`（平台后台）完整复制后裁剪改造而来：商户用独立账号登录，自助查单、提现、绑卡、充值、查看 API 密钥。与平台后台**物理隔离**（独立站点/端口/域名，独立商户 JWT）。技术栈同 artd：Vue 3 + TypeScript + Vite 7 + Element Plus + Pinia + vue-router + vue-i18n + Tailwind 4。要求 Node ≥ 20.19、pnpm ≥ 8.8（**用 pnpm，勿用 npm/yarn**）。

> **与平台后台 artd 的关键差异**（改这里前务必先读本节）：
> 1. **接口前缀 `/mapi/*`**（非 `/core/*`），后端中间件 `MerchantAuth` 只认 `plat=merchant` 的 token。
> 2. **前端静态菜单**：`.env` 中 `VITE_ACCESS_MODE=frontend`，菜单写死在 [src/router/modules/merchant.ts](src/router/modules/merchant.ts)，**不再调后端 `/core/system/menu` 动态菜单**。
> 3. **登录含图形验证码**：登录页 [src/views/auth/login/index.vue](src/views/auth/login/index.vue) 接 `GET /mapi/auth/captcha` + `POST /mapi/auth/login`（`login_name/password/code/uuid`）。
> 4. **业务页在 [src/views/merchant/](src/views/merchant/)**；平台后台的 `views/system`、`views/tool`、`views/plugin` 等**物理保留但已脱离菜单/路由（死代码）**，勿在其上加功能、也勿大规模删除（会破坏 vue-tsc 构建）。
> 5. 默认端口 **3006**（见 [.env](.env) `VITE_PORT`）。
> 6. **代收费率**：Phase 9.1 起由平台按通道配置，门户 API 对接页（[account/index.vue](src/views/merchant/account/index.vue)）**不展示** `merchant.rate`，仅展示代付默认费率 `rate_transfer`。

## 常用命令

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | **先 `vue-tsc --noEmit` 类型检查**再 `vite build`，类型错误会中断构建 |
| `pnpm fix` | ESLint 自动修复 |
| `pnpm lint:stylelint` | 样式检查修复 |
| `pnpm commit` | cz-git 交互式提交 |

开发环境 `VITE_API_URL=/api`，由 Vite 代理（端口 3006）转发到 `VITE_API_PROXY_URL`（默认远端，见 [.env.development](.env.development)）。前端写接口 URL 时**不带 `/api` 前缀**（如 `/mapi/auth/login`），baseURL 自动补。要连本地后端就改 `VITE_API_PROXY_URL`。

## 路径别名（见 [vite.config.ts](vite.config.ts)）

`@`→`src/`，`@views`、`@imgs`→`src/assets/images`、`@icons`、`@utils`、`@stores`→`src/store`、`@styles`。优先用别名而非相对路径。

## 自动导入（重要，避免重复 import）

通过 unplugin-auto-import / unplugin-vue-components，以下**无需手动 import**：

- Vue / vue-router / pinia / `@vueuse/core` 的 API（`ref`、`computed`、`watch`、`onMounted`、`useRouter`、`useRoute`、`defineStore` 等）
- Element Plus 组件与 `ElMessage`/`ElMessageBox`/`ElNotification`
- Art Design 组件（`ArtTable`、`ArtTableHeader` 等）与 `src/components/sai/` 下的 `sa-*` 组件

声明文件 [src/auto-imports.d.ts](src/auto-imports.d.ts)、[src/components.d.ts](src/components.d.ts) 自动生成，**勿手改**。

## API 层约定

商户门户业务接口在 [src/api/merchant/](src/api/merchant/) 下，**URL 统一 `/mapi/*`**。认证接口在 [src/api/auth.ts](src/api/auth.ts)（`fetchLogin`→`/mapi/auth/login`、`fetchGetUserInfo`→`/mapi/auth/info`；`fetchGetDictList`/`fetchClearCache` 已改空实现，避免商户 token 命中需后台权限的 `/core/*` 致登录 401）。范例 [src/api/merchant/order.ts](src/api/merchant/order.ts)：

```ts
import request from '@/utils/http'
export default {
  list(params) { return request.get<Api.Common.ApiPage>({ url: '/mapi/order/index', params }) },
  read(id)     { return request.get<Api.Common.ApiData>({ url: '/mapi/order/read?id=' + id }) }
}
```

请求封装在 [src/utils/http/index.ts](src/utils/http/index.ts)：自动注入 `Bearer` token、响应拦截以 `code===200` 为成功（[status.ts](src/utils/http/status.ts)）、`401` 自动登出。

> **越权安全**：后端 `/mapi` 控制器的商户ID 一律取自 token、**绝不信任请求参数**，商户只能查/操作自己的数据。前端无需也不应传 `merchant_id`。

## 业务页面（CRUD）标准结构

商户门户业务页在 [src/views/merchant/](src/views/merchant/)：`dashboard`（首页统计）、`order`（查单）、`withdraw`（提现列表+申请）、`bankcard`（绑卡/解绑）、`recharge`（充值列表+申请）、`account`（API 密钥）；枚举常量集中在 [src/views/merchant/constants.ts](src/views/merchant/constants.ts)。

```
views/merchant/<page>/
└── index.vue                  # 列表页：useTable + ArtTable；申请类页面用 el-dialog 弹窗 + 校验
```

新建页面时复用两个核心能力，**勿自行实现分页/弹窗/删除逻辑**：

- [src/hooks/core/useTable.ts](src/hooks/core/useTable.ts)：数据加载、分页、搜索、列显隐、刷新策略
- [src/composables/useSaiAdmin.ts](src/composables/useSaiAdmin.ts)：`showDialog`/`deleteRow`/`deleteSelectedRows` 等弹窗与删除逻辑

参考列表页 [order/index.vue](src/views/merchant/order/index.vue)、申请弹窗页 [withdraw/index.vue](src/views/merchant/withdraw/index.vue)、绑卡页 [bankcard/index.vue](src/views/merchant/bankcard/index.vue)。

## 组件 / 路由 / 状态

- **业务组件**优先用 [src/components/sai/](src/components/sai/) 下的 `sa-*`（`sa-search-bar`、`sa-button` 等）与 Art Design 的 `ArtTable`。
- **菜单 / 路由（与 artd 最大不同）**：商户门户走**前端静态菜单**——菜单写在 [src/router/modules/merchant.ts](src/router/modules/merchant.ts)、经 [src/router/modules/index.ts](src/router/modules/index.ts) 聚合，由 `frontend` 模式（[useAppMode](src/hooks/core/useAppMode.ts)）在守卫 [src/router/guards/beforeEach.ts](src/router/guards/beforeEach.ts) 中注册。新增页面 = 在 `merchant.ts` 加一项 + 在 `views/merchant/` 建对应 `index.vue`（`component` 串如 `/merchant/xxx` 经 `ComponentLoader` 自动映射）。**不走后端动态菜单，也无按钮级 `v-permission`**（商户无 `buttons` 权限位）。
- **状态**：Pinia 模块在 [src/store/modules/](src/store/modules/)（`user`/`menu`/`dict`/`setting`/`table`/`worktab`），均持久化。`user.info` 由 `/mapi/auth/info` 映射填充（`username`=商户号、`roles`/`buttons` 留空）。

## 代码风格

ESLint（[eslint.config.mjs](eslint.config.mjs)）+ Prettier + Stylelint；husky pre-commit 跑 lint-staged。提交类型见 [commitlint.config.cjs](commitlint.config.cjs)。

## 注释与变更清单

- 函数与复杂逻辑写 JSDoc + 行内中文注释，解释意图而非复述代码。
- 每轮改动后列出变更清单供我审查，代码经我确认再提交。通用执行边界与清单规范见根 [../AGENTS.md](../AGENTS.md)。
