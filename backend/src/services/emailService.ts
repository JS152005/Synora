import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

export interface SendOtpEmailParams {
  to: string;
  name?: string;
  studentName?: string;
  otp: string;
  emailType?: "PERSONAL" | "COLLEGE";
  purpose?: "PERSONAL" | "COLLEGE" | "PERSONAL_EMAIL_VERIFICATION" | "COLLEGE_EMAIL_VERIFICATION";
  expiresInMinutes?: number;
}

let transporterInstance: Transporter | null = null;

// Create reusable SMTP transporter from environment variables
function getTransporter(): Transporter {
  if (!transporterInstance) {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.SMTP_PORT) || 465;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    transporterInstance = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      // Pool connections for better performance
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });
  }
  return transporterInstance;
}

/**
 * Verifies SMTP connection connectivity.
 */
export async function verifySmtpConnection(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.verify();
    return true;
  } catch (error) {
    console.error("[SMTP-VERIFY-ERROR] Failed to connect to SMTP server:", (error as Error).message);
    return false;
  }
}

/**
 * Sends a real 6-digit OTP email to Personal or College email address.
 * Formats with both rich responsive HTML and plain-text fallback.
 */
export async function sendVerificationOtpEmail({
  to,
  name,
  studentName,
  otp,
  emailType,
  purpose,
  expiresInMinutes = 10,
}: SendOtpEmailParams): Promise<boolean> {
  const from =
    process.env.EMAIL_FROM ||
    `"Synora Med" <${process.env.SMTP_USER || "noreply@synora.com"}>`;

  const displayName = studentName || name || "Medical Student";
  const resolvedType =
    emailType ||
    (purpose?.startsWith("COLLEGE") ? "COLLEGE" : "PERSONAL");
  const isPersonal = resolvedType === "PERSONAL";
  const subject = isPersonal
    ? "Verify your Synora account"
    : "Verify your college email for Synora";

  const plainText = isPersonal
    ? `Hello ${displayName},

Your Synora verification code is:
${otp}

Enter this code in Synora to verify your personal email address.

This code will expire in ${expiresInMinutes} minutes.

If you did not request this verification code, you can safely ignore this email.

Regards,
The Synora Team`
    : `Hello ${name},

Your Synora college email verification code is:
${otp}

Enter this code in Synora to verify your college email address.

Successfully verifying your college email gives your Synora account a Verified Med badge.

This code will expire in ${expiresInMinutes} minutes.

If you did not request this code, you can safely ignore this email.

Regards,
The Synora Team`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%);
      padding: 32px 36px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0 0;
      color: #c7d2fe;
      font-size: 13px;
      font-weight: 500;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 9999px;
      color: #e0e7ff;
      font-size: 11px;
      font-weight: 600;
      margin-top: 8px;
    }
    .content {
      padding: 36px 36px 28px 36px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 12px;
    }
    .description {
      font-size: 14px;
      line-height: 1.6;
      color: #475569;
      margin-bottom: 24px;
    }
    .otp-box {
      background: #f1f5f9;
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: "Courier New", Courier, monospace;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #3730a3;
      margin: 0;
    }
    .badge-highlight {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background-color: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 10px 14px;
      color: #065f46;
      font-size: 13px;
      margin: 16px 0;
    }
    .expiry {
      font-size: 13px;
      color: #64748b;
      text-align: center;
      margin: 16px 0;
    }
    .footer {
      border-top: 1px solid #f1f5f9;
      padding: 24px 36px;
      background: #fafaf9;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
      text-align: center;
    }
    .footer a {
      color: #6366f1;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🩺 Synora</h1>
      <p>India's Collaborative Medical Student Network</p>
      <div class="badge">${isPersonal ? "Personal Email Verification" : "Institutional Verification"}</div>
    </div>
    <div class="content">
      <div class="greeting">Hello ${displayName},</div>
      <div class="description">
        ${
          isPersonal
            ? "Thank you for joining Synora. To activate your medical student study profile, please enter this verification code in your browser:"
            : "To link your medical institution and receive your <strong>Verified Med</strong> badge on Synora, please enter this code:"
        }
      </div>

      <div class="otp-box">
        <div class="otp-label">Your 6-Digit Verification Code</div>
        <div class="otp-code">${otp}</div>
      </div>

      ${
        !isPersonal
          ? `<div class="badge-highlight">
              ✨ <strong>Verified Med Badge:</strong> Verifying your college email confirms your medical enrollment and activates clinical peer matchmaking.
            </div>`
          : ""
      }

      <div class="expiry">
        ⏱️ This verification code is valid for <strong>${expiresInMinutes} minutes</strong> and can only be used once.
      </div>
    </div>
    <div class="footer">
      If you did not request this verification code, you can safely ignore this email.<br />
      Synora · Strictly Verified Medical Student Platform
    </div>
  </div>
</body>
</html>`;

  try {
    // Attempt SMTP send
    const info = await getTransporter().sendMail({
      from,
      to,
      subject,
      text: plainText,
      html,
    });

    console.log(`[EMAIL-DELIVERY-SUCCESS] Sent OTP to ${to} (MessageId: ${info.messageId})`);
    return true;
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`[EMAIL-DELIVERY-ERROR] Failed to send email to ${to}:`, err.message);

    // If in development and credentials are placeholders, log notice
    if (
      process.env.SMTP_PASS === "your_gmail_app_password_here" ||
      !process.env.SMTP_PASS
    ) {
      console.warn(
        `[EMAIL-DEV-NOTICE] SMTP_PASS in .env is still set to placeholder. To receive real emails, set your Gmail App Password in backend/.env.`
      );
    }

    throw new Error(
      "Unable to send verification email. Please check that your email address is correct and try again."
    );
  }
}

/**
 * Sends a test email to verify SMTP configuration connectivity.
 */
export async function sendTestEmail(toEmail: string) {
  const from =
    process.env.EMAIL_FROM ||
    `"Synora Med" <${process.env.SMTP_USER || "noreply@synora.com"}>`;

  const info = await getTransporter().sendMail({
    from,
    to: toEmail,
    subject: "Synora SMTP Real Email Delivery Test",
    text: "This is a test email from Synora verifying that SMTP email delivery is working properly.",
    html: `<div style="font-family: sans-serif; padding: 20px;">
      <h2>🎉 Synora SMTP Test Successful!</h2>
      <p>Your Gmail SMTP credentials are configured correctly and real emails are being delivered.</p>
    </div>`,
  });

  return info;
}

/**
 * Sends a real 6-digit OTP email for Password Reset.
 * Formats with rich responsive HTML matching Synora palette and plain-text fallback.
 */
export async function sendPasswordResetOtpEmail({
  to,
  name,
  otp,
  expiresInMinutes = 10,
}: {
  to: string;
  name?: string;
  otp: string;
  expiresInMinutes?: number;
}): Promise<boolean> {
  const from =
    process.env.EMAIL_FROM ||
    `"Synora Med" <${process.env.SMTP_USER || "noreply@synora.com"}>`;

  const displayName = name || "Medical Student";
  const subject = "Reset your Synora password";

  const plainText = `Hello ${displayName},

We received a request to reset your Synora account password.

Your 6-digit password reset code is:
${otp}

This code is valid for exactly ${expiresInMinutes} minutes and can only be used once.

If you did not request a password reset, please ignore this email or change your password if you suspect unauthorized access.

Regards,
The Synora Security Team`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F5F5DC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #4A3B35;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(74, 59, 53, 0.08), 0 2px 4px -2px rgba(74, 59, 53, 0.04);
      border: 1px solid #D8B4A0;
    }
    .header {
      background: linear-gradient(135deg, #4A3B35 0%, #3B4F8A 100%);
      padding: 32px 36px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      margin: 6px 0 0 0;
      color: #F5F5DC;
      font-size: 13px;
      font-weight: 500;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 9999px;
      color: #F5F5DC;
      font-size: 11px;
      font-weight: 600;
      margin-top: 8px;
    }
    .content {
      padding: 36px 36px 28px 36px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 700;
      color: #4A3B35;
      margin-bottom: 12px;
    }
    .description {
      font-size: 14px;
      line-height: 1.6;
      color: #4A3B35;
      margin-bottom: 24px;
    }
    .otp-box {
      background: #F5F5DC;
      border: 2px dashed #B79AA8;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #4A3B35;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: "Courier New", Courier, monospace;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #3B4F8A;
      margin: 0;
    }
    .expiry {
      font-size: 13px;
      color: #7A8450;
      text-align: center;
      margin: 16px 0;
      font-weight: 600;
    }
    .warning {
      background-color: #fff8f5;
      border: 1px solid #D8B4A0;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 12px;
      color: #4A3B35;
      margin-top: 20px;
    }
    .footer {
      border-top: 1px solid #F5F5DC;
      padding: 24px 36px;
      background: #faf8f5;
      font-size: 12px;
      color: #B79AA8;
      line-height: 1.5;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🩺 Synora</h1>
      <p>India's Collaborative Medical Student Network</p>
      <div class="badge">Password Reset Request</div>
    </div>
    <div class="content">
      <div class="greeting">Hello ${displayName},</div>
      <div class="description">
        We received a request to reset your password. Enter this verification code to confirm your identity and proceed with creating a new password:
      </div>

      <div class="otp-box">
        <div class="otp-label">Password Reset Code</div>
        <div class="otp-code">${otp}</div>
      </div>

      <div class="expiry">
        ⏱️ This verification code is valid for exactly <strong>${expiresInMinutes} minutes</strong> and can only be used once.
      </div>

      <div class="warning">
        🔒 <strong>Security Tip:</strong> Never share this code with anyone. Synora administrators will never ask for your verification code or password.
      </div>
    </div>
    <div class="footer">
      If you did not request a password reset, you can safely ignore this email.<br />
      Synora · Secure Medical Student Platform
    </div>
  </div>
</body>
</html>`;

  try {
    const info = await getTransporter().sendMail({
      from,
      to,
      subject,
      text: plainText,
      html,
    });

    console.log(`[PASSWORD-RESET-EMAIL-SUCCESS] Sent OTP to ${to} (MessageId: ${info.messageId})`);
    return true;
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`[PASSWORD-RESET-EMAIL-ERROR] Failed to send email to ${to}:`, err.message);
    throw new Error(
      "Unable to send password reset email. Please check that your email address is correct and try again."
    );
  }
}

