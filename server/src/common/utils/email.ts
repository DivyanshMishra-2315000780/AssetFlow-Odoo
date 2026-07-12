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
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'prod_user',
        pass: 'prod_pass',
      },
    });
  }

  // Create a mock account with ethereal.email
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
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
