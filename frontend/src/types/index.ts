export interface User {
  id: string;
  email: string;
  name: string;
  room: string;
  hostelType: 'boys' | 'girls';
  hostelName: string;
  avatar: string;
  theme: 'light' | 'dark';
  isAdmin: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
  error?: string;
}

export interface Feedback {
  _id?: string;
  user: string;
  email: string;
  mealType: string;
  foodRating: number;
  comments: string;
  response?: string;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Leave {
  _id?: string;
  user: string;
  email: string;
  type: string;
  from: Date;
  to: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Student {
  _id?: string;
  name: string;
  roll: string;
  email: string;
  room: string;
  department: string;
  phone: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Report {
  _id?: string;
  user: string;
  email: string;
  category: string;
  location: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'resolved';
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoomAllocation {
  _id?: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  hostelName: string;
  allocationDate: Date;
  status: 'occupied' | 'vacant';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Attendance {
  _id?: string;
  studentId: string;
  studentName: string;
  date: Date;
  status: 'present' | 'absent' | 'late';
  type: 'morning' | 'evening';
  recordedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Visitor {
  _id?: string;
  name: string;
  phone: string;
  purpose: string;
  studentVisiting: string;
  entryTime: Date;
  exitTime?: Date;
  status: 'visiting' | 'exited';
  expectedDuration: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Payment {
  _id?: string;
  studentId: string;
  studentName: string;
  amount: number;
  type: 'hostel' | 'mess' | 'other';
  method: 'cash' | 'online' | 'cheque';
  date: Date;
  status: 'paid' | 'pending';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  details?: string[];
}
