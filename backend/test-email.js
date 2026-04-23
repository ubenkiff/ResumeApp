import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'ubenkiff@gmail.com',  // <-- PUT YOUR REAL EMAIL HERE
      subject: 'Test Email from ResumeApp',
      html: '<h1>Test</h1><p>This is a test email.</p>',
    });

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success:', data);
    }
  } catch (err) {
    console.error('Failed:', err);
  }
}

testEmail();