
const issueService = require('../services/issueService');
const { validationResult } = require('express-validator');

class IssueController {
  async getIssues(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { page = 1, limit = 10, status, priority, assignedTo } = req.query;
      const filters = { status, priority, assignedTo };
      
      const result = await issueService.getIssues(filters, page, limit);
      
      res.json({
        success: true,
        data: result.issues,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      });
    } catch (error) {
      console.error('Get issues error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch issues',
        message: error.message 
      });
    }
  }

  async getIssue(req, res) {
    try {
      const { id } = req.params;
      const issue = await issueService.getIssueById(id);
      
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      
      res.json({ success: true, data: issue });
    } catch (error) {
      console.error('Get issue error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch issue',
        message: error.message 
      });
    }
  }

  async createIssue(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const issueData = {
        ...req.body,
        createdBy: req.user.id
      };
      
      const issueId = await issueService.createIssue(issueData);
      
      res.status(201).json({
        success: true,
        data: { id: issueId },
        message: 'Issue created successfully'
      });
    } catch (error) {
      console.error('Create issue error:', error);
      res.status(500).json({ 
        error: 'Failed to create issue',
        message: error.message 
      });
    }
  }

  async updateIssue(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { id } = req.params;
      const updateData = {
        ...req.body,
        updatedBy: req.user.id
      };
      
      const success = await issueService.updateIssue(id, updateData);
      
      if (!success) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      
      res.json({
        success: true,
        message: 'Issue updated successfully'
      });
    } catch (error) {
      console.error('Update issue error:', error);
      res.status(500).json({ 
        error: 'Failed to update issue',
        message: error.message 
      });
    }
  }

  async deleteIssue(req, res) {
    try {
      const { id } = req.params;
      const success = await issueService.deleteIssue(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      
      res.json({
        success: true,
        message: 'Issue deleted successfully'
      });
    } catch (error) {
      console.error('Delete issue error:', error);
      res.status(500).json({ 
        error: 'Failed to delete issue',
        message: error.message 
      });
    }
  }

  async assignIssue(req, res) {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;
      
      const success = await issueService.assignIssue(id, assignedTo, req.user.id);
      
      if (!success) {
        return res.status(404).json({ error: 'Issue not found' });
      }
      
      res.json({
        success: true,
        message: 'Issue assigned successfully'
      });
    } catch (error) {
      console.error('Assign issue error:', error);
      res.status(500).json({ 
        error: 'Failed to assign issue',
        message: error.message 
      });
    }
  }
}

module.exports = new IssueController();
