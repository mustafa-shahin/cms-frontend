import { TestBed } from '@angular/core/testing';
import { HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { UserService } from './user.service';
import { ApiService } from './api.service';
import { UserRole, UserDto, UserListDto, CreateUserDto, UpdateUserDto, PaginatedResponse } from '@cms/shared/api-interfaces';

describe('UserService', () => {
  let service: UserService;
  let apiServiceSpy: jest.Mocked<ApiService>;

  const mockUser: UserDto = {
    id: 1,
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.EndUser,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z'
  };

  const mockUserList: UserListDto = {
    ...mockUser,
    fullName: 'John Doe'
  };

  const mockPaginatedResponse: PaginatedResponse<UserListDto> = {
    success: true,
    statusCode: 200,
    items: [mockUserList],
    totalCount: 1,
    totalPages: 1,
    pageNumber: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPreviousPage: false,
    timestamp: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    const spy = {
      get: jest.fn(),
      getPaginated: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: ApiService, useValue: spy }
      ]
    });

    service = TestBed.inject(UserService);
    apiServiceSpy = TestBed.inject(ApiService) as jest.Mocked<ApiService>;
  });

  describe('getUsers', () => {
    it('should call getPaginated with default parameters', () => {
      apiServiceSpy.getPaginated.mockReturnValue(of(mockPaginatedResponse));

      service.getUsers().subscribe(response => {
        expect(response).toEqual(mockPaginatedResponse);
      });

      expect(apiServiceSpy.getPaginated).toHaveBeenCalledWith('users', {
        params: expect.any(HttpParams)
      });

      const callArgs = apiServiceSpy.getPaginated.mock.calls[0];
      const params = callArgs[1]?.params as HttpParams;
      expect(params.get('pageNumber')).toBe('1');
      expect(params.get('pageSize')).toBe('10');
      expect(params.get('sortDescending')).toBe('false');
    });

    it('should pass custom pagination parameters', () => {
      apiServiceSpy.getPaginated.mockReturnValue(of(mockPaginatedResponse));

      service.getUsers(2, 25).subscribe();

      const callArgs = apiServiceSpy.getPaginated.mock.calls[0];
      const params = callArgs[1]?.params as HttpParams;
      expect(params.get('pageNumber')).toBe('2');
      expect(params.get('pageSize')).toBe('25');
    });

    it('should include searchTerm when provided', () => {
      apiServiceSpy.getPaginated.mockReturnValue(of(mockPaginatedResponse));

      service.getUsers(1, 10, 'john').subscribe();

      const callArgs = apiServiceSpy.getPaginated.mock.calls[0];
      const params = callArgs[1]?.params as HttpParams;
      expect(params.get('searchTerm')).toBe('john');
    });

    it('should include roleFilter when provided', () => {
      apiServiceSpy.getPaginated.mockReturnValue(of(mockPaginatedResponse));

      service.getUsers(1, 10, undefined, UserRole.Admin).subscribe();

      const callArgs = apiServiceSpy.getPaginated.mock.calls[0];
      const params = callArgs[1]?.params as HttpParams;
      expect(params.get('roleFilter')).toBe(String(UserRole.Admin));
    });

    it('should include isActiveFilter when provided', () => {
      apiServiceSpy.getPaginated.mockReturnValue(of(mockPaginatedResponse));

      service.getUsers(1, 10, undefined, undefined, true).subscribe();

      const callArgs = apiServiceSpy.getPaginated.mock.calls[0];
      const params = callArgs[1]?.params as HttpParams;
      expect(params.get('isActiveFilter')).toBe('true');
    });

    it('should include sortBy when provided', () => {
      apiServiceSpy.getPaginated.mockReturnValue(of(mockPaginatedResponse));

      service.getUsers(1, 10, undefined, undefined, undefined, 'createdAt').subscribe();

      const callArgs = apiServiceSpy.getPaginated.mock.calls[0];
      const params = callArgs[1]?.params as HttpParams;
      expect(params.get('sortBy')).toBe('createdAt');
    });

    it('should include sortDescending flag', () => {
      apiServiceSpy.getPaginated.mockReturnValue(of(mockPaginatedResponse));

      service.getUsers(1, 10, undefined, undefined, undefined, 'name', true).subscribe();

      const callArgs = apiServiceSpy.getPaginated.mock.calls[0];
      const params = callArgs[1]?.params as HttpParams;
      expect(params.get('sortDescending')).toBe('true');
    });

    it('should handle all parameters together', () => {
      apiServiceSpy.getPaginated.mockReturnValue(of(mockPaginatedResponse));

      service.getUsers(3, 50, 'admin', UserRole.Admin, false, 'email', true).subscribe();

      const callArgs = apiServiceSpy.getPaginated.mock.calls[0];
      const params = callArgs[1]?.params as HttpParams;
      expect(params.get('pageNumber')).toBe('3');
      expect(params.get('pageSize')).toBe('50');
      expect(params.get('searchTerm')).toBe('admin');
      expect(params.get('roleFilter')).toBe(String(UserRole.Admin));
      expect(params.get('isActiveFilter')).toBe('false');
      expect(params.get('sortBy')).toBe('email');
      expect(params.get('sortDescending')).toBe('true');
    });

    it('should not include undefined optional parameters', () => {
      apiServiceSpy.getPaginated.mockReturnValue(of(mockPaginatedResponse));

      service.getUsers(1, 10).subscribe();

      const callArgs = apiServiceSpy.getPaginated.mock.calls[0];
      const params = callArgs[1]?.params as HttpParams;
      expect(params.has('searchTerm')).toBe(false);
      expect(params.has('roleFilter')).toBe(false);
      expect(params.has('isActiveFilter')).toBe(false);
      expect(params.has('sortBy')).toBe(false);
    });
  });

  describe('getUser', () => {
    it('should call get with user ID', () => {
      apiServiceSpy.get.mockReturnValue(of(mockUser));

      service.getUser(1).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      expect(apiServiceSpy.get).toHaveBeenCalledWith('users/1');
    });

    it('should handle different user IDs', () => {
      apiServiceSpy.get.mockReturnValue(of(mockUser));

      service.getUser(999).subscribe();

      expect(apiServiceSpy.get).toHaveBeenCalledWith('users/999');
    });
  });

  describe('createUser', () => {
    it('should call post with user data', () => {
      const createDto: CreateUserDto = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Doe',
        role: UserRole.EndUser
      };
      apiServiceSpy.post.mockReturnValue(of(mockUser));

      service.createUser(createDto).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      expect(apiServiceSpy.post).toHaveBeenCalledWith('users', createDto);
    });
  });

  describe('updateUser', () => {
    it('should call put with user ID and data', () => {
      const updateDto: UpdateUserDto = {
        id: 1,
        firstName: 'Updated',
        lastName: 'Name',
        role: UserRole.Developer,
        isActive: true
      };
      apiServiceSpy.put.mockReturnValue(of({ ...mockUser, ...updateDto }));

      service.updateUser(1, updateDto).subscribe(user => {
        expect(user.firstName).toBe('Updated');
      });

      expect(apiServiceSpy.put).toHaveBeenCalledWith('users/1', updateDto);
    });
  });

  describe('deleteUser', () => {
    it('should call delete with user ID', () => {
      apiServiceSpy.delete.mockReturnValue(of(void 0));

      service.deleteUser(1).subscribe();

      expect(apiServiceSpy.delete).toHaveBeenCalledWith('users/1');
    });
  });

  describe('activateUser', () => {
    it('should call post to activate endpoint', () => {
      apiServiceSpy.post.mockReturnValue(of(void 0));

      service.activateUser(1).subscribe();

      expect(apiServiceSpy.post).toHaveBeenCalledWith('users/1/activate', {});
    });
  });

  describe('deactivateUser', () => {
    it('should call post to deactivate endpoint', () => {
      apiServiceSpy.post.mockReturnValue(of(void 0));

      service.deactivateUser(1).subscribe();

      expect(apiServiceSpy.post).toHaveBeenCalledWith('users/1/deactivate', {});
    });
  });

  describe('edge cases', () => {
    it('should handle empty search term', () => {
      apiServiceSpy.getPaginated.mockReturnValue(of(mockPaginatedResponse));

      service.getUsers(1, 10, '').subscribe();

      const callArgs = apiServiceSpy.getPaginated.mock.calls[0];
      const params = callArgs[1]?.params as HttpParams;
      // Empty string should not be added
      expect(params.has('searchTerm')).toBe(false);
    });

    it('should handle roleFilter of 0 (EndUser)', () => {
      apiServiceSpy.getPaginated.mockReturnValue(of(mockPaginatedResponse));

      service.getUsers(1, 10, undefined, UserRole.EndUser).subscribe();

      const callArgs = apiServiceSpy.getPaginated.mock.calls[0];
      const params = callArgs[1]?.params as HttpParams;
      expect(params.get('roleFilter')).toBe('0');
    });

    it('should handle isActiveFilter of false', () => {
      apiServiceSpy.getPaginated.mockReturnValue(of(mockPaginatedResponse));

      service.getUsers(1, 10, undefined, undefined, false).subscribe();

      const callArgs = apiServiceSpy.getPaginated.mock.calls[0];
      const params = callArgs[1]?.params as HttpParams;
      expect(params.get('isActiveFilter')).toBe('false');
    });
  });
});
