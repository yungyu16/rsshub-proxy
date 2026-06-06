# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

RSSHub 代理 — 部署在 Cloudflare Workers 上的轻量代理，将请求转发到上游公共 RSSHub 实例，对外隐藏后端地址并实现简单负载均衡。

## 命令

| 命令 | 用途 |
|------|------|
| `npm run dev` / `npm start` | 本地开发（wrangler dev） |
| `npm run deploy` | 部署到 Cloudflare |
| `npm test` | 运行 vitest 测试 |
| `npm run cf-typegen` | 生成 Cloudflare 类型定义 |

修改 `wrangler.jsonc` 中的 bindings 后需要运行 `npm run cf-typegen`。

## 架构

- **入口**: `src/index.ts` — 唯一的 Worker 源码文件，导出 `ExportedHandler<Env>`
- **上游列表**: `PROXY_LIST` 数组中配置公共 RSSHub 实例，请求随机轮询到其中一个
- **转发逻辑**: 保留原始请求的路径、查询参数和请求头，仅替换 host/protocol/port
- **测试**: 使用 `@cloudflare/vitest-pool-workers` 在 Worker 环境中运行，mock `fetch` 验证转发行为

## 已知问题

响应体中的绝对 URL（RSS XML 的 `<link>`、`<guid>`、`<enclosure>` 等）和响应头（`Location`、`Content-Location`）仍指向上游实例，未做 host 替换。详见 `src/index.ts` 中的注释。

## Cloudflare Workers

STOP. Your knowledge of Cloudflare Workers APIs and limits may be outdated. Always retrieve current documentation before any Workers, KV, R2, D1, Durable Objects, Queues, Vectorize, AI, or Agents SDK task.

## Docs

- https://developers.cloudflare.com/workers/
- MCP: `https://docs.mcp.cloudflare.com/mcp`

For all limits and quotas, retrieve from the product's `/platform/limits/` page. eg. `/workers/platform/limits`

## Node.js Compatibility

https://developers.cloudflare.com/workers/runtime-apis/nodejs/

## Errors

- **Error 1102** (CPU/Memory exceeded): Retrieve limits from `/workers/platform/limits/`
- **All errors**: https://developers.cloudflare.com/workers/observability/errors/

## Product Docs

Retrieve API references and limits from:
`/kv/` · `/r2/` · `/d1/` · `/durable-objects/` · `/queues/` · `/vectorize/` · `/workers-ai/` · `/agents/`

## Best Practices (conditional)

If the application uses Durable Objects or Workflows, refer to the relevant best practices:

- Durable Objects: https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/
- Workflows: https://developers.cloudflare.com/workflows/build/rules-of-workflows/
