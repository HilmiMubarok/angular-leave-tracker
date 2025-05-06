import { Admin } from '../models';

export const MOCK_ADMINS: Admin[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'admin@example.com',
    birthDate: new Date('1990-01-15'),
    gender: 'Male',
    password: 'password123',
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    birthDate: new Date('1985-05-20'),
    gender: 'Female',
    password: 'Koploplo123!@#',
  },
  {
    id: 3,
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@example.com',
    birthDate: new Date('1992-11-08'),
    gender: 'Male',
    password: 'password123',
  },
];

export const getAdminByCredentials = (
  email: string,
  password: string
): Admin | undefined => {
  return MOCK_ADMINS.find(
    (admin) => admin.email === email && admin.password === password
  );
};

export const getAdminById = (id: number): Admin | undefined => {
  return MOCK_ADMINS.find((admin) => admin.id === id);
};

export const updateAdmin = (updatedAdmin: Admin): Admin | null => {
  const index = MOCK_ADMINS.findIndex((admin) => admin.id === updatedAdmin.id);
  
  if (index !== -1) {
    MOCK_ADMINS[index] = { ...MOCK_ADMINS[index], ...updatedAdmin };
    return MOCK_ADMINS[index];
  }
  
  return null;
};
