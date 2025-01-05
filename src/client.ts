import { getGlobalConfig, BackstageUserConfig } from "./config";

type RequestConfig = {
  headers?: Record<string, string>;
  body?: any;
  method?: string;
  signal?: AbortSignal;
};

type RequestInterceptor = (config: RequestConfig) => RequestConfig;
type ResponseInterceptor = (response: Response) => Promise<Response>;
type ErrorHandler = (error: Error) => void;

export class BackstageClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorHandler?: ErrorHandler;

  constructor(config?: BackstageUserConfig) {
    const globalConfig = getGlobalConfig();
    const finalConfig = config || globalConfig;

    if (!finalConfig) {
      throw new Error("No Backstage config found. Please call defineConfig() or pass config to BackstageClient.");
    }

    if (!finalConfig.token) {
      throw new Error("No token found in the Backstage config. Please provide a token.");
    }

    if (!finalConfig.accountId) {
      throw new Error("No accountId found in the Backstage config. Please provide an accountId.");
    }

    const { baseURL, token, onError } = finalConfig;
    this.baseURL = baseURL;
    this.errorHandler = onError;
    this.defaultHeaders = {
      Authorization: `Bearer ${token}`,
      "X-Account-ID": finalConfig.accountId,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    // Add request interceptor for debugging
    this.requestInterceptors.push((config) => {
      console.log("Request:", {
        method: config.method,
        url: config.url,
        headers: config.headers,
        body: config.body,
      });
      return config;
    });
  }

  private async request<T>(url: string, config: RequestConfig = {}): Promise<T> {
    let finalConfig = {
      ...config,
      headers: { ...this.defaultHeaders, ...config.headers },
      cache: "force-cache",
    };

    // Apply request interceptors
    for (const interceptor of this.requestInterceptors) {
      finalConfig = interceptor(finalConfig);
    }

    try {
      let response = await fetch(`${this.baseURL}${url}`, finalConfig);

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        response = await interceptor(response);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (this.errorHandler) {
        this.errorHandler(error as Error);
      }
      throw error;
    }
  }

  public async get<T = unknown>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  public async post<T = unknown>(url: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: "POST", body: JSON.stringify(data) });
  }

  public async put<T = unknown>(url: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: "PUT", body: JSON.stringify(data) });
  }

  public async patch<T = unknown>(url: string, data?: unknown, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: "PATCH", body: JSON.stringify(data) });
  }

  public async delete<T = unknown>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }
}

export const client = function (config?: BackstageUserConfig): BackstageClient {
  return new BackstageClient(config);
};
