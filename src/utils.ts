/**
 * Utility functions for MCP Meraki Server
 * Provides retry logic, pagination, and other helper functions
 */

import { AxiosError } from 'axios';

// ============================================================================
// Logging Utilities
// ============================================================================

const DEBUG = process.env.DEBUG === 'true';

export function log(message: string, ...args: unknown[]): void {
  if (DEBUG) {
    console.error(`[MCP-Meraki] ${message}`, ...args);
  }
}

export function logError(message: string, error: unknown): void {
  console.error(`[MCP-Meraki ERROR] ${message}`, error);
}

export function logSuccess(message: string, data?: unknown): void {
  if (DEBUG) {
    console.error(`[MCP-Meraki SUCCESS] ${message}`, data || '');
  }
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

export interface MerakiAPIError {
  status: number;
  statusText: string;
  message: string;
  errors?: string[];
  endpoint?: string;
}

export function formatError(error: unknown, endpoint?: string): MerakiAPIError {
  if (error instanceof AxiosError) {
    const status = error.response?.status || 500;
    const statusText = error.response?.statusText || 'Internal Server Error';
    const errors = error.response?.data?.errors || [];
    const message = errors.length > 0
      ? errors.join(', ')
      : error.message || 'An unknown error occurred';

    return {
      status,
      statusText,
      message,
      errors,
      endpoint
    };
  }

  return {
    status: 500,
    statusText: 'Internal Server Error',
    message: error instanceof Error ? error.message : 'An unknown error occurred',
    endpoint
  };
}

export function isRateLimitError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 429;
  }
  return false;
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    // Retry on rate limits and server errors
    return status === 429 || (status !== undefined && status >= 500);
  }
  return false;
}

// ============================================================================
// Retry Logic with Exponential Backoff
// ============================================================================

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffFactor: 2
};

/**
 * Executes a function with retry logic and exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === opts.maxRetries || !isRetryableError(error)) {
        throw error;
      }

      const delay = Math.min(
        opts.initialDelayMs * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelayMs
      );

      if (isRateLimitError(error)) {
        log(`Rate limit hit, waiting ${delay}ms before retry ${attempt + 1}/${opts.maxRetries}`);
      } else {
        log(`Request failed, retrying in ${delay}ms (${attempt + 1}/${opts.maxRetries})`);
      }

      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// Pagination Utilities
// ============================================================================

export interface PaginationInfo {
  hasMore: boolean;
  startingAfter?: string;
  endingBefore?: string;
}

/**
 * Parses pagination info from Link headers
 * Meraki uses Link headers for pagination: <url>; rel="next"
 */
export function parseLinkHeader(linkHeader: string | undefined): PaginationInfo {
  if (!linkHeader) {
    return { hasMore: false };
  }

  const links: Record<string, string> = {};
  const parts = linkHeader.split(',');

  for (const part of parts) {
    const match = part.match(/<([^>]+)>;\s*rel="([^"]+)"/);
    if (match) {
      const [, url, rel] = match;
      links[rel] = url;
    }
  }

  const hasMore = 'next' in links || 'prev' in links;

  // Extract startingAfter from next link
  let startingAfter: string | undefined;
  if (links.next) {
    const url = new URL(links.next);
    startingAfter = url.searchParams.get('startingAfter') || undefined;
  }

  // Extract endingBefore from prev link
  let endingBefore: string | undefined;
  if (links.prev) {
    const url = new URL(links.prev);
    endingBefore = url.searchParams.get('endingBefore') || undefined;
  }

  return {
    hasMore,
    startingAfter,
    endingBefore
  };
}

/**
 * Auto-paginate through all results
 */
export async function autoPaginate<T>(
  fetcher: (startingAfter?: string) => Promise<{ data: T[]; linkHeader?: string }>,
  maxPages = 100
): Promise<T[]> {
  const results: T[] = [];
  let startingAfter: string | undefined;
  let pageCount = 0;

  while (pageCount < maxPages) {
    const { data, linkHeader } = await fetcher(startingAfter);
    results.push(...data);

    const paginationInfo = parseLinkHeader(linkHeader);

    if (!paginationInfo.hasMore || !paginationInfo.startingAfter) {
      break;
    }

    startingAfter = paginationInfo.startingAfter;
    pageCount++;

    // Small delay between pages to avoid rate limiting
    await sleep(200);
  }

  if (pageCount >= maxPages) {
    log(`Warning: Reached maximum page limit (${maxPages}). There may be more results.`);
  }

  return results;
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validates if a string is a valid organization ID
 */
export function isValidOrgId(orgId: string): boolean {
  return /^\d+$/.test(orgId);
}

/**
 * Validates if a string is a valid network ID
 */
export function isValidNetworkId(networkId: string): boolean {
  return /^[LN]_\d+$/.test(networkId);
}

/**
 * Validates if a string is a valid device serial number
 */
export function isValidSerial(serial: string): boolean {
  return /^[A-Z0-9]{4,}-[A-Z0-9]{4,}-[A-Z0-9]{4,}$/.test(serial);
}

/**
 * Validates required parameters
 */
export function validateRequired<T>(
  params: Record<string, T>,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter(field => !params[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required parameters: ${missing.join(', ')}`);
  }
}

// ============================================================================
// Format Utilities
// ============================================================================

/**
 * Formats data for pretty JSON output
 */
export function formatJSON(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Formats a list of items into a readable table format
 */
export function formatTable<T extends Record<string, unknown>>(
  items: T[],
  columns: (keyof T)[]
): string {
  if (items.length === 0) {
    return 'No results found.';
  }

  const headers = columns.map(String);
  const rows = items.map(item =>
    columns.map(col => String(item[col] ?? ''))
  );

  // Calculate column widths
  const widths = headers.map((header, i) =>
    Math.max(
      header.length,
      ...rows.map(row => row[i].length)
    )
  );

  // Format header
  const headerRow = headers
    .map((header, i) => header.padEnd(widths[i]))
    .join(' | ');

  const separator = widths
    .map(width => '-'.repeat(width))
    .join('-|-');

  // Format rows
  const dataRows = rows
    .map(row =>
      row.map((cell, i) => cell.padEnd(widths[i])).join(' | ')
    )
    .join('\n');

  return `${headerRow}\n${separator}\n${dataRows}`;
}

/**
 * Truncates a string to a maximum length
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}

// ============================================================================
// Cache Utilities
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttlMs: number;

  constructor(ttlMs: number = 5 * 60 * 1000) { // Default 5 minutes
    this.ttlMs = ttlMs;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    const age = Date.now() - entry.timestamp;
    if (age > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }
}
