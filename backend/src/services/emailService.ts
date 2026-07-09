import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'MarketIntel AI'}" <${process.env.FROM_EMAIL || 'noreply@marketintel.ai'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    logger.info(`Email sent to ${options.to}`);
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
}

export function getVerificationEmailHtml(name: string, token: string): string {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">MarketIntel AI</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>Welcome, ${name}!</h2>
        <p>Please verify your email address to get started.</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
      </div>
    </div>
  `;
}

export function getPasswordResetEmailHtml(name: string, token: string): string {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">MarketIntel AI</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>Password Reset Request</h2>
        <p>Hi ${name}, click below to reset your password.</p>
        <a href="${url}" style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p style="color: #666; font-size: 12px;">This link expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    </div>
  `;
}

export function getAlertEmailHtml(alertName: string, message: string, link?: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">🚨 Market Alert</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2>${alertName}</h2>
        <p>${message}</p>
        ${link ? `<a href="${link}" style="display: inline-block; padding: 12px 24px; background: #f5576c; color: white; text-decoration: none; border-radius: 6px;">View Details</a>` : ''}
      </div>
    </div>
  `;
}
