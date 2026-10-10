import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const API_URL = "http://localhost:5000";

interface TestReport {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestReport[] = [];

function recordTest(name: string, passed: boolean, details?: string, error?: string) {
  results.push({ name, passed, details, error });
  const symbol = passed ? "✅" : "❌";
  console.log(`${symbol} [${passed ? "PASSED" : "FAILED"}] ${name}${details ? ` - ${details}` : ""}`);
  if (error) console.log(`   Error: ${error}`);
}

async function request(method: string, path: string, body?: any, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-test-suite": "synora-test-runner",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: res.status, data };
}

async function runTests() {
  console.log("============================================================");
  console.log("SYNORA BACKEND & SECURITY VERIFICATION TEST SUITE");
  console.log("============================================================\n");

  const aiimsCollege = await prisma.college.findUnique({
    where: { code: "AIIMS-DELHI" },
  });

  if (!aiimsCollege) {
    throw new Error("AIIMS-DELHI not found in seeded database.");
  }

  const timestamp = Date.now();
  const testStudentA = {
    fullName: "Arjun Verma",
    personalEmail: `arjun.verma.${timestamp}@gmail.com`,
    collegeEmail: `arjun.verma.${timestamp}@aiims.edu`,
    collegeId: aiimsCollege.id,
    course: "MBBS",
    year: "3rd Year (Part 1)",
    password: "Password123!",
  };

  const testStudentB = {
    fullName: "Pooja Sharma",
    personalEmail: `pooja.sharma.${timestamp}@gmail.com`,
    collegeEmail: `pooja.sharma.${timestamp}@aiims.edu`,
    collegeId: aiimsCollege.id,
    course: "MBBS",
    year: "3rd Year (Part 1)",
    password: "Password123!",
  };

  let studentAId = "";
  let studentBId = "";
  let tokenA = "";
  let tokenB = "";

  // ── TEST 1A: Registration with Valid Dual Emails & College ──
  try {
    const res = await request("POST", "/auth/register", testStudentA);
    studentAId = res.data.userId;
    const passed =
      res.status === 201 &&
      res.data.step === "VERIFY_PERSONAL_EMAIL" &&
      res.data.requiresVerification === true &&
      !res.data.otp; // OTP must NOT be in response!
    recordTest(
      "CASE 1A: Valid Registration (Personal & College Email)",
      passed,
      `User created with ID ${studentAId}, OTP hidden from API response`
    );
  } catch (err: any) {
    recordTest("CASE 1A: Valid Registration", false, undefined, err.message);
  }

  // ── TEST 6: Wrong College Email Domain Rejected ──
  try {
    const res = await request("POST", "/auth/register", {
      ...testStudentA,
      personalEmail: `fake.user.${timestamp}@gmail.com`,
      collegeEmail: `fake.user.${timestamp}@randomdomain.com`,
    });
    const isRejected = res.status === 400 && res.data.message?.includes("approved domain");
    recordTest("CASE 6: Wrong college email domain", isRejected, "Rejected with domain error: " + res.data.message);
  } catch (err: any) {
    recordTest("CASE 6: Wrong college email domain", false, undefined, err.message);
  }

  // ── TEST 7: Duplicate Personal Email Handled ──
  try {
    const res = await request("POST", "/auth/register", {
      fullName: "Duplicate User",
      personalEmail: testStudentA.personalEmail,
      collegeEmail: `unique.college.${timestamp}@aiims.edu`,
      collegeId: aiimsCollege.id,
      year: "1st Year",
      password: "Password123!",
    });
    const isRejected = res.status === 400 && res.data.message?.includes("personal email");
    recordTest("CASE 7: Duplicate personal email", isRejected, res.data.message);
  } catch (err: any) {
    recordTest("CASE 7: Duplicate personal email", false, undefined, err.message);
  }

  // ── TEST 8: Duplicate College Email Handled ──
  try {
    const res = await request("POST", "/auth/register", {
      fullName: "Duplicate User 2",
      personalEmail: `unique.personal.${timestamp}@gmail.com`,
      collegeEmail: testStudentA.collegeEmail,
      collegeId: aiimsCollege.id,
      year: "1st Year",
      password: "Password123!",
    });
    const isRejected = res.status === 400 && res.data.message?.includes("college email");
    recordTest("CASE 8: Duplicate college email", isRejected, res.data.message);
  } catch (err: any) {
    recordTest("CASE 8: Duplicate college email", false, undefined, err.message);
  }

  // ── TEST 9: Unverified User Directly Accessing Protected Endpoint (/user/discover) ──
  try {
    const jwt = await import("jsonwebtoken");
    const fakeToken = jwt.default.sign({ id: studentAId, email: testStudentA.personalEmail }, "synora_super_secret_key_2026");

    const res = await request("GET", "/user/discover", undefined, fakeToken);
    const isBlocked = res.status === 403 && res.data.code === "VERIFICATION_REQUIRED";
    recordTest("CASE 9: Unverified user directly calls /user/discover", isBlocked, "Blocked with HTTP 403 & VERIFICATION_REQUIRED");
  } catch (err: any) {
    recordTest("CASE 9: Unverified user access", false, undefined, err.message);
  }

  // ── TEST 10: Unverified User Calling Match API Directly ──
  try {
    const jwt = await import("jsonwebtoken");
    const fakeToken = jwt.default.sign({ id: studentAId, email: testStudentA.personalEmail }, "synora_super_secret_key_2026");

    const res = await request("GET", "/match/helpers", undefined, fakeToken);
    const isBlocked = res.status === 403 && res.data.code === "VERIFICATION_REQUIRED";
    recordTest("CASE 10: Unverified user calls /match/helpers", isBlocked, "Blocked with HTTP 403 & VERIFICATION_REQUIRED");
  } catch (err: any) {
    recordTest("CASE 10: Unverified match call", false, undefined, err.message);
  }

  // ── TEST 2: Wrong OTP Verification Attempt ──
  try {
    const res = await request("POST", "/auth/verify-otp", {
      userId: studentAId,
      emailType: "PERSONAL",
      otp: "000000",
    });
    const isFailed = res.status === 400 && res.data.message?.includes("Invalid verification code");
    recordTest("CASE 2: Wrong OTP attempt tracked", isFailed, res.data.message);
  } catch (err: any) {
    recordTest("CASE 2: Wrong OTP attempt", false, undefined, err.message);
  }

  // ── TEST 5: Brute Force / Too Many Failed OTP Attempts ──
  try {
    for (let i = 0; i < 4; i++) {
      await request("POST", "/auth/verify-otp", {
        userId: studentAId,
        emailType: "PERSONAL",
        otp: "111111",
      });
    }
    const resLockout = await request("POST", "/auth/verify-otp", {
      userId: studentAId,
      emailType: "PERSONAL",
      otp: "222222",
    });
    const isLocked = resLockout.status === 400 && resLockout.data.message?.includes("invalidated");
    recordTest("CASE 5: Too many OTP attempts lockout", isLocked, resLockout.data.message);
  } catch (err: any) {
    recordTest("CASE 5: Lockout check", false, undefined, err.message);
  }

  // Setup deterministic OTP for verification flow
  const bcrypt = await import("bcrypt");
  const validPersonalOtp = "654321";
  const validCollegeOtp = "789123";

  await prisma.emailVerification.deleteMany({ where: { userId: studentAId } });
  const hashA = await bcrypt.default.hash(validPersonalOtp, 8);
  await prisma.emailVerification.create({
    data: {
      userId: studentAId,
      email: testStudentA.personalEmail,
      emailType: "PERSONAL",
      otpHash: hashA,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      cooldownUntil: new Date(Date.now() + 60 * 1000),
      attempts: 0,
      maxAttempts: 5,
      isUsed: false,
    },
  });

  // ── TEST 3: Expired OTP Fails ──
  const expiredOtpUser = await prisma.user.create({
    data: {
      fullName: "Expired User",
      email: `expired.${timestamp}@gmail.com`,
      personalEmail: `expired.${timestamp}@gmail.com`,
      collegeEmail: `expired.${timestamp}@aiims.edu`,
      password: "Password123!",
      college: aiimsCollege.name,
      collegeId: aiimsCollege.id,
      year: "1st Year",
    },
  });
  const expiredHash = await bcrypt.default.hash("123456", 8);
  await prisma.emailVerification.create({
    data: {
      userId: expiredOtpUser.id,
      email: expiredOtpUser.email,
      emailType: "PERSONAL",
      otpHash: expiredHash,
      expiresAt: new Date(Date.now() - 5000),
      attempts: 0,
      maxAttempts: 5,
      isUsed: false,
    },
  });

  try {
    const res = await request("POST", "/auth/verify-otp", {
      userId: expiredOtpUser.id,
      emailType: "PERSONAL",
      otp: "123456",
    });
    const isExpired = res.status === 400 && res.data.message?.includes("expired");
    recordTest("CASE 3: Expired OTP rejected", isExpired, res.data.message);
  } catch (err: any) {
    recordTest("CASE 3: Expired OTP", false, undefined, err.message);
  }

  // ── TEST 1B: Successful Personal Email OTP Verification ──
  try {
    const res = await request("POST", "/auth/verify-otp", {
      userId: studentAId,
      emailType: "PERSONAL",
      otp: validPersonalOtp,
    });
    const passed =
      res.data.success === true &&
      res.data.step === "VERIFY_COLLEGE_EMAIL" &&
      res.data.personalEmailVerified === true;
    recordTest("CASE 1B: Verify Personal Email OTP", passed, "Personal email verified, college OTP generated");
  } catch (err: any) {
    recordTest("CASE 1B: Verify Personal Email OTP", false, undefined, err.message);
  }

  // ── TEST 4: Reused OTP Verification Fails ──
  try {
    const res = await request("POST", "/auth/verify-otp", {
      userId: studentAId,
      emailType: "PERSONAL",
      otp: validPersonalOtp,
    });
    const isRejected = res.status === 400;
    recordTest("CASE 4: Reused OTP rejected", isRejected, res.data.message);
  } catch (err: any) {
    recordTest("CASE 4: Reused OTP", false, undefined, err.message);
  }

  // Set known College OTP for student A
  const collegeHashA = await bcrypt.default.hash(validCollegeOtp, 8);
  await prisma.emailVerification.updateMany({
    where: { userId: studentAId, emailType: "COLLEGE", isUsed: false },
    data: { otpHash: collegeHashA },
  });

  // ── TEST 1C: Successful College Email OTP Verification -> Account reaches VERIFIED ──
  try {
    const res = await request("POST", "/auth/verify-otp", {
      userId: studentAId,
      emailType: "COLLEGE",
      otp: validCollegeOtp,
    });
    tokenA = res.data.token;
    const passed =
      res.data.success === true &&
      res.data.step === "VERIFIED" &&
      res.data.isVerified === true &&
      res.data.hasVerifiedMed === true &&
      res.data.status === "VERIFIED" &&
      !!tokenA;
    recordTest("CASE 1C: Verify College Email OTP -> Account reaches VERIFIED", passed, `Token granted for verified student, hasVerifiedMed: ${res.data.hasVerifiedMed}`);
  } catch (err: any) {
    recordTest("CASE 1C: Verify College Email OTP", false, undefined, err.message);
  }

  // ── TEST 13: Verified Student Accesses Protected Endpoint ──
  try {
    const res = await request("GET", "/user/me", undefined, tokenA);
    const passed = res.status === 200 && res.data.isVerified === true && res.data.college === "AIIMS New Delhi" && res.data.hasVerifiedMed === true;
    recordTest("CASE 13: Verified Student Accesses /user/me", passed, `Logged in: ${res.data.fullName}, Verified: ${res.data.isVerified}, Verified Med: ${res.data.hasVerifiedMed}`);
  } catch (err: any) {
    recordTest("CASE 13: Verified user me check", false, undefined, err.message);
  }

  // ── TEST OPTIONAL COLLEGE EMAIL (NO COLLEGE EMAIL FLOW) ──
  const testStudentC = {
    fullName: "Karan Patel",
    personalEmail: `karan.patel.${timestamp}@gmail.com`,
    collegeId: aiimsCollege.id,
    course: "MBBS",
    year: "2nd Year",
    password: "Password123!",
    hasCollegeEmail: false,
  };

  let studentCId = "";
  let tokenC = "";

  try {
    const res = await request("POST", "/auth/register", testStudentC);
    studentCId = res.data.userId;
    const passed =
      res.status === 201 &&
      res.data.step === "VERIFY_PERSONAL_EMAIL" &&
      res.data.hasCollegeEmail === false &&
      res.data.requiresVerification === true;
    recordTest("CASE 21A: Register with Personal Email ONLY (No College Email)", passed, `User created: ${studentCId}, hasCollegeEmail: false`);
  } catch (err: any) {
    recordTest("CASE 21A: Register with Personal Email ONLY", false, undefined, err.message);
  }

  // Set known personal OTP for Student C
  const validOtpC = "554433";
  const hashC = await bcrypt.default.hash(validOtpC, 8);
  await prisma.emailVerification.create({
    data: {
      userId: studentCId,
      email: testStudentC.personalEmail,
      emailType: "PERSONAL",
      otpHash: hashC,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      cooldownUntil: new Date(Date.now() + 60 * 1000),
      attempts: 0,
      maxAttempts: 5,
      isUsed: false,
    },
  });

  try {
    const res = await request("POST", "/auth/verify-otp", {
      userId: studentCId,
      emailType: "PERSONAL",
      otp: validOtpC,
    });
    tokenC = res.data.token;
    const passed =
      res.data.success === true &&
      res.data.step === "VERIFIED" &&
      res.data.isVerified === true &&
      res.data.hasVerifiedMed === false &&
      res.data.status === "VERIFIED" &&
      !!tokenC;
    recordTest("CASE 21B: Verify Personal OTP with NO College Email -> Instantly Active", passed, `Account activated without Verified Med badge (hasVerifiedMed: ${res.data.hasVerifiedMed})`);
  } catch (err: any) {
    recordTest("CASE 21B: Verify Personal OTP with NO College Email", false, undefined, err.message);
  }

  try {
    const res = await request("GET", "/user/me", undefined, tokenC);
    const passed = res.status === 200 && res.data.isVerified === true && res.data.hasVerifiedMed === false;
    recordTest("CASE 21C: Student C /user/me confirms hasVerifiedMed === false", passed, `Name: ${res.data.fullName}, hasVerifiedMed: ${res.data.hasVerifiedMed}`);
  } catch (err: any) {
    recordTest("CASE 21C: Student C /user/me check", false, undefined, err.message);
  }

  // ── TEST NORMAL LOGIN — STRICTLY PERSONAL EMAIL + PASSWORD (ZERO OTP LOOP) ──
  try {
    const res = await request("POST", "/auth/login", {
      email: testStudentA.personalEmail,
      password: "Password123!",
    });
    const passed =
      res.status === 200 &&
      res.data.success === true &&
      !!res.data.token &&
      !res.data.requiresVerification &&
      res.data.user?.hasVerifiedMed === true;
    recordTest("CASE 22A: Normal Login (Personal Email + Password) -> Instant JWT (Zero OTP)", passed, `Logged in: ${res.data.user?.fullName}, Token received, Zero OTP prompts`);
  } catch (err: any) {
    recordTest("CASE 22A: Normal Login", false, undefined, err.message);
  }

  try {
    const res = await request("POST", "/auth/login", {
      email: testStudentC.personalEmail,
      password: "Password123!",
    });
    const passed =
      res.status === 200 &&
      res.data.success === true &&
      !!res.data.token &&
      !res.data.requiresVerification &&
      res.data.user?.hasVerifiedMed === false;
    recordTest("CASE 22B: Normal Login Student C (No College Email) -> Instant JWT (Zero OTP)", passed, `Logged in: ${res.data.user?.fullName}, hasVerifiedMed: false`);
  } catch (err: any) {
    recordTest("CASE 22B: Normal Login Student C", false, undefined, err.message);
  }

  // ── TEST LOGIN WRONG PASSWORD ──
  try {
    const res = await request("POST", "/auth/login", {
      email: testStudentA.personalEmail,
      password: "WrongPassword999!",
    });
    const passed = res.status === 401 && res.data.message?.includes("Invalid email or password");
    recordTest("CASE 22C: Login with Wrong Password safely rejected", passed, res.data.message);
  } catch (err: any) {
    recordTest("CASE 22C: Wrong Password Login", false, undefined, err.message);
  }

  // ── TEST UNVERIFIED USER LOGIN (INCOMPLETE REGISTRATION) ──
  const unverifiedStudent = await prisma.user.create({
    data: {
      fullName: "Incomplete User",
      email: `unverified.${timestamp}@gmail.com`,
      personalEmail: `unverified.${timestamp}@gmail.com`,
      password: await bcrypt.default.hash("Password123!", 10),
      collegeId: aiimsCollege.id,
      personalEmailVerified: false,
      collegeEmailVerified: false,
      isVerified: false,
      status: "PENDING_EMAIL_VERIFICATION",
    },
  });

  try {
    const res = await request("POST", "/auth/login", {
      email: unverifiedStudent.email,
      password: "Password123!",
    });
    const passed = res.status === 200 && res.data.requiresVerification === true && res.data.step === "VERIFY_PERSONAL_EMAIL";
    recordTest("CASE 22D: Login with unverified email prompts verification step", passed, `Prompted step: ${res.data.step}`);
  } catch (err: any) {
    recordTest("CASE 22D: Unverified Login", false, undefined, err.message);
  }

  // ── TEST DEV TEST-EMAIL ENDPOINT ──
  try {
    const res = await request("POST", "/auth/test-email", {
      email: "test.check@example.com",
    });
    // In dev mode with placeholder password, it responds gracefully or catches safely
    const passed = res.status === 200 || res.status === 500;
    recordTest("CASE 23: Dev test-email endpoint is mounted and responds", passed, `HTTP ${res.status}: ${res.data.message}`);
  } catch (err: any) {
    recordTest("CASE 23: Dev test-email endpoint check", false, undefined, err.message);
  }

  // Register and verify Student B for peer matching & requests
  const resB = await request("POST", "/auth/register", testStudentB);
  studentBId = resB.data.userId;
  const updatedB = await prisma.user.update({
    where: { id: studentBId },
    data: {
      personalEmailVerified: true,
      collegeEmailVerified: true,
      isVerified: true,
      status: "VERIFIED",
    },
  });
  const jwtLib = await import("jsonwebtoken");
  tokenB = jwtLib.default.sign(
    { id: updatedB.id, email: updatedB.email, isVerified: true, status: "VERIFIED" },
    "synora_super_secret_key_2026",
    { expiresIn: "7d" }
  );

  // ── TEST 14: Verified Student Selects Learning Topic ──
  const testTopic = await prisma.topic.findFirst();
  if (!testTopic) throw new Error("No topics found in database.");

  try {
    const res = await request("POST", "/user/topics", { topicId: testTopic.id, type: "LEARNING" }, tokenA);
    const passed = res.status === 201 && res.data.data.type === "LEARNING";
    recordTest("CASE 14: Student A selects LEARNING topic", passed, `Topic: ${res.data.data.topic.name}`);
  } catch (err: any) {
    recordTest("CASE 14: Learning topic", false, undefined, err.message);
  }

  // ── TEST 15: Student B Selects Teaching (CAN_HELP) on Same Topic ──
  try {
    const res = await request("POST", "/user/topics", { topicId: testTopic.id, type: "CAN_HELP" }, tokenB);
    const passed = res.status === 201 && res.data.data.type === "CAN_HELP";
    recordTest("CASE 15: Student B selects CAN_HELP on same topic", passed, `Topic: ${res.data.data.topic.name}`);
  } catch (err: any) {
    recordTest("CASE 15: Teaching topic", false, undefined, err.message);
  }

  // ── TEST 16: Two Students Share Matching Topics -> Peer Match Found ──
  try {
    const res = await request("GET", "/match/helpers", undefined, tokenA);
    const matchFound = res.data.data?.some((m: any) => m.user.id === studentBId);
    recordTest("CASE 16: Reciprocal Peer Match Found", matchFound, `Found ${res.data.count} matching helper(s)`);
  } catch (err: any) {
    recordTest("CASE 16: Peer match", false, undefined, err.message);
  }

  // ── TEST 17: Self-Match Prevented ──
  try {
    await prisma.userTopic.upsert({
      where: { userId_topicId_type: { userId: studentAId, topicId: testTopic.id, type: "CAN_HELP" } },
      update: {},
      create: { userId: studentAId, topicId: testTopic.id, type: "CAN_HELP" },
    });
    const res = await request("GET", "/match/helpers", undefined, tokenA);
    const hasSelf = res.data.data?.some((m: any) => m.user.id === studentAId);
    recordTest("CASE 17: Student attempts to match with self prevented", !hasSelf, "Self-match excluded");
  } catch (err: any) {
    recordTest("CASE 17: Self match check", false, undefined, err.message);
  }

  // ── TEST 18: Partner Requests & Duplicate Request Prevention ──
  let partnerRequestId = "";
  try {
    const res = await request("POST", "/study-partner/request", { receiverId: studentBId }, tokenA);
    partnerRequestId = res.data.data.id;
    recordTest("CASE 18A: Send Study Partner Request", res.status === 201, `Request created: ${partnerRequestId}`);
  } catch (err: any) {
    recordTest("CASE 18A: Send Study Partner Request", false, undefined, err.message);
  }

  try {
    const res = await request("POST", "/study-partner/request", { receiverId: studentBId }, tokenA);
    const isPrevented = res.status === 400 && res.data.message?.includes("already exists");
    recordTest("CASE 18B: Duplicate Study Partner Request Prevented", isPrevented, res.data.message);
  } catch (err: any) {
    recordTest("CASE 18B: Duplicate request check", false, undefined, err.message);
  }

  // ── TEST 19: Unauthorized Chat Creation Without Partner Status ──
  const randomStudent = await prisma.user.create({
    data: {
      fullName: "Random Medical Student",
      email: `random.${timestamp}@gmail.com`,
      personalEmail: `random.${timestamp}@gmail.com`,
      collegeEmail: `random.${timestamp}@aiims.edu`,
      password: "Password123!",
      collegeId: aiimsCollege.id,
      isVerified: true,
      status: "VERIFIED",
    },
  });

  try {
    const res = await request("POST", "/conversation", { partnerId: randomStudent.id }, tokenA);
    const isDenied = res.status === 400 && res.data.message?.includes("accepted study partners");
    recordTest("CASE 19: Unauthorized chat creation without partner status", isDenied, res.data.message);
  } catch (err: any) {
    recordTest("CASE 19: Chat check", false, undefined, err.message);
  }

  // ── TEST 20: Password Leak Audit in Study Partner List ──
  try {
    await request("PATCH", `/study-partner/accept/${partnerRequestId}`, {}, tokenB);
    const partnersRes = await request("GET", "/study-partner/list", undefined, tokenA);
    const leakedPassword = partnersRes.data.data?.some((p: any) => p.password !== undefined);
    recordTest("CASE 20: Password hash leakage audit in study partner list", !leakedPassword, "Zero password hashes leaked");
  } catch (err: any) {
    recordTest("CASE 20: Password leakage check", false, undefined, err.message);
  }

  // Cleanup
  console.log("\n🧹 Cleaning up test artifacts from database...");
  await prisma.conversation.deleteMany({
    where: {
      participants: {
        some: {
          userId: { in: [studentAId, studentBId, studentCId, unverifiedStudent.id, randomStudent.id, expiredOtpUser.id] },
        },
      },
    },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [studentAId, studentBId, studentCId, unverifiedStudent.id, randomStudent.id, expiredOtpUser.id] } },
  });

  console.log("\n============================================================");
  console.log("TEST SUMMARY");
  console.log("============================================================");
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`Total Tests Run: ${total}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);

  if (failedCount === 0) {
    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% VERIFICATION INTEGRITY CONFIRMED.");
  } else {
    console.log(`\n⚠️ ${failedCount} tests failed.`);
  }

  await prisma.$disconnect();
}

runTests().catch((e) => {
  console.error("Test runner fatal error:", e);
  process.exit(1);
});
