import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { Employee } from '../../../core/models';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatCardModule,

    MatSortModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css']
})
export class EmployeeListComponent implements OnInit {
  private router = inject(Router);
  private employeeService = inject(EmployeeService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  employees = this.employeeService.employees;
  isLoading = this.employeeService.loading;
  filteredEmployees = signal<Employee[]>([]);
  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'gender', 'actions'];
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadEmployees();
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        return this.employeeService.searchEmployees(value || '');
      })
    ).subscribe(employees => {
      this.filteredEmployees.set(employees);
    });
  }
  
  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.filteredEmployees.set(employees);
      },
      error: (error) => {
        console.error('Error loading employees', error);
        this.snackBar.open('Error loading employees', 'Close', { duration: 3000 });
      }
    });
  }
  
  onSortChange(sort: Sort): void {
    console.log('Sort changed:', sort);
  }
  
  viewEmployee(id: number): void {
    this.router.navigate(['/employees', id]);
  }
  
  editEmployee(id: number): void {
    this.router.navigate(['/employees', id, 'edit']);
  }
  
  deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: (success) => {
          if (success) {
            this.snackBar.open('Employee deleted successfully', 'Close', { duration: 3000 });
            const currentEmployees = this.employees();
            this.filteredEmployees.set(currentEmployees);
          } else {
            this.snackBar.open('Failed to delete employee', 'Close', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('Error deleting employee', error);
          this.snackBar.open('Error deleting employee', 'Close', { duration: 3000 });
        }
      });
    }
  }
  
  addEmployee(): void {
    this.router.navigate(['/employees/new']);
  }
  
  getFullName(employee: Employee): string {
    return `${employee.firstName} ${employee.lastName}`;
  }
}
