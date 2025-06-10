
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/apiService';
import { Issue } from '@/types';

interface UseIssuesParams {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  assignedTo?: string;
  employeeUuid?: string;
}

export const useIssues = (params: UseIssuesParams = {}) => {
  return useQuery({
    queryKey: ['issues', params],
    queryFn: () => apiService.getIssues(params),
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
    },
  });
};
