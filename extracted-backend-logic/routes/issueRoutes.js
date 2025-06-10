
// Issue Routes
// Express.js route definitions for issue management

const express = require('express');
const router = express.Router();

class IssueRoutes {
  constructor(issueService, authMiddleware) {
    this.issueService = issueService;
    this.authMiddleware = authMiddleware;
  }

  setupRoutes() {
    // Get issues for authenticated user
    router.get('/user/:userId', 
      this.authMiddleware.authenticateMobile.bind(this.authMiddleware),
      async (req, res) => {
        try {
          const { userId } = req.params;
          
          // Ensure user can only access their own issues
          if (req.user.id !== userId) {
            return res.status(403).json({ error: 'Access denied' });
          }

          const issues = await this.issueService.getIssuesByUserId(userId);
          res.json({ success: true, issues });

        } catch (error) {
          console.error('Error fetching user issues:', error);
          res.status(500).json({ error: 'Failed to fetch issues' });
        }
      }
    );

    // Get specific issue by ID
    router.get('/:issueId',
      this.authMiddleware.authenticateMobile.bind(this.authMiddleware),
      async (req, res) => {
        try {
          const { issueId } = req.params;
          
          const issue = await this.issueService.getIssueById(issueId);
          
          if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
          }

          // Check if user has access to this issue
          if (issue.employeeUuid !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
          }

          res.json({ success: true, issue });

        } catch (error) {
          console.error('Error fetching issue:', error);
          res.status(500).json({ error: 'Failed to fetch issue' });
        }
      }
    );

    // Create new issue
    router.post('/',
      this.authMiddleware.authenticateMobile.bind(this.authMiddleware),
      async (req, res) => {
        try {
          const issueData = {
            ...req.body,
            employeeUuid: req.user.id
          };

          // Validate required fields
          if (!issueData.typeId || !issueData.subTypeId || !issueData.description) {
            return res.status(400).json({
              error: 'Type ID, Sub Type ID, and description are required'
            });
          }

          const issueId = await this.issueService.createIssue(issueData);
          
          if (!issueId) {
            return res.status(500).json({ error: 'Failed to create issue' });
          }

          res.status(201).json({
            success: true,
            issueId,
            message: 'Issue created successfully'
          });

        } catch (error) {
          console.error('Error creating issue:', error);
          res.status(500).json({ error: 'Failed to create issue' });
        }
      }
    );

    // Update issue status
    router.patch('/:issueId/status',
      this.authMiddleware.authenticateMobile.bind(this.authMiddleware),
      async (req, res) => {
        try {
          const { issueId } = req.params;
          const { status } = req.body;

          if (!status) {
            return res.status(400).json({ error: 'Status is required' });
          }

          // Get issue to verify ownership
          const issue = await this.issueService.getIssueById(issueId);
          if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
          }

          if (issue.employeeUuid !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
          }

          const success = await this.issueService.updateIssueStatus(
            issueId, 
            status, 
            req.user.id
          );

          if (!success) {
            return res.status(500).json({ error: 'Failed to update issue status' });
          }

          res.json({
            success: true,
            message: 'Issue status updated successfully'
          });

        } catch (error) {
          console.error('Error updating issue status:', error);
          res.status(500).json({ error: 'Failed to update issue status' });
        }
      }
    );

    // Add comment to issue
    router.post('/:issueId/comments',
      this.authMiddleware.authenticateMobile.bind(this.authMiddleware),
      async (req, res) => {
        try {
          const { issueId } = req.params;
          const { content } = req.body;

          if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content is required' });
          }

          // Get issue to verify ownership
          const issue = await this.issueService.getIssueById(issueId);
          if (!issue) {
            return res.status(404).json({ error: 'Issue not found' });
          }

          if (issue.employeeUuid !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
          }

          const commentId = await this.issueService.addComment(
            issueId,
            req.user.id,
            content.trim()
          );

          if (!commentId) {
            return res.status(500).json({ error: 'Failed to add comment' });
          }

          res.status(201).json({
            success: true,
            commentId,
            message: 'Comment added successfully'
          });

        } catch (error) {
          console.error('Error adding comment:', error);
          res.status(500).json({ error: 'Failed to add comment' });
        }
      }
    );

    // Admin routes for issue management
    router.get('/admin/all',
      this.authMiddleware.authenticateAdmin.bind(this.authMiddleware),
      this.authMiddleware.requirePermission('manage:issues'),
      async (req, res) => {
        try {
          // Implement admin view of all issues
          res.json({ success: true, message: 'Admin issues endpoint' });
        } catch (error) {
          console.error('Error fetching admin issues:', error);
          res.status(500).json({ error: 'Failed to fetch issues' });
        }
      }
    );

    return router;
  }
}

module.exports = { IssueRoutes };
