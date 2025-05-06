import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Employee } from '../models';
import { MOCK_EMPLOYEES, getEmployeeById, updateEmployee, deleteEmployee } from './employee.mock';

@Injectable({
  providedIn: 'root'
})
export class EmployeeMockService {
  private readonly MOCK_DELAY = 800;

  getAllEmployees(): Observable<Employee[]> {
    return of([...MOCK_EMPLOYEES]).pipe(delay(this.MOCK_DELAY));
  }

  getEmployeeById(id: number): Observable<Employee | null> {
    const employee = getEmployeeById(id);
    
    if (employee) {
      return of({ ...employee }).pipe(delay(this.MOCK_DELAY));
    }
    
    return throwError(() => new Error('Employee not found')).pipe(delay(this.MOCK_DELAY));
  }

  createEmployee(employeeData: Omit<Employee, 'id'>): Observable<Employee> {
    const newId = Math.max(...MOCK_EMPLOYEES.map(employee => employee.id || 0)) + 1;
    
    const newEmployee: Employee = {
      id: newId,
      ...employeeData
    };
    
    MOCK_EMPLOYEES.push(newEmployee);
    
    return of({ ...newEmployee }).pipe(delay(this.MOCK_DELAY));
  }

  updateEmployee(id: number, employeeData: Partial<Employee>): Observable<Employee | null> {
    const employee = getEmployeeById(id);
    
    if (!employee) {
      return throwError(() => new Error('Employee not found')).pipe(delay(this.MOCK_DELAY));
    }
    
    const { id: _, ...updateData } = employeeData;
    
    const updatedEmployee = updateEmployee({ ...employee, ...updateData });
    
    if (updatedEmployee) {
      return of({ ...updatedEmployee }).pipe(delay(this.MOCK_DELAY));
    }
    
    return throwError(() => new Error('Failed to update employee')).pipe(delay(this.MOCK_DELAY));
  }

  deleteEmployee(id: number): Observable<boolean> {
    const success = deleteEmployee(id);
    
    if (success) {
      return of(true).pipe(delay(this.MOCK_DELAY));
    }
    
    return throwError(() => new Error('Failed to delete employee')).pipe(delay(this.MOCK_DELAY));
  }

  searchEmployees(query: string): Observable<Employee[]> {
    if (!query.trim()) {
      return this.getAllEmployees();
    }
    
    const term = query.toLowerCase();
    const filteredEmployees = MOCK_EMPLOYEES.filter(employee => 
      employee.firstName.toLowerCase().includes(term) ||
      employee.lastName.toLowerCase().includes(term) ||
      employee.email.toLowerCase().includes(term) ||
      employee.phone.includes(term)
    );
    
    return of([...filteredEmployees]).pipe(delay(this.MOCK_DELAY));
  }
}
