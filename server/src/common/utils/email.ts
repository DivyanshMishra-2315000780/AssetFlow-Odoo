import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Creates a mock Nodemailer transporter.
 * Uses ethereal.email to safely test emails without sending real ones.
 */
const createTransporter = async () => {
  // If we had production credentials, we'd use them here.
  // For this mock implementation, we create a test account on the fly.
  if (env.NODE_ENV === 'production') {
    // Return production transporter
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  // Create a mock account with ethereal.email
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (options: EmailOptions) => {
  try {
    const transporter = await createTransporter();
    
    const mailOptions = {
      from: '"AssetFlow Support" <support@assetflow.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log(`📧 Message sent: ${info.messageId}`);
    
    // In dev mode, nodemailer provides a URL to preview the mock email
    if (env.NODE_ENV !== 'production') {
      console.log(`🔎 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    // In a real app, you might throw this error, but for mock purposes we'll just log it
    // throw new AppError('Failed to send email', 500, 'EMAIL_FAILED');
  }
};
