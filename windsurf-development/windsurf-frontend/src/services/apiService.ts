
// Main API service that re-exports all the modular services
// This maintains backwards compatibility while using the new modular structure

export { AuthService } from './authService';
export { IssueService } from './issueService';
export { UserService } from './userService';
export { DashboardService } from './dashboardService';
export { FileService } from './fileService';
export { AnalyticsService } from './analyticsService';
export { NotificationService } from './notificationService';

// Legacy ApiService class for backwards compatibility
import { AuthService } from './authService';
import { IssueService } from './issueService';
import { UserService } from './userService';
import { DashboardService } from './dashboardService';
import { FileService } from './fileService';
import { AnalyticsService } from './analyticsService';
import { NotificationService } from './notificationService';
import { API_CONFIG } from '@/config/api';

export class ApiService {
  // Authentication methods
  static async login(credentials: { email: string; password: string }) {
    return AuthService.login(credentials);
  }

  static async mobileLogin(credentials: { employeeId: string; email: string }) {
    return AuthService.mobileLogin(credentials);
  }

  static async logout() {
    return AuthService.logout();
  }

  // Issues methods
  static async getIssues(params?: any) {
    return IssueService.getIssues(params);
  }

  static async getIssue(id: string) {
    return IssueService.getIssue(id);
  }

  static async createIssue(issueData: any) {
    return IssueService.createIssue(issueData);
  }

  static async updateIssue(id: string, updateData: any) {
    return IssueService.updateIssue(id, updateData);
  }

  static async assignIssue(id: string, assigneeId: string) {
    return IssueService.assignIssue(id, assigneeId);
  }

  static async addComment(id: string, content: string) {
    return IssueService.addComment(id, content);
  }

  static async addInternalComment(id: string, content: string) {
    return IssueService.addInternalComment(id, content);
  }

  // File upload methods
  static async uploadFile(file: File, category = 'attachments') {
    return FileService.uploadFile(file, category);
  }

  static async uploadMultipleFiles(files: File[], category = 'attachments') {
    return FileService.uploadMultipleFiles(files, category);
  }

  static async deleteFile(filename: string, category = 'attachments') {
    return FileService.deleteFile(filename, category);
  }

  // Real-time connection
  static createRealtimeConnection() {
    const token = localStorage.getItem('authToken');
    const eventSource = new EventSource(`${API_CONFIG.BASE_URL}/api/realtime/stream?token=${token}`);
    return eventSource;
  }

  // Dashboard methods
  static async getDashboardMetrics(filters?: any) {
    return DashboardService.getMetrics(filters);
  }

  static async getChartData(type: string, filters?: any) {
    return DashboardService.getChartData(type, filters);
  }

  // Users methods
  static async getUsers(params?: any) {
    return UserService.getUsers(params);
  }

  static async createUser(userData: any) {
    return UserService.createUser(userData);
  }

  static async updateUser(id: string, userData: any) {
    return UserService.updateUser(id, userData);
  }

  // Analytics methods
  static async getAnalytics(params?: any) {
    return AnalyticsService.getAnalytics(params);
  }

  static async exportData(type: string, filters?: any) {
    return AnalyticsService.exportData(type, 'csv', filters);
  }

  // Notifications methods
  static async getNotifications(userId: string, params?: any) {
    return NotificationService.getNotifications(userId, params);
  }

  static async markNotificationAsRead(notificationId: string) {
    return NotificationService.markNotificationAsRead(notificationId);
  }

  static async markAllNotificationsAsRead(userId: string) {
    return NotificationService.markAllNotificationsAsRead(userId);
  }

  // Health check
  static async getHealthStatus() {
    return fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`).then(res => res.json());
  }

  static async getServiceStatus() {
    return fetch(`${API_CONFIG.BASE_URL}/api/status`).then(res => res.json());
  }
}

export default ApiService;
