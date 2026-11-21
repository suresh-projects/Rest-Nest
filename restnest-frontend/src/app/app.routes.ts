import { Routes } from '@angular/router';
import { roleGuard } from './core/guards';

export const routes: Routes = [
  { path: '', title: 'RestNest - Hourly family rest rooms',
    loadComponent: () => import('./pages/home.component').then(m => m.HomeComponent) },
  { path: 'property/:id', title: 'Room details - RestNest',
    loadComponent: () => import('./pages/property-detail.component').then(m => m.PropertyDetailComponent) },
  { path: 'login', title: 'Login - RestNest',
    loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent) },
  { path: 'register', title: 'Sign up - RestNest',
    loadComponent: () => import('./pages/register.component').then(m => m.RegisterComponent) },
  { path: 'my-bookings', title: 'My bookings - RestNest', canActivate: [roleGuard('GUEST')],
    loadComponent: () => import('./pages/my-bookings.component').then(m => m.MyBookingsComponent) },
  {
    path: 'host', canActivate: [roleGuard('HOST')],
    children: [
      { path: '', title: 'Host dashboard - RestNest',
        loadComponent: () => import('./pages/host-dashboard.component').then(m => m.HostDashboardComponent) },
      { path: 'properties', title: 'My rooms - RestNest',
        loadComponent: () => import('./pages/host-properties.component').then(m => m.HostPropertiesComponent) },
      { path: 'properties/new', title: 'Add room - RestNest',
        loadComponent: () => import('./pages/property-form.component').then(m => m.PropertyFormComponent) },
      { path: 'properties/:id/edit', title: 'Edit room - RestNest',
        loadComponent: () => import('./pages/property-form.component').then(m => m.PropertyFormComponent) },
      { path: 'bookings', title: 'Booking requests - RestNest',
        loadComponent: () => import('./pages/host-bookings.component').then(m => m.HostBookingsComponent) },
    ],
  },
  { path: '**', title: 'Not found - RestNest',
    loadComponent: () => import('./pages/not-found.component').then(m => m.NotFoundComponent) },
];
