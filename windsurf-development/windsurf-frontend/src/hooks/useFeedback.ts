
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface Feedback {
  id: string;
  issue_id: string;
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
}

interface UseFeedbackReturn {
  feedback: Feedback | null;
  isLoading: boolean;
  isSubmitting: boolean;
  submitFeedback: (issueId: string, rating: number, comment?: string) => Promise<boolean>;
  updateFeedback: (feedbackId: string, rating: number, comment?: string) => Promise<boolean>;
  deleteFeedback: (feedbackId: string) => Promise<boolean>;
  fetchIssueFeedback: (issueId: string) => Promise<void>;
}

export const useFeedback = (): UseFeedbackReturn => {
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async (issueId: string, rating: number, comment?: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          issue_id: issueId,
          rating,
          comment: comment || ''
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.data);
        
        toast({
          title: 'Feedback submitted',
          description: 'Thank you for your feedback!'
        });
        
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit feedback');
      }
    } catch (error: any) {
      console.error('Submit feedback error:', error);
      toast({
        title: 'Submission failed',
        description: error.message || 'Failed to submit feedback',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFeedback = async (feedbackId: string, rating: number, comment?: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating,
          comment: comment || ''
        })
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(data.data);
        
        toast({
          title: 'Feedback updated',
          description: 'Your feedback has been updated successfully'
        });
        
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update feedback');
      }
    } catch (error: any) {
      console.error('Update feedback error:', error);
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update feedback',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteFeedback = async (feedbackId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setFeedback(null);
        
        toast({
          title: 'Feedback deleted',
          description: 'Your feedback has been deleted'
        });
        
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete feedback');
      }
    } catch (error: any) {
      console.error('Delete feedback error:', error);
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete feedback',
        variant: 'destructive'
      });
      return false;
    }
  };

  const fetchIssueFeedback = async (issueId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/feedback/issue/${issueId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Assuming the API returns the first feedback for the current user
        if (data.data.feedback && data.data.feedback.length > 0) {
          setFeedback(data.data.feedback[0]);
        } else {
          setFeedback(null);
        }
      } else {
        setFeedback(null);
      }
    } catch (error) {
      console.error('Fetch feedback error:', error);
      setFeedback(null);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    feedback,
    isLoading,
    isSubmitting,
    submitFeedback,
    updateFeedback,
    deleteFeedback,
    fetchIssueFeedback
  };
};

export const useFeedbackStats = (filters?: any) => {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters?.startDate) queryParams.append('start_date', filters.startDate);
      if (filters?.endDate) queryParams.append('end_date', filters.endDate);
      if (filters?.assignedTo) queryParams.append('assigned_to', filters.assignedTo);

      const response = await fetch(`/api/feedback/stats/summary?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Fetch feedback stats error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [filters]);

  return {
    stats,
    isLoading,
    refetch: fetchStats
  };
};

export const useMyFeedback = () => {
  const [myFeedback, setMyFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/feedback/user/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyFeedback(data.data || []);
      }
    } catch (error) {
      console.error('Fetch my feedback error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFeedback();
  }, []);

  return {
    myFeedback,
    isLoading,
    refetch: fetchMyFeedback
  };
};
