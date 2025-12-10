import { TestBed } from '@angular/core/testing';
import { EnvironmentService } from './environment.service';

describe('EnvironmentService', () => {
  let service: EnvironmentService;

  beforeEach(() => {
    // Clear window.__env before each test
    (window as any).__env = {};
    
    TestBed.configureTestingModule({
      providers: [EnvironmentService]
    });
    service = TestBed.inject(EnvironmentService);
  });

  afterEach(() => {
    // Clean up
    delete (window as any).__env;
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with empty env when window.__env is undefined', () => {
      delete (window as any).__env;
      const freshService = new EnvironmentService();
      expect(freshService.apiUrl).toBe('https://localhost:7209/api');
    });
  });

  describe('apiUrl', () => {
    it('should return default apiUrl when not set in env', () => {
      expect(service.apiUrl).toBe('https://localhost:7209/api');
    });

    it('should return custom apiUrl when set in env', () => {
      (window as any).__env.apiUrl = 'https://custom-api.example.com';
      const freshService = new EnvironmentService();
      expect(freshService.apiUrl).toBe('https://custom-api.example.com');
    });
  });

  describe('apiVersion', () => {
    it('should return default apiVersion when not set in env', () => {
      expect(service.apiVersion).toBe('v1');
    });

    it('should return custom apiVersion when set in env', () => {
      (window as any).__env.apiVersion = 'v2';
      const freshService = new EnvironmentService();
      expect(freshService.apiVersion).toBe('v2');
    });
  });

  describe('production', () => {
    it('should return false when not set in env', () => {
      expect(service.production).toBe(false);
    });

    it('should return true when set to true in env', () => {
      (window as any).__env.production = true;
      const freshService = new EnvironmentService();
      expect(freshService.production).toBe(true);
    });
  });

  describe('get', () => {
    it('should return value when key exists', () => {
      (window as any).__env.customKey = 'customValue';
      const freshService = new EnvironmentService();
      expect(freshService.get('customKey')).toBe('customValue');
    });

    it('should return undefined when key does not exist and no default', () => {
      expect(service.get('nonExistentKey')).toBeUndefined();
    });

    it('should return default value when key does not exist', () => {
      expect(service.get('nonExistentKey', 'defaultValue')).toBe('defaultValue');
    });

    it('should return null when key is set to null', () => {
      (window as any).__env.nullKey = null;
      const freshService = new EnvironmentService();
      expect(freshService.get('nullKey', 'default')).toBe('default');
    });

    it('should return 0 when key is set to 0 (falsy but valid)', () => {
      (window as any).__env.zeroKey = 0;
      const freshService = new EnvironmentService();
      expect(freshService.get('zeroKey', 100)).toBe(0);
    });

    it('should return empty string when key is set to empty string', () => {
      (window as any).__env.emptyKey = '';
      const freshService = new EnvironmentService();
      expect(freshService.get('emptyKey', 'default')).toBe('');
    });
  });

  describe('set', () => {
    it('should set a new key-value pair', () => {
      service.set('newKey', 'newValue');
      expect(service.get('newKey')).toBe('newValue');
    });

    it('should override existing value', () => {
      service.set('testKey', 'value1');
      service.set('testKey', 'value2');
      expect(service.get('testKey')).toBe('value2');
    });

    it('should handle setting complex objects', () => {
      const complexObject = { nested: { value: 42 } };
      service.set('complexKey', complexObject);
      expect(service.get('complexKey')).toEqual(complexObject);
    });
  });

  describe('getApiUrl', () => {
    it('should construct full API URL with endpoint', () => {
      const url = service.getApiUrl('users');
      expect(url).toBe('https://localhost:7209/api/v1/users');
    });

    it('should handle endpoint with leading slash', () => {
      const url = service.getApiUrl('/users');
      expect(url).toBe('https://localhost:7209/api/v1/users');
    });

    it('should handle nested endpoints', () => {
      const url = service.getApiUrl('users/123/profile');
      expect(url).toBe('https://localhost:7209/api/v1/users/123/profile');
    });

    it('should use custom apiUrl and apiVersion', () => {
      (window as any).__env.apiUrl = 'https://api.example.com';
      (window as any).__env.apiVersion = 'v3';
      const freshService = new EnvironmentService();
      const url = freshService.getApiUrl('data');
      expect(url).toBe('https://api.example.com/v3/data');
    });

    it('should handle empty endpoint', () => {
      const url = service.getApiUrl('');
      expect(url).toBe('https://localhost:7209/api/v1/');
    });

    it('should handle endpoint with query params', () => {
      const url = service.getApiUrl('users?page=1&size=10');
      expect(url).toBe('https://localhost:7209/api/v1/users?page=1&size=10');
    });
  });
});
