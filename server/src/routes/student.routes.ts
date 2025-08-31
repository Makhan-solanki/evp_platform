import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { validateBody, validateParams, validateQuery } from '../middleware/validation';
import { 
  authenticateToken, 
  requireStudent,
  requireAdmin,
  optionalAuth 
} from '../middleware/auth';
import { 
  generalRateLimit 
} from '../middleware/security';
import { 
  auditLogger,
  logUserAction,
  trackDataChange 
} from '../middleware/audit';
import {
  updateStudentProfileSchema,
  organizationJoinRequestSchema,
  experienceResponseSchema,
  addSkillSchema,
  updateSkillSchema,
  addSocialLinkSchema,
  getStudentOrganizationsQuerySchema,
  getStudentExperiencesQuerySchema,
  studentSearchQuerySchema,
  updatePortfolioSettingsSchema,
  addAchievementSchema,
  updateStudentPreferencesSchema,
} from '../schemas/student';
import { idParamSchema } from '../schemas/common';

const router = Router();
const studentController = new StudentController();

/**
 * @route   GET /api/students/profile
 * @desc    Get student profile
 * @access  Private (Student only)
 */
router.get(
  '/profile',
  authenticateToken,
  requireStudent,
  studentController.getProfile
);

/**
 * @route   PUT /api/students/profile
 * @desc    Update student profile
 * @access  Private (Student only)
 */
router.put(
  '/profile',
  authenticateToken,
  requireStudent,
  validateBody(updateStudentProfileSchema),
  logUserAction('update_student_profile', 'Student updated profile'),
  trackDataChange('student', 'update'),
  auditLogger('update_student_profile', 'student'),
  studentController.updateProfile
);

/**
 * @route   GET /api/students/organizations
 * @desc    Get student organizations
 * @access  Private (Student only)
 */
router.get(
  '/organizations',
  authenticateToken,
  requireStudent,
  validateQuery(getStudentOrganizationsQuerySchema),
  studentController.getOrganizations
);

/**
 * @route   POST /api/students/org-requests
 * @desc    Request to join organization
 * @access  Private (Student only)
 */
router.post(
  '/org-requests',
  authenticateToken,
  requireStudent,
  validateBody(organizationJoinRequestSchema),
  logUserAction('request_join_organization', 'Student requested to join organization'),
  auditLogger('request_join_organization', 'organization_request'),
  studentController.requestToJoinOrganization
);

/**
 * @route   GET /api/students/experiences
 * @desc    Get student experiences
 * @access  Private (Student only)
 */
router.get(
  '/experiences',
  authenticateToken,
  requireStudent,
  validateQuery(getStudentExperiencesQuerySchema),
  studentController.getExperiences
);

/**
 * @route   PUT /api/students/experiences/:id/accept
 * @desc    Accept experience
 * @access  Private (Student only)
 */
router.put(
  '/experiences/:id/accept',
  authenticateToken,
  requireStudent,
  validateParams(idParamSchema),
  logUserAction('accept_experience', 'Student accepted experience'),
  trackDataChange('experience', 'update'),
  auditLogger('accept_experience', 'experience'),
  studentController.acceptExperience
);

/**
 * @route   PUT /api/students/experiences/:id/decline
 * @desc    Decline experience
 * @access  Private (Student only)
 */
router.put(
  '/experiences/:id/decline',
  authenticateToken,
  requireStudent,
  validateParams(idParamSchema),
  validateBody(experienceResponseSchema),
  logUserAction('decline_experience', 'Student declined experience'),
  trackDataChange('experience', 'update'),
  auditLogger('decline_experience', 'experience'),
  studentController.declineExperience
);

/**
 * @route   GET /api/students/portfolio
 * @desc    Get student portfolio
 * @access  Private (Student only)
 */
router.get(
  '/portfolio',
  authenticateToken,
  requireStudent,
  studentController.getPortfolio
);

/**
 * @route   PUT /api/students/portfolio
 * @desc    Update student portfolio
 * @access  Private (Student only)
 */
router.put(
  '/portfolio',
  authenticateToken,
  requireStudent,
  validateBody(updatePortfolioSettingsSchema),
  logUserAction('update_portfolio', 'Student updated portfolio'),
  trackDataChange('portfolio', 'update'),
  auditLogger('update_portfolio', 'portfolio'),
  studentController.updatePortfolio
);

/**
 * @route   POST /api/students/skills
 * @desc    Add skill
 * @access  Private (Student only)
 */
router.post(
  '/skills',
  authenticateToken,
  requireStudent,
  validateBody(addSkillSchema),
  logUserAction('add_skill', 'Student added skill'),
  trackDataChange('student_skill', 'create'),
  auditLogger('add_skill', 'student_skill'),
  studentController.addSkill
);

/**
 * @route   PUT /api/students/skills/:id
 * @desc    Update skill
 * @access  Private (Student only)
 */
