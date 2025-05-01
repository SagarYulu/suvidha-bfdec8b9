
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { formatDateToYYYYMMDD } from '@/utils/dateUtils';

/**
 * Fetches all employees from Supabase and maps them to the User type
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }

    console.log(`Fetched ${employees?.length || 0} users:`, employees);

    // Map the employees from Supabase format to our User type
    return employees.map(employee => ({
      id: String(employee.id),
      userId: employee.user_id || '',
      name: employee.name,
      email: employee.email,
      phone: employee.phone || '',
      employeeId: employee.emp_id,
      city: employee.city || '',
      cluster: employee.cluster || '',
      manager: employee.manager || '',
      role: employee.role || '',
      password: employee.password,
      dateOfJoining: employee.date_of_joining || '',
      bloodGroup: employee.blood_group || '',
      dateOfBirth: employee.date_of_birth || '',
      accountNumber: employee.account_number || '',
      ifscCode: employee.ifsc_code || ''
    }));

  } catch (error) {
    console.error('Error in getUsers:', error);
    throw error;
  }
};

/**
 * Creates a new employee in Supabase
 */
export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  try {
    // Check if employee with the same ID already exists
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('emp_id, user_id')
      .eq('emp_id', userData.employeeId)
      .single();

    if (existingEmployee) {
      console.error('Error in createUser:', {
        message: `Employee with ID ${userData.employeeId} already exists.`
      });
      throw new Error(`Employee with ID ${userData.employeeId} already exists.`);
    }

    // Also check for duplicate user_id
    const { data: existingUserId } = await supabase
      .from('employees')
      .select('user_id')
      .eq('user_id', userData.userId)
      .single();

    if (existingUserId) {
      console.error('Error in createUser:', {
        message: `Employee with User ID ${userData.userId} already exists.`
      });
      throw new Error(`Employee with User ID ${userData.userId} already exists.`);
    }

    // Map from User type to the format expected by the employees table
    // Convert date formats if they are in DD/MM/YYYY format
    const dateOfJoining = userData.dateOfJoining ? formatDateToYYYYMMDD(userData.dateOfJoining) : null;
    const dateOfBirth = userData.dateOfBirth ? formatDateToYYYYMMDD(userData.dateOfBirth) : null;

    const employee = {
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      emp_id: userData.employeeId,
      city: userData.city || null,
      cluster: userData.cluster || null,
      role: userData.role || null,
      manager: userData.manager || null,
      password: userData.password,
      user_id: userData.userId,
      date_of_joining: dateOfJoining,
      date_of_birth: dateOfBirth,
      blood_group: userData.bloodGroup || null,
      account_number: userData.accountNumber || null,
      ifsc_code: userData.ifscCode || null
    };

    console.log("Creating new employee:", employee);

    const { data, error } = await supabase
      .from('employees')
      .insert([employee])
      .select()
      .single();

    if (error) {
      console.error('Error creating user in Supabase:', error);
      console.error('Error details:', error.details, error.hint, error.message);
      throw error;
    }

    // Map the newly created employee back to our User type
    return {
      id: String(data.id),
      userId: data.user_id || '',
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      employeeId: data.emp_id,
      city: data.city || '',
      cluster: data.cluster || '',
      manager: data.manager || '',
      role: data.role || '',
      password: data.password,
      dateOfJoining: data.date_of_joining || '',
      bloodGroup: data.blood_group || '',
      dateOfBirth: data.date_of_birth || '',
      accountNumber: data.account_number || '',
      ifscCode: data.ifsc_code || ''
    };
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
};

// Delete user by ID
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
};
