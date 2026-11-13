export const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");

export class ApiError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
    signal?: AbortSignal;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const headers = new Headers();

    if (options.body !== undefined) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: options.method ?? "GET",
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        credentials: "include",
        signal: options.signal,
    });

    if (!response.ok) {
        if (response.status === 401) {
            window.dispatchEvent(new Event("auth:unauthorized"));
        }

        let message = response.statusText || "Request failed";
        try {
            const payload = (await response.json()) as { message?: string; error?: string };
            message = payload.message ?? payload.error ?? message;
        } catch {
            // The response did not contain a JSON error body.
        }

        throw new ApiError(message, response.status);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
    get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: "POST", body }),
    put: <T>(path: string, body?: unknown) => request<T>(path, { method: "PUT", body }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
