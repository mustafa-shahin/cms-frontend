import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserListComponent } from './user-list.component';
import { UserService, TranslationService, ToasterService } from '@cms/shared/utils';
import { UserListDto, UserRole, PaginatedResponse } from '@cms/shared/api-interfaces';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// Mock child components
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'cms-user-form', standalone: true, template: '' })
class MockUserFormComponent {
  @Input() user: UserListDto | null = null;
  @Output() cancelled = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
}

describe('UserListComponent', () => {
  let component: UserListComponent;
  let fixture: ComponentFixture<UserListComponent>;
  let mockUserService: Partial<UserService>;
  let mockTranslationService: Partial<TranslationService>;
  let mockToasterService: Partial<ToasterService>;

  const mockUsers: UserListDto[] = [
    {
      id: 1,
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User',
      fullName: 'Admin User',
      role: UserRole.Admin,
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      email: 'user@test.com',
      firstName: 'End',
      lastName: 'User',
      fullName: 'End User',
      role: UserRole.EndUser,
      isActive: false,
      createdAt: new Date().toISOString()
    }
  ];

  const mockResponse: PaginatedResponse<UserListDto> = {
    items: mockUsers,
    totalCount: 2,
    pageNumber: 1,
    pageSize: 10,
    hasNextPage: false,
    hasPreviousPage: false,
    success: true,
    statusCode: 200,
    totalPages: 1,
    timestamp: new Date().toISOString()
  };

  beforeEach(async () => {
    mockUserService = {
      getUsers: jest.fn().mockReturnValue(of(mockResponse)),
      activateUser: jest.fn().mockReturnValue(of(void 0)),
      deactivateUser: jest.fn().mockReturnValue(of(void 0)),
      deleteUser: jest.fn().mockReturnValue(of(void 0))
    };

    mockTranslationService = {
      instant: jest.fn((key: string) => key)
    };

    mockToasterService = {
      success: jest.fn(),
      error: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UserListComponent, NoopAnimationsModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: ToasterService, useValue: mockToasterService }
      ]
    })
    .overrideComponent(UserListComponent, {
      remove: { imports: [MockUserFormComponent] },
      add: { imports: [MockUserFormComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Loading & Navigation', () => {
    it('should load users on init', () => {
      expect(mockUserService.getUsers).toHaveBeenCalledWith(1, 10, '');
      expect(component.users).toEqual(mockUsers);
      expect(component.totalCount).toBe(2);
    });

    it('should handle load error', () => {
      (mockUserService.getUsers as jest.Mock).mockReturnValue(throwError(() => new Error('Load failed')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      
      component.loadUsers();

      expect(mockToasterService.error).toHaveBeenCalled();
      expect(component.isLoading).toBe(false);
      
      consoleSpy.mockRestore();
    });

    it('should search and reset page', () => {
      component.pageNumber = 5;
      component.searchTerm = 'query';
      component.onSearch();

      expect(component.pageNumber).toBe(1);
      expect(mockUserService.getUsers).toHaveBeenCalledWith(1, 10, 'query');
    });

    it('should change page', () => {
      component.changePage(3);
      expect(component.pageNumber).toBe(3);
      expect(mockUserService.getUsers).toHaveBeenCalledWith(3, 10, '');
    });
  });

  describe('Actions', () => {
    it('should open create modal', () => {
      component.openCreateModal();
      expect(component.selectedUser).toBeNull();
      expect(component.isModalOpen).toBe(true);
    });

    it('should open edit modal', () => {
      const user = mockUsers[0];
      component.onEdit(user);
      expect(component.selectedUser).toBe(user);
      expect(component.isModalOpen).toBe(true);
    });

    it('should reload on user saved', () => {
      const loadSpy = jest.spyOn(component, 'loadUsers');
      component.onUserSaved();
      
      expect(component.isModalOpen).toBe(false);
      expect(loadSpy).toHaveBeenCalled();
    });

    it('should deactivate active user', () => {
      const activeUser = mockUsers[0]; // isActive: true
      component.onToggleStatus(activeUser);

      expect(mockUserService.deactivateUser).toHaveBeenCalledWith(activeUser.id);
      expect(mockToasterService.success).toHaveBeenCalledWith('userManagement.userDeactivated');
      expect(mockUserService.getUsers).toHaveBeenCalledTimes(2); // Init + reload
    });
    
    it('should activate inactive user', () => {
      const inactiveUser = mockUsers[1]; // isActive: false
      component.onToggleStatus(inactiveUser);

      expect(mockUserService.activateUser).toHaveBeenCalledWith(inactiveUser.id);
      expect(mockToasterService.success).toHaveBeenCalledWith('userManagement.userActivated');
    });

    it('should handle toggle error', () => {
      (mockUserService.deactivateUser as jest.Mock).mockReturnValue(throwError(() => new Error('Toggle failed')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      
      component.onToggleStatus(mockUsers[0]);

      expect(mockToasterService.error).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should delete user if confirmed', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      const user = mockUsers[0];
      
      component.onDelete(user);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(user.id);
      expect(mockToasterService.success).toHaveBeenCalled();
    });

    it('should handle delete error', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      (mockUserService.deleteUser as jest.Mock).mockReturnValue(throwError(() => new Error('Delete failed')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      
      component.onDelete(mockUsers[0]);

      expect(mockToasterService.error).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('Helpers', () => {
    it('should get role label for enum value', () => {
      expect(component.getUserRoleLabel(UserRole.Admin)).toBe('userManagement.roles.Admin');
      expect(component.getUserRoleLabel(UserRole.Developer)).toBe('userManagement.roles.Developer');
      expect(component.getUserRoleLabel(UserRole.EndUser)).toBe('userManagement.roles.EndUser');
    });

    it('should get role label for string enum key', () => {
      expect(component.getUserRoleLabel('Admin')).toBe('userManagement.roles.Admin');
      expect(component.getUserRoleLabel('admin')).toBe('userManagement.roles.Admin'); // case insensitive
    });

    it('should get role label for numeric string', () => {
      expect(component.getUserRoleLabel('20')).toBe('userManagement.roles.Admin');
    });

    it('should return Unknown for invalid role', () => {
      expect(component.getUserRoleLabel(999 as unknown as UserRole)).toBe('Unknown');
    });
  });
});
