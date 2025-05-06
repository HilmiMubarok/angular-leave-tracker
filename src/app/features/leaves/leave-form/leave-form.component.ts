import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { LeaveService } from '../../../core/services/leave/leave.service';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { Leave, LeaveStatus } from '../../../core/models/leave.model';
import { Employee } from '../../../core/models';

@Component({
  selector: 'app-leave-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule
  ],
  templateUrl: './leave-form.component.html',
  styleUrls: ['./leave-form.component.css']
})
export class LeaveFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private leaveService = inject(LeaveService);
  private employeeService = inject(EmployeeService);

  leaveForm!: FormGroup;
  editMode = signal<boolean>(false);
  leaveId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  employees = signal<Employee[]>([]);
  validationError = signal<string | null>(null);

  validationMessages = {
    employeeId: [
      { type: 'required', message: 'Employee is required' }
    ],
    reason: [
      { type: 'required', message: 'Reason is required' },
      { type: 'minlength', message: 'Reason must be at least 3 characters long' }
    ],
    startDate: [
      { type: 'required', message: 'Start date is required' }
    ],
    endDate: [
      { type: 'required', message: 'End date is required' }
    ]
  };

  ngOnInit(): void {
    this.initForm();
    this.loadEmployees();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editMode.set(true);
      this.leaveId.set(Number(id));
      this.loadLeaveData(Number(id));
    }
  }

  initForm(): void {
    this.leaveForm = this.fb.group({
      employeeId: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(3)]],
      startDate: [new Date(), Validators.required],
      endDate: [new Date(), Validators.required],
      status: [LeaveStatus.PENDING]
    });

    this.leaveForm.get('endDate')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });

    this.leaveForm.get('startDate')?.valueChanges.subscribe(() => {
      this.validateDateRange();
    });
  }

  validateDateRange(): void {
    const startDate = this.leaveForm.get('startDate')?.value;
    const endDate = this.leaveForm.get('endDate')?.value;

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(0, 0, 0, 0);

      if (end.getTime() < start.getTime()) {
        this.leaveForm.get('endDate')?.setErrors({ invalidRange: true });
      } else {
        const endDateControl = this.leaveForm.get('endDate');
        const currentErrors = endDateControl?.errors;
        
        if (currentErrors) {
          const newErrors = { ...currentErrors };
          delete newErrors['invalidRange'];
          
          if (Object.keys(newErrors).length === 0) {
            endDateControl?.setErrors(null);
          } else {
            endDateControl?.setErrors(newErrors);
          }
        }
      }
    }
  }

  loadEmployees(): void {
    this.employeeService.getAllEmployees().subscribe({
      next: (employees) => {
        this.employees.set(employees);
      },
      error: (error) => {
        console.error('Error loading employees', error);
        this.snackBar.open('Error loading employees', 'Close', { duration: 3000 });
      }
    });
  }

  loadLeaveData(id: number): void {
    this.isLoading.set(true);
    this.leaveService.getLeaveById(id).subscribe({
      next: (leave) => {
        if (leave) {
          const formattedLeave = {
            ...leave,
            startDate: new Date(leave.startDate),
            endDate: new Date(leave.endDate)
          };
          this.leaveForm.patchValue(formattedLeave);
        } else {
          this.snackBar.open('Leave record not found', 'Close', { duration: 3000 });
          this.router.navigate(['/leaves']);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading leave data', error);
        this.snackBar.open('Error loading leave data', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) {
      Object.keys(this.leaveForm.controls).forEach(key => {
        const control = this.leaveForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSaving.set(true);
    this.validationError.set(null);

    const leaveData: Leave = this.leaveForm.value;
    const employeeId = leaveData.employeeId;
    const startDate = new Date(leaveData.startDate);
    const endDate = new Date(leaveData.endDate);

    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    leaveData.durationDays = durationDays;

    this.leaveService.validateLeaveRequest(employeeId, startDate, endDate).subscribe({
      next: (validationResult) => {
        if (!validationResult.valid) {
          this.validationError.set(validationResult.message || 'Invalid leave request');
          this.isSaving.set(false);
          return;
        }

        if (this.editMode() && this.leaveId()) {
          this.leaveService.updateLeave(this.leaveId()!, leaveData).subscribe({
            next: (updatedLeave) => {
              this.snackBar.open('Leave record updated successfully', 'Close', { duration: 3000 });
              this.router.navigate(['/leaves', this.leaveId()]);
              this.isSaving.set(false);
            },
            error: (error) => {
              console.error('Error updating leave record', error);
              this.snackBar.open('Error updating leave record', 'Close', { duration: 3000 });
              this.isSaving.set(false);
            }
          });
        } else {
          this.leaveService.createLeave(leaveData).subscribe({
            next: (newLeave) => {
              this.snackBar.open('Leave record created successfully', 'Close', { duration: 3000 });
              this.router.navigate(['/leaves']);
              this.isSaving.set(false);
            },
            error: (error) => {
              console.error('Error creating leave record', error);
              this.snackBar.open('Error creating leave record', 'Close', { duration: 3000 });
              this.isSaving.set(false);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error validating leave request', error);
        this.snackBar.open('Error validating leave request', 'Close', { duration: 3000 });
        this.isSaving.set(false);
      }
    });
  }

  cancel(): void {
    if (this.editMode()) {
      this.router.navigate(['/leaves', this.leaveId()]);
    } else {
      this.router.navigate(['/leaves']);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.leaveForm.get(controlName);
    if (!control) return '';
    
    if (control.errors && control.touched) {
      const messages = this.validationMessages[controlName as keyof typeof this.validationMessages];
      if (messages) {
        for (const message of messages) {
          if (control.errors[message.type]) {
            return message.message;
          }
        }
      }
      
      if (controlName === 'endDate' && control.errors['invalidRange']) {
        return 'End date must be after start date';
      }
    }
    
    return '';
  }

  getIsEditMode(): boolean {
    return this.editMode();
  }

  getFormTitle(): string {
    return this.getIsEditMode() ? 'Edit Leave Record' : 'Create New Leave Record';
  }
}
