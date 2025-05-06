import { Injectable } from '@angular/core';
import { Observable, of, delay, map } from 'rxjs';
import { Leave, LeaveStatus } from '../../models/leave.model';

@Injectable({
  providedIn: 'root'
})
export class LeaveMockService {
  private leaves: Leave[] = [
    {
      id: 1,
      employeeId: 1,
      reason: 'Vacation',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-15'),
      status: LeaveStatus.APPROVED,
      durationDays: 1
    },
    {
      id: 2,
      employeeId: 2,
      reason: 'Sick Leave',
      startDate: new Date('2025-02-10'),
      endDate: new Date('2025-02-10'),
      status: LeaveStatus.APPROVED,
      durationDays: 1
    },
    {
      id: 3,
      employeeId: 1,
      reason: 'Family Emergency',
      startDate: new Date('2025-03-05'),
      endDate: new Date('2025-03-05'),
      status: LeaveStatus.APPROVED,
      durationDays: 1
    },
    {
      id: 4,
      employeeId: 3,
      reason: 'Medical Appointment',
      startDate: new Date('2025-04-20'),
      endDate: new Date('2025-04-20'),
      status: LeaveStatus.PENDING,
      durationDays: 1
    },
    {
      id: 5,
      employeeId: 2,
      reason: 'Personal Leave',
      startDate: new Date('2025-05-12'),
      endDate: new Date('2025-05-12'),
      status: LeaveStatus.APPROVED,
      durationDays: 1
    },
    {
      id: 6,
      employeeId: 1,
      reason: 'Doctor Appointment',
      startDate: new Date('2025-04-10'),
      endDate: new Date('2025-04-10'),
      status: LeaveStatus.APPROVED,
      durationDays: 1
    },
    {
      id: 7,
      employeeId: 3,
      reason: 'Personal Matters',
      startDate: new Date('2025-01-05'),
      endDate: new Date('2025-01-05'),
      status: LeaveStatus.APPROVED,
      durationDays: 1
    },
    {
      id: 8,
      employeeId: 2,
      reason: 'Family Event',
      startDate: new Date('2025-03-15'),
      endDate: new Date('2025-03-15'),
      status: LeaveStatus.APPROVED,
      durationDays: 1
    },
    {
      id: 9,
      employeeId: 3,
      reason: 'Dental Checkup',
      startDate: new Date('2025-02-22'),
      endDate: new Date('2025-02-22'),
      status: LeaveStatus.APPROVED,
      durationDays: 1
    },
    {
      id: 10,
      employeeId: 1,
      reason: 'Personal Leave',
      startDate: new Date('2025-05-20'),
      endDate: new Date('2025-05-20'),
      status: LeaveStatus.PENDING,
      durationDays: 1
    }
  ];

  getAllLeaves(): Observable<Leave[]> {
    return of([...this.leaves]).pipe(delay(500));
  }

  getLeavesByEmployeeId(employeeId: number): Observable<Leave[]> {
    const employeeLeaves = this.leaves.filter(leave => leave.employeeId === employeeId);
    return of(employeeLeaves).pipe(delay(500));
  }

  getLeaveById(id: number): Observable<Leave | null> {
    const leave = this.leaves.find(leave => leave.id === id);
    return of(leave || null).pipe(delay(500));
  }

  createLeave(leaveData: Omit<Leave, 'id'>): Observable<Leave> {
    const newId = Math.max(...this.leaves.map(leave => leave.id || 0), 0) + 1;
    const newLeave: Leave = {
      ...leaveData,
      id: newId,
      status: LeaveStatus.PENDING
    };
    
    this.leaves.push(newLeave);
    return of(newLeave).pipe(delay(500));
  }

  updateLeave(id: number, leaveData: Partial<Leave>): Observable<Leave | null> {
    const index = this.leaves.findIndex(leave => leave.id === id);
    if (index === -1) {
      return of(null).pipe(delay(500));
    }
    
    this.leaves[index] = { ...this.leaves[index], ...leaveData };
    return of(this.leaves[index]).pipe(delay(500));
  }

  deleteLeave(id: number): Observable<boolean> {
    const initialLength = this.leaves.length;
    this.leaves = this.leaves.filter(leave => leave.id !== id);
    return of(this.leaves.length < initialLength).pipe(delay(500));
  }

  getLeavesCountByMonth(employeeId: number, year: number = new Date().getFullYear()): Observable<{ [month: string]: number }> {
    const leavesPerMonth: { [month: string]: number } = {};
    
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(year, i, 1).toLocaleString('default', { month: 'long' });
      leavesPerMonth[monthName] = 0;
    }
    
    this.leaves
      .filter(leave => 
        leave.employeeId === employeeId && 
        new Date(leave.startDate).getFullYear() === year &&
        leave.status === LeaveStatus.APPROVED)
      .forEach(leave => {
        const monthName = new Date(leave.startDate).toLocaleString('default', { month: 'long' });
        leavesPerMonth[monthName] = 1;
      });
    
    return of(leavesPerMonth).pipe(delay(500));
  }

  getTotalLeaveDays(employeeId: number, year: number = new Date().getFullYear()): Observable<number> {
    const uniqueMonths = new Set<string>();
    
    this.leaves
      .filter(leave => 
        leave.employeeId === employeeId && 
        new Date(leave.startDate).getFullYear() === year &&
        leave.status === LeaveStatus.APPROVED)
      .forEach(leave => {
        const monthName = new Date(leave.startDate).toLocaleString('default', { month: 'long' });
        uniqueMonths.add(monthName);
      });
    
    const totalDays = uniqueMonths.size;
    
    return of(totalDays).pipe(delay(500));
  }

  getRemainingLeaveDays(employeeId: number, year: number = new Date().getFullYear(), maxDaysPerYear: number = 12): Observable<number> {
    return this.getTotalLeaveDays(employeeId, year).pipe(
      delay(100),
      map(usedDays => Math.max(0, maxDaysPerYear - usedDays))
    );
  }
}
