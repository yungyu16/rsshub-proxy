import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
} from "cloudflare:test";
import { describe, it, expect, vi } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

describe("RSSHub 代理 Worker", () => {
	it("将请求转发到某个上游 RSSHub 实例", async () => {
		// 拦截 fetch，验证转发目标
		const mockFetch = vi.fn().mockResolvedValue(new Response("<rss/>", {
			headers: { "Content-Type": "application/rss+xml" },
		}));
		vi.stubGlobal("fetch", mockFetch);

		const request = new IncomingRequest("https://rsshub-proxy.example.workers.dev/bilibili/user/video/123");
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		// 验证确实调用了 fetch
		expect(mockFetch).toHaveBeenCalledOnce();

		// 验证转发的 URL 路径保持不变
		const forwardedRequest: Request = mockFetch.mock.calls[0][0];
		const forwardedUrl = new URL(forwardedRequest.url);
		expect(forwardedUrl.pathname).toBe("/bilibili/user/video/123");

		// 验证转发目标是已知的上游实例之一
		const knownHosts = ["rsshub.app", "rss.shab.fun", "rsshub.rssforever.com"];
		expect(knownHosts).toContain(forwardedUrl.hostname);

		expect(response.status).toBe(200);

		vi.unstubAllGlobals();
	});

	it("透传查询参数", async () => {
		const mockFetch = vi.fn().mockResolvedValue(new Response("<rss/>"));
		vi.stubGlobal("fetch", mockFetch);

		const request = new IncomingRequest("https://rsshub-proxy.example.workers.dev/v2ex/topics/hot?limit=20");
		const ctx = createExecutionContext();
		await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);

		const forwardedRequest: Request = mockFetch.mock.calls[0][0];
		const forwardedUrl = new URL(forwardedRequest.url);
		expect(forwardedUrl.search).toBe("?limit=20");

		vi.unstubAllGlobals();
	});
});