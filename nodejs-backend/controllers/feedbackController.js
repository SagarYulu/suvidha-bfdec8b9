
const { pool } = require('../config/database');
const queries = require('../queries/feedbackQueries');
const { v4: uuidv4 } = require('uuid');

const submitFeedback = async (req, res) => {
  try {
    const { issueId, sentiment, feedbackOption, feedbackText } = req.body;
    const employeeUuid = req.user.id;

    // Check if feedback already exists
    const [existing] = await pool.execute(queries.checkFeedbackExists, [issueId, employeeUuid]);
    
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Feedback already submitted for this ticket'
      });
    }

    // Get issue and employee details for additional context
    const [issueDetails] = await pool.execute(queries.getIssueDetails, [issueId]);
    const [employeeDetails] = await pool.execute(queries.getEmployeeDetails, [employeeUuid]);

    if (issueDetails.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    const issue = issueDetails[0];
    const employee = employeeDetails[0];

    // Submit feedback
    await pool.execute(queries.submitFeedback, [
      uuidv4(),
      issueId,
      employeeUuid,
      sentiment,
      feedbackText || feedbackOption,
      employee?.city,
      employee?.cluster,
      issue.assigned_to,
      issue.assigned_to_name
    ]);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const getFeedbackByTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const [feedback] = await pool.execute(queries.getFeedbackByTicket, [ticketId]);

    res.json({
      success: true,
      feedback: feedback[0] || null
    });
  } catch (error) {
    console.error('Get feedback by ticket error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const checkFeedbackExists = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const employeeUuid = req.user.id;

    const [feedback] = await pool.execute(queries.checkFeedbackExists, [ticketId, employeeUuid]);

    res.json({
      success: true,
      exists: feedback.length > 0
    });
  } catch (error) {
    console.error('Check feedback exists error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  submitFeedback,
  getFeedbackByTicket,
  checkFeedbackExists
};
