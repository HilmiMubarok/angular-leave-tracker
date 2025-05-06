import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeService } from '../../../core/services/employee/employee.service';
import { Employee } from '../../../core/models';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.css']
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private employeeService = inject(EmployeeService);
  
  employeeForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  employeeId = signal<number | null>(null);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  
  validationMessages = {
    firstName: [
      { type: 'required', message: 'First name is required' },
      { type: 'maxlength', message: 'First name cannot be more than 50 characters' }
    ],
    lastName: [
      { type: 'required', message: 'Last name is required' },
      { type: 'maxlength', message: 'Last name cannot be more than 50 characters' }
    ],
    email: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Please enter a valid email address' }
    ],
    phone: [
      { type: 'required', message: 'Phone number is required' },
      { type: 'pattern', message: 'Please enter a valid phone number' }
    ],
    address: [
      { type: 'required', message: 'Address is required' }
    ],
    gender: [
      { type: 'required', message: 'Gender is required' }
    ]
  };
  
  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.employeeId.set(Number(id));
      this.loadEmployeeData(Number(id));
    }
  }
  
  initForm(): void {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-()]{8,20}$/)]],
      address: ['', Validators.required],
      gender: ['', Validators.required]
    });
  }
  
  loadEmployeeData(id: number): void {
    this.isLoading.set(true);
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee) => {
        if (employee) {
          this.employeeForm.patchValue(employee);
        } else {
          this.snackBar.open('Employee not found', 'Close', { duration: 3000 });
          this.router.navigate(['/employees']);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading employee data', error);
        this.snackBar.open('Error loading employee data', 'Close', { duration: 3000 });
        this.isLoading.set(false);
        this.router.navigate(['/employees']);
      }
    });
  }
  
  onSubmit(): void {
    if (this.employeeForm.invalid) {
      Object.keys(this.employeeForm.controls).forEach(key => {
        const control = this.employeeForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    this.isSaving.set(true);
    const employeeData: Employee = this.employeeForm.value;
    if (this.isEditMode() && this.employeeId()) {
      this.employeeService.updateEmployee(this.employeeId()!, employeeData).subscribe({
        next: (updatedEmployee) => {
          this.snackBar.open('Employee updated successfully', 'Close', { duration: 3000 });
          this.isSaving.set(false);
          this.router.navigate(['/employees']);
        },
        error: (error) => {
          console.error('Error updating employee', error);
          this.snackBar.open('Error updating employee', 'Close', { duration: 3000 });
          this.isSaving.set(false);
        }
      });
    } else {
      this.employeeService.createEmployee(employeeData).subscribe({
        next: (newEmployee) => {
          this.snackBar.open('Employee created successfully', 'Close', { duration: 3000 });
          this.isSaving.set(false);
          this.router.navigate(['/employees']);
        },
        error: (error) => {
          console.error('Error creating employee', error);
          this.snackBar.open('Error creating employee', 'Close', { duration: 3000 });
          this.isSaving.set(false);
        }
      });
    }
  }
  
  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
