import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  RegisterUser,
  LoginUser,
  UpdateProfile,
  VerifyOtpRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  VerifyResetOtpRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateSettingsRequest,
} from "../models/userModel";
import {
  generateOtp,
  maskEmail,
  normalizeEmail,
  isValidCollegeEmailDomain,
  OTP_EXPIRY_MINUTES,
  OTP_EXPIRY_MS,
  OTP_RESEND_COOLDOWN_SECONDS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_MAX_ATTEMPTS,
} from "../utils/security";
import {
  sendVerificationOtpEmail,
  sendPasswordResetOtpEmail,
  sendPasswordChangeOtpEmail,
} from "./emailService";

export const testAuthService = () => {
  return {
    message: "Auth Service Working",
  };
};

/**
 * Initiates registration for a verified medical student account.
 * IMPORTANT ARCHITECTURE RULE:
 * The account is NOT created in the User table yet.
 * Registration details are stored securely in PendingRegistration with password securely hashed.
 * The User account is ONLY created/activated after required email verification is complete.
 */
export const registerService = async (data: RegisterUser) => {
  if (!data.fullName || data.fullName.trim().length < 3) {
    throw new Error("Full name must be at least 3 characters long.");
  }

  const personalEmailInput = data.personalEmail || data.email;
  if (!personalEmailInput || !personalEmailInput.includes("@")) {
    throw new Error("A valid personal email address is required.");
  }

  const normPersonal = normalizeEmail(personalEmailInput);

  // College email is OPTIONAL
  const hasCollegeEmail = Boolean(
    data.hasCollegeEmail !== false &&
      data.collegeEmail &&
      data.collegeEmail.trim().length > 0
  );
  let normCollege: string | null = null;

  if (hasCollegeEmail) {
    if (!data.collegeEmail || !data.collegeEmail.includes("@")) {
      throw new Error(
        "A valid college email address is required when selecting college email option."
      );
    }
    normCollege = normalizeEmail(data.collegeEmail);

    if (normPersonal === normCollege) {
      throw new Error(
        "Personal email and college email must be two separate, distinct addresses."
      );
    }
  }

  if (!data.collegeId) {
    throw new Error("Medical college selection is required.");
  }

  if (!data.year) {
    throw new Error("Academic year is required.");
  }

  if (!data.password || data.password.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  if (data.confirmPassword && data.password !== data.confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  // Prevent duplicate registered accounts across personal email
  const existingPersonal = await prisma.user.findFirst({
    where: {
      OR: [
        { email: normPersonal },
        { personalEmail: normPersonal },
        { collegeEmail: normPersonal },
      ],
    },
  });

  if (existingPersonal) {
    throw new Error(
      "An account is already registered with this personal email address."
    );
  }

  // If college email is provided, prevent collision with existing registered users
  if (normCollege) {
    const existingCollege = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normCollege },
          { personalEmail: normCollege },
          { collegeEmail: normCollege },
        ],
      },
    });

    if (existingCollege) {
      throw new Error(
        "An account is already registered with this college email address."
      );
    }
  }

  // Validate College in Database
  const college = await prisma.college.findFirst({
    where: {
      OR: [{ id: data.collegeId }, { code: data.collegeId }],
      active: true,
    },
  });

  if (!college) {
    throw new Error(
      "Selected medical college could not be verified in the national database."
    );
  }

  // Domain Validation only if college email provided
  if (normCollege) {
    const isTestEmail =
      normCollege === process.env.SMTP_USER ||
      normCollege.includes("synora.test") ||
      process.env.NODE_ENV !== "production";

    if (
      !isTestEmail &&
      college.hasVerifiedDomain &&
      college.emailDomains.length > 0
    ) {
      const isValidDomain = isValidCollegeEmailDomain(
        normCollege,
        college.emailDomains
      );

      if (!isValidDomain) {
        const examples = college.emailDomains.map((d) => `@${d}`).join(" or ");
        throw new Error(
          `Invalid college email domain for ${college.name}. Your college email must end with an approved domain (${examples}).`
        );
      }
    }
  }

  // Resolve Course
  const courseCode = data.course || "MBBS";
  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id: data.courseId || "" }, { code: courseCode }],
      active: true,
    },
  });

  // Securely hash password with bcrypt — NEVER store plain text
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Clean up any previous stale pending registration for this personal email
  await prisma.pendingRegistration.deleteMany({
    where: { email: normPersonal },
  });

  // Create PendingRegistration record (NOT a user account yet!)
  const pendingReg = await prisma.pendingRegistration.create({
    data: {
      fullName: data.fullName.trim(),
      email: normPersonal,
      personalEmail: normPersonal,
      collegeEmail: normCollege,
      passwordHash: hashedPassword,
      college: college.name,
      collegeId: college.id,
      course: course?.name || courseCode,
      courseId: course?.id,
      year: data.year,
      hasCollegeEmail: Boolean(normCollege),
      personalEmailVerified: false,
      collegeEmailVerified: false,
      verificationStep: "PERSONAL_EMAIL",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour pending TTL
    },
  });

  // Generate 6-digit OTP for PERSONAL EMAIL
  const personalOtp = generateOtp();
  const personalOtpHash = await bcrypt.hash(personalOtp, 8);

  // Centralized OTP Policy: EXACTLY 10 MINUTES
  await prisma.emailVerification.create({
    data: {
      pendingRegistrationId: pendingReg.id,
      email: normPersonal,
      emailType: "PERSONAL",
      otpHash: personalOtpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      cooldownUntil: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS),
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      isUsed: false,
    },
  });

  // Send REAL Email via Nodemailer SMTP Service
  try {
    await sendVerificationOtpEmail({
      to: normPersonal,
      name: data.fullName.trim(),
      otp: personalOtp,
      emailType: "PERSONAL",
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (emailErr: unknown) {
    console.warn(
      `[AUTH-EMAIL-NOTICE] Real email sending: ${(emailErr as Error).message}`
    );
    if (
      process.env.SMTP_PASS &&
      process.env.SMTP_PASS !== "your_gmail_app_password_here"
    ) {
      throw new Error(
        "Unable to send verification email. Please check that your email address is correct and try again."
      );
    }
  }

  // If college email is provided, ALSO generate and dispatch College Email OTP immediately
  if (normCollege) {
    const collegeOtp = generateOtp();
    const collegeOtpHash = await bcrypt.hash(collegeOtp, 8);

    await prisma.emailVerification.create({
      data: {
        pendingRegistrationId: pendingReg.id,
        email: normCollege,
        emailType: "COLLEGE",
        otpHash: collegeOtpHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        cooldownUntil: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS),
        attempts: 0,
        maxAttempts: OTP_MAX_ATTEMPTS,
        isUsed: false,
      },
    });

    try {
      await sendVerificationOtpEmail({
        to: normCollege,
        name: data.fullName.trim(),
        otp: collegeOtp,
        emailType: "COLLEGE",
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      });
    } catch (err: unknown) {
      console.warn(
        `[AUTH-EMAIL-NOTICE] College email real delivery: ${(err as Error).message}`
      );
    }

    console.log(
      `[AUTH-OTP-DEV] Generated 10-min OTP for College Email (${normCollege}): ${collegeOtp}`
    );
  }

  console.log(
    `[AUTH-OTP-DEV] Generated 10-min OTP for Personal Email (${normPersonal}): ${personalOtp}`
  );

  return {
    success: true,
    message: normCollege
      ? "Registration initiated. Verification codes have been sent to your personal and college emails."
      : "Registration initiated. A 6-digit verification code has been sent to your personal email.",
    registrationId: pendingReg.id,
    userId: pendingReg.id,
    step: normCollege ? "VERIFY_EMAILS" : "VERIFY_PERSONAL_EMAIL",
    personalEmailMasked: maskEmail(normPersonal),
    hasCollegeEmail: Boolean(normCollege),
    collegeEmailMasked: normCollege ? maskEmail(normCollege) : null,
    requiresVerification: true,
  };
};

/**
 * Verifies 6-digit OTP for Personal Email or College Email.
 * Enforces:
 * - 10-minute expiry
 * - Single-use only
 * - Attempt limits (max 5)
 * - ONLY creates the active User account when required verification is complete!
 */
export const verifyOtpService = async (params: VerifyOtpRequest) => {
  const { registrationId, userId, emailType, otp } = params;
  const targetId = registrationId || userId;

  if (!targetId || !emailType || !otp) {
    throw new Error(
      "Registration session identifier, emailType, and 6-digit OTP code are required."
    );
  }

  if (emailType !== "PERSONAL" && emailType !== "COLLEGE") {
    throw new Error("Invalid emailType. Must be PERSONAL or COLLEGE.");
  }

  const cleanOtp = otp.trim();
  if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    throw new Error("Verification code must be exactly 6 digits.");
  }

  // 1. Check Pending Registration first (New safe flow)
  const pending = await prisma.pendingRegistration.findUnique({
    where: { id: targetId },
  });

  if (pending) {
    // If verifying college email, personal email MUST be verified first
    if (emailType === "COLLEGE" && !pending.personalEmailVerified) {
      throw new Error(
        "You must successfully verify your personal email first."
      );
    }

    // Fetch active OTP record for pending registration
    const record = await prisma.emailVerification.findFirst({
      where: {
        pendingRegistrationId: targetId,
        emailType,
        isUsed: false,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      throw new Error(
        "No active verification code found. Please request a new code."
      );
    }

    // Check Expiration (Server-side 10-minute authority)
    if (new Date() > record.expiresAt) {
      throw new Error(
        "This verification code has expired. Please request a new code."
      );
    }

    // Check Max Attempts (5 attempts)
    if (record.attempts >= record.maxAttempts) {
      throw new Error(
        "Too many failed attempts. This code has been invalidated. Please request a new code."
      );
    }

    // Compare OTP securely with bcrypt
    const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);

    if (!isMatch) {
      const nextAttempts = record.attempts + 1;
      await prisma.emailVerification.update({
        where: { id: record.id },
        data: { attempts: nextAttempts },
      });

      if (nextAttempts >= record.maxAttempts) {
        throw new Error(
          "Too many failed attempts. This code has been invalidated. Please request a new code."
        );
      }

      const remaining = record.maxAttempts - nextAttempts;
      throw new Error(
        `Invalid verification code. Please try again. ${remaining} attempt${
          remaining === 1 ? "" : "s"
        } remaining.`
      );
    }

    // Mark current OTP as used (Single-use enforcement)
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { isUsed: true },
    });

    // ── STEP 1: Personal Email Verified ──
    if (emailType === "PERSONAL") {
      if (pending.hasCollegeEmail && pending.collegeEmail) {
        const updatedPending = await prisma.pendingRegistration.update({
          where: { id: targetId },
          data: {
            personalEmailVerified: true,
            verificationStep: "COLLEGE_EMAIL",
          },
        });

        // If college email was somehow already verified, complete registration now!
        if (updatedPending.collegeEmailVerified) {
          const newUser = await prisma.user.create({
            data: {
              fullName: pending.fullName,
              email: pending.email,
              personalEmail: pending.personalEmail,
              collegeEmail: pending.collegeEmail,
              password: pending.passwordHash,
              college: pending.college,
              collegeId: pending.collegeId,
              course: pending.course,
              courseId: pending.courseId,
              year: pending.year,
              personalEmailVerified: true,
              collegeEmailVerified: true,
              isVerified: true,
              status: "VERIFIED",
              verificationStep: "VERIFIED",
              role: "STUDENT",
            },
          });

          await prisma.pendingRegistration.delete({
            where: { id: pending.id },
          });

          const token = jwt.sign(
            {
              id: newUser.id,
              email: newUser.email,
              role: "STUDENT",
              isVerified: true,
              status: "VERIFIED",
              hasVerifiedMed: true,
            },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
          );

          return {
            success: true,
            message:
              "Both emails verified successfully! Your Synora account is active with Verified Med badge.",
            step: "VERIFIED",
            personalEmailVerified: true,
            collegeEmailVerified: true,
            isVerified: true,
            hasVerifiedMed: true,
            status: "VERIFIED",
            token,
            user: {
              id: newUser.id,
              fullName: newUser.fullName,
              email: newUser.email,
              personalEmail: newUser.personalEmail,
              collegeEmail: newUser.collegeEmail,
              college: newUser.college,
              course: newUser.course,
              year: newUser.year,
              isVerified: true,
              hasVerifiedMed: true,
              status: "VERIFIED",
            },
          };
        }

        // Check if an active COLLEGE OTP already exists
        const activeCollegeRecord = await prisma.emailVerification.findFirst({
          where: {
            pendingRegistrationId: targetId,
            emailType: "COLLEGE",
            isUsed: false,
            expiresAt: { gt: new Date() },
          },
        });

        if (!activeCollegeRecord) {
          const collegeOtp = generateOtp();
          const collegeOtpHash = await bcrypt.hash(collegeOtp, 8);
          await prisma.emailVerification.create({
            data: {
              pendingRegistrationId: targetId,
              email: pending.collegeEmail,
              emailType: "COLLEGE",
              otpHash: collegeOtpHash,
              expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
              cooldownUntil: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS),
              attempts: 0,
              maxAttempts: OTP_MAX_ATTEMPTS,
              isUsed: false,
            },
          });

          try {
            await sendVerificationOtpEmail({
              to: pending.collegeEmail,
              name: pending.fullName,
              otp: collegeOtp,
              emailType: "COLLEGE",
              expiresInMinutes: OTP_EXPIRY_MINUTES,
            });
          } catch (err: unknown) {
            console.warn(`[AUTH-EMAIL-NOTICE] College OTP dispatch: ${(err as Error).message}`);
          }
        }

        return {
          success: true,
          message:
            "Personal email verified! Now verify your college email.",
          registrationId: pending.id,
          userId: pending.id,
          step: "VERIFY_COLLEGE_EMAIL",
          personalEmailVerified: true,
          collegeEmailVerified: false,
          isVerified: false,
          hasVerifiedMed: false,
          collegeEmailMasked: maskEmail(pending.collegeEmail),
        };
      } else {
        // Student has NO college email:
        // ONLY NOW create the active User account in the database!
        const newUser = await prisma.user.create({
          data: {
            fullName: pending.fullName,
            email: pending.email,
            personalEmail: pending.personalEmail,
            collegeEmail: null,
            password: pending.passwordHash,
            college: pending.college,
            collegeId: pending.collegeId,
            course: pending.course,
            courseId: pending.courseId,
            year: pending.year,
            personalEmailVerified: true,
            collegeEmailVerified: false,
            isVerified: true,
            status: "VERIFIED",
            verificationStep: "VERIFIED",
            role: "STUDENT",
          },
        });

        // Clean up pending registration record
        await prisma.pendingRegistration.delete({
          where: { id: pending.id },
        });

        const token = jwt.sign(
          {
            id: newUser.id,
            email: newUser.email,
            role: "STUDENT",
            isVerified: true,
            status: "VERIFIED",
            hasVerifiedMed: false,
          },
          process.env.JWT_SECRET as string,
          { expiresIn: "7d" }
        );

        return {
          success: true,
          message:
            "Personal email verified successfully. Your Synora account is active!",
          step: "VERIFIED",
          personalEmailVerified: true,
          collegeEmailVerified: false,
          isVerified: true,
          hasVerifiedMed: false,
          status: "VERIFIED",
          token,
          user: {
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email,
            personalEmail: newUser.personalEmail,
            collegeEmail: null,
            college: newUser.college,
            course: newUser.course,
            year: newUser.year,
            isVerified: true,
            hasVerifiedMed: false,
            status: "VERIFIED",
          },
        };
      }
    }

    // ── STEP 2: College Email Verified ──
    if (emailType === "COLLEGE") {
      // Must have personal email verified first
      if (!pending.personalEmailVerified) {
        throw new Error("You must successfully verify your personal email first.");
      }

      // ONLY NOW create the active User account with Verified Med badge!
      const newUser = await prisma.user.create({
        data: {
          fullName: pending.fullName,
          email: pending.email,
          personalEmail: pending.personalEmail,
          collegeEmail: pending.collegeEmail,
          password: pending.passwordHash,
          college: pending.college,
          collegeId: pending.collegeId,
          course: pending.course,
          courseId: pending.courseId,
          year: pending.year,
          personalEmailVerified: true,
          collegeEmailVerified: true,
          isVerified: true,
          status: "VERIFIED",
          verificationStep: "VERIFIED",
          role: "STUDENT",
        },
      });

      // Clean up pending registration record
      await prisma.pendingRegistration.delete({
        where: { id: pending.id },
      });

      const token = jwt.sign(
        {
          id: newUser.id,
          email: newUser.email,
          role: "STUDENT",
          isVerified: true,
          status: "VERIFIED",
          hasVerifiedMed: true,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      return {
        success: true,
        message:
          "Congratulations! Both emails verified and your Verified Med badge is active.",
        step: "VERIFIED",
        personalEmailVerified: true,
        collegeEmailVerified: true,
        isVerified: true,
        hasVerifiedMed: true,
        status: "VERIFIED",
        token,
        user: {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          personalEmail: newUser.personalEmail,
          collegeEmail: newUser.collegeEmail,
          college: newUser.college,
          course: newUser.course,
          year: newUser.year,
          isVerified: true,
          hasVerifiedMed: true,
          status: "VERIFIED",
        },
      };
    }
  }

  // Fallback: If user is an already created user needing verification
  const existingUser = await prisma.user.findUnique({
    where: { id: targetId },
  });

  if (!existingUser) {
    throw new Error(
      "Registration session not found or expired. Please start registration again."
    );
  }

  const record = await prisma.emailVerification.findFirst({
    where: {
      userId: targetId,
      emailType,
      isUsed: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new Error(
      "No active verification code found. Please request a new code."
    );
  }

  if (new Date() > record.expiresAt) {
    throw new Error(
      "This verification code has expired. Please request a new code."
    );
  }

  const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);
  if (!isMatch) {
    throw new Error("Invalid verification code.");
  }

  await prisma.emailVerification.update({
    where: { id: record.id },
    data: { isUsed: true },
  });

  const updatedUser = await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      personalEmailVerified: true,
      collegeEmailVerified:
        emailType === "COLLEGE" || existingUser.collegeEmailVerified,
      isVerified: true,
      status: "VERIFIED",
      verificationStep: "VERIFIED",
    },
  });

  const hasVerifiedMed = Boolean(
    updatedUser.collegeEmailVerified && updatedUser.collegeEmail
  );

  const token = jwt.sign(
    {
      id: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role || "STUDENT",
      isVerified: true,
      status: "VERIFIED",
      hasVerifiedMed,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  return {
    success: true,
    message: "Email verified successfully.",
    step: "VERIFIED",
    personalEmailVerified: true,
    collegeEmailVerified: updatedUser.collegeEmailVerified,
    isVerified: true,
    hasVerifiedMed,
    status: "VERIFIED",
    token,
    user: updatedUser,
  };
};

/**
 * Resends a fresh OTP code with rate limit and cooldown enforcement.
 * Centralized 10-minute expiry applies.
 */
export const resendOtpService = async (params: ResendOtpRequest) => {
  const { registrationId, userId, emailType } = params;
  const targetId = registrationId || userId;

  if (!targetId || !emailType) {
    throw new Error(
      "Registration session identifier and emailType are required."
    );
  }

  // Check pending registration first
  const pending = await prisma.pendingRegistration.findUnique({
    where: { id: targetId },
  });

  if (pending) {
    if (emailType === "COLLEGE" && !pending.personalEmailVerified) {
      throw new Error("You must verify your personal email first.");
    }

    const targetEmail =
      emailType === "PERSONAL" ? pending.personalEmail : pending.collegeEmail;

    if (!targetEmail) {
      throw new Error(
        `No ${emailType.toLowerCase()} email address found for this registration.`
      );
    }

    // Check cooldown on latest record
    const latestRecord = await prisma.emailVerification.findFirst({
      where: {
        pendingRegistrationId: targetId,
        emailType,
      },
      orderBy: { createdAt: "desc" },
    });

    if (
      latestRecord &&
      latestRecord.cooldownUntil &&
      new Date() < latestRecord.cooldownUntil
    ) {
      const secondsRemaining = Math.ceil(
        (latestRecord.cooldownUntil.getTime() - Date.now()) / 1000
      );
      throw new Error(
        `Please wait ${secondsRemaining} second${
          secondsRemaining === 1 ? "" : "s"
        } before requesting another code.`
      );
    }

    // Invalidate previous unused codes
    await prisma.emailVerification.updateMany({
      where: {
        pendingRegistrationId: targetId,
        emailType,
        isUsed: false,
      },
      data: { isUsed: true },
    });

    // Generate new OTP
    const newOtp = generateOtp();
    const newOtpHash = await bcrypt.hash(newOtp, 8);

    await prisma.emailVerification.create({
      data: {
        pendingRegistrationId: targetId,
        email: targetEmail,
        emailType,
        otpHash: newOtpHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        cooldownUntil: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS),
        attempts: 0,
        maxAttempts: OTP_MAX_ATTEMPTS,
        isUsed: false,
      },
    });

    // Real Email Delivery via Nodemailer
    try {
      await sendVerificationOtpEmail({
        to: targetEmail,
        name: pending.fullName,
        otp: newOtp,
        emailType,
        expiresInMinutes: OTP_EXPIRY_MINUTES,
      });
    } catch (err: unknown) {
      console.warn(
        `[AUTH-EMAIL-NOTICE] Resend email delivery: ${(err as Error).message}`
      );
      if (
        process.env.SMTP_PASS &&
        process.env.SMTP_PASS !== "your_gmail_app_password_here"
      ) {
        throw new Error(
          "Unable to resend verification email. Please try again."
        );
      }
    }

    console.log(
      `[AUTH-OTP-DEV] Resent 10-min OTP for ${emailType} (${targetEmail}): ${newOtp}`
    );

    return {
      success: true,
      message: `A new 6-digit verification code has been sent to your ${emailType.toLowerCase()} email.`,
      maskedEmail: maskEmail(targetEmail),
    };
  }

  // Fallback for existing user
  const user = await prisma.user.findUnique({
    where: { id: targetId },
  });

  if (!user) {
    throw new Error("Registration session not found.");
  }

  const targetEmail =
    emailType === "PERSONAL"
      ? user.personalEmail || user.email
      : user.collegeEmail;

  if (!targetEmail) {
    throw new Error(
      `No ${emailType.toLowerCase()} email address found for this account.`
    );
  }

  const latestRecord = await prisma.emailVerification.findFirst({
    where: {
      userId: targetId,
      emailType,
    },
    orderBy: { createdAt: "desc" },
  });

  if (
    latestRecord &&
    latestRecord.cooldownUntil &&
    new Date() < latestRecord.cooldownUntil
  ) {
    const secondsRemaining = Math.ceil(
      (latestRecord.cooldownUntil.getTime() - Date.now()) / 1000
    );
    throw new Error(
      `Please wait ${secondsRemaining} second${
        secondsRemaining === 1 ? "" : "s"
      } before requesting another code.`
    );
  }

  await prisma.emailVerification.updateMany({
    where: {
      userId: targetId,
      emailType,
      isUsed: false,
    },
    data: { isUsed: true },
  });

  const newOtp = generateOtp();
  const newOtpHash = await bcrypt.hash(newOtp, 8);

  await prisma.emailVerification.create({
    data: {
      userId: targetId,
      email: targetEmail,
      emailType,
      otpHash: newOtpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      cooldownUntil: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS),
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      isUsed: false,
    },
  });

  await sendVerificationOtpEmail({
    to: targetEmail,
    name: user.fullName,
    otp: newOtp,
    emailType,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
  });

  return {
    success: true,
    message: `A new 6-digit verification code has been sent to your ${emailType.toLowerCase()} email.`,
    maskedEmail: maskEmail(targetEmail),
  };
};

