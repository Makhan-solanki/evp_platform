import { Router } from 'express';
import { ExperienceController } from '../controllers/experience.controller';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { 
  authenticateToken, 
  requireOrganization,
  requireStudent,
  requireAdmin,
  optionalAuth 
} from '../middleware/auth';
import { 
  generalRateLimit,
  uploadRateLimit 
} from '../middleware/security';
import { 
  auditLogger,
  logUserAction,
  trackDataChange 
} from '../middleware/audit';
import {
  createExperienceSchema,
  updateExperienceSchema,
  verifyExperienceSchema,
  getExperiencesQuerySchema,
  getPublicExperiencesQuerySchema,
  experienceAnalyticsQuerySchema,
  bulkExperienceOperationsSchema,
  createExperienceTemplateSchema,
  experienceFeedbackSchema,
} from '../schemas/experience';
import { idParamSchema } from '../schemas/common';

const router = Router();
const experienceController = new ExperienceController();

/**
 * @route   GET /api/experiences
 * @desc    Get experiences with filters
 * @access  Private
 */
router.get(
  '/',
  authenticateToken,
  validateQuery(getExperiencesQuerySchema),
  experienceController.getExperiences
);

/**
 * @route   POST /api/experiences
 * @desc    Create experience (Organization only)
 * @access  Private (Organization only)
 */
router.post(
  '/',
  authenticateToken,
  requireOrganization,
  validateBody(createExperienceSchema),
  logUserAction('create_experience', 'Organization created experience'),
  trackDataChange('experience', 'create'),
  auditLogger('create_experience', 'experience'),
  experienceController.createExperience
);

/**
 * @route   GET /api/experiences/public
 * @desc    Get public experiences feed
 * @access  Public
 */
router.get(
  '/public',
  optionalAuth,
  validateQuery(getPublicExperiencesQuerySchema),
  experienceController.getPublicExperiences
);

/**
 * @route   GET /api/experiences/trending
 * @desc    Get trending experiences
 * @access  Public
 */
router.get(
  '/trending',
  optionalAuth,
  experienceController.getTrendingExperiences
);

/**
 * @route   GET /api/experiences/featured
 * @desc    Get featured experiences
 * @access  Public
 */
router.get(
  '/featured',
  optionalAuth,
  experienceController.getFeaturedExperiences
);

/**
 * @route   GET /api/experiences/search/skills
 * @desc    Search experiences by skills
 * @access  Public
 */
router.get(
  '/search/skills',
  optionalAuth,
  experienceController.searchBySkills
);

/**
 * @route   GET /api/experiences/analytics
 * @desc    Get experience analytics
 * @access  Private
 */
router.get(
  '/analytics',
  authenticateToken,
  validateQuery(experienceAnalyticsQuerySchema),
  logUserAction('view_experience_analytics', 'User viewed experience analytics'),
  experienceController.getAnalytics
);

/**
 * @route   GET /api/experiences/statistics
 * @desc    Get experience statistics
 * @access  Private
 */
router.get(
  '/statistics',
  authenticateToken,
  experienceController.getStatistics
);

/**
 * @route   POST /api/experiences/bulk-operations
 * @desc    Bulk experience operations
 * @access  Private
 */
router.post(
  '/bulk-operations',
  authenticateToken,
  validateBody(bulkExperienceOperationsSchema),
  logUserAction('bulk_experience_operations', 'User performed bulk experience operations'),
  auditLogger('bulk_experience_operations', 'experience'),
  experienceController.bulkOperations
);

/**
 * @route   POST /api/experiences/templates
 * @desc    Create experience template (Organization only)
 * @access  Private (Organization only)
 */
router.post(
  '/templates',
  authenticateToken,
  requireOrganization,
  validateBody(createExperienceTemplateSchema),
  logUserAction('create_experience_template', 'Organization created experience template'),
  auditLogger('create_experience_template', 'experience_template'),
  experienceController.createTemplate
);

/**
 * @route   GET /api/experiences/:id
 * @desc    Get experience details
 * @access  Public/Private (based on experience visibility)
 */
