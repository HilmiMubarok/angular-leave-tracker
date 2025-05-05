export interface Employee {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  gender: 'Male' | 'Female' | 'Other';
}

export interface EmployeeWithLeaves extends Employee {
  leaves?: Leave[];
}

interface Leave {
  id?: number;
  employeeId: number;
  reason: string;
  startDate: Date;
  endDate: Date;
  status?: 'Pending' | 'Approved' | 'Rejected';
}
