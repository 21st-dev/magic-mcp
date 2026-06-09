import { config } from "./config.js";

const TWENTY_FIRST_API_KEY =
  config.apiKey || process.env.TWENTY_FIRST_API_KEY || process.env.API_KEY;

const isTesting = process.env.DEBUG === "true" ? true : false;
export const BASE_URL = isTesting
  ? "http://localhost:3005"
  : "https://magic.21st.dev";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface HttpClient {
  get<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<{ status: number; data: T }>;
  post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<{ status: number; data: T }>;
  put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<{ status: number; data: T }>;
  delete<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<{ status: number; data: T }>;
  patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<{ status: number; data: T }>;
}

const createMethod = (method: HttpMethod) => {
  return async <T>(
    endpoint: string,
    data?: unknown,
    options: RequestInit = {}
  ) => {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(TWENTY_FIRST_API_KEY ? { "x-api-key": TWENTY_FIRST_API_KEY } : {}),
      ...options.headers,
    };

    console.log("BASE_URL", BASE_URL);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      method,
      headers,
      ...(data ? { body: JSON.stringify(data) } : {}),
    });

    console.log("response", response);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `HTTP ${response.status} ${response.statusText}${errorText ? `: ${errorText}` : ""}`
      );
    }

    return { status: response.status, data: (await response.json()) as T };
  };
};

export const twentyFirstClient: HttpClient = {
  get: createMethod("GET"),
  post: createMethod("POST"),
  put: createMethod("PUT"),
  delete: createMethod("DELETE"),
  patch: createMethod("PATCH"),
};
