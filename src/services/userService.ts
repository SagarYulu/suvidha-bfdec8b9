
import { User } from "@/types";
import { MOCK_USERS } from "@/data/mockData";

// In-memory storage for the mock users
let users = [...MOCK_USERS];

export const getUsers = (): Promise<User[]> => {
  return Promise.resolve(users);
};

export const getUserById = (id: string): Promise<User | undefined> => {
  const user = users.find(user => user.id === id);
  return Promise.resolve(user);
};

export const createUser = (user: Omit<User, 'id'>): Promise<User> => {
  const newUser: User = {
    id: `${users.length + 1}`,
    ...user,
  };
  
  users = [...users, newUser];
  return Promise.resolve(newUser);
};

export const updateUser = (id: string, userData: Partial<User>): Promise<User | undefined> => {
  let updatedUser: User | undefined;
  
  users = users.map(user => {
    if (user.id === id) {
      updatedUser = { ...user, ...userData };
      return updatedUser;
    }
    return user;
  });
  
  return Promise.resolve(updatedUser);
};

export const deleteUser = (id: string): Promise<boolean> => {
  const initialLength = users.length;
  users = users.filter(user => user.id !== id);
  
  return Promise.resolve(users.length < initialLength);
};