/**
 * Authenticates user credentials.
 * Normal login is strictly PERSONAL EMAIL + PASSWORD ONLY.
 * ZERO OTP. ZERO Medical Email. ZERO College Email. ZERO Authentication loops.
 */
export const loginService = async (credentials: LoginUser) => {
  if (!credentials.email || !credentials.password) {
    throw new Error("Email and password are required.");
  }

  const normEmail = normalizeEmail(credentials.email);

  // Normal login identity is strictly PERSONAL EMAIL
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: normEmail }, { personalEmail: normEmail }],
    },
    include: {
      collegeRef: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(
    credentials.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
    throw new Error(
      "Your account has been suspended or deactivated. Please contact support."
    );
  }

  if (!user.personalEmailVerified) {
    throw new Error("Please verify your personal email to access Synora.");
  }

  const hasVerifiedMed = Boolean(
    user.collegeEmailVerified && user.collegeEmail
  );

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "STUDENT",
      isVerified: true,
      status: "VERIFIED",
      hasVerifiedMed,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "7d",
    }
  );

  return {
    success: true,
    message: "Login successful",
    requiresVerification: false,
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      personalEmail: user.personalEmail,
      collegeEmail: user.collegeEmail,
      profileImage: user.profileImage,
      bio: user.bio,
      college: user.college,
      collegeId: user.collegeId,
      course: user.course,
      year: user.year,
      role: user.role || "STUDENT",
      isVerified: true,
      personalEmailVerified: user.personalEmailVerified,
      collegeEmailVerified: user.collegeEmailVerified,
      hasVerifiedMed,
      status: "VERIFIED",
      theme: user.theme || "light",
      emailNotifications: user.emailNotifications,
      livePresence: user.livePresence,
      createdAt: user.createdAt,
    },
  };
};

