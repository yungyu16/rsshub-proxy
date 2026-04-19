// 公共 RSSHub 实例列表，随机轮询
const PROXY_LIST = [
	"https://rsshub.app",
	"https://rss.shab.fun",
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
	},
} satisfies ExportedHandler<Env>;