export interface Leave {
  id?: number;
  employeeId: number;
  reason: string;
  startDate: Date;
  endDate: Date;
  status?: 'Pending' | 'Approved' | 'Rejected';
  durationDays?: number;
}

export interface LeaveStatistics {
  totalLeavesThisYear: number;
  remainingLeavesThisYear: number;
  leavesPerMonth: { [month: string]: number };
}

export enum LeaveStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}
