
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const EmployeeModel = require('../models/Employee');
const config = require('../config/env');

class AuthService {
  generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );
  }

  async login(email, password) {
    const user = await UserModel.findByEmail(email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await UserModel.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        employee_id: user.employee_id
      }
    };
  }

  async mobileLogin(email, employeeId) {
    const employee = await EmployeeModel.findByEmailAndId(email, employeeId);
    
    if (!employee) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(employee);

    return {
      token,
      user: {
        id: employee.id,
        email: employee.email,
        name: employee.name,
        emp_id: employee.emp_id,
        role: employee.role || 'employee'
      }
    };
  }

  async getProfile(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employee_id: user.employee_id,
      phone: user.phone,
      city: user.city,
      cluster: user.cluster,
      manager: user.manager,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }
}

module.exports = new AuthService();
