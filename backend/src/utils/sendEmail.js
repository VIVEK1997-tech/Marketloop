import nodemailer from 'nodemailer';

const requiredMailConfig = ['EMAIL_USER', 'EMAIL_PASS'];

const ensureMailConfig = () => {
  const missing = requiredMailConfig.filter((key) => !process.env[key]);
  if (missing.length) {
    const error = new Error(`Email service is not configured. Missing: ${missing.join(', ')}`);
    error.statusCode = 503;
    throw error;
  }
};

const createTransporter = () => {
  ensureMailConfig();

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

export const sendOtpEmail = async ({ email, name, otp }) => {
  try {
    const transporter = createTransporter();
    const recipientName = name?.trim() || 'there';

    await transporter.sendMail({
      from: `"MarketLoop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your OTP Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
          <div style="padding: 24px; border: 1px solid #e2e8f0; border-radius: 18px; background: #ffffff;">
            <h2 style="margin: 0 0 16px; font-size: 24px;">Verify your email</h2>
            <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">Hi ${recipientName},</p>
            <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">
              Your OTP is:
            </p>
            <div style="margin: 0 0 20px; padding: 14px 18px; border-radius: 14px; background: #eff6ff; color: #1d4ed8; font-size: 30px; font-weight: 800; letter-spacing: 8px; text-align: center;">
              ${otp}
            </div>
            <p style="margin: 0 0 10px; font-size: 15px; line-height: 1.6;">
              It will expire in 10 minutes.
            </p>
            <p style="margin: 0; font-size: 13px; color: #64748b;">
              If you did not request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `
    });
  } catch (error) {
    if (error.statusCode) throw error;

    const smtpError = new Error(
      'Unable to send OTP email. Check EMAIL_USER, EMAIL_PASS, and use a Gmail App Password.'
    );
    smtpError.statusCode = 503;
    throw smtpError;
  }
};
