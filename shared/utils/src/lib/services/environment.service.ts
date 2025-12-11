import { Injectable } from '@angular/core';

// Type-safe interface for environment configuration
interface EnvironmentConfig {
  apiUrl?: string;
  apiVersion?: string;
  production?: boolean;
  [key: string]: unknown;
}

interface WindowWithEnv extends Window {
  __env?: EnvironmentConfig;
}

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private env: EnvironmentConfig;

  constructor() {
    // Environment will be injected at runtime
    this.env = (window as WindowWithEnv).__env || {};
  }

  get apiUrl(): string {
    return this.env.apiUrl || 'https://localhost:7209/api';
  }

  get apiVersion(): string {
    return this.env.apiVersion || 'v1';
  }

  get production(): boolean {
    return this.env.production || false;
  }

  get<T = unknown>(key: string, defaultValue?: T): T {
    return (this.env[key] as T) ?? (defaultValue as T);
  }

  set(key: string, value: unknown): void {
    this.env[key] = value;
  }

  getApiUrl(endpoint: string): string {
    const version = this.apiVersion;
    const cleanEndpoint = endpoint.startsWith('/')
      ? endpoint.substring(1)
      : endpoint;
    return `${this.apiUrl}/${version}/${cleanEndpoint}`;
  }
}
