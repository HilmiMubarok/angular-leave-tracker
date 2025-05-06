import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { LeaveService } from '../../../core/services/leave/leave.service';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { Leave, LeaveStatus } from '../../../core/models/leave.model';
import { Employee } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
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
    MatDialogModule
  ],
  templateUrl: './leave-list.component.html',
  styleUrls: ['./leave-list.component.css']
})
export class LeaveListComponent implements OnInit {
  private router = inject(Router);
  private leaveService = inject(LeaveService);
  private employeeService = inject(EmployeeService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  leaves = this.leaveService.leaves;
  isLoading = this.leaveService.loading;
  filteredLeaves = signal<Leave[]>([]);
  employeesMap = signal<Map<number, Employee>>(new Map());
  
  displayedColumns: string[] = ['id', 'employee', 'reason', 'startDate', 'endDate', 'status', 'actions'];
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.loadLeaves();
    this.loadEmployees();
    
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const searchTerm = (value || '').toLowerCase();
        return this.leaveService.getAllLeaves().pipe(
          switchMap(leaves => {
            const filtered = leaves.filter(leave => 
              leave.reason.toLowerCase().includes(searchTerm) ||
              this.getEmployeeName(leave.employeeId).toLowerCase().includes(searchTerm) ||
              leave.status?.toLowerCase().includes(searchTerm) ||
              false
            );
            return [filtered];
          })
        );
      })
    ).subscribe(leaves => {
      this.filteredLeaves.set(leaves);
    });
  }
  
  loadLeaves(): void {
    this.leaveService.getAllLeaves().subscribe({
      next: (leaves) => {
        this.filteredLeaves.set(leaves);
      },
      error: (error) => {
        console.error('Error loading leaves', error);
        this.snackBar.open('Error loading leaves', 'Close', { duration: 3000 });
      }
    });
  }
  
  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        const employeeMap = new Map<number, Employee>();
        employees.forEach(employee => {
          employeeMap.set(employee.id!, employee);
        });
        this.employeesMap.set(employeeMap);
      },
      error: (error) => {
        console.error('Error loading employees', error);
      }
    });
  }
  
  onSortChange(sort: Sort): void {
    console.log('Sort changed:', sort);
  }
  
  viewLeave(id: number): void {
    this.router.navigate(['/leaves', id]);
  }
  
  editLeave(id: number): void {
    this.router.navigate(['/leaves', id, 'edit']);
  }
  
  deleteLeave(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirm Delete',
        message: 'Are you sure you want to delete this leave record?',
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.leaveService.deleteLeave(id).subscribe({
          next: (success) => {
            if (success) {
              this.snackBar.open('Leave record deleted successfully', 'Close', { duration: 3000 });
              const currentLeaves = this.leaves();
              this.filteredLeaves.set(currentLeaves);
            } else {
              this.snackBar.open('Failed to delete leave record', 'Close', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('Error deleting leave record', error);
            this.snackBar.open('Error deleting leave record', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
  
  addLeave(): void {
    this.router.navigate(['/leaves/new']);
  }
  
  getEmployeeName(employeeId: number): string {
    const employee = this.employeesMap().get(employeeId);
    if (employee) {
      return `${employee.firstName} ${employee.lastName}`;
    }
    return `Employee #${employeeId}`;
  }
  
  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    
    switch (status) {
      case LeaveStatus.APPROVED:
        return 'status-approved';
      case LeaveStatus.REJECTED:
        return 'status-rejected';
      case LeaveStatus.PENDING:
        return 'status-pending';
      default:
        return '';
    }
  }
  
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString();
  }
}
