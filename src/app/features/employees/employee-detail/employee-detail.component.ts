import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { Employee } from '../../../core/models';

interface LeaveRecord {
  id: number;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'approved' | 'pending' | 'rejected';
  durationDays: number;
}

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private employeeService = inject(EmployeeService);
  
  employee = signal<Employee | null>(null);
  leaveRecords = signal<LeaveRecord[]>([]);
  isLoading = signal<boolean>(true);
  employeeId = signal<number | null>(null);
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.employeeId.set(Number(id));
      this.loadEmployeeData(Number(id));
      this.loadEmployeeLeaveRecords(Number(id));
    } else {
      this.router.navigate(['/employees']);
    }
  }
  
  loadEmployeeData(id: number): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee) => {
        if (employee) {
          this.employee.set(employee);
        } else {
          this.snackBar.open('Employee not found', 'Close', { duration: 3000 });
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading employee data', error);
        this.snackBar.open('Error loading employee data', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }
  
  loadEmployeeLeaveRecords(employeeId: number): void {
    setTimeout(() => {
      const mockLeaveRecords: LeaveRecord[] = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        reason: ['Vacation', 'Sick Leave', 'Personal Leave', 'Family Emergency', 'Medical Appointment'][i],
        startDate: new Date(2025, i, i + 10).toISOString().split('T')[0],
        endDate: new Date(2025, i, i + 11).toISOString().split('T')[0],
        status: ['approved', 'pending', 'rejected', 'approved', 'pending'][i] as 'approved' | 'pending' | 'rejected',
        durationDays: i % 3 === 0 ? 2 : 1
      }));
      
      this.leaveRecords.set(mockLeaveRecords);
    }, 1000);
  }
  
  editEmployee(): void {
    if (this.employeeId()) {
      this.router.navigate(['/employees', this.employeeId(), 'edit']);
    }
  }
  
  deleteEmployee(): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      if (this.employeeId()) {
        this.isLoading.set(true);
        this.employeeService.deleteEmployee(this.employeeId()!).subscribe({
          next: (success) => {
            if (success) {
              this.snackBar.open('Employee deleted successfully', 'Close', { duration: 3000 });
              this.router.navigate(['/employees']);
            } else {
              this.snackBar.open('Failed to delete employee', 'Close', { duration: 3000 });
              this.isLoading.set(false);
            }
          },
          error: (error) => {
            console.error('Error deleting employee', error);
            this.snackBar.open('Error deleting employee', 'Close', { duration: 3000 });
            this.isLoading.set(false);
          }
        });
      }
    }
  }
  
  goBack(): void {
    this.router.navigate(['/employees']);
  }
  
  getFullName(): string {
    const emp = this.employee();
    return emp ? `${emp.firstName} ${emp.lastName}` : '';
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }
  
  addLeave(): void {
    this.snackBar.open('Leave management will be implemented in the next phase', 'OK', { duration: 3000 });
  }
}
