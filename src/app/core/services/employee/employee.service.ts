import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Employee } from '../../models';
import { EmployeeMockService } from '../../mock/employee.service.mock';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private employeeMockService = inject(EmployeeMockService);
  
  private employeesSignal = signal<Employee[]>([]);
  private selectedEmployeeSignal = signal<Employee | null>(null);
  private loadingSignal = signal<boolean>(false);
  
  readonly employees = this.employeesSignal.asReadonly();
  readonly selectedEmployee = this.selectedEmployeeSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  
  getAllEmployees(): Observable<Employee[]> {
    this.loadingSignal.set(true);
    
    return this.employeeMockService.getAllEmployees().pipe(
      tap(employees => {
        this.employeesSignal.set(employees);
        this.loadingSignal.set(false);
      })
    );
  }
  
  getEmployeeById(id: number): Observable<Employee | null> {
    this.loadingSignal.set(true);
    
    return this.employeeMockService.getEmployeeById(id).pipe(
      tap(employee => {
        this.selectedEmployeeSignal.set(employee);
        this.loadingSignal.set(false);
      })
    );
  }
  
  createEmployee(employeeData: Omit<Employee, 'id'>): Observable<Employee> {
    this.loadingSignal.set(true);
    
    return this.employeeMockService.createEmployee(employeeData).pipe(
      tap(newEmployee => {
        this.employeesSignal.update(employees => [...employees, newEmployee]);
        this.loadingSignal.set(false);
      })
    );
  }
  
  updateEmployee(id: number, employeeData: Partial<Employee>): Observable<Employee | null> {
    this.loadingSignal.set(true);
    
    return this.employeeMockService.updateEmployee(id, employeeData).pipe(
      tap(updatedEmployee => {
        if (updatedEmployee) {
          this.employeesSignal.update(employees => 
            employees.map(emp => emp.id === id ? updatedEmployee : emp)
          );
          
          if (this.selectedEmployeeSignal()?.id === id) {
            this.selectedEmployeeSignal.set(updatedEmployee);
          }
        }
        
        this.loadingSignal.set(false);
      })
    );
  }
  
  deleteEmployee(id: number): Observable<boolean> {
    this.loadingSignal.set(true);
    
    return this.employeeMockService.deleteEmployee(id).pipe(
      tap(success => {
        if (success) {
          this.employeesSignal.update(employees => 
            employees.filter(emp => emp.id !== id)
          );
          
          if (this.selectedEmployeeSignal()?.id === id) {
            this.selectedEmployeeSignal.set(null);
          }
        }
        
        this.loadingSignal.set(false);
      })
    );
  }
  
  searchEmployees(query: string): Observable<Employee[]> {
    this.loadingSignal.set(true);
    
    return this.employeeMockService.searchEmployees(query).pipe(
      tap(employees => {
        this.employeesSignal.set(employees);
        this.loadingSignal.set(false);
      })
    );
  }
  
  clearSelectedEmployee(): void {
    this.selectedEmployeeSignal.set(null);
  }
}
