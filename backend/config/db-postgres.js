const { Pool } = require('pg');
require('dotenv').config();

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Database connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Initialize database tables with integer SERIAL IDs
const initializeDatabase = async () => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Initializing database with integer IDs...');
    
    // Drop existing tables in correct order (child tables first)
    console.log('🗑️  Dropping existing tables...');
    const tablesToDrop = [
      'ticket_feedback',
      'issue_comments', 
      'issue_internal_comments',
      'issue_audit_trail',
      'issue_notifications',
      'issues',
      'rbac_user_roles',
      'rbac_role_permissions', 
      'rbac_permissions',
      'rbac_roles',
      'master_clusters',
      'master_cities',
      'master_roles',
      'dashboard_user_audit_logs',
      'master_audit_logs',
      'dashboard_users',
      'employees',
      'users'
    ];
    
    for (const table of tablesToDrop) {
      try {
        await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✅ Dropped table: ${table}`);
      } catch (error) {
        console.log(`ℹ️  Table ${table} doesn't exist, skipping...`);
      }
    }
    
    // Create new tables with integer SERIAL IDs
    console.log('🏗️  Creating new tables with integer SERIAL IDs...');
    
    // Users table
    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created users table');
    
    // Employees table
    await client.query(`
      CREATE TABLE employees (
        id SERIAL PRIMARY KEY,
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
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created employees table');
    
    // Dashboard Users table
    await client.query(`
      CREATE TABLE dashboard_users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        employee_id VARCHAR(50),
        city VARCHAR(100),
        cluster VARCHAR(100),
        manager VARCHAR(255),
        role VARCHAR(100),
        password VARCHAR(255),
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        last_updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Created dashboard_users table');
    
    // Issues table
    await client.query(`
      CREATE TABLE issues (
        id SERIAL PRIMARY KEY,
        description TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'open',
        priority VARCHAR(20) DEFAULT 'medium',
        type_id VARCHAR(50),
        sub_type_id VARCHAR(50),
        employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        assigned_to INTEGER REFERENCES dashboard_users(id) ON DELETE SET NULL,
        attachment_url TEXT,
        attachments JSONB,
        mapped_type_id VARCHAR(50),
        mapped_sub_type_id VARCHAR(50),
        mapped_by INTEGER REFERENCES dashboard_users(id) ON DELETE SET NULL,
        mapped_at TIMESTAMP,
        closed_at TIMESTAMP,
        escalation_level INTEGER DEFAULT 0,
        escalated_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created issues table');
    
    // Issue Comments table
    await client.query(`
      CREATE TABLE issue_comments (
        id SERIAL PRIMARY KEY,
        issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created issue_comments table');
    
    // Ticket Feedback table
    await client.query(`
      CREATE TABLE ticket_feedback (
        id SERIAL PRIMARY KEY,
        issue_id INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
        feedback TEXT NOT NULL,
        sentiment VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created ticket_feedback table');
    
    // Create indexes for performance
    await client.query('CREATE INDEX idx_users_username ON users(username)');
    await client.query('CREATE INDEX idx_users_role ON users(role)');
    await client.query('CREATE INDEX idx_employees_email ON employees(email)');
    await client.query('CREATE INDEX idx_employees_emp_id ON employees(emp_id)');
    await client.query('CREATE INDEX idx_employees_city ON employees(city)');
    await client.query('CREATE INDEX idx_employees_cluster ON employees(cluster)');
    await client.query('CREATE INDEX idx_dashboard_users_email ON dashboard_users(email)');
    await client.query('CREATE INDEX idx_dashboard_users_role ON dashboard_users(role)');
    await client.query('CREATE INDEX idx_issues_status ON issues(status)');
    await client.query('CREATE INDEX idx_issues_priority ON issues(priority)');
    await client.query('CREATE INDEX idx_issues_employee_id ON issues(employee_id)');
    await client.query('CREATE INDEX idx_issues_assigned_to ON issues(assigned_to)');
    await client.query('CREATE INDEX idx_issue_comments_issue_id ON issue_comments(issue_id)');
    await client.query('CREATE INDEX idx_issue_comments_employee_id ON issue_comments(employee_id)');
    await client.query('CREATE INDEX idx_ticket_feedback_issue_id ON ticket_feedback(issue_id)');
    await client.query('CREATE INDEX idx_ticket_feedback_sentiment ON ticket_feedback(sentiment)');
    console.log('✅ Created indexes');
    
    // Seed initial data
    console.log('🌱 Seeding initial data...');
    
    // Create admin user
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    const adminResult = await client.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id',
      ['admin', adminPassword, 'admin']
    );
    
    const adminUserId = adminResult.rows[0].id;
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
      const empResult = await client.query(
        `INSERT INTO employees (name, email, phone, emp_id, city, cluster, manager, role, password, 
         date_of_joining, blood_group, date_of_birth, account_number, ifsc_code) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
        [
          employee.name, employee.email, employee.phone, employee.emp_id, employee.city,
          employee.cluster, employee.manager, employee.role, employee.password,
          employee.date_of_joining, employee.blood_group, employee.date_of_birth,
          employee.account_number, employee.ifsc_code
        ]
      );
      console.log(`✅ Created employee: ${employee.name} with ID: ${empResult.rows[0].id}`);
    }
    
    // Create dashboard user
    const dashboardResult = await client.query(
      `INSERT INTO dashboard_users (name, email, phone, employee_id, city, cluster, manager, role, password, user_id, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
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
    console.log('✅ Created dashboard user with ID:', dashboardResult.rows[0].id);
    
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
      const issueResult = await client.query(
        `INSERT INTO issues (description, status, priority, type_id, sub_type_id, employee_id, assigned_to) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [
          issue.description, issue.status, issue.priority, issue.type_id,
          issue.sub_type_id, issue.employee_id, issue.assigned_to || null
        ]
      );
      console.log(`✅ Created issue: "${issue.description}" with ID: ${issueResult.rows[0].id}`);
    }
    
    console.log('🎉 Database migration completed successfully!');
    console.log('📊 Summary:');
    console.log('   - All tables recreated with integer SERIAL IDs');
    console.log('   - Admin user created (username: admin, password: admin123)');
    console.log('   - 2 sample employees created');
    console.log('   - 1 dashboard user created');
    console.log('   - 2 sample issues created');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Connect to database and initialize tables
const connectDatabase = async () => {
  try {
    await testConnection();
    await initializeDatabase();
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
};

module.exports = { 
  pool,
  testConnection,
  initializeDatabase,
  connectDatabase
};