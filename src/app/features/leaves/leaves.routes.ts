import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const LEAVE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./leave-list/leave-list.component').then(c => c.LeaveListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'new',
    loadComponent: () => import('./leave-form/leave-form.component').then(c => c.LeaveFormComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id',
    loadComponent: () => import('./leave-detail/leave-detail.component').then(c => c.LeaveDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./leave-form/leave-form.component').then(c => c.LeaveFormComponent),
    canActivate: [authGuard]
  }
];
