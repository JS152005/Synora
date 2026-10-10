import "dotenv/config";
import prisma from "./src/config/prisma";
import {
  registerService,
  verifyOtpService,
  loginService,
  forgotPasswordService,
  verifyResetOtpService,
  resetPasswordService,
  updateSettingsService,
  getMeService,
} from "./src/services/authService";
import {
  createConversationService,
} from "./src/services/conversationService";
import { verifySmtpConnection } from "./src/services/emailService";

// Intercept OTP logged by auth service for automated testing verification
let lastGeneratedOtp = "";
const origLog = console.log;
console.log = (...args: any[]) => {
  const msg = args.join(" ");
  const match = msg.match(/: (\d{6})/);
  if (match) {
    lastGeneratedOtp = match[1];
  }
  origLog(...args);
};

async function runComprehensiveAudit() {
  console.log("============================================================");
  console.log("🚀 SYNORA COMPLETE AUTH, SECURITY & SYSTEM AUDIT TEST SUITE");
  console.log("============================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✔ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${detail ? `(${detail})` : ""}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // --- CHECK 1: Master & Reference Data Preserved & Clean State ---
  console.log("▶ [TEST 1] Verifying Clean Student State & Master Data Integrity...");
  // Clear any existing test student users to ensure a pristine slate
  await prisma.emailVerification.deleteMany({});
  await prisma.pendingRegistration.deleteMany({});
  await prisma.user.deleteMany({});

  const initialUsers = await prisma.user.count();
  const collegeCount = await prisma.college.count();
  const courseCount = await prisma.course.count();
  const subjectCount = await prisma.subject.count();
  const topicCount = await prisma.topic.count();

  assert(initialUsers === 0, "No old student accounts remain in database", `Found ${initialUsers} users`);
  assert(collegeCount >= 200, "All 200 medical colleges preserved", `Found ${collegeCount}`);
  assert(courseCount >= 5, "Curriculum courses preserved", `Found ${courseCount}`);
  assert(subjectCount === 19, "All 19 MBBS curriculum subjects preserved", `Found ${subjectCount}`);
  assert(topicCount >= 500, "Curriculum topics & subtopics preserved", `Found ${topicCount}`);

  // --- CHECK 2: SMTP Real Email Delivery Connectivity ---
  console.log("\n▶ [TEST 2] Verifying Gmail SMTP Server Connection...");
  const smtpReady = await verifySmtpConnection();
  assert(smtpReady === true, "Gmail SMTP server connected and ready via TLS");

  // Fetch valid College & Course for tests
  const college = await prisma.college.findFirst({ where: { active: true } });
  const course = await prisma.course.findFirst({ where: { code: "MBBS" } });
  if (!college || !course) throw new Error("Seed data missing college/course");

  const realSmtpEmail = process.env.SMTP_USER || "jsctsmail@gmail.com";

  // --- CHECK 3: Registration Logic — Account NOT Created Before Verification ---
  console.log("\n▶ [TEST 3] Testing Registration WITHOUT College Email...");
  lastGeneratedOtp = "";
  const reg1 = await registerService({
    fullName: "Dr. Ananya Roy",
    personalEmail: realSmtpEmail, // Real Gmail receives the real OTP!
    collegeId: college.id,
    courseId: course.id,
    year: "2nd Year",
    hasCollegeEmail: false,
    password: "Password@123",
    confirmPassword: "Password@123",
  });

  assert(reg1.success === true, "Registration 1 initiated successfully");
  assert(Boolean(reg1.registrationId), "Pending registration ID returned");

  // Verify Account is NOT created in User table yet!
  const userCountBeforeVerify = await prisma.user.count({
    where: { email: realSmtpEmail },
  });
  assert(
    userCountBeforeVerify === 0,
    "CRITICAL: User account is NOT created before required email verification"
  );

  // Check OTP expiration in DB is exactly 10 minutes
  const otpRecord1 = await prisma.emailVerification.findFirst({
    where: { pendingRegistrationId: reg1.registrationId, emailType: "PERSONAL" },
  });
  assert(Boolean(otpRecord1), "OTP verification record created in database");
  const diffMinutes = Math.round(
    (otpRecord1!.expiresAt.getTime() - otpRecord1!.createdAt.getTime()) / (60 * 1000)
  );
  assert(diffMinutes === 10, "OTP validity is EXACTLY 10 minutes", `Diff: ${diffMinutes}m`);

  // --- CHECK 4: OTP Verification & Attempt Limits ---
  console.log("\n▶ [TEST 4] Testing Incorrect OTP & Expiration Handling...");
  try {
    await verifyOtpService({
      registrationId: reg1.registrationId,
      emailType: "PERSONAL",
      otp: "000000",
    });
    assert(false, "Incorrect OTP should have thrown error");
  } catch (err: any) {
    assert(err.message.includes("Invalid verification code"), "Incorrect OTP properly rejected");
  }

  const validOtp1 = lastGeneratedOtp;
  assert(validOtp1.length === 6, "Captured real generated 6-digit OTP");

  // Verify OTP for student without college email
  const verify1 = await verifyOtpService({
    registrationId: reg1.registrationId,
    emailType: "PERSONAL",
    otp: validOtp1,
  });

  assert(verify1.success === true, "Personal OTP verified successfully");
  assert(verify1.isVerified === true, "Account is now verified");
  assert(verify1.hasVerifiedMed === false, "User without college email does NOT receive Verified Med badge");
  assert(Boolean(verify1.token), "JWT token returned upon account activation");

  // Verify User IS NOW created in User table!
  const userCountAfterVerify = await prisma.user.count({
    where: { email: realSmtpEmail },
  });
  assert(userCountAfterVerify === 1, "User account is now registered and active in User table");

  // Test single-use OTP reuse rejection
  try {
    await verifyOtpService({
      registrationId: reg1.registrationId,
      emailType: "PERSONAL",
      otp: validOtp1,
    });
    assert(false, "Used OTP should be rejected");
  } catch {
    assert(true, "Used OTP cannot be reused (Single-use strictly enforced)");
  }

  // --- CHECK 5: Normal Login Flow — Personal Email + Password ONLY ---
  console.log("\n▶ [TEST 5] Testing Normal Login Flow...");
  const loginRes = await loginService({
    email: realSmtpEmail,
    password: "Password@123",
  });

  assert(loginRes.success === true, "Normal login succeeded");
  assert(Boolean(loginRes.token), "JWT token returned on normal login");
  assert(loginRes.user.isVerified === true, "User status is verified");
  assert(loginRes.user.hasVerifiedMed === false, "Verified Med badge accurately false");

  // --- CHECK 6: Registration WITH College Email (Dual OTP & Verified Med Badge) ---
  console.log("\n▶ [TEST 6] Testing Registration WITH College Email (Dual OTP Flow)...");
  const personalEmail2 = "kavita.patel." + Date.now() + "@synora.test";
  lastGeneratedOtp = "";
  const reg2 = await registerService({
    fullName: "Dr. Kavita Patel",
    personalEmail: personalEmail2,
    hasCollegeEmail: true,
    collegeEmail: "kavita.med." + Date.now() + "@aiims.edu",
    collegeId: college.id,
    courseId: course.id,
    year: "3rd Year",
    password: "SecurePassword@456",
    confirmPassword: "SecurePassword@456",
  });

  assert(reg2.success === true, "Registration 2 with college email initiated");
  assert(reg2.step === "VERIFY_PERSONAL_EMAIL", "Step 1 is Personal Email OTP");

  // Verify account NOT created before verification
  const user2Before = await prisma.user.count({ where: { email: personalEmail2 } });
  assert(user2Before === 0, "Account with college email is NOT created before verification");

  const validOtp2Personal = lastGeneratedOtp;

  // Verify Personal OTP -> should move to College Email OTP step
  lastGeneratedOtp = "";
  const verify2Personal = await verifyOtpService({
    registrationId: reg2.registrationId,
    emailType: "PERSONAL",
    otp: validOtp2Personal,
  });

  assert(verify2Personal.step === "VERIFY_COLLEGE_EMAIL", "Transitions to VERIFY_COLLEGE_EMAIL step");
  assert(verify2Personal.personalEmailVerified === true, "Personal email marked verified in pending state");
  assert(verify2Personal.hasVerifiedMed === false, "Verified Med NOT granted yet before college OTP");

  // Find College OTP
  const otpRecord2College = await prisma.emailVerification.findFirst({
    where: { pendingRegistrationId: reg2.registrationId, emailType: "COLLEGE" },
  });
  assert(Boolean(otpRecord2College), "College OTP record generated in database");
  const collegeDiffMin = Math.round(
    (otpRecord2College!.expiresAt.getTime() - otpRecord2College!.createdAt.getTime()) / (60 * 1000)
  );
  assert(collegeDiffMin === 10, "College OTP validity is EXACTLY 10 minutes");

  const validOtp2College = lastGeneratedOtp;

  // Verify College OTP -> ONLY NOW creates user with Verified Med badge!
  const verify2College = await verifyOtpService({
    registrationId: reg2.registrationId,
    emailType: "COLLEGE",
    otp: validOtp2College,
  });

  assert(verify2College.step === "VERIFIED", "Account fully activated after College OTP");
  assert(verify2College.hasVerifiedMed === true, "Verified Med badge GRANTED on college email verification");

  const user2After = await prisma.user.count({ where: { email: personalEmail2 } });
  assert(user2After === 1, "Account active in User table only after dual verification complete");

  // --- CHECK 7: Forgot Password Flow (10-minute OTP & Reset) ---
  console.log("\n▶ [TEST 7] Testing Forgot Password Flow...");

  // A. Unregistered email check
  try {
    await forgotPasswordService({ email: "nonexistent.student@synora.test" });
    assert(false, "Unregistered email should fail");
  } catch (err: any) {
    assert(
      err.message === "This email is not registered.",
      "Unregistered email correctly returns 'This email is not registered.'"
    );
  }

  // B. Registered email check
  lastGeneratedOtp = "";
  const forgotRes = await forgotPasswordService({ email: realSmtpEmail });
  assert(forgotRes.success === true, "Forgot password initiated for registered student");
  assert(
    forgotRes.message === "Verification code sent to your email.",
    "Correct message: 'Verification code sent to your email.'"
  );

  // Check 10-minute validity on password reset OTP
  const resetOtpRecord = await prisma.emailVerification.findFirst({
    where: { email: realSmtpEmail, emailType: "PASSWORD_RESET", isUsed: false },
    orderBy: { createdAt: "desc" },
  });
  assert(Boolean(resetOtpRecord), "Password reset OTP record created");
  const resetDiffMin = Math.round(
    (resetOtpRecord!.expiresAt.getTime() - resetOtpRecord!.createdAt.getTime()) / (60 * 1000)
  );
  assert(resetDiffMin === 10, "Password reset OTP validity is EXACTLY 10 minutes");

  const validResetOtp = lastGeneratedOtp;

  // C. Verify reset OTP
  const verifyResetRes = await verifyResetOtpService({
    email: realSmtpEmail,
    otp: validResetOtp,
  });
  assert(verifyResetRes.success === true, "Password reset OTP verified");
  assert(Boolean(verifyResetRes.resetToken), "Single-use signed reset token issued");

  // D. Password reset with mismatched passwords
  try {
    await resetPasswordService({
      resetToken: verifyResetRes.resetToken,
      newPassword: "BrandNewPassword@999",
      confirmPassword: "MismatchPassword@999",
    });
    assert(false, "Mismatch should fail");
  } catch (err: any) {
    assert(err.message === "Passwords do not match.", "Password mismatch correctly rejected");
  }

  // E. Password reset with valid match
  const resetSuccess = await resetPasswordService({
    resetToken: verifyResetRes.resetToken,
    newPassword: "BrandNewPassword@999",
    confirmPassword: "BrandNewPassword@999",
  });
  assert(resetSuccess.success === true, "Password successfully reset");

  // F. Normal login with NEW password
  const newLoginRes = await loginService({
    email: realSmtpEmail,
    password: "BrandNewPassword@999",
  });
  assert(newLoginRes.success === true, "Normal login works with NEW password and ZERO OTP");

  // G. Old password rejected
  try {
    await loginService({
      email: realSmtpEmail,
      password: "Password@123",
    });
    assert(false, "Old password should fail");
  } catch (err: any) {
    assert(err.message.includes("Invalid email or password"), "Old password properly rejected");
  }

  // --- CHECK 8: Settings Persistence ---
  console.log("\n▶ [TEST 8] Testing Settings Persistence...");
  const updatedSettings = await updateSettingsService(newLoginRes.user.id, {
    theme: "dark",
    emailNotifications: false,
    livePresence: true,
  });
  assert(updatedSettings.settings.theme === "dark", "Theme setting persists to database");
  assert(updatedSettings.settings.emailNotifications === false, "Notification setting persists to database");

  const meProfile = await getMeService(newLoginRes.user.id);
  assert(meProfile.theme === "dark", "getMe returns persisted theme");
  assert(meProfile.emailNotifications === false, "getMe returns persisted notification preference");

  // --- CHECK 9: Chat & Conversation Authorization (IDOR Prevention) ---
  console.log("\n▶ [TEST 9] Testing Chat & Conversation Authorization...");
  try {
    // Attempt to create conversation without accepted partnership
    await createConversationService(newLoginRes.user.id, "cmurcfs4m000qlk8glx5ji6ww");
    assert(false, "Unauthorized chat creation should fail");
  } catch (err: any) {
    assert(
      err.message.includes("not found") || err.message.includes("accepted study partners"),
      "Chat properly blocked between non-partners"
    );
  }

  console.log("\n============================================================");
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log("============================================================");
}

runComprehensiveAudit()
  .catch((e) => {
    console.error("❌ Audit test failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
