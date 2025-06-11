
import jwt from 'jsonwebtoken';
import { User } from '@/types';
import { mockUsers } from '@/data/mockData';

// Mock admin user
const adminUser: User = {
  id: 'admin-123',
  userId: 'admin-user-123',
  name: 'Admin User',
  email: 'admin@example.com',
  phone: '1234567890',
  employeeId: 'EMP001',
  city: 'Bangalore',
  cluster: 'South',
  manager: 'Manager Name',
  role: 'admin',
  password: 'admin123',
  dateOfJoining: '2023-01-01',
  bloodGroup: 'A+',
  dateOfBirth: '1990-01-01',
  accountNumber: '123456789',
  ifscCode: 'ABC123',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true,
};

const users = [adminUser, ...mockUsers];

export const authenticateUser = async (email: string, password: string) => {
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('User not found');
  }

  // In a real app, you'd compare hashed passwords
  const isValidPassword = user.password === password;
  
  if (!isValidPassword) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    'your-secret-key',
    { expiresIn: '24h' }
  );

  const { password: _, ...userWithoutPassword } = user;
  
  return {
    user: userWithoutPassword,
    token
  };
};

export const validateToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, 'your-secret-key') as any;
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  const id = `user-${Date.now()}`;
  // For mock service, store password as plain text
  const password = userData.password || 'default123';
  
  const newUser: User = {
    ...userData,
    id,
    password,
    role: userData.role as 'admin' | 'manager' | 'agent' | 'employee',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  };

  users.push(newUser);
  
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

export const updateUser = async (id: string, userData: Partial<User>) => {
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  // For mock service, store password as plain text if provided
  const updateData = { ...userData };
  if (userData.password) {
    updateData.password = userData.password;
  }

  users[userIndex] = {
    ...users[userIndex],
    ...updateData,
    role: userData.role as 'admin' | 'manager' | 'agent' | 'employee',
    updatedAt: new Date().toISOString(),
  };

  const { password: _, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
};

export const deleteUser = async (id: string) => {
  const userIndex = users.findIndex(u => u.id === id);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }

  users.splice(userIndex, 1);
  return true;
};

export const getAllUsers = async () => {
  return users.map(user => {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};
