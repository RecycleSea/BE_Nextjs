import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendOtpEmail(email: string, otp: string, name?: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Email Verification - OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333;">Email Verification</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; font-size: 16px;">
            ${name ? `Hi ${name},` : 'Hello,'}
          </p>
          <p style="margin: 0 0 15px 0; font-size: 16px;">
            Thank you for registering! Please use the following OTP code to verify your email address:
          </p>
          
          <div style="background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</span>
          </div>
          
          <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
            This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #999;">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendResetPasswordEmail(email: string, resetToken: string, name?: string) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333;">Password Reset</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 15px 0; font-size: 16px;">
            ${name ? `Hi ${name},` : 'Hello,'}
          </p>
          <p style="margin: 0 0 20px 0; font-size: 16px;">
            You requested to reset your password. Click the button below to create a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="margin: 20px 0 10px 0; font-size: 14px; color: #666;">
            This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
          </p>
          
          <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
            If the button doesn't work, copy and paste this URL into your browser:<br>
            <span style="word-break: break-all;">${resetUrl}</span>
          </p>
        </div>
        
        <div style="text-align: center; font-size: 12px; color: #999;">
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendWelcomeEmail(email: string, name?: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to Our Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333;">Welcome!</h1>
        </div>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px;">
          <p style="margin: 0 0 15px 0; font-size: 16px;">
            ${name ? `Hi ${name},` : 'Hello,'}
          </p>
          <p style="margin: 0 0 15px 0; font-size: 16px;">
            Welcome to our platform! Your email has been successfully verified and your account is now active.
          </p>
          <p style="margin: 0; font-size: 16px;">
            We're excited to have you on board!
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}