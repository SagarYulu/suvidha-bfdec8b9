
const userQueries = {
  getAllUsers: `
    SELECT id, name, email, role, city, cluster, manager, created_at, updated_at
    FROM dashboard_users 
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
  `,

  getUserById: `
    SELECT id, name, email, role, city, cluster, manager, created_at, updated_at
    FROM dashboard_users 
    WHERE id = ? AND deleted_at IS NULL
  `,

  createUser: `
    INSERT INTO dashboard_users 
    (id, name, email, password, role, city, cluster, manager, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `,

  updateUser: `
    UPDATE dashboard_users 
    SET name = ?, email = ?, role = ?, city = ?, cluster = ?, manager = ?, 
        last_updated_by = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,

  deleteUser: `
    UPDATE dashboard_users 
    SET deleted_at = CURRENT_TIMESTAMP, last_updated_by = ?
    WHERE id = ?
  `,

  getUserByEmail: `
    SELECT id, name, email, role
    FROM dashboard_users 
    WHERE email = ? AND deleted_at IS NULL
  `
};

module.exports = userQueries;
