import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, TranslationService, ToasterService } from '@cms/shared/utils';
import { UserListDto, UserRole } from '@cms/shared/api-interfaces';
import { 
  IconComponent, 
  DialogComponent,
  ButtonComponent,
  CardComponent,
  PageHeaderComponent,
  SearchBarComponent,
  BadgeComponent,
  PaginationComponent
} from '@cms/shared/ui';
import { UserFormComponent } from '../user-form';

@Component({
  selector: 'cms-user-list',
  standalone: true,
  imports: [
    CommonModule, 
    IconComponent, 
    DialogComponent, 
    UserFormComponent,
    ButtonComponent,
    CardComponent,
    PageHeaderComponent,
    SearchBarComponent,
    BadgeComponent,
    PaginationComponent
  ],
  templateUrl: './user-list.component.html',
})
export class UserListComponent implements OnInit {
  protected readonly translate = inject(TranslationService);
  private readonly userService = inject(UserService);
  private readonly toaster = inject(ToasterService);

  users: UserListDto[] = [];
  totalCount = 0;
  pageNumber = 1;
  pageSize = 10;
  searchTerm = '';
  hasNextPage = false;
  isLoading = false;
  
  isModalOpen = false;
  selectedUser: UserListDto | null = null;
  UserRole = UserRole;
  Math = Math;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getUsers(this.pageNumber, this.pageSize, this.searchTerm).subscribe({
      next: (response) => {
        this.users = response.items;
        this.totalCount = response.totalCount;
        this.hasNextPage = response.hasNextPage;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.toaster.error(this.translate.instant('userManagement.errorLoadingUsers'));
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.loadUsers();
  }

  changePage(page: number): void {
    this.pageNumber = page;
    this.loadUsers();
  }

  openCreateModal(): void {
    this.selectedUser = null;
    this.isModalOpen = true;
  }

  onEdit(user: UserListDto): void {
    this.selectedUser = user;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedUser = null;
  }

  onUserSaved(): void {
    this.closeModal();
    this.loadUsers();
  }

  onToggleStatus(user: UserListDto): void {
    const action = user.isActive ? 
      this.userService.deactivateUser(user.id) : 
      this.userService.activateUser(user.id);
    
    const successMessage = user.isActive ? 
      'userManagement.userDeactivated' : 
      'userManagement.userActivated';

    action.subscribe({
      next: () => {
        this.toaster.success(this.translate.instant(successMessage));
        this.loadUsers();
      },
      error: (err) => {
        console.error(err);
        this.toaster.error(this.translate.instant('userManagement.errorTogglingStatus'));
      }
    });
  }

  onDelete(user: UserListDto): void {
    if (confirm(this.translate.instant('userManagement.confirmDelete'))) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.toaster.success(this.translate.instant('userManagement.userDeleted'));
          this.loadUsers();
        },
        error: (err) => {
          console.error(err);
          this.toaster.error(this.translate.instant('userManagement.errorDeletingUser'));
        }
      });
    }
  }

  getUserRoleLabel(role: UserRole | string): string {
    // Handle case where API returns string name of enum or numeric string
    let roleValue = role;
    if (typeof role === 'string') {
      if (!isNaN(Number(role))) {
        roleValue = Number(role);
      } else {
        // Attempt to find enum by name (case-insensitive)
        const key = Object.keys(this.UserRole).find(k => k.toLowerCase() === role.toLowerCase()) as keyof typeof UserRole;
        if (key) {
          roleValue = this.UserRole[key];
        }
      }
    }

    switch (roleValue) {
      case UserRole.Admin: return this.translate.instant('userManagement.roles.Admin');
      case UserRole.Developer: return this.translate.instant('userManagement.roles.Developer');
      case UserRole.EndUser: return this.translate.instant('userManagement.roles.EndUser');
      default: return 'Unknown';
    }
  }
}
