export interface Admin {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: Date;
  gender: 'Male' | 'Female';
  password?: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  admin: Omit<Admin, 'password'>;
  token: string;
}
