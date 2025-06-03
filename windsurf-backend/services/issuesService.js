const db = require('../config/database');

const issuesService = {
  async getIssues(filters) {
    let query = 'SELECT * FROM issues WHERE 1=1';
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    // Add more filters as needed

    const [rows] = await db.query(query, params);
    return rows;
  },

  async getIssueById(id) {
    const [rows] = await db.query('SELECT * FROM issues WHERE id = ?', [id]);
    return rows[0];
  },

  async createIssue(issueData) {
    const [result] = await db.query('INSERT INTO issues SET ?', issueData);
    return result.insertId;
  },

  async updateIssue(id, issueData) {
    await db.query('UPDATE issues SET ? WHERE id = ?', [issueData, id]);
  },

  async deleteIssue(id) {
    await db.query('DELETE FROM issues WHERE id = ?', [id]);
  }
};

module.exports = issuesService;
