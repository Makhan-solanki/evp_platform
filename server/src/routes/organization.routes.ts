import { Router } from 'express';
import { OrganizationController } from '../controllers/organization.controller';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { 
  authenticateToken, 
  requireOrganization,
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
  createOrganizationSchema,
  updateOrganizationProfileSchema,
  inviteStudentSchema,
  bulkInviteStudentsSchema,
  csvBulkInviteSchema,
  removeStudentSchema,
  updateStudentRoleSchema,
  getOrganizationStudentsQuerySchema,
  getOrganizationExperiencesQuerySchema,
  organizationAnalyticsQuerySchema,
  verificationQueueQuerySchema,
  updateOrganizationSettingsSchema,
} from '../schemas/organization';
import { idParamSchema } from '../schemas/common';

const router = Router();
const organizationController = new OrganizationController();

/**
 * @route   GET /api/organizations
 * @desc    List all organizations (admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  logUserAction('list_organizations', 'Admin listed organizations'),
  organizationController.listOrganizations
);

/**
 * @route   POST /api/organizations
 * @desc    Create organization
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  validateBody(createOrganizationSchema),
  logUserAction('create_organization', 'User created organization'),
  trackDataChange('organization', 'create'),
  auditLogger('create_organization', 'organization'),
  organizationController.createOrganization
);

/**
 * @route   GET /api/organizations/profile
 * @desc    Get organization profile
 * @access  Private (Organization only)
 */
router.get(
  '/profile',
  authenticateToken,
  requireOrganization,
  organizationController.getProfile
);

/**
 * @route   PUT /api/organizations/profile
 * @desc    Update organization profile
 * @access  Private (Organization only)
 */
router.put(
  '/profile',
  authenticateToken,
  requireOrganization,
  validateBody(updateOrganizationProfileSchema),
  logUserAction('update_organization_profile', 'Organization updated profile'),
  trackDataChange('organization', 'update'),
  auditLogger('update_organization_profile', 'organization'),
  organizationController.updateProfile
);

/**
 * @route   GET /api/organizations/students
 * @desc    Get organization students
 * @access  Private (Organization only)
 */
router.get(
  '/students',
  authenticateToken,
  requireOrganization,
  validateQuery(getOrganizationStudentsQuerySchema),
  organizationController.getStudents
);

/**
 * @route   POST /api/organizations/students/invite
 * @desc    Invite student to organization
 * @access  Private (Organization only)
 */
router.post(
  '/students/invite',
  authenticateToken,
  requireOrganization,
  validateBody(inviteStudentSchema),
  logUserAction('invite_student', 'Organization invited student'),
  auditLogger('invite_student', 'invitation'),
  organizationController.inviteStudent
);

/**
 * @route   POST /api/organizations/students/bulk-invite
 * @desc    Bulk invite students to organization
 * @access  Private (Organization only)
 */
router.post(
  '/students/bulk-invite',
  authenticateToken,
  requireOrganization,
  validateBody(bulkInviteStudentsSchema),
  logUserAction('bulk_invite_students', 'Organization bulk invited students'),
  auditLogger('bulk_invite_students', 'invitation'),
  organizationController.bulkInviteStudents
);

/**
 * @route   POST /api/organizations/students/csv-invite
 * @desc    CSV bulk invite students
 * @access  Private (Organization only)
 */
router.post(
  '/students/csv-invite',
  authenticateToken,
  requireOrganization,
  uploadRateLimit,
  validateBody(csvBulkInviteSchema),
  logUserAction('csv_bulk_invite', 'Organization CSV bulk invited students'),
  auditLogger('csv_bulk_invite', 'invitation'),
  organizationController.csvBulkInvite
);

/**
 * @route   DELETE /api/organizations/students/:id
 * @desc    Remove student from organization
 * @access  Private (Organization only)
 */
router.delete(
  '/students/:id',
  authenticateToken,
  requireOrganization,
  validateParams(idParamSchema),
  validateBody(removeStudentSchema),
  logUserAction('remove_student', 'Organization removed student'),
  auditLogger('remove_student', 'organization_student'),
  organizationController.removeStudent
);

/**
 * @route   PUT /api/organizations/students/:id/role
 * @desc    Update student role in organization
 * @access  Private (Organization only)
 */
router.put(
  '/students/:id/role',
  authenticateToken,
  requireOrganization,
  validateParams(idParamSchema),
  validateBody(updateStudentRoleSchema),
  logUserAction('update_student_role', 'Organization updated student role'),
  trackDataChange('organization_student', 'update'),
  auditLogger('update_student_role', 'organization_student'),
  organizationController.updateStudentRole
);

/**
 * @route   GET /api/organizations/experiences
 * @desc    Get organization experiences
 * @access  Private (Organization only)
 */
router.get(
  '/experiences',
  authenticateToken,
  requireOrganization,
  validateQuery(getOrganizationExperiencesQuerySchema),
  organizationController.getExperiences
);

/**
 * @route   POST /api/organizations/experiences
 * @desc    Create experience (redirect to experiences endpoint)
 * @access  Private (Organization only)
 */
router.post(
  '/experiences',
  authenticateToken,
  requireOrganization,
  (req, res) => {
    res.status(301).json({
      success: false,
      message: 'Please use /api/experiences endpoint to create experiences',
      redirect: '/api/experiences',
    });
  }
);

/**
 * @route   GET /api/organizations/analytics
 * @desc    Get organization analytics
 * @access  Private (Organization only)
 */
router.get(
  '/analytics',
  authenticateToken,
  requireOrganization,
  validateQuery(organizationAnalyticsQuerySchema),
  logUserAction('view_analytics', 'Organization viewed analytics'),
  organizationController.getAnalytics
);

/**
 * @route   GET /api/organizations/dashboard
 * @desc    Get organization dashboard stats
 * @access  Private (Organization only)
 */
router.get(
  '/dashboard',
  authenticateToken,
  requireOrganization,
  organizationController.getDashboardStats
);

/**
 * @route   GET /api/organizations/verification-queue
 * @desc    Get verification queue
 * @access  Private (Organization only)
 */
router.get(
  '/verification-queue',
  authenticateToken,
  requireOrganization,
  validateQuery(verificationQueueQuerySchema),
  organizationController.getVerificationQueue
);

/**
 * @route   PUT /api/organizations/settings
 * @desc    Update organization settings
 * @access  Private (Organization only)
 */
router.put(
  '/settings',
  authenticateToken,
  requireOrganization,
  validateBody(updateOrganizationSettingsSchema),
  logUserAction('update_organization_settings', 'Organization updated settings'),
  trackDataChange('organization', 'update'),
  auditLogger('update_organization_settings', 'organization'),
  organizationController.updateSettings
);

// Public routes
/**
 * @route   GET /api/organizations/:slug
 * @desc    Get organization by slug (public)
 * @access  Public
 */
router.get(
  '/:slug',
  optionalAuth,
  // validateParams for slug would need custom validation
  organizationController.getOrganizationBySlug
);

export default router;
