import { Route } from '@angular/router';
import { authGuard } from '@cms/shared/auth/data-access';
import { LoginComponent, RegisterComponent } from '@cms/shared/auth/feature';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CustomizationWizardComponent } from './pages/customization-wizard/customization-wizard.component';
import { DesignerComponent } from './pages/designer/designer.component';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/dashboard/overview/dashboard-overview.component').then(m => m.DashboardOverviewComponent),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/user-list/user-list.component').then(m => m.UserListComponent),
      },
      // Add other feature routes here in the future
    ]
  },
  {
    path: 'configurator',
    component: CustomizationWizardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'customization',
    component: CustomizationWizardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'designer',
    component: DesignerComponent,
    canActivate: [authGuard],
  },
  {
    path: '**',
    redirectTo: '/dashboard',
  },
];
