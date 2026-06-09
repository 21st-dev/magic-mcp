import { BASE_URL } from "./http-client.js";

describe("http-client", () => {
  it("should use production URL in production environment", () => {
    expect(BASE_URL).toBe("https://magic.21st.dev");
  });
});

describe("http-client error handling", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("throws on non-2xx response with status and error message", async () => {
    const { twentyFirstClient } = await import("./http-client.js");

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "Anthropic experiencing high load" }), {
        status: 500,
        statusText: "Internal Server Error",
      }) as Response;

    await expect(
      twentyFirstClient.post("/api/refine-ui", { foo: "bar" })
    ).rejects.toThrow("HTTP 500 Internal Server Error: {\"error\":\"Anthropic experiencing high load\"}");
  });

  it("throws on non-2xx response when response has no body", async () => {
    const { twentyFirstClient } = await import("./http-client.js");

    globalThis.fetch = async () =>
      new Response(null, {
        status: 503,
        statusText: "Service Unavailable",
      }) as Response;

    await expect(
      twentyFirstClient.post("/api/refine-ui", { foo: "bar" })
    ).rejects.toThrow("HTTP 503 Service Unavailable");
  });

  it("throws on 401 with the error body from server", async () => {
    const { twentyFirstClient } = await import("./http-client.js");

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ error: "Invalid or inactive API key" }), {
        status: 401,
        statusText: "Unauthorized",
      }) as Response;

    await expect(
      twentyFirstClient.get("/api/some-endpoint")
    ).rejects.toThrow("HTTP 401 Unauthorized: {\"error\":\"Invalid or inactive API key\"}");
  });
});