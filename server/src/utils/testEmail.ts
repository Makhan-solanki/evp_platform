import { emailService } from '../config/email';
import { logger } from '../config/logger';

/**
 * Test script to verify Gmail SMTP configuration
 * Run with: npm run test:email
 */

async function testEmailService() {
  console.log('🧪 Testing Gmail SMTP Configuration...\n');

  // Test 1: Welcome Email
  console.log('📧 Testing Welcome Email...');
  const welcomeResult = await emailService.sendWelcomeEmail(
    'test@example.com',
    'Test User'
  );
  console.log(welcomeResult ? '✅ Welcome email sent successfully' : '❌ Welcome email failed');

  // Test 2: Password Reset Email
  console.log('\n📧 Testing Password Reset Email...');
  const resetResult = await emailService.sendPasswordResetEmail(
    'test@example.com',
    'test-reset-token-123'
  );
  console.log(resetResult ? '✅ Password reset email sent successfully' : '❌ Password reset email failed');

  // Test 3: Email Verification
  console.log('\n📧 Testing Email Verification...');
  const verificationResult = await emailService.sendVerificationEmail(
    'test@example.com',
    'test-verification-token-123'
  );
  console.log(verificationResult ? '✅ Verification email sent successfully' : '❌ Verification email failed');

  // Test 4: Experience Verification Request
  console.log('\n📧 Testing Experience Verification Request...');
  const experienceResult = await emailService.sendExperienceVerificationEmail(
    'organization@example.com',
    'Software Engineering Internship',
    'Tech Company Inc.'
  );
  console.log(experienceResult ? '✅ Experience verification email sent successfully' : '❌ Experience verification email failed');

  console.log('\n🎉 Email service test completed!');
  console.log('\n📝 Note: Check your email inboxes to verify the emails were received.');
  console.log('   - test@example.com (for user emails)');
  console.log('   - organization@example.com (for organization emails)');
}

// Run the test if this file is executed directly
if (require.main === module) {
  testEmailService()
    .then(() => {
      console.log('\n✅ Email service test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Email service test failed:', error);
      logger.error('Email service test failed:', error);
      process.exit(1);
    });
}

export { testEmailService };
