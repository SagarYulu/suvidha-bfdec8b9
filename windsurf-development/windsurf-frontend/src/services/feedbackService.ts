
import { apiClient } from '@/utils/apiClient';

interface Feedback {
  id: string;
  issue_id: string;
  employee_uuid: string;
  rating: number;
  comment: string;
  created_at: string;
  employee_name?: string;
}

interface FeedbackStats {
  average_rating: number;
  total_feedback: number;
  positive_feedback: number;
  negative_feedback: number;
  satisfaction_rate: number;
  dissatisfaction_rate: number;
  neutral_feedback: number;
}

interface CreateFeedbackPayload {
  issue_id: string;
  rating: number;
  comment?: string;
}

interface UpdateFeedbackPayload {
  rating?: number;
  comment?: string;
}

interface FeedbackFilters {
  start_date?: string;
  end_date?: string;
  assigned_to?: string;
}

export class FeedbackService {
  // Create feedback
  static async createFeedback(payload: CreateFeedbackPayload): Promise<Feedback> {
    const response = await apiClient.post<Feedback>('/api/feedback', payload);
    return response.data;
  }

  // Get specific feedback
  static async getFeedback(feedbackId: string): Promise<Feedback> {
    const response = await apiClient.get<Feedback>(`/api/feedback/${feedbackId}`);
    return response.data;
  }

  // Get feedback for a specific issue
  static async getIssueFeedback(issueId: string): Promise<{
    feedback: Feedback[];
    average_rating: number;
    total_feedback: number;
  }> {
    const response = await apiClient.get(`/api/feedback/issue/${issueId}`);
    return response.data;
  }

  // Get feedback statistics
  static async getFeedbackStats(filters?: FeedbackFilters): Promise<FeedbackStats> {
    const queryParams = new URLSearchParams();
    if (filters?.start_date) queryParams.append('start_date', filters.start_date);
    if (filters?.end_date) queryParams.append('end_date', filters.end_date);
    if (filters?.assigned_to) queryParams.append('assigned_to', filters.assigned_to);

    const response = await apiClient.get<FeedbackStats>(`/api/feedback/stats/summary?${queryParams}`);
    return response.data;
  }

  // Get user's own feedback
  static async getMyFeedback(): Promise<Array<{
    issue_id: string;
    issue_description: string;
    issue_status: string;
    feedback: Feedback;
  }>> {
    const response = await apiClient.get('/api/feedback/user/me');
    return response.data;
  }

  // Update feedback
  static async updateFeedback(feedbackId: string, payload: UpdateFeedbackPayload): Promise<Feedback> {
    const response = await apiClient.put<Feedback>(`/api/feedback/${feedbackId}`, payload);
    return response.data;
  }

  // Delete feedback
  static async deleteFeedback(feedbackId: string): Promise<void> {
    await apiClient.delete(`/api/feedback/${feedbackId}`);
  }

  // Convenience methods for specific use cases

  // Submit issue resolution feedback
  static async submitResolutionFeedback(
    issueId: string, 
    rating: number, 
    comment?: string
  ): Promise<Feedback> {
    return this.createFeedback({
      issue_id: issueId,
      rating,
      comment
    });
  }

  // Get agent performance based on feedback
  static async getAgentPerformance(agentId: string, dateRange?: {
    start_date: string;
    end_date: string;
  }): Promise<{
    agent_id: string;
    average_rating: number;
    total_issues: number;
    feedback_count: number;
    satisfaction_rate: number;
    recent_feedback: Feedback[];
  }> {
    const filters: FeedbackFilters = {
      assigned_to: agentId,
      ...dateRange
    };

    const stats = await this.getFeedbackStats(filters);
    
    // This would typically be a separate endpoint, but for now we'll construct it
    return {
      agent_id: agentId,
      average_rating: stats.average_rating,
      total_issues: stats.total_feedback, // Assuming 1:1 for now
      feedback_count: stats.total_feedback,
      satisfaction_rate: stats.satisfaction_rate,
      recent_feedback: [] // Would come from a separate endpoint
    };
  }

  // Get feedback trends over time
  static async getFeedbackTrends(days: number = 30): Promise<Array<{
    date: string;
    average_rating: number;
    feedback_count: number;
    satisfaction_rate: number;
  }>> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // This would typically be a separate endpoint for trending data
    // For now, we'll return the structure that would be expected
    const trends: Array<{
      date: string;
      average_rating: number;
      feedback_count: number;
      satisfaction_rate: number;
    }> = [];

    // Implementation would involve making calls to get daily stats
    // This is a placeholder for the expected data structure
    return trends;
  }

  // Get top rated agents
  static async getTopRatedAgents(limit: number = 10): Promise<Array<{
    agent_id: string;
    agent_name: string;
    average_rating: number;
    feedback_count: number;
    satisfaction_rate: number;
  }>> {
    // This would be a specific endpoint for agent rankings
    // Placeholder for expected data structure
    return [];
  }

  // Get feedback summary for dashboard
  static async getDashboardSummary(): Promise<{
    overall_stats: FeedbackStats;
    recent_feedback: Feedback[];
    low_rated_issues: Array<{
      issue_id: string;
      issue_description: string;
      rating: number;
      feedback: Feedback;
    }>;
    improvement_suggestions: string[];
  }> {
    // This would combine multiple endpoints for a dashboard view
    const overall_stats = await this.getFeedbackStats();
    
    return {
      overall_stats,
      recent_feedback: [], // Would come from another endpoint
      low_rated_issues: [], // Would come from another endpoint
      improvement_suggestions: [] // Would be derived from low-rated feedback
    };
  }

  // Bulk operations for admin

  // Export feedback data
  static async exportFeedback(filters?: FeedbackFilters & {
    format?: 'csv' | 'excel';
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    if (filters?.start_date) queryParams.append('start_date', filters.start_date);
    if (filters?.end_date) queryParams.append('end_date', filters.end_date);
    if (filters?.assigned_to) queryParams.append('assigned_to', filters.assigned_to);
    if (filters?.format) queryParams.append('format', filters.format);

    const response = await fetch(`/api/feedback/export?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to export feedback data');
    }

    return response.blob();
  }

  // Get feedback analytics for reporting
  static async getAnalytics(timeframe: 'week' | 'month' | 'quarter' | 'year'): Promise<{
    timeframe: string;
    summary: FeedbackStats;
    trends: Array<{
      period: string;
      average_rating: number;
      feedback_count: number;
    }>;
    category_breakdown: Array<{
      category: string;
      average_rating: number;
      count: number;
    }>;
    agent_performance: Array<{
      agent_id: string;
      agent_name: string;
      average_rating: number;
      feedback_count: number;
    }>;
  }> {
    const response = await apiClient.get(`/api/feedback/analytics?timeframe=${timeframe}`);
    return response.data;
  }
}

export default FeedbackService;
