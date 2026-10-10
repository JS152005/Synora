import crypto from "crypto";

/**
 * Centralized Synora OTP Policy: Exactly 10 minutes expiry across all flows.
 */
export const OTP_EXPIRY_MINUTES = 10;
export const OTP_EXPIRY_MS = OTP_EXPIRY_MINUTES * 60 * 1000;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const OTP_RESEND_COOLDOWN_MS = OTP_RESEND_COOLDOWN_SECONDS * 1000;
export const OTP_MAX_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure 6-digit numeric OTP.
 */
export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Mask an email address for safe display in UI/API responses.
 * Example: "student123@aiims.edu" -> "s***3@aiims.edu"
 */
export const maskEmail = (email: string | null | undefined): string => {
  if (!email || !email.includes("@")) return "";

  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) {
    return `${localPart[0]}*@${domain}`;
  }

  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  const maskedLocal = `${firstChar}${"*".repeat(Math.max(1, localPart.length - 2))}${lastChar}`;

  return `${maskedLocal}@${domain}`;
};

/**
 * Normalizes email address (trimmed, lowercased).
 */
export const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

const GENERIC_WEBMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "ymail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "mail.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "aol.com",
  "rediffmail.com",
]);

/**
 * Checks if domain is a generic personal webmail provider.
 */
export const isGenericWebmail = (email: string): boolean => {
  const norm = normalizeEmail(email);
  const parts = norm.split("@");
  if (parts.length !== 2) return true;
  return GENERIC_WEBMAIL_DOMAINS.has(parts[1]);
};

/**
 * Validates that an institutional email domain matches one of the college's approved domains.
 * Supports exact domain or subdomain (e.g. "student.aiims.edu" matches "aiims.edu").
 */
export const isValidCollegeEmailDomain = (
  email: string,
  approvedDomains: string[]
): boolean => {
  if (!approvedDomains || approvedDomains.length === 0) return false;

  const norm = normalizeEmail(email);
  const parts = norm.split("@");
  if (parts.length !== 2) return false;
  const userDomain = parts[1];

  return approvedDomains.some((approved) => {
    const cleanApproved = approved.trim().toLowerCase();
    return (
      userDomain === cleanApproved || userDomain.endsWith("." + cleanApproved)
    );
  });
};
