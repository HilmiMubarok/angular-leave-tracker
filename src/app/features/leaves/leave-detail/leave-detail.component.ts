import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';

import { LeaveService } from '../../../core/services/leave/leave.service';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { Leave, LeaveStatus } from '../../../core/models/leave.model';
import { Employee } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-leave-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './leave-detail.component.html',
  styleUrls: ['./leave-detail.component.css']
})
export class LeaveDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private leaveService = inject(LeaveService);
  private employeeService = inject(EmployeeService);

  leave = signal<Leave | null>(null);
  employee = signal<Employee | null>(null);
  isLoading = signal<boolean>(true);
  leaveStatuses = Object.values(LeaveStatus);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadLeaveData(Number(id));
    } else {
      this.router.navigate(['/leaves']);
    }
  }

  loadLeaveData(id: number): void {
    this.isLoading.set(true);
    this.leaveService.getLeaveById(id).subscribe({
      next: (leave) => {
        if (leave) {
          this.leave.set(leave);
          this.loadEmployeeData(leave.employeeId);
        } else {
          this.snackBar.open('Leave record not found', 'Close', { duration: 3000 });
          this.router.navigate(['/leaves']);
        }
      },
      error: (error) => {
        console.error('Error loading leave data', error);
        this.snackBar.open('Error loading leave data', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  loadEmployeeData(employeeId: number): void {
    this.employeeService.getEmployeeById(employeeId).subscribe({
      next: (employee) => {
        this.employee.set(employee);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading employee data', error);
        this.isLoading.set(false);
      }
    });
  }

  editLeave(): void {
    if (this.leave()) {
      this.router.navigate(['/leaves', this.leave()!.id, 'edit']);
    }
  }

  deleteLeave(): void {
    if (!this.leave()) return;

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
      if (result && this.leave()) {
        this.leaveService.deleteLeave(this.leave()!.id!).subscribe({
          next: (success) => {
            if (success) {
              this.snackBar.open('Leave record deleted successfully', 'Close', { duration: 3000 });
              this.router.navigate(['/leaves']);
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

  updateLeaveStatus(status: string): void {
    if (!this.leave()) return;

    this.leaveService.updateLeave(this.leave()!.id!, { status: status as LeaveStatus }).subscribe({
      next: (updatedLeave) => {
        if (updatedLeave) {
          this.leave.set(updatedLeave);
          this.snackBar.open(`Leave status updated to ${status}`, 'Close', { duration: 3000 });
        } else {
          this.snackBar.open('Failed to update leave status', 'Close', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error updating leave status', error);
        this.snackBar.open('Error updating leave status', 'Close', { duration: 3000 });
      }
    });
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

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  calculateDuration(startDate: Date | string | undefined, endDate: Date | string | undefined): number {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  goBack(): void {
    this.router.navigate(['/leaves']);
  }
}
