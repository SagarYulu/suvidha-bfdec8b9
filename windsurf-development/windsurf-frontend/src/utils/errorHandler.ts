
interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class ErrorHandler {
  static handle(error: any, defaultMessage: string = 'An error occurred'): string {
    console.error('Error:', error);

    // Handle API errors
    if (error.name === 'ApiError') {
      return error.message;
    }

    // Handle network errors
    if (!navigator.onLine) {
      return 'No internet connection. Please check your network.';
    }

    // Handle fetch errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return 'Server is unreachable. Please try again later.';
    }

    // Handle generic errors
    if (error.message) {
      return error.message;
    }

    return defaultMessage;
  }

  static isAuthError(error: any): boolean {
    return error.name === 'ApiError' && (error.status === 401 || error.status === 403);
  }

  static isNetworkError(error: any): boolean {
    return !navigator.onLine || 
           (error instanceof TypeError && error.message.includes('fetch')) ||
           (error.name === 'ApiError' && error.status === 0);
  }

  static getErrorType(error: any): 'auth' | 'network' | 'validation' | 'server' | 'unknown' {
    if (this.isAuthError(error)) return 'auth';
    if (this.isNetworkError(error)) return 'network';
    
    if (error.name === 'ApiError') {
      if (error.status >= 400 && error.status < 500) return 'validation';
      if (error.status >= 500) return 'server';
    }
    
    return 'unknown';
  }
}
