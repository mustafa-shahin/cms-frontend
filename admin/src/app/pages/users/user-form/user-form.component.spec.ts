import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFormComponent } from './user-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService, TranslationService, ToasterService } from '@cms/shared/utils';
import { UserListDto, UserRole, CreateUserDto, UpdateUserDto } from '@cms/shared/api-interfaces';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;
  let mockUserService: Partial<UserService>;
  let mockTranslationService: Partial<TranslationService>;
  let mockToasterService: Partial<ToasterService>;

  const mockUser: UserListDto = {
    id: 1,
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'User',
    fullName: 'Test User',
    role: UserRole.Admin,
    isActive: true,
    createdAt: new Date().toISOString()
  };

  beforeEach(async () => {
    mockUserService = {
      createUser: jest.fn().mockReturnValue(of(void 0)),
      updateUser: jest.fn().mockReturnValue(of(void 0))
    };

    mockTranslationService = {
      instant: jest.fn((key: string) => key)
    };

    mockToasterService = {
      success: jest.fn(),
      error: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [UserFormComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: ToasterService, useValue: mockToasterService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize empty form for create mode', () => {
      // Create mode (no user input)
      expect(component.form).toBeTruthy();
      expect(component.form.get('email')?.value).toBe('');
      expect(component.form.get('role')?.value).toBe(UserRole.EndUser); // Default
    });

    it('should initialize form with user data for edit mode', () => {
      component.user = mockUser;
      component.initForm(); // Re-init with user

      expect(component.form.get('firstName')?.value).toBe(mockUser.firstName);
      expect(component.form.get('email')?.disabled).toBe(true);
      expect(component.form.get('password')?.validator).toBeNull(); // Password optional in edit
    });

    it('should normalize string role "Admin" to enum value', () => {
       // Simulate string role as might come from some APIs or inputs
       const userWithStringRole = { ...mockUser, role: 'Admin' as unknown as UserRole };
       component.user = userWithStringRole;
       component.initForm();

       expect(component.form.get('role')?.value).toBe(UserRole.Admin);
    });
     
    it('should normalize numeric string role "20" to enum value', () => {
       const userWithNumericStringRole = { ...mockUser, role: '20' as unknown as UserRole };
       component.user = userWithNumericStringRole;
       component.initForm();

       expect(component.form.get('role')?.value).toBe(20);
    });
  });

  describe('Validation', () => {
    it('should validate required fields', () => {
      component.form.patchValue({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: null
      });

      expect(component.form.valid).toBe(false);
      expect(component.form.get('firstName')?.hasError('required')).toBe(true);
      expect(component.form.get('email')?.hasError('required')).toBe(true);
    });

    it('should validate email format', () => {
      component.form.patchValue({ email: 'invalid-email' });
      expect(component.form.get('email')?.hasError('email')).toBe(true);
    });

    it('should validate password min length', () => {
        // Create mode
        component.form.patchValue({ password: '123' });
        expect(component.form.get('password')?.hasError('minlength')).toBe(true);
    });
  });

  describe('Submission', () => {
    it('should create new user', () => {
      component.form.patchValue({
        firstName: 'New',
        lastName: 'User',
        email: 'new@test.com',
        password: 'password123',
        role: UserRole.Developer
      });

      component.onSubmit();

      const expectedDto: CreateUserDto = {
        firstName: 'New',
        lastName: 'User',
        email: 'new@test.com',
        password: 'password123',
        role: UserRole.Developer
      };

      expect(mockUserService.createUser).toHaveBeenCalledWith(expectedDto);
      expect(mockToasterService.success).toHaveBeenCalled();
    });

    it('should update existing user', () => {
      component.user = mockUser;
      component.initForm();
      
      component.form.patchValue({
        firstName: 'Updated',
        role: UserRole.Developer
      });

      component.onSubmit();

      const expectedDto: UpdateUserDto = {
        id: mockUser.id,
        firstName: 'Updated',
        lastName: mockUser.lastName, // Original value
        role: UserRole.Developer,
        isActive: mockUser.isActive
      };

      expect(mockUserService.updateUser).toHaveBeenCalledWith(mockUser.id, expectedDto);
      expect(mockToasterService.success).toHaveBeenCalled();
    });

    it('should handle create error', () => {
      (mockUserService.createUser as jest.Mock).mockReturnValue(throwError(() => new Error('Create failed')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      
      component.form.patchValue({
        firstName: 'New',
        lastName: 'User',
        email: 'new@test.com',
        password: 'password123',
        role: UserRole.EndUser
      });

      component.onSubmit();

      expect(mockToasterService.error).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle update error', () => {
      component.user = mockUser;
      component.initForm();
      (mockUserService.updateUser as jest.Mock).mockReturnValue(throwError(() => new Error('Update failed')));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      component.onSubmit();

      expect(mockToasterService.error).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should not submit invalid form', () => {
      component.form.reset();
      component.onSubmit();
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });
  });
});
