import { Employee } from '../models';

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-123-4567',
    address: '123 Main St, New York, NY 10001',
    gender: 'Male'
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-987-6543',
    address: '456 Park Ave, Boston, MA 02108',
    gender: 'Female'
  },
  {
    id: 3,
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@example.com',
    phone: '+1-555-456-7890',
    address: '789 Oak St, Chicago, IL 60601',
    gender: 'Male'
  },
  {
    id: 4,
    firstName: 'Emily',
    lastName: 'Williams',
    email: 'emily.williams@example.com',
    phone: '+1-555-789-0123',
    address: '321 Pine St, San Francisco, CA 94101',
    gender: 'Female'
  },
  {
    id: 5,
    firstName: 'Alex',
    lastName: 'Taylor',
    email: 'alex.taylor@example.com',
    phone: '+1-555-234-5678',
    address: '654 Cedar St, Seattle, WA 98101',
    gender: 'Male'
  }
];

export const getEmployeeById = (id: number): Employee | undefined => {
  return MOCK_EMPLOYEES.find(employee => employee.id === id);
};

export const updateEmployee = (updatedEmployee: Employee): Employee | null => {
  const index = MOCK_EMPLOYEES.findIndex(employee => employee.id === updatedEmployee.id);
  
  if (index !== -1) {
    MOCK_EMPLOYEES[index] = { ...updatedEmployee };
    return MOCK_EMPLOYEES[index];
  }
  
  return null;
};

export const deleteEmployee = (id: number): boolean => {
  const index = MOCK_EMPLOYEES.findIndex(employee => employee.id === id);
  
  if (index !== -1) {
    MOCK_EMPLOYEES.splice(index, 1);
    return true;
  }
  
  return false;
};
