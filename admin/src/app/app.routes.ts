import { Route } from '@angular/router';
import { authGuard } from '@cms/shared/auth/data-access';
import { LoginComponent, RegisterComponent } from '@cms/shared/auth/feature';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ConfiguratorComponent } from './pages/configurator/configurator.component';
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
  },
  {
    path: 'configurator',
    component: ConfiguratorComponent,
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
