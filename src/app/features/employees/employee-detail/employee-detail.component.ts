import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { LeaveService } from '../../../core/services/leave/leave.service';
import { Employee } from '../../../core/models';
import { Leave, LeaveStatistics, LeaveStatus } from '../../../core/models/leave.model';



@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTabsModule,
    MatListModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private employeeService = inject(EmployeeService);
  private leaveService = inject(LeaveService);
  
  employee = signal<Employee | null>(null);
  leaveRecords = signal<Leave[]>([]);
  leaveStatistics = signal<LeaveStatistics | null>(null);
  isLoading = signal<boolean>(true);
  isLoadingLeaves = signal<boolean>(false);
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
    this.isLoadingLeaves.set(true);
    this.leaveService.getLeavesByEmployeeId(employeeId).subscribe({
      next: (leaves) => {
        this.leaveRecords.set(leaves);
        this.isLoadingLeaves.set(false);
      },
      error: (error) => {
        console.error('Error loading leave records', error);
        this.snackBar.open('Error loading leave records', 'Close', { duration: 3000 });
        this.isLoadingLeaves.set(false);
      }
    });
    
    // Load leave statistics
    this.loadLeaveStatistics(employeeId);
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
  
  getStatusClass(status: string | undefined): string {
    if (!status) return '';
    
    switch (status.toLowerCase()) {
      case LeaveStatus.APPROVED.toLowerCase(): return 'status-approved';
      case LeaveStatus.PENDING.toLowerCase(): return 'status-pending';
      case LeaveStatus.REJECTED.toLowerCase(): return 'status-rejected';
      default: return '';
    }
  }
  
  addLeave(): void {
    if (this.employeeId()) {
      this.router.navigate(['/leaves/new'], { 
        queryParams: { employeeId: this.employeeId() } 
      });
    }
  }
  
  loadLeaveStatistics(employeeId: number): void {
    this.leaveService.getLeaveStatistics(employeeId).subscribe({
      next: (statistics) => {
        this.leaveStatistics.set(statistics);
      },
      error: (error) => {
        console.error('Error loading leave statistics', error);
        this.snackBar.open('Error loading leave statistics', 'Close', { duration: 3000 });
      }
    });
  }
  
  viewLeaveDetails(leaveId: number): void {
    this.router.navigate(['/leaves', leaveId]);
  }
  
  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
  
  getMonths(): string[] {
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push(new Date(2025, i, 1).toLocaleString('default', { month: 'long' }));
    }
    return months;
  }
  
  hasLeaveInMonth(month: string): boolean {
    const stats = this.leaveStatistics();
    if (!stats || !stats.leavesPerMonth) return false;
    
    return stats.leavesPerMonth[month] > 0;
  }
  
  getMonthDays(month: string): string {
    const stats = this.leaveStatistics();
    if (!stats || !stats.leavesPerMonth) return '0 days';
    
    const days = stats.leavesPerMonth[month] || 0;
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
}
