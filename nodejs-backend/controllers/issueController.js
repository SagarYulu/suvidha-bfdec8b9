const { pool } = require('../config/database');
const queries = require('../queries/issueQueries');
const { v4: uuidv4 } = require('uuid');

const getIssues = async (req, res) => {
  try {
    const { status, typeId, priority, city, assignedTo, startDate, endDate } = req.query;
    
    let issues;
    
    // Use specific queries instead of dynamic SQL construction
    if (status && typeId && priority && city && assignedTo && startDate && endDate) {
      // Complex filtering - would need a combined query or multiple filters
      [issues] = await pool.execute(queries.getAllIssues);
      // Apply client-side filtering for complex combinations
      issues = issues.filter(issue => {
        return (
          (!status || issue.status === status) &&
          (!typeId || issue.type_id === typeId) &&
          (!priority || issue.priority === priority) &&
          (!city || issue.city === city) &&
          (!assignedTo || issue.assigned_to === assignedTo) &&
          (!startDate || new Date(issue.created_at) >= new Date(startDate)) &&
          (!endDate || new Date(issue.created_at) <= new Date(endDate))
        );
      });
    } else if (status) {
      [issues] = await pool.execute(queries.getIssuesWithStatusFilter, [status]);
    } else if (typeId) {
      [issues] = await pool.execute(queries.getIssuesWithTypeFilter, [typeId]);
    } else if (priority) {
      [issues] = await pool.execute(queries.getIssuesWithPriorityFilter, [priority]);
    } else if (city) {
      [issues] = await pool.execute(queries.getIssuesWithCityFilter, [city]);
    } else if (assignedTo) {
      [issues] = await pool.execute(queries.getIssuesWithAssignedToFilter, [assignedTo]);
    } else if (startDate && endDate) {
      [issues] = await pool.execute(queries.getIssuesWithDateRangeFilter, [startDate, endDate]);
    } else {
      [issues] = await pool.execute(queries.getAllIssues);
    }

    res.json({
      success: true,
      issues
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;

    const [issues] = await pool.execute(queries.getIssueById, [id]);
    
    if (issues.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Get comments for this issue
    const [comments] = await pool.execute(queries.getIssueComments, [id]);

    const issue = issues[0];
    issue.comments = comments;

    res.json({
      success: true,
      issue
    });
  } catch (error) {
    console.error('Get issue by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const createIssue = async (req, res) => {
  try {
    const { typeId, subTypeId, description, priority = 'medium' } = req.body;
    const employeeUuid = req.user.id;
    const issueId = uuidv4();

    // Handle file attachments
    let attachments = null;
    if (req.files && req.files.length > 0) {
      attachments = JSON.stringify(req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: `/uploads/${file.filename}`
      })));
    }

    await pool.execute(queries.createIssue, [
      issueId,
      employeeUuid,
      typeId,
      subTypeId,
      description,
      'open',
      priority,
      attachments
    ]);

    res.status(201).json({
      success: true,
      issueId,
      message: 'Issue created successfully'
    });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedBy = req.user.id;

    // Check if issue exists
    const [issues] = await pool.execute(queries.getIssueById, [id]);
    if (issues.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    const previousStatus = issues[0].status;
    const closedAt = (status === 'closed' || status === 'resolved') ? new Date() : null;

    // Update issue status
    await pool.execute(queries.updateIssueStatus, [status, closedAt, id]);

    // Create audit trail
    await pool.execute(queries.createAuditTrail, [
      uuidv4(),
      id,
      updatedBy,
      'status_change',
      previousStatus,
      status,
      JSON.stringify({ updatedBy: req.user.name })
    ]);

    res.json({
      success: true,
      message: 'Issue status updated successfully'
    });
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const assignIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;
    const assignedBy = req.user.id;

    // Check if issue exists
    const [issues] = await pool.execute(queries.getIssueById, [id]);
    if (issues.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Update issue assignment
    await pool.execute(queries.assignIssue, [assignedTo, 'in_progress', id]);

    // Create audit trail
    await pool.execute(queries.createAuditTrail, [
      uuidv4(),
      id,
      assignedBy,
      'assignment',
      null,
      null,
      JSON.stringify({ assignedTo, assignedBy: req.user.name })
    ]);

    res.json({
      success: true,
      message: 'Issue assigned successfully'
    });
  } catch (error) {
    console.error('Assign issue error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const employeeUuid = req.user.id;

    // Check if issue exists
    const [issues] = await pool.execute(queries.getIssueById, [id]);
    if (issues.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Add comment
    await pool.execute(queries.addComment, [
      uuidv4(),
      id,
      employeeUuid,
      content
    ]);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const getEmployeeIssues = async (req, res) => {
  try {
    const employeeUuid = req.user.id;

    const [issues] = await pool.execute(queries.getEmployeeIssues, [employeeUuid]);

    res.json({
      success: true,
      issues
    });
  } catch (error) {
    console.error('Get employee issues error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  getIssues,
  getIssueById,
  createIssue,
  updateIssueStatus,
  assignIssue,
  addComment,
  getEmployeeIssues
};
