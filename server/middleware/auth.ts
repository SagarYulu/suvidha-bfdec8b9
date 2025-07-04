import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name: string;
        role: string;
        userType: 'employee' | 'dashboard_user';
      };
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required' 
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Get user details from database based on user type
    let user;
    if (decoded.userType === 'employee') {
      user = await storage.getEmployeeById(decoded.userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          userType: 'employee'
        };
      }
    } else if (decoded.userType === 'dashboard_user') {
      user = await storage.getDashboardUserById(decoded.userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          userType: 'dashboard_user'
        };
      }
    }

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ 
        error: 'Invalid or expired token' 
      });
    }
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
};

// Middleware to check if user is a dashboard user (admin)
export const requireDashboardUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.userType !== 'dashboard_user') {
    return res.status(403).json({ 
      error: 'Dashboard user access required' 
    });
  }
  next();
};

// Middleware to check if user is an employee
export const requireEmployee = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.userType !== 'employee') {
    return res.status(403).json({ 
      error: 'Employee access required' 
    });
  }
  next();
};