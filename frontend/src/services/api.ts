import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse, LoginCredentials, AuthResponse, User, Feedback, Leave, Student, Report, RoomAllocation, Attendance, Visitor, Payment } from '../types';

class ApiService {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Load token from localStorage
    this.token = localStorage.getItem('authToken');
    if (this.token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
    }

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
    delete this.client.defaults.headers.common['Authorization'];
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async register(userData: Partial<User> & { password: string }): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', userData);
    if (response.data.success && response.data.data.token) {
      this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async verifyToken(): Promise<ApiResponse<{ user: User }>> {
    const response = await this.client.get<ApiResponse<{ user: User }>>('/auth/verify');
    return response.data;
  }

  // Feedback endpoints
  async getFeedback(): Promise<ApiResponse<Feedback[]>> {
    const response = await this.client.get<ApiResponse<Feedback[]>>('/feedback');
    return response.data;
  }

  async createFeedback(data: Partial<Feedback>): Promise<ApiResponse<Feedback>> {
    const response = await this.client.post<ApiResponse<Feedback>>('/feedback', data);
    return response.data;
  }

  async updateFeedback(id: string, data: Partial<Feedback>): Promise<ApiResponse<Feedback>> {
    const response = await this.client.put<ApiResponse<Feedback>>(`/feedback/${id}`, data);
    return response.data;
  }

  async deleteFeedback(id: string): Promise<ApiResponse<{ deletedCount: number }>> {
    const response = await this.client.delete<ApiResponse<{ deletedCount: number }>>(`/feedback/${id}`);
    return response.data;
  }

  // Leave endpoints
  async getLeaves(): Promise<ApiResponse<Leave[]>> {
    const response = await this.client.get<ApiResponse<Leave[]>>('/leaves');
    return response.data;
  }

  async createLeave(data: Partial<Leave>): Promise<ApiResponse<Leave>> {
    const response = await this.client.post<ApiResponse<Leave>>('/leaves', data);
    return response.data;
  }

  async updateLeave(id: string, data: Partial<Leave>): Promise<ApiResponse<Leave>> {
    const response = await this.client.put<ApiResponse<Leave>>(`/leaves/${id}`, data);
    return response.data;
  }

  async deleteLeave(id: string): Promise<ApiResponse<{ deletedCount: number }>> {
    const response = await this.client.delete<ApiResponse<{ deletedCount: number }>>(`/leaves/${id}`);
    return response.data;
  }

  // Student endpoints
  async getStudents(): Promise<ApiResponse<Student[]>> {
    const response = await this.client.get<ApiResponse<Student[]>>('/students');
    return response.data;
  }

  async createStudent(data: Partial<Student>): Promise<ApiResponse<Student>> {
    const response = await this.client.post<ApiResponse<Student>>('/students', data);
    return response.data;
  }

  async updateStudent(id: string, data: Partial<Student>): Promise<ApiResponse<Student>> {
    const response = await this.client.put<ApiResponse<Student>>(`/students/${id}`, data);
    return response.data;
  }

  async deleteStudent(id: string): Promise<ApiResponse<{ deletedCount: number }>> {
    const response = await this.client.delete<ApiResponse<{ deletedCount: number }>>(`/students/${id}`);
    return response.data;
  }

  // Report endpoints
  async getReports(): Promise<ApiResponse<Report[]>> {
    const response = await this.client.get<ApiResponse<Report[]>>('/reports');
    return response.data;
  }

  async createReport(data: Partial<Report>): Promise<ApiResponse<Report>> {
    const response = await this.client.post<ApiResponse<Report>>('/reports', data);
    return response.data;
  }

  async updateReport(id: string, data: Partial<Report>): Promise<ApiResponse<Report>> {
    const response = await this.client.put<ApiResponse<Report>>(`/reports/${id}`, data);
    return response.data;
  }

  async deleteReport(id: string): Promise<ApiResponse<{ deletedCount: number }>> {
    const response = await this.client.delete<ApiResponse<{ deletedCount: number }>>(`/reports/${id}`);
    return response.data;
  }

  // Room allocation endpoints
  async getRoomAllocations(): Promise<ApiResponse<RoomAllocation[]>> {
    const response = await this.client.get<ApiResponse<RoomAllocation[]>>('/room-allocations');
    return response.data;
  }

  async createRoomAllocation(data: Partial<RoomAllocation>): Promise<ApiResponse<RoomAllocation>> {
    const response = await this.client.post<ApiResponse<RoomAllocation>>('/room-allocations', data);
    return response.data;
  }

  async updateRoomAllocation(id: string, data: Partial<RoomAllocation>): Promise<ApiResponse<RoomAllocation>> {
    const response = await this.client.put<ApiResponse<RoomAllocation>>(`/room-allocations/${id}`, data);
    return response.data;
  }

  async deleteRoomAllocation(id: string): Promise<ApiResponse<{ deletedCount: number }>> {
    const response = await this.client.delete<ApiResponse<{ deletedCount: number }>>(`/room-allocations/${id}`);
    return response.data;
  }

  // Attendance endpoints
  async getAttendance(): Promise<ApiResponse<Attendance[]>> {
    const response = await this.client.get<ApiResponse<Attendance[]>>('/attendance');
    return response.data;
  }

  async createAttendance(data: Partial<Attendance>): Promise<ApiResponse<Attendance>> {
    const response = await this.client.post<ApiResponse<Attendance>>('/attendance', data);
    return response.data;
  }

  async deleteAttendance(id: string): Promise<ApiResponse<{ deletedCount: number }>> {
    const response = await this.client.delete<ApiResponse<{ deletedCount: number }>>(`/attendance/${id}`);
    return response.data;
  }

  // Visitor endpoints
  async getVisitors(): Promise<ApiResponse<Visitor[]>> {
    const response = await this.client.get<ApiResponse<Visitor[]>>('/visitors');
    return response.data;
  }

  async createVisitor(data: Partial<Visitor>): Promise<ApiResponse<Visitor>> {
    const response = await this.client.post<ApiResponse<Visitor>>('/visitors', data);
    return response.data;
  }

  async updateVisitor(id: string, data: Partial<Visitor>): Promise<ApiResponse<Visitor>> {
    const response = await this.client.put<ApiResponse<Visitor>>(`/visitors/${id}`, data);
    return response.data;
  }

  async deleteVisitor(id: string): Promise<ApiResponse<{ deletedCount: number }>> {
    const response = await this.client.delete<ApiResponse<{ deletedCount: number }>>(`/visitors/${id}`);
    return response.data;
  }

  // Payment endpoints
  async getPayments(): Promise<ApiResponse<Payment[]>> {
    const response = await this.client.get<ApiResponse<Payment[]>>('/payments');
    return response.data;
  }

  async createPayment(data: Partial<Payment>): Promise<ApiResponse<Payment>> {
    const response = await this.client.post<ApiResponse<Payment>>('/payments', data);
    return response.data;
  }

  async deletePayment(id: string): Promise<ApiResponse<{ deletedCount: number }>> {
    const response = await this.client.delete<ApiResponse<{ deletedCount: number }>>(`/payments/${id}`);
    return response.data;
  }
}

export const apiService = new ApiService();
