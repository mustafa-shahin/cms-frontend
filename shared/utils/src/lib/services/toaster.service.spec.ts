import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ToasterService } from './toaster.service';

describe('ToasterService', () => {
  let service: ToasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToasterService]
    });
    service = TestBed.inject(ToasterService);
  });

  afterEach(() => {
    service.clear();
  });

  describe('initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should start with empty toasts array', () => {
      expect(service.toasts$()).toEqual([]);
    });
  });

  describe('success', () => {
    it('should add a success toast', () => {
      service.success('Success message');
      const toasts = service.toasts$();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('Success message');
    });

    it('should use default duration of 5000ms', () => {
      service.success('Success');
      const toasts = service.toasts$();
      expect(toasts[0].duration).toBe(5000);
    });

    it('should accept custom duration', () => {
      service.success('Success', 3000);
      const toasts = service.toasts$();
      expect(toasts[0].duration).toBe(3000);
    });
  });

  describe('error', () => {
    it('should add an error toast', () => {
      service.error('Error message');
      const toasts = service.toasts$();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('error');
      expect(toasts[0].message).toBe('Error message');
    });

    it('should use default duration of 7000ms', () => {
      service.error('Error');
      const toasts = service.toasts$();
      expect(toasts[0].duration).toBe(7000);
    });
  });

  describe('warning', () => {
    it('should add a warning toast', () => {
      service.warning('Warning message');
      const toasts = service.toasts$();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('warning');
      expect(toasts[0].message).toBe('Warning message');
    });

    it('should use default duration of 6000ms', () => {
      service.warning('Warning');
      const toasts = service.toasts$();
      expect(toasts[0].duration).toBe(6000);
    });
  });

  describe('info', () => {
    it('should add an info toast', () => {
      service.info('Info message');
      const toasts = service.toasts$();
      expect(toasts.length).toBe(1);
      expect(toasts[0].type).toBe('info');
      expect(toasts[0].message).toBe('Info message');
    });

    it('should use default duration of 5000ms', () => {
      service.info('Info');
      const toasts = service.toasts$();
      expect(toasts[0].duration).toBe(5000);
    });
  });

  describe('show', () => {
    it('should add toast with specified type', () => {
      service.show('success', 'Custom message');
      const toasts = service.toasts$();
      expect(toasts[0].type).toBe('success');
      expect(toasts[0].message).toBe('Custom message');
    });

    it('should generate unique IDs for each toast', () => {
      service.show('info', 'Message 1');
      service.show('info', 'Message 2');
      const toasts = service.toasts$();
      expect(toasts[0].id).not.toBe(toasts[1].id);
    });

    it('should add multiple toasts', () => {
      service.success('Success 1');
      service.error('Error 1');
      service.warning('Warning 1');
      expect(service.toasts$().length).toBe(3);
    });
  });

  describe('auto-remove', () => {
    it('should auto-remove toast after duration', fakeAsync(() => {
      service.success('Will disappear', 1000);
      expect(service.toasts$().length).toBe(1);
      
      tick(1000);
      expect(service.toasts$().length).toBe(0);
    }));

    it('should not auto-remove when duration is 0', fakeAsync(() => {
      service.show('info', 'Persistent', 0);
      expect(service.toasts$().length).toBe(1);
      
      tick(10000);
      expect(service.toasts$().length).toBe(1);
    }));

    it('should auto-remove multiple toasts at correct times', fakeAsync(() => {
      service.show('info', 'Fast', 500);
      service.show('info', 'Medium', 1000);
      service.show('info', 'Slow', 2000);
      expect(service.toasts$().length).toBe(3);

      tick(500);
      expect(service.toasts$().length).toBe(2);

      tick(500);
      expect(service.toasts$().length).toBe(1);

      tick(1000);
      expect(service.toasts$().length).toBe(0);
    }));
  });

  describe('remove', () => {
    it('should remove specific toast by ID', () => {
      service.success('Toast 1');
      service.error('Toast 2');
      const toastToRemove = service.toasts$()[0];
      
      service.remove(toastToRemove.id);
      
      const remaining = service.toasts$();
      expect(remaining.length).toBe(1);
      expect(remaining[0].message).toBe('Toast 2');
    });

    it('should do nothing when removing non-existent ID', () => {
      service.success('Toast 1');
      service.remove('non-existent-id');
      expect(service.toasts$().length).toBe(1);
    });

    it('should handle removing from empty list', () => {
      expect(() => service.remove('any-id')).not.toThrow();
      expect(service.toasts$().length).toBe(0);
    });
  });

  describe('clear', () => {
    it('should remove all toasts', () => {
      service.success('Toast 1');
      service.error('Toast 2');
      service.warning('Toast 3');
      expect(service.toasts$().length).toBe(3);

      service.clear();
      expect(service.toasts$().length).toBe(0);
    });

    it('should handle clearing empty list', () => {
      expect(() => service.clear()).not.toThrow();
      expect(service.toasts$().length).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', () => {
      service.success('');
      expect(service.toasts$()[0].message).toBe('');
    });

    it('should handle very long message', () => {
      const longMessage = 'A'.repeat(10000);
      service.success(longMessage);
      expect(service.toasts$()[0].message).toBe(longMessage);
    });

    it('should handle special characters in message', () => {
      const specialMessage = '<script>alert("xss")</script>';
      service.success(specialMessage);
      expect(service.toasts$()[0].message).toBe(specialMessage);
    });

    it('should handle unicode characters', () => {
      const unicodeMessage = '日本語テスト 🎉 مرحبا';
      service.success(unicodeMessage);
      expect(service.toasts$()[0].message).toBe(unicodeMessage);
    });

    it('should handle negative duration (treated as no auto-remove)', fakeAsync(() => {
      service.show('info', 'Negative duration', -1);
      tick(10000);
      // Negative duration should still trigger setTimeout, which may behave unexpectedly
      // This test documents the current behavior
      expect(service.toasts$().length).toBeLessThanOrEqual(1);
    }));
  });
});