router.put(
  '/skills/:id',
  authenticateToken,
  requireStudent,
  validateParams(idParamSchema),
  validateBody(updateSkillSchema),
  logUserAction('update_skill', 'Student updated skill'),
  trackDataChange('student_skill', 'update'),
  auditLogger('update_skill', 'student_skill'),
  studentController.updateSkill
);

/**
 * @route   DELETE /api/students/skills/:id
 * @desc    Remove skill
 * @access  Private (Student only)
 */
router.delete(
  '/skills/:id',
  authenticateToken,
  requireStudent,
  validateParams(idParamSchema),
  logUserAction('remove_skill', 'Student removed skill'),
  auditLogger('remove_skill', 'student_skill'),
  studentController.removeSkill
);

/**
 * @route   POST /api/students/social-links
 * @desc    Add social link
 * @access  Private (Student only)
 */
router.post(
  '/social-links',
  authenticateToken,
  requireStudent,
  validateBody(addSocialLinkSchema),
  logUserAction('add_social_link', 'Student added social link'),
  trackDataChange('social_link', 'create'),
  auditLogger('add_social_link', 'social_link'),
  studentController.addSocialLink
);

/**
 * @route   DELETE /api/students/social-links/:id
 * @desc    Remove social link
 * @access  Private (Student only)
 */
router.delete(
  '/social-links/:id',
  authenticateToken,
  requireStudent,
  validateParams(idParamSchema),
  logUserAction('remove_social_link', 'Student removed social link'),
  auditLogger('remove_social_link', 'social_link'),
  studentController.removeSocialLink
);

/**
 * @route   POST /api/students/achievements
 * @desc    Add achievement
 * @access  Private (Student only)
 */
router.post(
  '/achievements',
  authenticateToken,
  requireStudent,
  validateBody(addAchievementSchema),
  logUserAction('add_achievement', 'Student added achievement'),
  trackDataChange('achievement_badge', 'create'),
  auditLogger('add_achievement', 'achievement_badge'),
  studentController.addAchievement
);

/**
 * @route   PUT /api/students/preferences
 * @desc    Update student preferences
 * @access  Private (Student only)
 */
router.put(
  '/preferences',
  authenticateToken,
  requireStudent,
  validateBody(updateStudentPreferencesSchema),
  logUserAction('update_student_preferences', 'Student updated preferences'),
  trackDataChange('student', 'update'),
  auditLogger('update_student_preferences', 'student'),
  studentController.updatePreferences
);

/**
 * @route   GET /api/students/statistics
 * @desc    Get student statistics
 * @access  Private (Student only)
 */
router.get(
  '/statistics',
  authenticateToken,
  requireStudent,
  studentController.getStatistics
);

/**
 * @route   GET /api/students/dashboard
 * @desc    Get student dashboard data
 * @access  Private (Student only)
 */
router.get(
  '/dashboard',
  authenticateToken,
  requireStudent,
  studentController.getDashboard
);

// Public routes
/**
 * @route   GET /api/students/search
 * @desc    Search students (public)
 * @access  Public
 */
router.get(
  '/search',
  optionalAuth,
  validateQuery(studentSearchQuerySchema),
  studentController.searchStudents
);

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID (public)
 * @access  Public
 */
router.get(
  '/:id',
  optionalAuth,
  validateParams(idParamSchema),
  studentController.getStudentById
);

// Admin routes
/**
 * @route   GET /api/students/admin/list
 * @desc    List all students (admin only)
 * @access  Private (Admin only)
 */
router.get(
  '/admin/list',
  authenticateToken,
  requireAdmin,
  validateQuery(studentSearchQuerySchema),
  logUserAction('list_students', 'Admin listed students'),
  async (req, res, next) => {
    // Admin version with more detailed data
    const studentController = new StudentController();
    await studentController.searchStudents(req, res, next);
  }
);

/**
 * @route   PUT /api/students/:id/verify
 * @desc    Verify student (admin only)
 * @access  Private (Admin only)
 */
router.put(
  '/:id/verify',
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  logUserAction('verify_student', 'Admin verified student'),
  auditLogger('verify_student', 'student'),
  async (req, res, next) => {
    // TODO: Implement student verification
    res.json({
      success: true,
      message: 'Student verification feature coming soon',
    });
  }
);

/**
 * @route   PUT /api/students/:id/status
 * @desc    Update student status (admin only)
 * @access  Private (Admin only)
 */
router.put(
  '/:id/status',
  authenticateToken,
  requireAdmin,
  validateParams(idParamSchema),
  logUserAction('update_student_status', 'Admin updated student status'),
  auditLogger('update_student_status', 'student'),
  async (req, res, next) => {
    // TODO: Implement student status update
    res.json({
      success: true,
      message: 'Student status update feature coming soon',
    });
  }
);

export default router;