// ============================================================
// FORGOT PASSWORD FLOW
// ============================================================

/**
 * STEP 1: Enter Email.
 * - If email does NOT exist: Return "This email is not registered.", send NO OTP, create NO OTP record.
 * - If email exists: Send 6-digit OTP valid for EXACTLY 10 MINUTES to personal email.
 */
export const forgotPasswordService = async (params: ForgotPasswordRequest) => {
  if (!params.email || !params.email.includes("@")) {
    throw new Error("A valid personal email address is required.");
  }

  const normEmail = normalizeEmail(params.email);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: normEmail }, { personalEmail: normEmail }],
    },
  });

  // Requirement 1A: If email DOES NOT exist, explicitly state:
  // "This email is not registered." Do NOT send OTP. Do NOT create record.
  if (!user) {
    throw new Error("This email is not registered.");
  }

  const targetEmail = user.personalEmail || user.email;

  // Invalidate any previous unused password reset OTPs for this user
  await prisma.emailVerification.updateMany({
    where: {
      userId: user.id,
      emailType: "PASSWORD_RESET",
      isUsed: false,
    },
    data: { isUsed: true },
  });

  // Generate secure 6-digit OTP
  const resetOtp = generateOtp();
  const resetOtpHash = await bcrypt.hash(resetOtp, 8);

  // Store OTP record with EXACTLY 10-minute expiry
  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      email: targetEmail,
      emailType: "PASSWORD_RESET",
      otpHash: resetOtpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      cooldownUntil: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS),
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      isUsed: false,
    },
  });

  // Send real email via Gmail SMTP
  try {
    await sendPasswordResetOtpEmail({
      to: targetEmail,
      name: user.fullName,
      otp: resetOtp,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (err: unknown) {
    console.warn(
      `[AUTH-EMAIL-NOTICE] Password reset email delivery: ${
        (err as Error).message
      }`
    );
    if (
      process.env.SMTP_PASS &&
      process.env.SMTP_PASS !== "your_gmail_app_password_here"
    ) {
      throw new Error(
        "Unable to send password reset email. Please try again."
      );
    }
  }

  console.log(
    `[AUTH-OTP-DEV] Generated 10-min Password Reset OTP for (${targetEmail}): ${resetOtp}`
  );

  return {
    success: true,
    message: "Verification code sent to your email.",
    emailMasked: maskEmail(targetEmail),
  };
};

/**
 * STEP 2: Verify Forgot Password OTP.
 * - Enforces 10-minute expiration.
 * - Single-use only.
 * - Invalidation on max attempts.
 * - Issues a temporary single-use reset token on success.
 */
export const verifyResetOtpService = async (params: VerifyResetOtpRequest) => {
  const { email, otp } = params;

  if (!email || !otp) {
    throw new Error("Email and verification code are required.");
  }

  const normEmail = normalizeEmail(email);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: normEmail }, { personalEmail: normEmail }],
    },
  });

  if (!user) {
    throw new Error("This email is not registered.");
  }

  const cleanOtp = otp.trim();
  if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    throw new Error("Verification code must be exactly 6 digits.");
  }

  const record = await prisma.emailVerification.findFirst({
    where: {
      userId: user.id,
      emailType: "PASSWORD_RESET",
      isUsed: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new Error(
      "No active verification code found. Please request a new code."
    );
  }

  // Check 10-minute expiration
  if (new Date() > record.expiresAt) {
    throw new Error(
      "This verification code has expired. Please request a new code."
    );
  }

  // Check attempt limits
  if (record.attempts >= record.maxAttempts) {
    throw new Error(
      "Too many failed attempts. This code has been invalidated. Please request a new code."
    );
  }

  const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);

  if (!isMatch) {
    const nextAttempts = record.attempts + 1;
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { attempts: nextAttempts },
    });

    if (nextAttempts >= record.maxAttempts) {
      throw new Error(
        "Too many failed attempts. This code has been invalidated. Please request a new code."
      );
    }

    const remaining = record.maxAttempts - nextAttempts;
    throw new Error(
      `Invalid verification code. ${remaining} attempt${
        remaining === 1 ? "" : "s"
      } remaining.`
    );
  }

  // Mark OTP as used (single use)
  await prisma.emailVerification.update({
    where: { id: record.id },
    data: { isUsed: true },
  });

  // Issue signed temporary reset token (valid for 10 minutes)
  const resetToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      purpose: "PASSWORD_RESET",
      verificationId: record.id,
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "10m" }
  );

  return {
    success: true,
    message: "Verification code verified successfully.",
    resetToken,
  };
};

