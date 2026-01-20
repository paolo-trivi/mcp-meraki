/**
 * Meraki Dashboard API Client
 * Handles authentication, rate limiting, and HTTP requests to Meraki API
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { log, logError, logSuccess, withRetry, formatError, SimpleCache } from './utils.js';

// ============================================================================
// Rate Limiter
// ============================================================================

class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number; // tokens per second

  constructor(requestsPerSecond: number = 5) {
    this.maxTokens = requestsPerSecond;
    this.tokens = requestsPerSecond;
    this.refillRate = requestsPerSecond;
    this.lastRefill = Date.now();
  }

  private refill(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000;
    const tokensToAdd = timePassed * this.refillRate;

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  async acquire(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return;
    }

    // Wait until we have a token
    const waitTime = ((1 - this.tokens) / this.refillRate) * 1000;
    log(`Rate limit: waiting ${Math.ceil(waitTime)}ms`);
    await new Promise(resolve => setTimeout(resolve, waitTime));

    this.refill();
    this.tokens -= 1;
  }
}

// ============================================================================
// Meraki Client
// ============================================================================

export interface MerakiClientConfig {
  apiKey: string;
  baseURL?: string;
  timeout?: number;
  rateLimit?: number;
}

export class MerakiClient {
  private axiosInstance: AxiosInstance;
  private rateLimiter: RateLimiter;
  private cache: SimpleCache<unknown>;

  constructor(config: MerakiClientConfig) {
    const {
      apiKey,
      baseURL = 'https://api.meraki.com/api/v1',
      timeout = 30000,
      rateLimit = 5
    } = config;

    if (!apiKey) {
      throw new Error('Meraki API key is required');
    }

    this.axiosInstance = axios.create({
      baseURL,
      timeout,
      headers: {
        'X-Cisco-Meraki-API-Key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.rateLimiter = new RateLimiter(rateLimit);
    this.cache = new SimpleCache<unknown>(5 * 60 * 1000); // 5 minutes cache

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logError('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        logSuccess(
          `API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`,
          `Status: ${response.status}`
        );
        return response;
      },
      (error) => {
        const formattedError = formatError(
          error,
          error.config?.url
        );
        logError(
          `API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          formattedError
        );
        return Promise.reject(error);
      }
    );
  }

  /**
   * Generic GET request with caching and rate limiting
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    useCache = true
  ): Promise<T> {
    const cacheKey = `GET:${endpoint}:${JSON.stringify(params || {})}`;

    // Check cache first
    if (useCache) {
      const cached = this.cache.get(cacheKey) as T | undefined;
      if (cached) {
        log(`Cache hit: ${endpoint}`);
        return cached;
      }
    }

    await this.rateLimiter.acquire();

    const result = await withRetry(async () => {
      const response = await this.axiosInstance.get<T>(endpoint, { params });
      return response.data;
    });

    // Cache the result
    if (useCache) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Generic GET request that returns both data and headers (for pagination)
   */
  async getWithHeaders<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<{ data: T; headers: Record<string, string> }> {
    await this.rateLimiter.acquire();

    const response = await withRetry(async () => {
      return await this.axiosInstance.get<T>(endpoint, { params });
    });

    return {
      data: response.data,
      headers: response.headers as Record<string, string>
    };
  }

  /**
   * Generic POST request with rate limiting
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    await this.rateLimiter.acquire();

    // Invalidate related cache entries
    this.invalidateCache(endpoint);

    const result = await withRetry(async () => {
      const response = await this.axiosInstance.post<T>(endpoint, data, config);
      return response.data;
    });

    return result;
  }

  /**
   * Generic PUT request with rate limiting
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    await this.rateLimiter.acquire();

    // Invalidate related cache entries
    this.invalidateCache(endpoint);

    const result = await withRetry(async () => {
      const response = await this.axiosInstance.put<T>(endpoint, data, config);
      return response.data;
    });

    return result;
  }

  /**
   * Generic DELETE request with rate limiting
   */
  async delete<T>(
    endpoint: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    await this.rateLimiter.acquire();

    // Invalidate related cache entries
    this.invalidateCache(endpoint);

    const result = await withRetry(async () => {
      const response = await this.axiosInstance.delete<T>(endpoint, config);
      return response.data;
    });

    return result;
  }

  /**
   * Generic PATCH request with rate limiting
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    await this.rateLimiter.acquire();

    // Invalidate related cache entries
    this.invalidateCache(endpoint);

    const result = await withRetry(async () => {
      const response = await this.axiosInstance.patch<T>(endpoint, data, config);
      return response.data;
    });

    return result;
  }

  /**
   * Invalidate cache entries related to an endpoint
   */
  private invalidateCache(endpoint: string): void {
    // Simple invalidation: clear entire cache
    // In production, you might want more granular invalidation
    this.cache.clear();
    log(`Cache cleared due to mutation: ${endpoint}`);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get the underlying axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let merakiClientInstance: MerakiClient | null = null;

export function getMerakiClient(): MerakiClient {
  if (!merakiClientInstance) {
    throw new Error('Meraki client not initialized. Call initMerakiClient first.');
  }
  return merakiClientInstance;
}

export function initMerakiClient(config: MerakiClientConfig): MerakiClient {
  merakiClientInstance = new MerakiClient(config);
  return merakiClientInstance;
}
