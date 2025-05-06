import { Routes } from '@angular/router';

export const EMPLOYEE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => 
      import('./employee-list/employee-list.component').then(m => m.EmployeeListComponent),
    title: 'Employees - Leave Track'
  },
  {
    path: 'new',
    loadComponent: () => 
      import('./employee-form/employee-form.component').then(m => m.EmployeeFormComponent),
    title: 'Add Employee - Leave Track'
  },
  {
    path: ':id',
    loadComponent: () => 
      import('./employee-detail/employee-detail.component').then(m => m.EmployeeDetailComponent),
    title: 'Employee Details - Leave Track'
  },
  {
    path: ':id/edit',
    loadComponent: () => 
      import('./employee-form/employee-form.component').then(m => m.EmployeeFormComponent),
    title: 'Edit Employee - Leave Track'
  }
];