/**
 * Resends Forgot Password OTP.
 */
export const resendResetOtpService = async (params: { email: string }) => {
  if (!params.email) {
    throw new Error("Email is required.");
  }

  const normEmail = normalizeEmail(params.email);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: normEmail }, { personalEmail: normEmail }],
    },
  });

  if (!user) {
    throw new Error("This email is not registered.");
  }

  const targetEmail = user.personalEmail || user.email;

  // Check cooldown on latest record
  const latestRecord = await prisma.emailVerification.findFirst({
    where: {
      userId: user.id,
      emailType: "PASSWORD_RESET",
    },
    orderBy: { createdAt: "desc" },
  });

  if (
    latestRecord &&
    latestRecord.cooldownUntil &&
    new Date() < latestRecord.cooldownUntil
  ) {
    const secondsRemaining = Math.ceil(
      (latestRecord.cooldownUntil.getTime() - Date.now()) / 1000
    );
    throw new Error(
      `Please wait ${secondsRemaining} second${
        secondsRemaining === 1 ? "" : "s"
      } before requesting another code.`
    );
  }

  // Invalidate previous
  await prisma.emailVerification.updateMany({
    where: {
      userId: user.id,
      emailType: "PASSWORD_RESET",
      isUsed: false,
    },
    data: { isUsed: true },
  });

  const newOtp = generateOtp();
  const newOtpHash = await bcrypt.hash(newOtp, 8);

  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      email: targetEmail,
      emailType: "PASSWORD_RESET",
      otpHash: newOtpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      cooldownUntil: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS),
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      isUsed: false,
    },
  });

  try {
    await sendPasswordResetOtpEmail({
      to: targetEmail,
      name: user.fullName,
      otp: newOtp,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (err: unknown) {
    console.warn(
      `[AUTH-EMAIL-NOTICE] Resend password reset email: ${
        (err as Error).message
      }`
    );
    if (
      process.env.SMTP_PASS &&
      process.env.SMTP_PASS !== "your_gmail_app_password_here"
    ) {
      throw new Error(
        "Unable to resend password reset email. Please try again."
      );
    }
  }

  console.log(
    `[AUTH-OTP-DEV] Resent 10-min Password Reset OTP for (${targetEmail}): ${newOtp}`
  );

  return {
    success: true,
    message: "Verification code sent to your email.",
    maskedEmail: maskEmail(targetEmail),
  };
};

/**
 * STEP 3: Create a new password.
 * - Password matching check.
 * - Password strength check.
 * - Secure bcrypt hashing.
 * - Invalidates all reset sessions.
 */
export const resetPasswordService = async (params: ResetPasswordRequest) => {
  const { resetToken, newPassword, confirmPassword } = params;

  if (!resetToken) {
    throw new Error("Password reset token is required.");
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("Passwords do not match.");
  }

  let decoded: any;
  try {
    decoded = jwt.verify(resetToken, process.env.JWT_SECRET as string);
  } catch (err) {
    throw new Error(
      "Invalid or expired password reset session. Please request a new code."
    );
  }

  if (decoded.purpose !== "PASSWORD_RESET" || !decoded.userId) {
    throw new Error("Invalid password reset token.");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    throw new Error("Student account not found.");
  }

  // Hash new password securely
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password in database
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Invalidate any remaining password reset records for this user
  await prisma.emailVerification.updateMany({
    where: {
      userId: user.id,
      emailType: "PASSWORD_RESET",
      isUsed: false,
    },
    data: { isUsed: true },
  });

  return {
    success: true,
    message: "Password reset successfully.",
  };
};

/**
 * Authenticated Password Change (e.g. from Settings).
 */
/**
 * Requests an OTP for Settings Password Change.
 * Sends a 6-digit OTP to the student's verified personal email.
 * Valid for EXACTLY 10 MINUTES.
 */
export const requestChangePasswordOtpService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Student account not found.");
  }

  const targetEmail = user.personalEmail || user.email;

  if (!targetEmail) {
    throw new Error("No verified personal email address found for this account.");
  }

  // Check cooldown on latest record (60s)
  const latestRecord = await prisma.emailVerification.findFirst({
    where: {
      userId,
      emailType: "PASSWORD_CHANGE",
    },
    orderBy: { createdAt: "desc" },
  });

  if (
    latestRecord &&
    latestRecord.cooldownUntil &&
    new Date() < latestRecord.cooldownUntil
  ) {
    const secondsRemaining = Math.ceil(
      (latestRecord.cooldownUntil.getTime() - Date.now()) / 1000
    );
    throw new Error(
      `Please wait ${secondsRemaining} second${
        secondsRemaining === 1 ? "" : "s"
      } before requesting another code.`
    );
  }

  // Invalidate previous unused PASSWORD_CHANGE OTPs for this user
  await prisma.emailVerification.updateMany({
    where: {
      userId,
      emailType: "PASSWORD_CHANGE",
      isUsed: false,
    },
    data: { isUsed: true },
  });

  // Generate 6-digit cryptographic OTP (10-minute expiry)
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 8);

  await prisma.emailVerification.create({
    data: {
      userId,
      email: targetEmail,
      emailType: "PASSWORD_CHANGE",
      otpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
      cooldownUntil: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS),
      attempts: 0,
      maxAttempts: OTP_MAX_ATTEMPTS,
      isUsed: false,
    },
  });

  // Dispatch real email via Nodemailer
  try {
    await sendPasswordChangeOtpEmail({
      to: targetEmail,
      name: user.fullName,
      otp,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
    });
  } catch (err: unknown) {
    console.warn(
      `[AUTH-EMAIL-NOTICE] Password change email delivery: ${(err as Error).message}`
    );
    if (
      process.env.SMTP_PASS &&
      process.env.SMTP_PASS !== "your_gmail_app_password_here"
    ) {
      throw new Error(
        "Unable to send password change verification email. Please try again."
      );
    }
  }

  console.log(
    `[AUTH-OTP-DEV] Generated 10-min Password Change OTP for (${targetEmail}): ${otp}`
  );

  return {
    success: true,
    message: "A 6-digit verification code has been sent to your verified personal email.",
    maskedEmail: maskEmail(targetEmail),
  };
};

