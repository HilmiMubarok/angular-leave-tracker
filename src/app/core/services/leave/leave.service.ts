import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Leave, LeaveStatistics, LeaveStatus } from '../../models/leave.model';
import { LeaveMockService } from '../../mock-services/leave/leave-mock.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveService {
  private leaveMockService = inject(LeaveMockService);

  private leavesSignal = signal<Leave[]>([]);
  private selectedLeaveSignal = signal<Leave | null>(null);
  private loadingSignal = signal<boolean>(false);

  readonly leaves = this.leavesSignal.asReadonly();
  readonly selectedLeave = this.selectedLeaveSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  getAllLeaves(): Observable<Leave[]> {
    this.loadingSignal.set(true);
    
    return this.leaveMockService.getAllLeaves().pipe(
      tap(leaves => {
        this.leavesSignal.set(leaves);
        this.loadingSignal.set(false);
      })
    );
  }

  getLeaveById(id: number): Observable<Leave | null> {
    this.loadingSignal.set(true);
    
    return this.leaveMockService.getLeaveById(id).pipe(
      tap(leave => {
        this.selectedLeaveSignal.set(leave);
        this.loadingSignal.set(false);
      })
    );
  }

  getLeavesByEmployeeId(employeeId: number): Observable<Leave[]> {
    this.loadingSignal.set(true);
    
    return this.leaveMockService.getLeavesByEmployeeId(employeeId).pipe(
      tap(leaves => {
        this.leavesSignal.set(leaves);
        this.loadingSignal.set(false);
      })
    );
  }

  createLeave(leaveData: Omit<Leave, 'id'>): Observable<Leave> {
    this.loadingSignal.set(true);
    
    return this.leaveMockService.createLeave(leaveData).pipe(
      tap(newLeave => {
        this.leavesSignal.update(leaves => [...leaves, newLeave]);
        this.loadingSignal.set(false);
      })
    );
  }

  updateLeave(id: number, leaveData: Partial<Leave>): Observable<Leave | null> {
    this.loadingSignal.set(true);
    
    return this.leaveMockService.updateLeave(id, leaveData).pipe(
      tap(updatedLeave => {
        if (updatedLeave) {
          this.leavesSignal.update(leaves => 
            leaves.map(leave => leave.id === id ? updatedLeave : leave)
          );
          
          if (this.selectedLeaveSignal()?.id === id) {
            this.selectedLeaveSignal.set(updatedLeave);
          }
        }
        this.loadingSignal.set(false);
      })
    );
  }

  deleteLeave(id: number): Observable<boolean> {
    this.loadingSignal.set(true);
    
    return this.leaveMockService.deleteLeave(id).pipe(
      tap(success => {
        if (success) {
          this.leavesSignal.update(leaves => 
            leaves.filter(leave => leave.id !== id)
          );
          
          if (this.selectedLeaveSignal()?.id === id) {
            this.selectedLeaveSignal.set(null);
          }
        }
        this.loadingSignal.set(false);
      })
    );
  }

  clearSelectedLeave(): void {
    this.selectedLeaveSignal.set(null);
  }

  getLeaveStatistics(employeeId: number, year: number = new Date().getFullYear()): Observable<LeaveStatistics> {
    this.loadingSignal.set(true);
    
    const MAX_LEAVE_DAYS_PER_YEAR = 12;
    
    return new Observable<LeaveStatistics>(observer => {
      this.leaveMockService.getTotalLeaveDays(employeeId, year).subscribe({
        next: totalDays => {
          const remainingDays = Math.max(0, MAX_LEAVE_DAYS_PER_YEAR - totalDays);
          
          this.leaveMockService.getLeavesCountByMonth(employeeId, year).subscribe({
            next: leavesPerMonth => {
              const statistics: LeaveStatistics = {
                totalLeavesThisYear: totalDays,
                remainingLeavesThisYear: remainingDays,
                leavesPerMonth
              };
              
              observer.next(statistics);
              observer.complete();
              this.loadingSignal.set(false);
            },
            error: err => {
              observer.error(err);
              this.loadingSignal.set(false);
            }
          });
        },
        error: err => {
          observer.error(err);
          this.loadingSignal.set(false);
        }
      });
    });
  }

  validateLeaveRequest(employeeId: number, startDate: Date, endDate: Date): Observable<{ valid: boolean, message?: string }> {
    const year = startDate.getFullYear();
    const startMonth = startDate.getMonth();
    const endMonth = endDate.getMonth();
    
    return new Observable<{ valid: boolean, message?: string }>(observer => {
      if (startMonth !== endMonth || startDate.getFullYear() !== endDate.getFullYear()) {
        observer.next({
          valid: false,
          message: 'Leave request cannot span multiple months. Each leave must be within a single month.'
        });
        observer.complete();
        return;
      }
      
      const durationInDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (durationInDays > 1) {
        observer.next({
          valid: false,
          message: 'Each employee can only use 1 leave day per month.'
        });
        observer.complete();
        return;
      }
      
      this.leaveMockService.getAllLeaves().subscribe({
        next: allLeaves => {
          const monthName = new Date(year, startMonth, 1).toLocaleString('default', { month: 'long' });
          
          const pendingLeavesInSameMonth = allLeaves.filter(leave => {
            const leaveMonth = new Date(leave.startDate).getMonth();
            const leaveYear = new Date(leave.startDate).getFullYear();
            
            return leave.employeeId === employeeId && 
                  leaveMonth === startMonth && 
                  leaveYear === year && 
                  leave.status === LeaveStatus.PENDING;
          });
          
          if (pendingLeavesInSameMonth.length > 0) {
            observer.next({
              valid: false,
              message: `You already have a pending leave request for ${monthName}. Please wait for approval before submitting another request.`
            });
            observer.complete();
            return;
          }
          
          this.leaveMockService.getLeavesCountByMonth(employeeId, year).subscribe({
            next: leavesPerMonth => {
              if (leavesPerMonth[monthName] > 0) {
                observer.next({ 
                  valid: false, 
                  message: `You have already used your leave day for ${monthName}. Each employee can only use 1 leave day per month.`
                });
                observer.complete();
                return;
              }
              
              this.leaveMockService.getTotalLeaveDays(employeeId, year).subscribe({
                next: totalDays => {
                  const MAX_LEAVE_DAYS_PER_YEAR = 12;
                  
                  if (totalDays + durationInDays > MAX_LEAVE_DAYS_PER_YEAR) {
                    observer.next({ 
                      valid: false, 
                      message: `This leave would exceed your annual limit of ${MAX_LEAVE_DAYS_PER_YEAR} days`
                    });
                    observer.complete();
                    return;
                  }
                  observer.next({ valid: true });
                  observer.complete();
                },
                error: err => observer.error(err)
              });
            },
            error: err => observer.error(err)
          });
        },
        error: err => observer.error(err)
      });
    });
  }
}
