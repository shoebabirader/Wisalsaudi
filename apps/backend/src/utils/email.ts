/**
 * Email Service
 * Handles sending verification and notification emails
 * Note: This is a placeholder implementation. In production, integrate with SendGrid or AWS SES
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email
 * @param options - Email options
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // TODO: Integrate with SendGrid or AWS SES
  console.log('📧 Email would be sent:', {
    to: options.to,
    subject: options.subject,
  });

  // For development, just log the email
  if (process.env.NODE_ENV === 'development') {
    console.log('Email content:', options.html);
  }

  // In production, use SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: options.to,
  //   from: process.env.FROM_EMAIL,
  //   subject: options.subject,
  //   html: options.html,
  //   text: options.text,
  // });
}

/**
 * Send email verification email
 * @param email - User email
 * @param verificationToken - Verification token
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string
): Promise<void> {
  const verificationUrl = `${process.env.API_URL}/api/auth/verify-email?token=${verificationToken}`;

  await sendEmail({
    to: email,
    subject: 'Verify your WISAL account - تحقق من حسابك في ويصل',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to WISAL! - مرحباً بك في ويصل!</h2>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <p>شكراً لتسجيلك. يرجى التحقق من عنوان بريدك الإلكتروني بالنقر على الرابط أدناه:</p>
        <p>
          <a href="${verificationUrl}" style="background-color: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Verify Email - تحقق من البريد الإلكتروني
          </a>
        </p>
        <p>Or copy and paste this link: ${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, please ignore this email.</p>
      </div>
    `,
    text: `Welcome to WISAL! Please verify your email by visiting: ${verificationUrl}`,
  });
}

/**
 * Send password reset email
 * @param email - User email
 * @param resetToken - Password reset token
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.API_URL}/api/auth/reset-password?token=${resetToken}`;

  await sendEmail({
    to: email,
    subject: 'Reset your WISAL password - إعادة تعيين كلمة المرور',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request - طلب إعادة تعيين كلمة المرور</h2>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. انقر على الرابط أدناه لتعيين كلمة مرور جديدة:</p>
        <p>
          <a href="${resetUrl}" style="background-color: #1E40AF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Reset Password - إعادة تعيين كلمة المرور
          </a>
        </p>
        <p>Or copy and paste this link: ${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      </div>
    `,
    text: `Reset your password by visiting: ${resetUrl}`,
  });
}
