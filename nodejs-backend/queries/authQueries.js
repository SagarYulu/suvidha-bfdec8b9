
const authQueries = {
  findUserByEmail: `
    SELECT id, name, email, password, role, city, cluster, manager
    FROM dashboard_users 
    WHERE email = ? AND deleted_at IS NULL
  `,

  findEmployeeById: `
    SELECT id, name, email, emp_id, password, role, city, cluster, manager
    FROM employees 
    WHERE emp_id = ?
  `,

  updateLastLogin: `
    UPDATE dashboard_users 
    SET last_login_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `
};

module.exports = authQueries;
