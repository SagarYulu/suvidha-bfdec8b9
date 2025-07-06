
const express = require('express');
const router = express.Router();
const internalCommentController = require('../controllers/internalCommentController');
const authMiddleware = require('../middlewares/auth');
const { validateInternalComment } = require('../middlewares/validation');

// All routes require authentication
router.use(authMiddleware.authenticate);

// Get internal comments for an issue
router.get('/issue/:issueId', internalCommentController.getInternalComments);

// Create internal comment
router.post('/issue/:issueId', validateInternalComment, internalCommentController.createInternalComment);

// Update internal comment
router.put('/:commentId', validateInternalComment, internalCommentController.updateInternalComment);

// Delete internal comment
router.delete('/:commentId', internalCommentController.deleteInternalComment);

module.exports = router;
