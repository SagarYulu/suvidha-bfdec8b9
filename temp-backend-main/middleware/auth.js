
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user details from database
    const [users] = await pool.execute(
      'SELECT id, email, name, role FROM dashboard_users WHERE id = ? AND is_active = 1',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

const authenticateEmployee = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get employee details from database
    const [employees] = await pool.execute(
      'SELECT employee_uuid, employee_name, employee_id, manager_name FROM employees WHERE employee_uuid = ?',
      [decoded.employeeUuid]
    );

    if (employees.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.employee = employees[0];
    next();
  } catch (error) {
    console.error('Employee token verification failed:', error);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

module.exports = {
  authenticateToken,
  authenticateEmployee
};
