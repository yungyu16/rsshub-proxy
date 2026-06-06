// 公共 RSSHub 实例列表，随机轮询
const PROXY_LIST = [
	// "https://rsshub.app",
	"https://rsshub.rssforever.com",
];

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const incomingUrl = new URL(request.url);

		// 随机选一个上游实例
		const upstream = PROXY_LIST[Math.floor(Math.random() * PROXY_LIST.length)];
		const upstreamUrl = new URL(upstream);

		// 替换 host，保留路径、查询参数等
		incomingUrl.hostname = upstreamUrl.hostname;
		incomingUrl.protocol = upstreamUrl.protocol;
		incomingUrl.port = upstreamUrl.port;

		// 透传所有原始请求头
		const proxyRequest = new Request(incomingUrl.toString(), request);

		return fetch(proxyRequest);
		//
		// ⚠️ 已知问题：响应的绝对地址未做替换，存在以下隐患：
		//
		// 1.【响应体】RSS/Atom 的 XML 里大量使用绝对 URL（<link>、<guid>、
		//    <enclosure>、<content> 中嵌入的图片/链接等），这些 URL 的 origin
		//    都指向上游实例（如 https://rsshub.rssforever.com），而非代理域名。
		//    如果 RSS 阅读器通过这些链接做后续请求（如拉取全文、下载附件），
		//    就会绕过本代理直接访问上游，可能因 CORS 或网络策略失败。
		//
		// 2.【响应头】若上游返回 Location、Content-Location 等重定向头，
		//    其中的绝对 URL 同样指向上游，客户端若跟随重定向会脱离代理。
		//
		// 3.【暴露上游】响应中的绝对 URL 暴露了上游实例地址，违背了代理层
		//    对外隐藏后端的目的。
		//
		// 如需修复，基本思路是在返回响应前：
		//   - 用 HTMLRewriter 或字符串替换，将 body 中所有上游 host 替换
		//     为代理域名的 host
		//   - 遍历响应头，对 Location / Content-Location 等字段做同样替换
		// 注意：替换是全局文本替换，可能误伤内容本身（如 RSS 条目摘要里
		// 恰好包含上游域名文本），需要取舍。
	},
} satisfies ExportedHandler<Env>;