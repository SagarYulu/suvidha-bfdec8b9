
// Authentication Context Logic
// Original file: src/contexts/AuthContext.tsx

class AuthContextManager {
  constructor() {
    this.authState = {
      isAuthenticated: false,
      user: null,
      session: null,
      role: null
    };
    this.isLoading = false;
    this.authService = new AuthService();
  }

  async signIn(email, password) {
    try {
      this.isLoading = true;
      
      // Try local authentication first
      const localUser = await this.authService.login(email, password);
      
      if (localUser) {
        // Store user session
        this.setSession({
          id: localUser.id,
          email: localUser.email,
          name: localUser.name,
          role: localUser.role
        });
        
        this.isLoading = false;
        return true;
      }
      
      this.isLoading = false;
      return false;
    } catch (error) {
      console.error("Sign-in error:", error);
      this.isLoading = false;
      return false;
    }
  }

  async logout() {
    try {
      this.isLoading = true;
      
      // Clear local storage
      this.clearSession();
      
      // Update auth state
      this.authState = {
        isAuthenticated: false,
        user: null,
        session: null,
        role: null,
      };
      
      this.isLoading = false;
    } catch (error) {
      console.error("Logout error:", error);
      this.isLoading = false;
      throw new Error(error.message || "Failed to log out");
    }
  }

  setSession(userData) {
    const newAuthState = {
      isAuthenticated: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
      },
      session: null,
      role: userData.role,
    };
    
    this.authState = newAuthState;
    // Store in localStorage or session storage
    localStorage.setItem('authState', JSON.stringify(newAuthState));
    localStorage.setItem('mockUser', JSON.stringify(userData));
  }

  clearSession() {
    localStorage.removeItem('mockUser');
    localStorage.removeItem('authState');
  }

  async refreshSession() {
    try {
      // Check for mock user first
      const mockUserStr = localStorage.getItem('mockUser');
      if (mockUserStr) {
        const mockUser = JSON.parse(mockUserStr);
        if (mockUser && mockUser.email) {
          const newAuthState = {
            isAuthenticated: true,
            user: {
              id: mockUser.id || `mock-${Date.now()}`,
              email: mockUser.email,
              name: mockUser.name || mockUser.email.split('@')[0],
            },
            session: null,
            role: mockUser.role || 'user',
          };
          
          this.authState = newAuthState;
          localStorage.setItem('authState', JSON.stringify(newAuthState));
          return;
        }
      }

      // If no session found
      const newAuthState = {
        isAuthenticated: false,
        user: null,
        session: null,
        role: null,
      };
      
      this.authState = newAuthState;
      localStorage.removeItem('authState');
    } catch (error) {
      console.error("Error refreshing session:", error);
      this.authState = {
        isAuthenticated: false,
        user: null,
        session: null,
        role: null,
      };
      localStorage.removeItem('authState');
    }
  }
}

module.exports = { AuthContextManager };
