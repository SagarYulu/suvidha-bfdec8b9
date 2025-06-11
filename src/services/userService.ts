import { User } from '@/types';

// Mock user data with proper typing
const mockUsers: User[] = [
  {
    id: 'user-1',
    userId: 'emp-001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '9876543210',
    employeeId: 'EMP001',
    city: 'Bangalore',
    cluster: 'South',
    manager: 'Manager Smith',
    role: 'employee',
    password: 'password123',
    dateOfJoining: '2023-01-15',
    bloodGroup: 'O+',
    dateOfBirth: '1990-05-20',
    accountNumber: '1234567890',
    ifscCode: 'HDFC0001234',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'user-2',
    userId: 'emp-002',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '9876543211',
    employeeId: 'EMP002',
    city: 'Delhi',
    cluster: 'North',
    manager: 'Manager Jones',
    role: 'agent',
    password: 'password456',
    dateOfJoining: '2023-02-20',
    bloodGroup: 'B+',
    dateOfBirth: '1992-10-10',
    accountNumber: '2345678901',
    ifscCode: 'ICIC0005678',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: false,
  },
  {
    id: 'user-3',
    userId: 'emp-003',
    name: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phone: '9876543212',
    employeeId: 'EMP003',
    city: 'Mumbai',
    cluster: 'West',
    manager: 'Manager Smith',
    role: 'manager',
    password: 'password789',
    dateOfJoining: '2023-03-25',
    bloodGroup: 'AB+',
    dateOfBirth: '1988-07-04',
    accountNumber: '3456789012',
    ifscCode: 'SBIN0000456',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
  },
];

// Function to get all users
export const getUsers = async (): Promise<User[]> => {
  return mockUsers;
};

// Function to get a user by ID
export const getUserById = async (id: string): Promise<User | undefined> => {
  return mockUsers.find(user => user.id === id);
};

// Function to create a new user
export const createUser = async (user: User): Promise<User> => {
  mockUsers.push(user);
  return user;
};

// Function to update an existing user
export const updateUser = async (id: string, updatedUser: User): Promise<User | undefined> => {
  const index = mockUsers.findIndex(user => user.id === id);
  if (index !== -1) {
    mockUsers[index] = updatedUser;
    return updatedUser;
  }
  return undefined;
};

// Function to delete a user by ID
export const deleteUser = async (id: string): Promise<boolean> => {
  const index = mockUsers.findIndex(user => user.id === id);
  if (index !== -1) {
    mockUsers.splice(index, 1);
    return true;
  }
  return false;
};
