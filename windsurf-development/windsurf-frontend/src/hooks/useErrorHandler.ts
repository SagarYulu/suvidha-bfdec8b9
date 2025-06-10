
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, context?: string) => {
    const errorWithMessage = toErrorWithMessage(error);
    const title = context ? `${context} Error` : 'Error';
    
    console.error(`${title}:`, error);
    
    toast({
      title,
      description: errorWithMessage.message,
      variant: "destructive",
    });
  }, []);

  const handleSuccess = useCallback((message: string, title: string = 'Success') => {
    toast({
      title,
      description: message,
    });
  }, []);

  return {
    handleError,
    handleSuccess,
  };
};
