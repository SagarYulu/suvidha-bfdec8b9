const { pool } = require('../config/db');

async function migrateToIntegerIds() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Starting database migration to integer IDs...');
    
    // Drop existing tables in correct order (child tables first)
    console.log('🗑️  Dropping existing tables...');
    await connection.execute('SET foreign_key_checks = 0');
    
    const tablesToDrop = [
      'ticket_feedback',
      'issue_comments',
      'issues',
      'rbac_user_roles',
      'rbac_role_permissions',
      'rbac_permissions',
      'rbac_roles',
      'master_clusters',
      'master_cities',
      'master_roles',
      'dashboard_users',
      'employees',
      'users'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await connection.execute(`DROP TABLE IF EXISTS ${table}`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`ℹ️  Table ${table} doesn't exist, skipping...`);
      }
    }
    
    await connection.execute('SET foreign_key_checks = 1');
    
    // Create new tables with integer AUTO_INCREMENT IDs
    console.log('🏗️  Creating new tables with integer IDs...');
    
    // Users table
    await connection.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_role (role)
      )
    `);
    console.log('✅ Created users table');
    
    // Employees table
    await connection.execute(`
      CREATE TABLE employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        emp_id VARCHAR(50) UNIQUE NOT NULL,
        city VARCHAR(100),
        cluster VARCHAR(100),
        manager VARCHAR(255),
        role VARCHAR(100),
        password VARCHAR(255),
        date_of_joining DATE,
        blood_group VARCHAR(10),
        date_of_birth DATE,
        account_number VARCHAR(50),
        ifsc_code VARCHAR(20),
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_email (email),
        INDEX idx_emp_id (emp_id),
        INDEX idx_city (city),
        INDEX idx_cluster (cluster)
      )
    `);
    console.log('✅ Created employees table');
    
    // Dashboard Users table
    await connection.execute(`
      CREATE TABLE dashboard_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        employee_id VARCHAR(50),
        city VARCHAR(100),
        cluster VARCHAR(100),
        manager VARCHAR(255),
        role VARCHAR(100),
        password VARCHAR(255),
        user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by INT,
        last_updated_by INT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (last_updated_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);
    console.log('✅ Created dashboard_users table');
    
    // Issues table
    await connection.execute(`
      CREATE TABLE issues (
        id INT AUTO_INCREMENT PRIMARY KEY,
        description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(20) DEFAULT 'medium',
        type_id VARCHAR(50),
        sub_type_id VARCHAR(50),
        employee_id INT NOT NULL,
        assigned_to INT,
        attachment_url TEXT,
        attachments JSON,
        mapped_type_id VARCHAR(50),
        mapped_sub_type_id VARCHAR(50),
        mapped_by INT,
        mapped_at TIMESTAMP NULL,
        closed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (assigned_to) REFERENCES dashboard_users(id) ON DELETE SET NULL,
        FOREIGN KEY (mapped_by) REFERENCES dashboard_users(id) ON DELETE SET NULL,
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_employee_id (employee_id),
        INDEX idx_assigned_to (assigned_to)
      )
    `);
    console.log('✅ Created issues table');
    
    // Issue Comments table
    await connection.execute(`
      CREATE TABLE issue_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        issue_id INT NOT NULL,
        content TEXT NOT NULL,
        employee_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        INDEX idx_issue_id (issue_id),
        INDEX idx_employee_id (employee_id)
      )
    `);
    console.log('✅ Created issue_comments table');
    
    // Ticket Feedback table
    await connection.execute(`
      CREATE TABLE ticket_feedback (
        id INT AUTO_INCREMENT PRIMARY KEY,
        issue_id INT NOT NULL,
        feedback TEXT NOT NULL,
        sentiment VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
        INDEX idx_issue_id (issue_id),
        INDEX idx_sentiment (sentiment)
      )
    `);
    console.log('✅ Created ticket_feedback table');
    
    // Seed initial data
    console.log('🌱 Seeding initial data...');
    
    // Create admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const [adminResult] = await connection.execute(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      ['admin', adminPassword, 'admin']
    );
    
    const adminUserId = adminResult.insertId;
    console.log('✅ Created admin user with ID:', adminUserId);
    
    // Create sample employees
    const employees = [
      {
        name: 'John Doe',
        email: 'john.doe@yulu.com',
        phone: '+91-9876543210',
        emp_id: 'EMP001',
        city: 'Bangalore',
        cluster: 'Koramangala',
        manager: 'Manager A',
        role: 'Delivery Executive',
        password: await bcrypt.hash('password123', 10),
        date_of_joining: '2024-01-15',
        blood_group: 'O+',
        date_of_birth: '1990-05-15',
        account_number: '1234567890',
        ifsc_code: 'HDFC0000123'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@yulu.com',
        phone: '+91-9876543211',
        emp_id: 'EMP002',
        city: 'Mumbai',
        cluster: 'Andheri',
        manager: 'Manager B',
        role: 'Delivery Executive',
        password: await bcrypt.hash('password123', 10),
        date_of_joining: '2024-02-01',
        blood_group: 'A+',
        date_of_birth: '1992-08-20',
        account_number: '1234567891',
        ifsc_code: 'HDFC0000124'
      }
    ];
    
    for (const employee of employees) {
      const [empResult] = await connection.execute(
        `INSERT INTO employees (name, email, phone, emp_id, city, cluster, manager, role, password, 
         date_of_joining, blood_group, date_of_birth, account_number, ifsc_code) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employee.name, employee.email, employee.phone, employee.emp_id, employee.city,
          employee.cluster, employee.manager, employee.role, employee.password,
          employee.date_of_joining, employee.blood_group, employee.date_of_birth,
          employee.account_number, employee.ifsc_code
        ]
      );
      console.log(`✅ Created employee: ${employee.name} with ID: ${empResult.insertId}`);
    }
    
    // Create dashboard user
    const [dashboardResult] = await connection.execute(
      `INSERT INTO dashboard_users (name, email, phone, employee_id, city, cluster, manager, role, password, user_id, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Admin User',
        'admin@yulu.com',
        '+91-9876543220',
        'ADM001',
        'Bangalore',
        'Corporate',
        'CEO',
        'Administrator',
        adminPassword,
        adminUserId,
        adminUserId
      ]
    );
    console.log('✅ Created dashboard user with ID:', dashboardResult.insertId);
    
    // Create sample issues
    const issues = [
      {
        description: 'Bike not starting properly',
        status: 'open',
        priority: 'high',
        type_id: 'technical',
        sub_type_id: 'bike_issue',
        employee_id: 1
      },
      {
        description: 'Payment not received for last month',
        status: 'in_progress',
        priority: 'medium',
        type_id: 'financial',
        sub_type_id: 'payment_issue',
        employee_id: 2,
        assigned_to: 1
      }
    ];
    
    for (const issue of issues) {
      const [issueResult] = await connection.execute(
        `INSERT INTO issues (description, status, priority, type_id, sub_type_id, employee_id, assigned_to) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          issue.description, issue.status, issue.priority, issue.type_id,
          issue.sub_type_id, issue.employee_id, issue.assigned_to || null
        ]
      );
      console.log(`✅ Created issue: "${issue.description}" with ID: ${issueResult.insertId}`);
    }
    
    console.log('🎉 Database migration completed successfully!');
    console.log('📊 Summary:');
    console.log('   - All tables recreated with integer AUTO_INCREMENT IDs');
    console.log('   - Admin user created (username: admin, password: admin123)');
    console.log('   - 2 sample employees created');
    console.log('   - 1 dashboard user created');
    console.log('   - 2 sample issues created');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToIntegerIds()
    .then(() => {
      console.log('✅ Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateToIntegerIds };