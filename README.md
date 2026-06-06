# RSSHub Proxy

在 Cloudflare Workers 上运行的 RSSHub 反向代理，轻量、零依赖。

## 为什么需要它？

[RSSHub](https://github.com/DIYgod/RSSHub) 是一个非常强大的 RSS 生成工具，但公共实例可能因网络策略、地域限制或服务不稳定而无法访问。

RSSHub Proxy 作为一个中间层，将你的请求转发到上游公共 RSSHub 实例，同时对外隐藏后端地址。当上游不可用时，只需在代理端切换实例，所有订阅者无需修改任何 RSS 地址。

## 快速开始

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 部署到 Cloudflare
npm run deploy
```

部署后，你的 RSS 订阅地址从 `https://rsshub.app/weibo/user/123456` 变为 `https://your-worker.workers.dev/weibo/user/123456`。

## 工作原理

```
RSS 阅读器 ──→ rsshub-proxy ──→ 上游 RSSHub 实例
             (Cloudflare        (随机轮询)
              Workers)
```

请求到达 Worker 后，代理会从配置的上游列表中随机选择一个实例，保留原始路径、查询参数和请求头，仅替换目标地址后转发。响应直接透传回客户端。

## 已知局限

响应体中的绝对 URL（RSS XML 的 `<link>`、`<guid>`、`<enclosure>` 等）和部分响应头仍指向上游实例，未做 host 替换。这意味着 RSS 阅读器通过链接做后续请求时可能绕过代理直接访问上游，也可能因 CORS 或网络策略失败。

## 技术栈

- **运行时**: Cloudflare Workers
- **语言**: TypeScript
- **部署**: Wrangler CLI

## License

MIT