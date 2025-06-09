
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { Issue, IssueFilters } from '@/types';
import { toast } from 'sonner';

export const useIssues = (filters?: IssueFilters) => {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: () => apiService.getIssues(filters),
  });
};

export const useIssue = (id: string) => {
  return useQuery({
    queryKey: ['issue', id],
    queryFn: () => apiService.getIssue(id),
    enabled: !!id,
  });
};

export const useCreateIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (issueData: Partial<Issue>) => apiService.createIssue(issueData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create issue');
    },
  });
};

export const useUpdateIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Issue> }) => 
      apiService.updateIssue(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      toast.success('Issue updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update issue');
    },
  });
};

export const useAssignIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) => 
      apiService.assignIssue(id, assignedTo),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      toast.success('Issue assigned successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to assign issue');
    },
  });
};

export const useDeleteIssue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => apiService.deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete issue');
    },
  });
};
