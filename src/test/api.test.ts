import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, api } from "@/lib/api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("frontend API client", () => {
  it("sends GET requests with cookie credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(api.get<{ ok: boolean }>("/health")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/health",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("serializes JSON bodies and sets the content type", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ id: "readme-1" }), { status: 201 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await api.post("/readmes", { projectName: "ReadmeHub" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/readmes",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ projectName: "ReadmeHub" }),
        headers: { "Content-Type": "application/json" },
      }),
    );
  });

  it("surfaces API error messages and codes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Sign in required", code: "UNAUTHORIZED" }), {
          status: 401,
        }),
      ),
    );

    await expect(api.get("/private")).rejects.toMatchObject({
      name: "Error",
      message: "Sign in required",
      status: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("provides a status-based message for non-JSON error responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 })));

    const response = api.get("/health");
    await expect(response).rejects.toBeInstanceOf(ApiError);
    await expect(response).rejects.toMatchObject({
      message: "Request failed (503)",
      status: 503,
    });
  });
});
