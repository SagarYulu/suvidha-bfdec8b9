
const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class BulkUserService {
  async bulkCreateUsers(usersData, createdBy) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const results = [];
      const errors = [];
      
      for (const userData of usersData) {
        try {
          // Validate required fields
          if (!userData.name || !userData.email || !userData.employee_id) {
            errors.push({
              row: userData,
              error: 'Missing required fields: name, email, or employee_id'
            });
            continue;
          }
          
          // Check if user already exists
          const [existing] = await connection.execute(
            'SELECT id FROM dashboard_users WHERE email = ? OR employee_id = ?',
            [userData.email.toLowerCase(), userData.employee_id]
          );
          
          if (existing.length > 0) {
            errors.push({
              row: userData,
              error: 'User with this email or employee ID already exists'
            });
            continue;
          }
          
          // Generate password if not provided
          const password = userData.password || this.generateRandomPassword();
          const hashedPassword = await bcrypt.hash(password, 10);
          
          const userId = uuidv4();
          
          // Insert user
          await connection.execute(`
            INSERT INTO dashboard_users (
              id, name, email, password, role, employee_id, phone, city, cluster, 
              manager, date_of_joining, blood_group, account_number, ifsc_code,
              date_of_birth, created_by, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `, [
            userId,
            userData.name,
            userData.email.toLowerCase(),
            hashedPassword,
            userData.role || 'employee',
            userData.employee_id,
            userData.phone || null,
            userData.city || null,
            userData.cluster || null,
            userData.manager || null,
            userData.date_of_joining || null,
            userData.blood_group || null,
            userData.account_number || null,
            userData.ifsc_code || null,
            userData.date_of_birth || null,
            createdBy
          ]);
          
          // Create employee auth credentials for mobile login
          await connection.execute(`
            INSERT INTO employee_auth_credentials (email, employee_id, user_id)
            VALUES (?, ?, ?)
          `, [userData.email.toLowerCase(), userData.employee_id, userId]);
          
          results.push({
            id: userId,
            email: userData.email,
            employee_id: userData.employee_id,
            tempPassword: userData.password ? null : password
          });
          
        } catch (error) {
          errors.push({
            row: userData,
            error: error.message
          });
        }
      }
      
      await connection.commit();
      
      return {
        success: results,
        errors: errors,
        totalProcessed: usersData.length,
        successCount: results.length,
        errorCount: errors.length
      };
      
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
  
  generateRandomPassword(length = 8) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

module.exports = new BulkUserService();
