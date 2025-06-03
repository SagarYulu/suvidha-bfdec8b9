
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.email = data.email;
    this.employeeId = data.employeeId;
    this.phone = data.phone;
    this.city = data.city;
    this.cluster = data.cluster;
    this.role = data.role;
    this.password = data.password;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(plainPassword) {
    return bcrypt.compare(plainPassword, this.password);
  }

  toJSON() {
    const user = { ...this };
    delete user.password;
    return user;
  }

  static fromDatabase(row) {
    return new User({
      id: row.id,
      name: row.name,
      email: row.email,
      employeeId: row.employee_id,
      phone: row.phone,
      city: row.city,
      cluster: row.cluster,
      role: row.role,
      password: row.password,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    });
  }
}

module.exports = User;
