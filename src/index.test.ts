import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "./index";

describe("MTA-STS fetch handler", () => {
    const mockResponse = new Response("policy-content", { status: 200 });

    beforeEach(() => {
        vi.resetAllMocks();
    });

    it("should proxy the request to the Cloudflare MTA-STS endpoint", async () => {
        const fetchSpy = vi
            .spyOn(globalThis, "fetch")
            .mockResolvedValueOnce(mockResponse);

        const req = new Request(
            "https://mta-sts.example.com/.well-known/mta-sts.txt",
        );
        const res = await handler.fetch(req);

        expect(fetchSpy).toHaveBeenCalledWith(
            "https://mta-sts.mx.cloudflare.net/.well-known/mta-sts.txt",
        );
        expect(res).toBe(mockResponse);
    });

    it("should return the response from the proxied endpoint", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse);

        const req = new Request(
            "https://mta-sts.example.com/.well-known/mta-sts.txt",
        );
        const res = await handler.fetch(req);

        expect(res.status).toBe(200);
        const text = await res.text();
        expect(text).toBe("policy-content");
    });

    it("responds 404 for other paths", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(mockResponse);

        const req = new Request("https://example.com/other-path");
        const res = await handler.fetch(req);

        expect(res.status).toBe(404);
        expect(await res.text()).toBe("Not Found");
    });
});
