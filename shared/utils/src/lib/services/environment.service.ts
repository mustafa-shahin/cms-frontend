import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private env: any;

  constructor() {
    // Environment will be injected at runtime
    this.env = (window as any).__env || {};
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

  get<T = any>(key: string, defaultValue?: T): T {
    return this.env[key] ?? defaultValue;
  }

  set(key: string, value: any): void {
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
