import nodemailer from 'nodemailer';
import { logger } from './logger';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(this.config);
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: options.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean> {
    const subject = 'Welcome to Academix - Experience Verification Platform';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Academix!</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Experience Verification Platform</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Hello ${userName}!</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Welcome to Academix! We're excited to have you join our platform for verifying and showcasing student experiences.
          </p>
          
          <div style="background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0;">What you can do with Academix:</h3>
            <ul style="color: #475569; line-height: 1.8;">
              <li>✅ Verify student experiences and achievements</li>
              <li>✅ Build professional portfolios</li>
              <li>✅ Connect with educational organizations</li>
              <li>✅ Track your learning journey</li>
            </ul>
          </div>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Get started by completing your profile and adding your first experience. Our team is here to help you succeed!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
               style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Get Started
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            If you have any questions, feel free to reach out to our support team at 
            <a href="mailto:support@academix.com" style="color: #2563eb;">support@academix.com</a>
          </p>
        </div>
        
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            © 2024 Academix. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      from: `"Academix" <${this.config.auth.user}>`,
      to: userEmail,
      subject,
      html,
    });
  }

  async sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = 'Reset Your Password - Academix';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
          <p style="color: #fecaca; margin: 10px 0 0 0; font-size: 16px;">Academix Platform</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Hello!</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            We received a request to reset your password for your Academix account. If you didn't make this request, you can safely ignore this email.
          </p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <p style="color: #991b1b; margin: 0; font-weight: 500;">
              This password reset link will expire in 1 hour for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
        
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            © 2024 Academix. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      from: `"Academix Support" <${this.config.auth.user}>`,
      to: userEmail,
      subject,
      html,
    });
  }

  async sendVerificationEmail(userEmail: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    const subject = 'Verify Your Email - Academix';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #16a34a, #15803d); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Verify Your Email</h1>
          <p style="color: #bbf7d0; margin: 10px 0 0 0; font-size: 16px;">Academix Platform</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Almost there!</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            Thank you for signing up with Academix! To complete your registration, please verify your email address by clicking the button below.
          </p>
          
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <p style="color: #166534; margin: 0; font-weight: 500;">
              Email verification helps us keep your account secure and ensures you receive important updates.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
          </p>
        </div>
        
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            © 2024 Academix. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      from: `"Academix" <${this.config.auth.user}>`,
      to: userEmail,
      subject,
      html,
    });
  }

  async sendExperienceVerificationEmail(userEmail: string, experienceTitle: string, organizationName: string): Promise<boolean> {
    const subject = 'Experience Verification Request - Academix';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Experience Verification</h1>
          <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Academix Platform</p>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Verification Request</h2>
          
          <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
            A student has requested verification for their experience: <strong>${experienceTitle}</strong>
          </p>
          
          <div style="background: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <h3 style="color: #92400e; margin-top: 0;">Organization: ${organizationName}</h3>
            <p style="color: #92400e; margin: 0;">
              Please review and verify this experience to help the student build their professional portfolio.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/organization/requests" 
               style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
              Review Request
            </a>
          </div>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            Thank you for helping students verify their experiences and build their professional credibility.
          </p>
        </div>
        
        <div style="background: #1e293b; padding: 20px; text-align: center;">
          <p style="color: #94a3b8; margin: 0; font-size: 14px;">
            © 2024 Academix. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      from: `"Academix" <${this.config.auth.user}>`,
      to: userEmail,
      subject,
      html,
    });
  }
}

export const emailService = new EmailService();
