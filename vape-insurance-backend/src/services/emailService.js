const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.initializeEmailService();
  }

  initializeEmailService() {
    try {
      // Try Resend first (preferred)
      if (process.env.RESEND_API_KEY) {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.provider = 'resend';
        console.log('✅ Resend email service initialized');
      } 
      // Fallback to SendGrid if configured
      else if (process.env.SENDGRID_API_KEY) {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        this.sendgrid = sgMail;
        this.provider = 'sendgrid';
        console.log('✅ SendGrid email service initialized');
      } 
      else {
        this.provider = 'console';
        console.log('⚠️  No email API key configured - OTPs will be logged to console');
      }
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.provider = 'console';
    }
  }

  async sendOTPEmail(to, name, otp, expiryMinutes = 10) {
    try {
      const htmlContent = this.generateOTPEmailHTML(name, otp, 'VapeGuard Insurance', expiryMinutes);
      const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || 'onboarding@resend.dev';
      const fromName = process.env.FROM_NAME || 'VapeGuard Insurance';

      // Use Resend (preferred)
      if (this.provider === 'resend') {
        const result = await this.resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: [to],
          subject: 'VapeGuard Insurance - Email Verification Code',
          html: htmlContent,
        });

        const messageId = result.data?.id || result.id;

        console.log('✅ OTP email sent successfully via Resend', {
          to: to.replace(/(.{3}).*(@.*)/, '$1***$2'),
          messageId: messageId,
          fromEmail: fromEmail
        });

        return {
          success: true,
          messageId: messageId,
          provider: 'resend'
        };
      }

      // Fallback to SendGrid
      if (this.provider === 'sendgrid') {
        const msg = {
          to: to,
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || fromEmail,
            name: fromName
          },
          subject: 'VapeGuard Insurance - Email Verification Code',
          html: htmlContent,
          text: this.htmlToText(htmlContent)
        };

        const result = await this.sendgrid.send(msg);
        
        console.log('✅ OTP email sent successfully via SendGrid', {
          to: to.replace(/(.{3}).*(@.*)/, '$1***$2'),
          messageId: result[0].headers['x-message-id']
        });

        return {
          success: true,
          messageId: result[0].headers['x-message-id'],
          provider: 'sendgrid'
        };
      }

      // Console fallback (development)
      console.log('\n📧 ============ EMAIL OTP (Development Mode) ============');
      console.log(`To: ${to}`);
      console.log(`Subject: VapeGuard Insurance - Email Verification Code`);
      console.log(`OTP: ${otp}`);
      console.log(`Expires in: ${expiryMinutes} minutes`);
      console.log('========================================================\n');

      return {
        success: true,
        messageId: 'console-' + Date.now(),
        provider: 'console'
      };

    } catch (error) {
      console.error('❌ Failed to send OTP email:', error.message);
      
      // In development, still return success with console logging
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📧 ============ EMAIL OTP (Fallback) ============');
        console.log(`To: ${to}`);
        console.log(`OTP: ${otp}`);
        console.log(`Error: ${error.message}`);
        console.log('===============================================\n');
        
        return {
          success: true,
          messageId: 'fallback-' + Date.now(),
          provider: 'console',
          error: error.message
        };
re      }
      
      throw error;
    }
  }

  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async sendLoginOTPEmail(to, name, otp, expiryMinutes = 5) {
    try {
      const htmlContent = this.generateLoginOTPEmailHTML(name, otp, 'VapeGuard Dashboard', expiryMinutes);
      const fromEmail = process.env.RESEND_FROM_EMAIL || process.env.FROM_EMAIL || 'onboarding@resend.dev';
      const fromName = process.env.FROM_NAME || 'VapeGuard Insurance';

      // Use Resend (preferred)
      if (this.provider === 'resend') {
        const result = await this.resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: [to],
          subject: 'VapeGuard Dashboard - Login Verification Code',
          html: htmlContent,
        });

        const messageId = result.data?.id || result.id;

        console.log('✅ Login OTP email sent successfully via Resend', {
          to: to.replace(/(.{3}).*(@.*)/, '$1***$2'),
          messageId: messageId,
          fromEmail: fromEmail
        });

        return {
          success: true,
          messageId: messageId,
          provider: 'resend'
        };
      }

      // Fallback to SendGrid
      if (this.provider === 'sendgrid') {
        const msg = {
          to: to,
          from: {
            email: process.env.SENDGRID_FROM_EMAIL || fromEmail,
            name: fromName
          },
          subject: 'VapeGuard Dashboard - Login Verification Code',
          html: htmlContent,
          text: this.htmlToText(htmlContent)
        };

        const result = await this.sendgrid.send(msg);
        
        console.log('✅ Login OTP email sent successfully via SendGrid', {
          to: to.replace(/(.{3}).*(@.*)/, '$1***$2'),
          messageId: result[0].headers['x-message-id']
        });

        return {
          success: true,
          messageId: result[0].headers['x-message-id'],
          provider: 'sendgrid'
        };
      }

      // Console fallback (development)
      console.log('\n📧 ============ LOGIN OTP (Development Mode) ============');
      console.log(`To: ${to}`);
      console.log(`Subject: VapeGuard Dashboard - Login Verification Code`);
      console.log(`OTP: ${otp}`);
      console.log(`Expires in: ${expiryMinutes} minutes`);
      console.log('========================================================\n');

      return {
        success: true,
        messageId: 'console-' + Date.now(),
        provider: 'console'
      };

    } catch (error) {
      console.error('❌ Failed to send login OTP email:', error.message);
      
      // In development, still return success with console logging
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📧 ============ LOGIN OTP (Fallback) ============');
        console.log(`To: ${to}`);
        console.log(`OTP: ${otp}`);
        console.log(`Error: ${error.message}`);
        console.log('===============================================\n');
        
        return {
          success: true,
          messageId: 'fallback-' + Date.now(),
          provider: 'console',
          error: error.message
        };
      }
      
      throw error;
    }
  }

  generateOTPEmailHTML(name, otp, appName, expiryMinutes) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName} - Email Verification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛡️ ${appName}</h1>
            <p>Email Verification Required</p>
        </div>
        <div class="content">
            <h2>Hello ${name || 'Valued Customer'},</h2>
            <p>Thank you for choosing VapeGuard Insurance! To complete your application, please verify your email address using the OTP below:</p>
            
            <div class="otp-box">
                <p style="margin: 0; font-size: 16px; color: #666;">Your Verification Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; font-size: 14px; color: #999;">Valid for ${expiryMinutes} minutes</p>
            </div>

            <div class="warning">
                <strong>⚠️ Security Notice:</strong> Never share this code with anyone. VapeGuard will never ask for your OTP via phone or email.
            </div>

            <p>If you didn't request this verification, please ignore this email or contact our support team.</p>
            
            <div class="footer">
                <p>Best regards,<br><strong>VapeGuard Insurance Team</strong></p>
                <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  generateLoginOTPEmailHTML(name, otp, appName, expiryMinutes) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${appName} - Login Verification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-box { background: #fff; border: 2px dashed #4a90e2; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
        .otp-code { font-size: 32px; font-weight: bold; color: #4a90e2; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        .warning { background: #e8f4fd; border: 1px solid #4a90e2; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 ${appName}</h1>
            <p>Secure Login Access</p>
        </div>
        <div class="content">
            <h2>Welcome back, ${name || 'User'}!</h2>
            <p>You're attempting to log in to your VapeGuard Dashboard. Please use the verification code below to complete your login:</p>
            
            <div class="otp-box">
                <p style="margin: 0; font-size: 16px; color: #666;">Your Login Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; font-size: 14px; color: #999;">Valid for ${expiryMinutes} minutes</p>
            </div>

            <div class="warning">
                <strong>🔒 Security Alert:</strong> If you didn't attempt to log in, please ignore this email and consider changing your password.
            </div>

            <p>This code will expire in ${expiryMinutes} minutes for your security.</p>
            
            <div class="footer">
                <p>Best regards,<br><strong>VapeGuard Security Team</strong></p>
                <p style="font-size: 12px; color: #999;">This is an automated security message. Please do not reply to this email.</p>
            </div>
        </div>
    </div>
</body>
</html>`;
  }
}

module.exports = new EmailService();
