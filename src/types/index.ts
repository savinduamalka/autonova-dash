export type Role = 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';

export interface AuthUser {
  id: number;
  userName: string;
  email: string;
  role: string;
}

export interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  vehicles: Vehicle[];
}

export interface CustomerUpdate {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
}

export type VehicleInput = Omit<Vehicle, 'id'>;

export * from './appointment';

export type ProjectStatus =
  | 'planned'
  | 'in_progress'
  | 'blocked'
  | 'completed'
  | 'canceled';

export type Project = {
  id: string;
  title: string;
  description?: string;
  customerId: string;
  vehicleId: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  progressPct: number;
  assigneeId?: string;
};

export type TimeLog = {
  id: string;
  employeeId: string;
  projectId?: string;
  appointmentId?: string;
  task: string;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  notes?: string;
  loggedAt: string;
  reviewed?: boolean;
};

export type Invoice = {
  id: string;
  customerId: string;
  items: { description: string; qty: number; unitPrice: number }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'due' | 'paid' | 'void';
  issuedAt: string;
  paidAt?: string;
  paymentRef?: string;
};

export type Notification = {
  id: string;
  type: 'status' | 'reminder' | 'payment' | 'system';
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
  customerId?: string;
  projectId?: string;
  appointmentId?: string;
};

export type ServicePrice = {
  id: string;
  name: string;
  basePrice: number;
  description?: string;
  active: boolean;
};

export interface LoginResponse {
  token: string;
  type: string;
  user: AuthUser;
}
