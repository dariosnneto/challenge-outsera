import { APIRequestContext, APIResponse } from '@playwright/test';

export interface ApiResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  body: T | undefined;
  raw: APIResponse;
}

export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string
  ) {}

  private async toApiResponse<T>(response: APIResponse): Promise<ApiResponse<T>> {
    let body: T | undefined;
    try {
      body = await response.json() as T;
    } catch {
      body = undefined;
    }
    return {
      status: response.status(),
      headers: response.headers(),
      body,
      raw: response,
    };
  }

  async get<T = unknown>(path: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${path}`;
    const response = await this.request.get(url, { params });
    return this.toApiResponse<T>(response);
  }

  async post<T = unknown>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${path}`;
    const response = await this.request.post(url, { data });
    return this.toApiResponse<T>(response);
  }

  async put<T = unknown>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${path}`;
    const response = await this.request.put(url, { data });
    return this.toApiResponse<T>(response);
  }

  async patch<T = unknown>(path: string, data?: unknown): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${path}`;
    const response = await this.request.patch(url, { data });
    return this.toApiResponse<T>(response);
  }

  async delete<T = unknown>(path: string): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${path}`;
    const response = await this.request.delete(url);
    return this.toApiResponse<T>(response);
  }
}
