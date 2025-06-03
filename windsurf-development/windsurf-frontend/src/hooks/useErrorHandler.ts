
import { useCallback } from 'react';
import { toast } from 'sonner';
import { ErrorHandler } from '@/utils/errorHandler';

export const useErrorHandler = () => {
  const handleError = useCallback((error: any, customMessage?: string) => {
    const errorType = ErrorHandler.getErrorType(error);
    const message = ErrorHandler.handle(error, customMessage);

    switch (errorType) {
      case 'auth':
        toast.error('Authentication required. Please log in again.');
        break;
      case 'network':
        toast.error('Network error. Please check your connection and try again.');
        break;
      case 'validation':
        toast.error(message);
        break;
      case 'server':
        toast.error('Server error. Please try again later.');
        break;
      default:
        toast.error(message);
    }

    return message;
  }, []);

  const handleSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  return {
    handleError,
    handleSuccess,
  };
};
