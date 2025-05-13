
// Re-export from the ui component
export { useToast, toast } from "@/components/ui/use-toast";

// Add a custom toast function for priority updates
export const priorityUpdateToast = (status: 'success' | 'error' | 'info', message: string, details?: string) => {
  const { toast } = useToast();
  
  toast({
    title: status === 'success' ? 'Priority Update' : 
           status === 'error' ? 'Update Failed' : 'Information',
    description: (
      <div>
        <p>{message}</p>
        {details && <p className="text-xs text-gray-500 mt-1">{details}</p>}
      </div>
    ),
    variant: status === 'error' ? 'destructive' : 'default',
  });
};