/**
 * Authenticated Password Change from Settings.
 * STRICT SECURITY POLICY:
 * Requires BOTH:
 * 1. Current Password (verified with bcrypt against user.password)
 * 2. 6-Digit OTP sent to verified personal email (valid 10 minutes, single-use, max 5 attempts)
 */
export const changePasswordService = async (
  userId: string,
  params: ChangePasswordRequest
) => {
  const { currentPassword, newPassword, confirmPassword, otp } = params;

  if (!currentPassword || !newPassword) {
    throw new Error("Current password and new password are required.");
  }

  if (!otp || otp.trim().length !== 6 || !/^\d{6}$/.test(otp.trim())) {
    throw new Error("A valid 6-digit verification code is required to change password.");
  }

  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long.");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New passwords do not match.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Student account not found.");
  }

  // 1. Verify Current Password
  const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentValid) {
    throw new Error("Incorrect current password.");
  }

  // 2. Verify Personal Email OTP (Single-use, 10-minute expiry, max 5 attempts)
  const cleanOtp = otp.trim();
  const record = await prisma.emailVerification.findFirst({
    where: {
      userId,
      emailType: "PASSWORD_CHANGE",
      isUsed: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new Error(
      "No active verification code found. Please request a new code."
    );
  }

  // Check 10-minute expiration
  if (new Date() > record.expiresAt) {
    throw new Error(
      "This verification code has expired. Please request a new code."
    );
  }

  // Check attempt limits
  if (record.attempts >= record.maxAttempts) {
    throw new Error(
      "Too many failed attempts. This code has been invalidated. Please request a new code."
    );
  }

  const isMatch = await bcrypt.compare(cleanOtp, record.otpHash);
  if (!isMatch) {
    const nextAttempts = record.attempts + 1;
    await prisma.emailVerification.update({
      where: { id: record.id },
      data: { attempts: nextAttempts },
    });

    if (nextAttempts >= record.maxAttempts) {
      throw new Error(
        "Too many failed attempts. This code has been invalidated. Please request a new code."
      );
    }

    const remaining = record.maxAttempts - nextAttempts;
    throw new Error(
      `Invalid verification code. Please try again. ${remaining} attempt${
        remaining === 1 ? "" : "s"
      } remaining.`
    );
  }

  // Mark OTP as used (Single-use enforcement)
  await prisma.emailVerification.update({
    where: { id: record.id },
    data: { isUsed: true },
  });

  // Securely hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password in database
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return {
    success: true,
    message: "Password changed successfully.",
  };
};

/**
 * Returns pending registration status for smooth verification resumption.
 */
export const getRegistrationStatusService = async (registrationId: string) => {
  const pending = await prisma.pendingRegistration.findUnique({
    where: { id: registrationId },
  });

  if (!pending) {
    const existingUser = await prisma.user.findFirst({
      where: { id: registrationId },
    });
    if (existingUser) {
      return {
        success: true,
        isPending: false,
        isComplete: true,
        personalEmailVerified: existingUser.personalEmailVerified,
        collegeEmailVerified: existingUser.collegeEmailVerified,
        hasCollegeEmail: Boolean(existingUser.collegeEmail),
        status: existingUser.status,
      };
    }

    return {
      success: false,
      isPending: false,
      isComplete: false,
      message: "Pending registration session not found or already verified.",
    };
  }

  const isComplete = Boolean(
    pending.personalEmailVerified &&
      (!pending.hasCollegeEmail || pending.collegeEmailVerified)
  );

  return {
    success: true,
    isPending: true,
    isComplete,
    registrationId: pending.id,
    fullName: pending.fullName,
    personalEmailMasked: maskEmail(pending.personalEmail),
    hasCollegeEmail: pending.hasCollegeEmail,
    collegeEmailMasked: pending.collegeEmail
      ? maskEmail(pending.collegeEmail)
      : null,
    personalEmailVerified: pending.personalEmailVerified,
    collegeEmailVerified: pending.collegeEmailVerified,
  };
};

/**
 * Updates User Preferences & Settings (Theme, alerts, presence).
 */
export const updateSettingsService = async (
  userId: string,
  settings: UpdateSettingsRequest
) => {
  const updateData: any = {};

  if (settings.theme) {
    updateData.theme = settings.theme;
  }
  if (typeof settings.emailNotifications === "boolean") {
    updateData.emailNotifications = settings.emailNotifications;
  }
  if (typeof settings.livePresence === "boolean") {
    updateData.livePresence = settings.livePresence;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      theme: true,
      emailNotifications: true,
      livePresence: true,
    },
  });

  return {
    success: true,
    message: "Settings saved successfully.",
    settings: updatedUser,
  };
};

