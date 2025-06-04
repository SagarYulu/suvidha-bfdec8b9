
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueService } from '@/services/issueService';
import { toast } from 'sonner';

export function useIssues(params: any = {}) {
  return useQuery({
    queryKey: ['issues', params],
    queryFn: () => issueService.getIssues(params),
  });
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: ['issue', id],
    queryFn: () => issueService.getIssue(id),
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: issueService.createIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create issue');
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      issueService.updateIssue(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update issue');
    },
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => issueService.deleteIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete issue');
    },
  });
}
