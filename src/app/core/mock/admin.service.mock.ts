import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Admin, AdminLoginRequest, AdminLoginResponse } from '../models';
import { MOCK_ADMINS, getAdminByCredentials, getAdminById, updateAdmin } from './admin.mock';

@Injectable({
  providedIn: 'root'
})
export class AdminMockService {
  private readonly MOCK_DELAY = 800;

  login(loginRequest: AdminLoginRequest): Observable<AdminLoginResponse> {
    const admin = getAdminByCredentials(loginRequest.email, loginRequest.password);
    
    if (admin) {
      const { password, ...adminWithoutPassword } = admin;
      
      const response: AdminLoginResponse = {
        admin: adminWithoutPassword,
        token: `mock-jwt-token-${admin.id}-${Date.now()}`
      };
      
      return of(response).pipe(delay(this.MOCK_DELAY));
    }
    
    return throwError(() => new Error('Invalid email or password')).pipe(delay(this.MOCK_DELAY));
  }

  getAllAdmins(): Observable<Omit<Admin, 'password'>[]> {
    const adminsWithoutPasswords = MOCK_ADMINS.map(({ password, ...rest }) => rest);
    return of(adminsWithoutPasswords).pipe(delay(this.MOCK_DELAY));
  }

  getAdminById(id: number): Observable<Omit<Admin, 'password'> | null> {
    const admin = getAdminById(id);
    
    if (admin) {
      const { password, ...adminWithoutPassword } = admin;
      return of(adminWithoutPassword).pipe(delay(this.MOCK_DELAY));
    }
    
    return throwError(() => new Error('Admin not found')).pipe(delay(this.MOCK_DELAY));
  }

  updateAdminProfile(id: number, adminData: Partial<Admin>): Observable<Omit<Admin, 'password'> | null> {
    const admin = getAdminById(id);
    
    if (!admin) {
      return throwError(() => new Error('Admin not found')).pipe(delay(this.MOCK_DELAY));
    }
    
    const { id: _, ...updateData } = adminData;
    
    const updatedAdmin = updateAdmin({ ...admin, ...updateData });
    
    if (updatedAdmin) {
      const { password, ...adminWithoutPassword } = updatedAdmin;
      return of(adminWithoutPassword).pipe(delay(this.MOCK_DELAY));
    }
    
    return throwError(() => new Error('Failed to update admin')).pipe(delay(this.MOCK_DELAY));
  }

  createAdmin(adminData: Omit<Admin, 'id'>): Observable<Omit<Admin, 'password'>> {
    const newId = Math.max(...MOCK_ADMINS.map(admin => admin.id || 0)) + 1;
    
    const newAdmin: Admin = {
      id: newId,
      ...adminData
    };
    
    MOCK_ADMINS.push(newAdmin);
    
    const { password, ...adminWithoutPassword } = newAdmin;
    return of(adminWithoutPassword).pipe(delay(this.MOCK_DELAY));
  }

  deleteAdmin(id: number): Observable<boolean> {
    const index = MOCK_ADMINS.findIndex(admin => admin.id === id);
    
    if (index !== -1) {
      MOCK_ADMINS.splice(index, 1);
      return of(true).pipe(delay(this.MOCK_DELAY));
    }
    
    return throwError(() => new Error('Admin not found')).pipe(delay(this.MOCK_DELAY));
  }
}