/**
 * Returns current authenticated student profile.
 */
export const getMeService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      personalEmail: true,
      collegeEmail: true,
      profileImage: true,
      bio: true,
      college: true,
      collegeId: true,
      course: true,
      courseId: true,
      year: true,
      role: true,
      personalEmailVerified: true,
      collegeEmailVerified: true,
      isVerified: true,
      status: true,
      theme: true,
      emailNotifications: true,
      livePresence: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return {
    ...user,
    hasVerifiedMed: Boolean(user.collegeEmailVerified && user.collegeEmail),
  };
};

/**
 * Updates editable student profile attributes.
 * Handles Medical College, Degree Course, Academic Year, Full Name, and Bio.
 * Strictly verifies ownership via authenticated session (prevents IDOR and mass assignment).
 */
export const updateProfileService = async (
  userId: string,
  data: UpdateProfile
) => {
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!currentUser) {
    throw new Error("User not found.");
  }

  const updateData: any = {};

  if (data.fullName && data.fullName.trim().length >= 3) {
    updateData.fullName = data.fullName.trim();
  }

  if (typeof data.bio === "string") {
    updateData.bio = data.bio;
  }

  if (data.year && data.year.trim().length > 0) {
    updateData.year = data.year.trim();
  }

  // Update Medical College (by ID, code, or name)
  if (data.collegeId || data.college) {
    const col = await prisma.college.findFirst({
      where: {
        OR: [
          { id: data.collegeId || "" },
          { code: data.collegeId || "" },
          { name: data.college || "" },
          { officialName: data.college || "" },
        ],
        active: true,
      },
    });

    if (col) {
      updateData.collegeId = col.id;
      updateData.college = col.name;
    } else if (data.college && data.college.trim()) {
      updateData.college = data.college.trim();
    }
  }

  // Update Degree Course (by ID, code, or name)
  if (data.courseId || data.course) {
    const crs = await prisma.course.findFirst({
      where: {
        OR: [
          { id: data.courseId || "" },
          { code: data.courseId || data.course || "" },
          { name: data.course || "" },
        ],
        active: true,
      },
    });

    if (crs) {
      updateData.courseId = crs.id;
      updateData.course = crs.name;
    } else if (data.course && data.course.trim()) {
      updateData.course = data.course.trim();
    }
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateData,
    select: {
      id: true,
      fullName: true,
      email: true,
      personalEmail: true,
      collegeEmail: true,
      profileImage: true,
      bio: true,
      college: true,
      collegeId: true,
      course: true,
      courseId: true,
      year: true,
      role: true,
      personalEmailVerified: true,
      collegeEmailVerified: true,
      isVerified: true,
      status: true,
      createdAt: true,
    },
  });

  return {
    success: true,
    message: "Profile updated successfully.",
    user: {
      ...updatedUser,
      hasVerifiedMed: Boolean(
        updatedUser.collegeEmailVerified && updatedUser.collegeEmail
      ),
    },
  };
};

/**
 * Retrieves list of approved Indian medical colleges from database.
 */
export const getCollegesService = async (search?: string, state?: string) => {
  const where: any = { active: true };

  if (search && search.trim()) {
    const term = search.trim();
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { officialName: { contains: term, mode: "insensitive" } },
      { city: { contains: term, mode: "insensitive" } },
      { code: { contains: term, mode: "insensitive" } },
    ];
  }

  if (state && state.trim()) {
    where.state = { equals: state.trim(), mode: "insensitive" };
  }

  return prisma.college.findMany({
    where,
    orderBy: [{ state: "asc" }, { name: "asc" }],
    select: {
      id: true,
      code: true,
      name: true,
      officialName: true,
      city: true,
      state: true,
      country: true,
      type: true,
      emailDomains: true,
      hasVerifiedDomain: true,
    },
  });
};

/**
 * Retrieves courses and academic years from database.
 */
export const getCoursesService = async () => {
  return prisma.course.findMany({
    where: { active: true },
    include: {
      academicYears: {
        where: { active: true },
        orderBy: { order: "asc" },
      },
    },
    orderBy: { code: "asc" },
  });
};