/**
 * Sends a real 6-digit OTP email for Settings Password Change verification.
 */
export async function sendPasswordChangeOtpEmail({
  to,
  name,
  otp,
  expiresInMinutes = 10,
}: {
  to: string;
  name?: string;
  otp: string;
  expiresInMinutes?: number;
}): Promise<boolean> {
  const from =
    process.env.EMAIL_FROM ||
    `"Synora Med" <${process.env.SMTP_USER || "noreply@synora.com"}>`;

  const displayName = name || "Medical Student";
  const subject = "Verify password change for your Synora account";

  const plainText = `Hello ${displayName},

We received a request to change the password for your Synora account from Settings.

Your 6-digit verification code is:
${otp}

This code is valid for exactly ${expiresInMinutes} minutes and can only be used once.

Enter this code in Synora Settings to confirm your identity and complete the password change.

If you did not request this password change, please review your account security immediately.

Regards,
The Synora Security Team`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #F5F5DC;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #4A3B35;
    }
    .container {
      max-width: 560px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(74, 59, 53, 0.08);
      border: 1px solid #D8B4A0;
    }
    .header {
      background: linear-gradient(135deg, #4A3B35 0%, #3B4F8A 100%);
      padding: 32px 36px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
    }
    .header p {
      margin: 6px 0 0 0;
      color: #F5F5DC;
      font-size: 13px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      border-radius: 9999px;
      color: #F5F5DC;
      font-size: 11px;
      font-weight: 600;
      margin-top: 8px;
    }
    .content {
      padding: 36px 36px 28px 36px;
    }
    .greeting {
      font-size: 16px;
      font-weight: 700;
      color: #4A3B35;
      margin-bottom: 12px;
    }
    .description {
      font-size: 14px;
      line-height: 1.6;
      color: #4A3B35;
      margin-bottom: 24px;
    }
    .otp-box {
      background: #F5F5DC;
      border: 2px dashed #B79AA8;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #4A3B35;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 8px;
      color: #3B4F8A;
      margin: 0;
    }
    .expiry {
      font-size: 13px;
      color: #7A8450;
      text-align: center;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .warning {
      background-color: #fbf9f6;
      border-left: 4px solid #3B4F8A;
      padding: 12px 16px;
      border-radius: 4px;
      font-size: 12px;
      color: #4A3B35;
      margin-top: 24px;
    }
    .footer {
      background-color: #fbf9f6;
      padding: 20px 36px;
      font-size: 12px;
      color: #B79AA8;
      line-height: 1.5;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🩺 Synora</h1>
      <p>India's Collaborative Medical Student Network</p>
      <div class="badge">Password Change Verification</div>
    </div>
    <div class="content">
      <div class="greeting">Hello ${displayName},</div>
      <div class="description">
        We received a request to change your password from Synora Settings. Enter this verification code to confirm your identity and proceed with the update:
      </div>

      <div class="otp-box">
        <div class="otp-label">Password Change Code</div>
        <div class="otp-code">${otp}</div>
      </div>

      <div class="expiry">
        ⏱️ This verification code is valid for exactly <strong>${expiresInMinutes} minutes</strong> and can only be used once.
      </div>

      <div class="warning">
        🔒 <strong>Security Notice:</strong> If you did not make this request from Synora Settings, please ensure your account is protected immediately.
      </div>
    </div>
    <div class="footer">
      Synora · Secure Medical Student Collaboration Platform
    </div>
  </div>
</body>
</html>`;

  try {
    const info = await getTransporter().sendMail({
      from,
      to,
      subject,
      text: plainText,
      html,
    });

    console.log(`[PASSWORD-CHANGE-EMAIL-SUCCESS] Sent OTP to ${to} (MessageId: ${info.messageId})`);
    return true;
  } catch (error: unknown) {
    const err = error as Error;
    console.error(`[PASSWORD-CHANGE-EMAIL-ERROR] Failed to send email to ${to}:`, err.message);
    throw new Error(
      "Unable to send password change verification email. Please try again."
    );
  }
}


