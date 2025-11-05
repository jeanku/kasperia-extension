import { withSignedParams, mergeUrlParams } from '@/utils/util'

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface HttpClientOptions {
    headers?: Record<string, string>;
}

interface RequestConfig extends RequestInit {
    params?: Record<string, any>;
}

class HttpClient {
    private defaultHeaders: Record<string, string>;

    constructor(options: HttpClientOptions = {}) {
        this.defaultHeaders = options.headers || {
            "Content-Type": "application/json",
        };
    }

    private buildUrl(url: string, params?: Record<string, any>): string {
        if (!params) return url;

        const queryString = Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null)
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join("&");
                }
                return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            })
            .join("&");

        return queryString ? `${url}?${queryString}` : url;
    }

    private async request<T>(
        method: HttpMethod,
        url: string,
        config: RequestConfig = {}
    ): Promise<T> {
        const { headers, body, params, ...rest } = config;

        const finalUrl = this.buildUrl(url, params);
        const finalHeaders = { ...this.defaultHeaders, ...headers };

        const requestConfig: RequestInit = {
            method,
            headers: finalHeaders,
            ...rest,
        };

        if (body && ["POST", "PUT", "PATCH"].includes(method)) {
            requestConfig.body = JSON.stringify(body);
        }

        const response = await fetch(finalUrl, requestConfig);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        try {
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                return (await response.json()) as T;
            } else {
                return (await response.text()) as unknown as T;
            }
        } catch (error: any) {
            throw new Error(`Failed to parse response: ${error.message}`);
        }
    }

    get<T>(
        url: string,
        params?: Record<string, any>,
        config?: Omit<RequestConfig, "body" | "method" | "params">,
        isSign?: boolean,
    ): Promise<T> {
        let newParams = params
        if(isSign) {
            const { mergedParams } = mergeUrlParams(url, params);
            newParams = withSignedParams(mergedParams);
        }
        return this.request<T>("GET", url, { ...config, params: newParams });
    }

    post<T>(
        url: string,
        body?: any,
        config?: Omit<RequestConfig, "body" | "method">
    ): Promise<T> {
        return this.request<T>("POST", url, { ...config, body });
    }

    put<T>(
        url: string,
        body?: any,
        config?: Omit<RequestConfig, "body" | "method">
    ): Promise<T> {
        return this.request<T>("PUT", url, { ...config, body });
    }

    delete<T>(
        url: string,
        config?: Omit<RequestConfig, "body" | "method">
    ): Promise<T> {
        return this.request<T>("DELETE", url, config);
    }
}

export { HttpClient } ;
