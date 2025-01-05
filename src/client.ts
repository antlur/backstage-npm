import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { getGlobalConfig, BackstageUserConfig } from "./config";

export class BackstageClient {
  private instance: AxiosInstance;

  constructor(config?: BackstageUserConfig) {
    // If no config is passed, try to get from the global config
    const globalConfig = getGlobalConfig();
    const finalConfig = config || globalConfig;

    if (!finalConfig) {
      throw new Error("No Backstage config found. Please call defineConfig() or pass config to BackstageClient.");
    }

    // check for token and accountId in the config
    if (!finalConfig.token) {
      throw new Error("No token found in the Backstage config. Please provide a token.");
    }

    if (!finalConfig.accountId) {
      throw new Error("No accountId found in the Backstage config. Please provide an accountId.");
    }

    const { baseURL, token, onError } = finalConfig;

    this.instance = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Account-ID": finalConfig.accountId,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for debugging
    this.instance.interceptors.request.use((requestConfig) => {
      // console.log("Request:", {
      //   method: requestConfig.method,
      //   url: requestConfig.url,
      //   headers: requestConfig.headers,
      //   data: requestConfig.data,
      // });
      return requestConfig;
    });

    // Add response interceptor for debugging
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // console.error("API Error:", {
        //   status: error.response?.status,
        //   method: error.config?.method,
        //   url: error.config?.url,
        //   headers: error.config?.headers,
        //   data: error.response?.data,
        // });
        if (onError) onError(error);
        return Promise.reject(error);
      }
    );
  }

  public async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  public async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  public async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  public async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  public async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  public getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

export const client = function (config?: BackstageUserConfig): BackstageClient {
  return new BackstageClient(config);
};
