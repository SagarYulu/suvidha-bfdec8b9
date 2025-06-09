
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const EmployeeModel = require('../models/Employee');
const config = require('../config/env');

class AuthService {
  static generateToken(user) {
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

  static async login(email, password) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await UserModel.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(user);
    
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  static async mobileLogin(email, employeeId) {
    const employee = await EmployeeModel.findByEmailAndId(email, employeeId);
    if (!employee) {
      throw new Error('Invalid credentials');
    }

    const token = this.generateToken(employee);
    
    return {
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.emp_id,
        role: employee.role
      },
      token
    };
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = AuthService;
