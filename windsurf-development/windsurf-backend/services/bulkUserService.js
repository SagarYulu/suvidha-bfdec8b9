
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class BulkUserService {
  async bulkCreateUsers(users, createdBy) {
    const results = {
      success: [],
      errors: [],
      totalProcessed: users.length,
      successCount: 0,
      errorCount: 0
    };

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      try {
        // Generate temporary password
        const tempPassword = this.generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        const id = uuidv4();
        
        await db.execute(
          `INSERT INTO dashboard_users (id, name, email, password, role, status, created_at, updated_at) 
           VALUES (?, ?, ?, ?, ?, 'active', NOW(), NOW())`,
          [id, user.name, user.email, hashedPassword, user.role || 'support']
        );

        results.success.push({
          ...user,
          id,
          tempPassword,
          row: i + 1
        });
        results.successCount++;
      } catch (error) {
        results.errors.push({
          row: i + 1,
          data: user,
          error: error.message
        });
        results.errorCount++;
      }
    }

    return results;
  }

  generateTempPassword() {
    const length = 8;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }
}

module.exports = new BulkUserService();