router.get(
  '/:id',
  optionalAuth,
  validateParams(idParamSchema),
  experienceController.getExperience
);

/**
 * @route   PUT /api/experiences/:id
 * @desc    Update experience
 * @access  Private (Organization or Student)
 */
router.put(
  '/:id',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(updateExperienceSchema),
  logUserAction('update_experience', 'User updated experience'),
  trackDataChange('experience', 'update'),
  auditLogger('update_experience', 'experience'),
  experienceController.updateExperience
);

/**
 * @route   DELETE /api/experiences/:id
 * @desc    Delete experience
 * @access  Private (Organization or Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  validateParams(idParamSchema),
  logUserAction('delete_experience', 'User deleted experience'),
  auditLogger('delete_experience', 'experience'),
  experienceController.deleteExperience
);

/**
 * @route   PUT /api/experiences/:id/verify
 * @desc    Verify experience
 * @access  Private (Organization or Admin)
 */
router.put(
  '/:id/verify',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(verifyExperienceSchema),
  logUserAction('verify_experience', 'User verified experience'),
  trackDataChange('experience', 'verify'),
  auditLogger('verify_experience', 'experience'),
  experienceController.verifyExperience
);

/**
 * @route   PUT /api/experiences/:id/reject
 * @desc    Reject experience
 * @access  Private (Organization or Admin)
 */
router.put(
  '/:id/reject',
  authenticateToken,
  validateParams(idParamSchema),
  logUserAction('reject_experience', 'User rejected experience'),
  trackDataChange('experience', 'reject'),
  auditLogger('reject_experience', 'experience'),
  experienceController.rejectExperience
);

/**
 * @route   POST /api/experiences/:id/documents
 * @desc    Upload experience documents
 * @access  Private (Organization or Student)
 */
router.post(
  '/:id/documents',
  authenticateToken,
  validateParams(idParamSchema),
  uploadRateLimit,
  logUserAction('upload_experience_documents', 'User uploaded experience documents'),
  trackDataChange('document', 'create'),
  auditLogger('upload_experience_documents', 'document'),
  experienceController.uploadDocuments
);

/**
 * @route   POST /api/experiences/:id/feedback
 * @desc    Submit experience feedback
 * @access  Private
 */
router.post(
  '/:id/feedback',
  authenticateToken,
  validateParams(idParamSchema),
  validateBody(experienceFeedbackSchema),
  logUserAction('submit_experience_feedback', 'User submitted experience feedback'),
  auditLogger('submit_experience_feedback', 'experience_feedback'),
  experienceController.submitFeedback
);

// Admin routes
/**
 * @route   GET /api/experiences/admin/pending
 * @desc    Get pending experiences for admin review
 * @access  Private (Admin only)
 */
router.get(
  '/admin/pending',
  authenticateToken,
  requireAdmin,
  logUserAction('view_pending_experiences', 'Admin viewed pending experiences'),
  async (req, res, next) => {
    // Admin view of pending experiences
    req.query.status = 'PENDING';
    await experienceController.getExperiences(req, res, next);
  }
);

/**
 * @route   PUT /api/experiences/admin/bulk-verify
 * @desc    Bulk verify experiences (Admin only)
 * @access  Private (Admin only)
 */
router.put(
  '/admin/bulk-verify',
  authenticateToken,
  requireAdmin,
  logUserAction('bulk_verify_experiences', 'Admin bulk verified experiences'),
  auditLogger('bulk_verify_experiences', 'experience'),
  async (req, res, next) => {
    req.body.operation = 'verify';
    await experienceController.bulkOperations(req, res, next);
  }
);

/**
 * @route   PUT /api/experiences/admin/bulk-reject
 * @desc    Bulk reject experiences (Admin only)
 * @access  Private (Admin only)
 */
router.put(
  '/admin/bulk-reject',
  authenticateToken,
  requireAdmin,
  logUserAction('bulk_reject_experiences', 'Admin bulk rejected experiences'),
  auditLogger('bulk_reject_experiences', 'experience'),
  async (req, res, next) => {
    req.body.operation = 'reject';
    await experienceController.bulkOperations(req, res, next);
  }
);

export default router;
