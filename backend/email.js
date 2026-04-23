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
          <p style="color: #334155; line-height: 1.6;">Thank you for joining ResumeApp! You're now ready to build your professional resume.</p>
          <a href="http://localhost:5174" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Get Started →</a>
          <p style="color: #64748b; font-size: 12px; margin-top: 30px;">© 2024 ResumeApp. All rights reserved.</p>
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
          <p style="color: #334155;">We noticed a new login to your ResumeApp account.</p>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Time:</strong> ${timestamp}</p>
            <p style="margin: 10px 0 0 0;"><strong>IP Address:</strong> ${ip}</p>
          </div>
          <p style="color: #334155;">If this wasn't you, please reset your password immediately.</p>
          <a href="http://localhost:5174" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0;">Secure Your Account →</a>
        </div>
      </div>
    `,
  }),
};

// Send email function with better error handling
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