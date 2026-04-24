import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Email templates
const templates = {
  welcome: (username) => ({
    subject: `Welcome to ResumeApp, ${username}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🎉 Welcome to ResumeApp!</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e293b;">Hello ${username},</h2>
          <p style="color: #334155; line-height: 1.6;">Thank you for joining ResumeApp! You're now ready to build your professional resume and share it with the world.</p>
          
          <div style="background: #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e293b; margin-top: 0;">📋 Quick Start:</h3>
            <ul style="color: #334155; line-height: 1.6;">
              <li>Complete your profile information</li>
              <li>Add your work experience</li>
              <li>List your skills and projects</li>
              <li>Share your public resume link</li>
            </ul>
          </div>
          
          <a href="https://resumeapp.vercel.app" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Get Started →</a>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 20px;">
            If you didn't sign up for ResumeApp, please ignore this email.<br>
            © 2024 ResumeApp. All rights reserved.
          </p>
        </div>
      </div>
    `,
  }),

  loginAlert: (username, timestamp, ip) => ({
    subject: `🔐 New login to your ResumeApp account`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1e293b; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🔐 New Login Detected</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e293b;">Hello ${username},</h2>
          <p style="color: #334155; line-height: 1.6;">We noticed a new login to your ResumeApp account.</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #92400e;"><strong>📅 Time:</strong> ${timestamp}</p>
            <p style="margin: 10px 0 0 0; color: #92400e;"><strong>🌐 IP Address:</strong> ${ip || 'Unknown'}</p>
          </div>
          
          <p style="color: #334155;">If this was you, you can safely ignore this email.</p>
          <p style="color: #dc2626; font-weight: bold;">If this wasn't you, please reset your password immediately.</p>
          
          <a href="https://resumeapp.vercel.app" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Secure Your Account →</a>
          
          <p style="color: #64748b; font-size: 12px; margin-top: 30px; border-top: 1px solid #cbd5e1; padding-top: 20px;">
            If you have any questions, contact support@resumeapp.com
          </p>
        </div>
      </div>
    `,
  }),

  passwordReset: (username, resetLink) => ({
    subject: `Reset your ResumeApp password`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #1e293b; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🔐 Reset Your Password</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e293b;">Hello ${username},</h2>
          <p style="color: #334155; line-height: 1.6;">We received a request to reset your ResumeApp password.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password →</a>
          </div>
          
          <p style="color: #64748b; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #334155;">If you didn't request this, please ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;">
          <p style="color: #64748b; font-size: 12px;">
            For security, this link can only be used once.
          </p>
        </div>
      </div>
    `,
  }),
};

// Send email function
async function sendEmail(to, type, data) {
  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  
  console.log(`Attempting to send ${type} email to ${to}`);
  
  if (!to || !to.includes('@')) {
    console.error('Invalid email address:', to);
    return null;
  }
  
  let template;
  switch (type) {
    case 'welcome':
      template = templates.welcome(data.username);
      break;
    case 'loginAlert':
      template = templates.loginAlert(data.username, data.timestamp, data.ip);
      break;
    case 'passwordReset':
      template = templates.passwordReset(data.username, data.resetLink);
      break;
    default:
      console.error('Unknown email type:', type);
      return null;
  }

  try {
    const { data: emailData, error } = await resend.emails.send({
      from,
      to,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      console.error('Resend API error:', error);
      return null;
    }
    
    console.log(`✅ Email sent to ${to}, ID:`, emailData?.id);
    return emailData;
  } catch (error) {
    console.error('Email send exception:', error.message);
    return null;
  }
}

export { sendEmail };