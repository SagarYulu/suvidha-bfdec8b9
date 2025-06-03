
// User Service Logic
// Original file: src/services/userService.ts

class UserService {
  constructor(dbConnection) {
    this.db = dbConnection;
  }

  async getUserById(id) {
    try {
      // First check dashboard users
      let user = await this.db.query(
        'SELECT * FROM dashboard_users WHERE id = ?',
        [id]
      );
      
      if (user) {
        return {
          id: user.id,
          userId: user.user_id || "",
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          employeeId: user.employee_id || "",
          city: user.city || "",
          cluster: user.cluster || "",
          manager: user.manager || "",
          role: user.role || "employee",
          password: user.password,
          dateOfJoining: "",
          bloodGroup: "",
          dateOfBirth: "",
          accountNumber: "",
          ifscCode: ""
        };
      }

      // If not found in dashboard users, check employees
      user = await this.db.query(
        'SELECT * FROM employees WHERE id = ?',
        [id]
      );

      if (user) {
        return {
          id: user.id,
          userId: user.user_id || "",
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          employeeId: user.emp_id,
          city: user.city || "",
          cluster: user.cluster || "",
          manager: user.manager || "",
          role: user.role || "employee",
          password: user.password,
          dateOfJoining: user.date_of_joining || "",
          bloodGroup: user.blood_group || "",
          dateOfBirth: user.date_of_birth || "",
          accountNumber: user.account_number || "",
          ifscCode: user.ifsc_code || ""
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  async getAllUsers() {
    try {
      const users = await this.db.query('SELECT * FROM employees ORDER BY name');
      return users || [];
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  async createUser(userData) {
    try {
      const userId = this.generateUUID();
      
      await this.db.query(
        `INSERT INTO employees (
          id, emp_id, name, email, phone, user_id, password, 
          manager, role, cluster, city, date_of_joining, 
          blood_group, date_of_birth, account_number, ifsc_code,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          userId,
          userData.employeeId,
          userData.name,
          userData.email,
          userData.phone,
          userData.userId,
          userData.password,
          userData.manager,
          userData.role,
          userData.cluster,
          userData.city,
          userData.dateOfJoining,
          userData.bloodGroup,
          userData.dateOfBirth,
          userData.accountNumber,
          userData.ifscCode
        ]
      );

      return userId;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  async updateUser(id, userData) {
    try {
      await this.db.query(
        `UPDATE employees SET 
          name = ?, email = ?, phone = ?, manager = ?, 
          role = ?, cluster = ?, city = ?, updated_at = NOW()
        WHERE id = ?`,
        [
          userData.name,
          userData.email,
          userData.phone,
          userData.manager,
          userData.role,
          userData.cluster,
          userData.city,
          id
        ]
      );

      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  async deleteUser(id) {
    try {
      await this.db.query('DELETE FROM employees WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

module.exports = { UserService };
