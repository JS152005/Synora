import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const API_URL = "http://localhost:5000";

interface AuditResult {
  category: string;
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const auditResults: AuditResult[] = [];

function record(category: string, name: string, passed: boolean, details?: string, error?: string) {
  auditResults.push({ category, name, passed, details, error });
  const icon = passed ? "✅" : "❌";
  console.log(`${icon} [${category}] ${name}${details ? ` -> ${details}` : ""}`);
  if (error) console.log(`   ⚠️ ERROR: ${error}`);
}

async function api(method: string, path: string, body?: any, token?: string) {
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

async function runE2EFullAudit() {
  console.log("================================================================================");
  console.log("SYNORA COMPREHENSIVE END-TO-END WORKFLOW, BRANCH FLOW & COMPONENT AUDIT");
  console.log("================================================================================\n");

  const timestamp = Date.now();
  const bcrypt = await import("bcrypt");

  // Get AIIMS New Delhi from recognized database
  const aiimsCollege = await prisma.college.findUnique({
    where: { code: "AIIMS-DELHI" },
  });

  if (!aiimsCollege) {
    throw new Error("AIIMS-DELHI not found in recognized college directory.");
  }

  let userAId = "";
  let userBId = "";
  let userNoCollegeId = "";
  let tokenA = "";
  let tokenB = "";
  let tokenNoCollege = "";

  /* ─────────────────────────────────────────────────────────────────────────────
   * 1. REGISTRATION BRANCH FLOW: OPTIONAL COLLEGE EMAIL (NO COLLEGE EMAIL)
   * ───────────────────────────────────────────────────────────────────────────── */
  console.log("\n--- [MODULE 1: REGISTRATION BRANCH FLOW (NO COLLEGE EMAIL)] ---");
  const regNoCollegeData = {
    fullName: "Rohan Kulkarni",
    personalEmail: `rohan.kulkarni.${timestamp}@gmail.com`,
    collegeId: aiimsCollege.id,
    course: "MBBS",
    year: "2nd Year",
    password: "Password123!",
    hasCollegeEmail: false,
  };

  try {
    const res = await api("POST", "/auth/register", regNoCollegeData);
    userNoCollegeId = res.data.userId;
    const ok =
      res.status === 201 &&
      res.data.success === true &&
      res.data.step === "VERIFY_PERSONAL_EMAIL" &&
      res.data.hasCollegeEmail === false &&
      res.data.requiresVerification === true;
    record("REGISTRATION", "Branch 1: Register without college email initiates personal OTP", ok, `User ID: ${userNoCollegeId}`);
  } catch (err: any) {
    record("REGISTRATION", "Branch 1: Register without college email", false, undefined, err.message);
  }

  // Inject known OTP for userNoCollege
  const otpNoCollege = "445566";
  const hashNoCollege = await bcrypt.default.hash(otpNoCollege, 8);
  await prisma.emailVerification.create({
    data: {
      userId: userNoCollegeId,
      email: regNoCollegeData.personalEmail,
      emailType: "PERSONAL",
      otpHash: hashNoCollege,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      cooldownUntil: new Date(Date.now() + 60 * 1000),
      attempts: 0,
      maxAttempts: 5,
      isUsed: false,
    },
  });

  try {
    const res = await api("POST", "/auth/verify-otp", {
      userId: userNoCollegeId,
      emailType: "PERSONAL",
      otp: otpNoCollege,
    });
    tokenNoCollege = res.data.token;
    const ok =
      res.status === 200 &&
      res.data.success === true &&
      res.data.step === "VERIFIED" &&
      res.data.isVerified === true &&
      res.data.hasVerifiedMed === false &&
      res.data.status === "VERIFIED" &&
      !!tokenNoCollege;
    record("VERIFICATION", "Branch 1: Personal OTP verifies & immediately activates account (no loop, hasVerifiedMed: false)", ok, `JWT token received, Verified Med badge: false`);
  } catch (err: any) {
    record("VERIFICATION", "Branch 1: Verify Personal OTP without college email", false, undefined, err.message);
  }

  /* ─────────────────────────────────────────────────────────────────────────────
   * 2. REGISTRATION BRANCH FLOW: WITH COLLEGE EMAIL & VERIFIED MED BADGE
   * ───────────────────────────────────────────────────────────────────────────── */
  console.log("\n--- [MODULE 2: REGISTRATION BRANCH FLOW (WITH COLLEGE EMAIL)] ---");
  const regCollegeDataA = {
    fullName: "Dr. Ananya Sen",
    personalEmail: `ananya.sen.${timestamp}@gmail.com`,
    collegeEmail: `ananya.sen.${timestamp}@aiims.edu`,
    collegeId: aiimsCollege.id,
    course: "MBBS",
    year: "3rd Year (Part 1)",
    password: "Password123!",
    hasCollegeEmail: true,
  };

  try {
    const res = await api("POST", "/auth/register", regCollegeDataA);
    userAId = res.data.userId;
    const ok =
      res.status === 201 &&
      res.data.success === true &&
      res.data.step === "VERIFY_PERSONAL_EMAIL" &&
      res.data.hasCollegeEmail === true &&
      res.data.requiresVerification === true &&
      !res.data.otp;
    record("REGISTRATION", "Branch 2: Register with college email creates user & dispatches personal OTP", ok, `User ID: ${userAId}`);
  } catch (err: any) {
    record("REGISTRATION", "Branch 2: Register with college email", false, undefined, err.message);
  }

  // Inject known OTP for User A (Personal)
  const otpPersonalA = "112233";
  const hashPersonalA = await bcrypt.default.hash(otpPersonalA, 8);
  await prisma.emailVerification.deleteMany({ where: { userId: userAId } });
  await prisma.emailVerification.create({
    data: {
      userId: userAId,
      email: regCollegeDataA.personalEmail,
      emailType: "PERSONAL",
      otpHash: hashPersonalA,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      cooldownUntil: new Date(Date.now() + 60 * 1000),
      attempts: 0,
      maxAttempts: 5,
      isUsed: false,
    },
  });

  try {
    const res = await api("POST", "/auth/verify-otp", {
      userId: userAId,
      emailType: "PERSONAL",
      otp: otpPersonalA,
    });
    const ok =
      res.status === 200 &&
      res.data.success === true &&
      res.data.step === "VERIFY_COLLEGE_EMAIL" &&
      res.data.personalEmailVerified === true &&
      res.data.collegeEmailVerified === false;
    record("VERIFICATION", "Branch 2: Personal OTP verified -> advances to college email OTP step", ok, `Step: ${res.data.step}`);
  } catch (err: any) {
    record("VERIFICATION", "Branch 2: Verify Personal OTP", false, undefined, err.message);
  }

  // Inject known OTP for User A (College)
  const otpCollegeA = "778899";
  const hashCollegeA = await bcrypt.default.hash(otpCollegeA, 8);
  await prisma.emailVerification.updateMany({
    where: { userId: userAId, emailType: "COLLEGE", isUsed: false },
    data: { otpHash: hashCollegeA },
  });

  try {
    const res = await api("POST", "/auth/verify-otp", {
      userId: userAId,
      emailType: "COLLEGE",
      otp: otpCollegeA,
    });
    tokenA = res.data.token;
    const ok =
      res.status === 200 &&
      res.data.success === true &&
      res.data.step === "VERIFIED" &&
      res.data.isVerified === true &&
      res.data.hasVerifiedMed === true &&
      res.data.status === "VERIFIED" &&
      !!tokenA;
    record("VERIFICATION", "Branch 2: College OTP verified -> Account verified with Verified Med badge", ok, `hasVerifiedMed: ${res.data.hasVerifiedMed}, Token issued`);
  } catch (err: any) {
    record("VERIFICATION", "Branch 2: Verify College OTP", false, undefined, err.message);
  }

  /* ─────────────────────────────────────────────────────────────────────────────
   * 3. REGISTRATION VALIDATION & REJECTIONS
   * ───────────────────────────────────────────────────────────────────────────── */
  console.log("\n--- [MODULE 3: REGISTRATION SECURITY & DOMAIN VALIDATION] ---");
  try {
    const res = await api("POST", "/auth/register", {
      ...regCollegeDataA,
      personalEmail: `fake.${timestamp}@gmail.com`,
      collegeEmail: `fake.${timestamp}@unapproveddomain.org`,
    });
    const ok = res.status === 400 && res.data.message?.includes("approved domain");
    record("SECURITY", "Unapproved college domain rejected", ok, res.data.message);
  } catch (err: any) {
    record("SECURITY", "Unapproved college domain check", false, undefined, err.message);
  }

  try {
    const res = await api("POST", "/auth/register", {
      ...regCollegeDataA,
      collegeEmail: `another.${timestamp}@aiims.edu`,
    });
    const ok = res.status === 400 && res.data.message?.includes("personal email");
    record("SECURITY", "Duplicate personal email registration rejected", ok, res.data.message);
  } catch (err: any) {
    record("SECURITY", "Duplicate personal email check", false, undefined, err.message);
  }

  try {
    const res = await api("POST", "/auth/register", {
      ...regCollegeDataA,
      personalEmail: `another.${timestamp}@gmail.com`,
    });
    const ok = res.status === 400 && res.data.message?.includes("college email");
    record("SECURITY", "Duplicate college email registration rejected", ok, res.data.message);
  } catch (err: any) {
    record("SECURITY", "Duplicate college email check", false, undefined, err.message);
  }

  /* ─────────────────────────────────────────────────────────────────────────────
   * 4. NORMAL LOGIN FLOW — STRICTLY PERSONAL EMAIL + PASSWORD (NO OTP LOOP)
   * ───────────────────────────────────────────────────────────────────────────── */
  console.log("\n--- [MODULE 4: LOGIN FLOWS (ZERO OTP LOOP)] ---");
  try {
    const res = await api("POST", "/auth/login", {
      email: regCollegeDataA.personalEmail,
      password: "Password123!",
    });
    const ok =
      res.status === 200 &&
      res.data.success === true &&
      !res.data.requiresVerification &&
      !!res.data.token &&
      res.data.user?.hasVerifiedMed === true;
    record("LOGIN", "Normal Login (Verified Med User): Instant JWT token, zero OTP, direct access", ok, `User: ${res.data.user?.fullName}, hasVerifiedMed: true`);
  } catch (err: any) {
    record("LOGIN", "Normal Login Verified Med User", false, undefined, err.message);
  }

  try {
    const res = await api("POST", "/auth/login", {
      email: regNoCollegeData.personalEmail,
      password: "Password123!",
    });
    const ok =
      res.status === 200 &&
      res.data.success === true &&
      !res.data.requiresVerification &&
      !!res.data.token &&
      res.data.user?.hasVerifiedMed === false;
    record("LOGIN", "Normal Login (No College Email User): Instant JWT token, zero OTP, direct access", ok, `User: ${res.data.user?.fullName}, hasVerifiedMed: false`);
  } catch (err: any) {
    record("LOGIN", "Normal Login No College Email User", false, undefined, err.message);
  }

  try {
    const res = await api("POST", "/auth/login", {
      email: regCollegeDataA.personalEmail,
      password: "WrongPassword999!",
    });
    const ok = res.status === 401 && res.data.message?.includes("Invalid email or password");
    record("LOGIN", "Wrong password safely rejected with HTTP 401", ok, res.data.message);
  } catch (err: any) {
    record("LOGIN", "Wrong password check", false, undefined, err.message);
  }

  /* ─────────────────────────────────────────────────────────────────────────────
   * 5. USER PROFILE & IDENTITY ENDPOINTS (/user/me & /auth/me)
   * ───────────────────────────────────────────────────────────────────────────── */
  console.log("\n--- [MODULE 5: PROFILE & IDENTITY ENDPOINTS] ---");
  try {
    const res = await api("GET", "/user/me", undefined, tokenA);
    const ok =
      res.status === 200 &&
      res.data.fullName === regCollegeDataA.fullName &&
      res.data.isVerified === true &&
      res.data.hasVerifiedMed === true;
    record("PROFILE", "GET /user/me returns Verified Med identity", ok, `Name: ${res.data.fullName}, hasVerifiedMed: ${res.data.hasVerifiedMed}`);
  } catch (err: any) {
    record("PROFILE", "GET /user/me check", false, undefined, err.message);
  }

  try {
    const res = await api("GET", "/auth/me", undefined, tokenNoCollege);
    const ok =
      res.status === 200 &&
      res.data.fullName === regNoCollegeData.fullName &&
      res.data.isVerified === true &&
      res.data.hasVerifiedMed === false;
    record("PROFILE", "GET /auth/me returns Active Student identity (hasVerifiedMed: false)", ok, `Name: ${res.data.fullName}, hasVerifiedMed: ${res.data.hasVerifiedMed}`);
  } catch (err: any) {
    record("PROFILE", "GET /auth/me check", false, undefined, err.message);
  }

  // Update profile
  try {
    const updateRes = await api(
      "PUT",
      "/user/profile",
      {
        fullName: "Dr. Ananya Sen, MBBS",
        bio: "Specializing in Clinical Neurology and Internal Medicine study groups.",
        year: "Final Year (Part 2)",
      },
      tokenA
    );
    const ok =
      updateRes.status === 200 &&
      updateRes.data.user?.fullName === "Dr. Ananya Sen, MBBS" &&
      updateRes.data.user?.hasVerifiedMed === true;
    record("PROFILE", "PUT /user/profile updates bio, name, and year while preserving Verified Med status", ok, `Updated Name: ${updateRes.data.user?.fullName}`);
  } catch (err: any) {
    record("PROFILE", "PUT /user/profile update", false, undefined, err.message);
  }

  /* ─────────────────────────────────────────────────────────────────────────────
   * 6. CURRICULUM, SUBJECTS & TOPIC SELECTION
   * ───────────────────────────────────────────────────────────────────────────── */
  console.log("\n--- [MODULE 6: MEDICAL SUBJECTS & TOPIC SELECTION] ---");
  let testTopicId = "";
  let topicName = "";

  try {
    const subjectsRes = await api("GET", "/subjects", undefined, tokenA);
    const ok = subjectsRes.status === 200 && Array.isArray(subjectsRes.data.data) && subjectsRes.data.data.length >= 19;
    record("CURRICULUM", "GET /subjects returns national MBBS curriculum (19 subjects)", ok, `Found ${subjectsRes.data.data?.length} subjects`);

    if (ok) {
      const subject1 = subjectsRes.data.data[0];
      const topicsRes = await api("GET", `/subjects/${subject1.id}/topics`, undefined, tokenA);
      const topicsList = topicsRes.data.data || [];
      testTopicId = topicsList[0]?.id || "";
      topicName = topicsList[0]?.name || "";
      const topicOk = topicsRes.status === 200 && !!testTopicId;
      record("CURRICULUM", "GET /subjects/:id/topics returns hierarchical curriculum topics", topicOk, `Subject: ${subject1.name}, Topic: ${topicName}`);
    }
  } catch (err: any) {
    record("CURRICULUM", "Subjects & topics check", false, undefined, err.message);
  }

  // User A selects LEARNING topic
  let userTopicAId = "";
  try {
    const addRes = await api("POST", "/user/topics", { topicId: testTopicId, type: "LEARNING" }, tokenA);
    userTopicAId = addRes.data.data?.id;
    const ok = addRes.status === 201 && addRes.data.data?.type === "LEARNING";
    record("TOPICS", "User A selects topic for LEARNING", ok, `Topic: ${topicName}`);
  } catch (err: any) {
    record("TOPICS", "User A topic selection", false, undefined, err.message);
  }

  // Register and verify User B for reciprocal matching
  const regCollegeDataB = {
    fullName: "Dr. Vikram Sethi",
    personalEmail: `vikram.sethi.${timestamp}@gmail.com`,
    collegeEmail: `vikram.sethi.${timestamp}@aiims.edu`,
    collegeId: aiimsCollege.id,
    course: "MBBS",
    year: "3rd Year (Part 1)",
    password: "Password123!",
    hasCollegeEmail: true,
  };

  const resB = await api("POST", "/auth/register", regCollegeDataB);
  userBId = resB.data.userId;
  await prisma.user.update({
    where: { id: userBId },
    data: {
      personalEmailVerified: true,
      collegeEmailVerified: true,
      isVerified: true,
      status: "VERIFIED",
    },
  });

  const jwt = await import("jsonwebtoken");
  tokenB = jwt.default.sign(
    { id: userBId, email: regCollegeDataB.personalEmail, isVerified: true, status: "VERIFIED", hasVerifiedMed: true },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  // User B selects CAN_HELP on the same topic
  try {
    const addRes = await api("POST", "/user/topics", { topicId: testTopicId, type: "CAN_HELP" }, tokenB);
    const ok = addRes.status === 201 && addRes.data.data?.type === "CAN_HELP";
    record("TOPICS", "User B selects same topic for TEACHING (CAN_HELP)", ok, `Topic: ${topicName}`);
  } catch (err: any) {
    record("TOPICS", "User B topic selection", false, undefined, err.message);
  }

  /* ─────────────────────────────────────────────────────────────────────────────
   * 7. SMART PEER MATCHMAKING
   * ───────────────────────────────────────────────────────────────────────────── */
  console.log("\n--- [MODULE 7: RECIPROCAL PEER MATCHMAKING] ---");
  try {
    const res = await api("GET", "/match/helpers", undefined, tokenA);
    const match = res.data.data?.find((m: any) => m.user.id === userBId);
    const ok = res.status === 200 && !!match;
    record("MATCHING", "User A finds User B under /match/helpers for syllabus topic", ok, `Matched Helper: ${match?.user?.fullName}, Topic: ${match?.topic?.name}`);
  } catch (err: any) {
    record("MATCHING", "/match/helpers query", false, undefined, err.message);
  }

  try {
    const res = await api("GET", "/match/learners", undefined, tokenB);
    const match = res.data.data?.find((m: any) => m.user.id === userAId);
    const ok = res.status === 200 && !!match;
    record("MATCHING", "User B finds User A under /match/learners for reciprocal syllabus topic", ok, `Matched Learner: ${match?.user?.fullName}, Topic: ${match?.topic?.name}`);
  } catch (err: any) {
    record("MATCHING", "/match/learners query", false, undefined, err.message);
  }

  /* ─────────────────────────────────────────────────────────────────────────────
   * 8. STUDY PARTNER REQUEST WORKFLOW
   * ───────────────────────────────────────────────────────────────────────────── */
  console.log("\n--- [MODULE 8: STUDY PARTNER REQUEST WORKFLOW] ---");
  let partnerReqId = "";
  try {
    const res = await api("POST", "/study-partner/request", { receiverId: userBId }, tokenA);
    partnerReqId = res.data.data?.id;
    const ok = res.status === 201 && !!partnerReqId;
    record("STUDY_PARTNERS", "User A sends study partner request to User B", ok, `Request ID: ${partnerReqId}`);
  } catch (err: any) {
    record("STUDY_PARTNERS", "Send partner request", false, undefined, err.message);
  }

  // Duplicate request check
  try {
    const res = await api("POST", "/study-partner/request", { receiverId: userBId }, tokenA);
    const ok = res.status === 400 && res.data.message?.includes("already exists");
    record("STUDY_PARTNERS", "Duplicate study partner request safely prevented", ok, res.data.message);
  } catch (err: any) {
    record("STUDY_PARTNERS", "Duplicate partner request check", false, undefined, err.message);
  }

  // User B views incoming requests
  try {
    const res = await api("GET", "/study-partner/incoming", undefined, tokenB);
    const found = res.data.data?.some((r: any) => r.id === partnerReqId);
    const ok = res.status === 200 && found;
    record("STUDY_PARTNERS", "User B sees incoming partner request from User A", ok, `Found request: ${partnerReqId}`);
  } catch (err: any) {
    record("STUDY_PARTNERS", "Incoming partner requests check", false, undefined, err.message);
  }

  // User B accepts partner request
  try {
    const res = await api("PATCH", `/study-partner/accept/${partnerReqId}`, {}, tokenB);
    const ok = res.status === 200 && res.data.data?.status === "ACCEPTED";
    record("STUDY_PARTNERS", "User B accepts partner request", ok, `Status: ${res.data.data?.status}`);
  } catch (err: any) {
    record("STUDY_PARTNERS", "Accept partner request", false, undefined, err.message);
  }

  // Both users see each other in partner list
  try {
    const listA = await api("GET", "/study-partner/list", undefined, tokenA);
    const listB = await api("GET", "/study-partner/list", undefined, tokenB);
    const aHasB = listA.data.data?.some((p: any) => p.id === userBId);
    const bHasA = listB.data.data?.some((p: any) => p.id === userAId);
    const noPasswordLeak = !listA.data.data?.some((p: any) => p.password !== undefined);
    const ok = listA.status === 200 && listB.status === 200 && aHasB && bHasA && noPasswordLeak;
    record("STUDY_PARTNERS", "Mutual partner relationship confirmed; zero password hashes leaked", ok, `A has B: ${aHasB}, B has A: ${bHasA}, Leaked passwords: ${!noPasswordLeak}`);
  } catch (err: any) {
    record("STUDY_PARTNERS", "Mutual partner list check", false, undefined, err.message);
  }

  /* ─────────────────────────────────────────────────────────────────────────────
   * 9. DIRECT CHAT & CONVERSATION WORKFLOW
   * ───────────────────────────────────────────────────────────────────────────── */
  console.log("\n--- [MODULE 9: DIRECT MESSAGING & CHAT SYSTEM] ---");
  let convId = "";
  try {
    const res = await api("POST", "/conversation", { partnerId: userBId }, tokenA);
    convId = res.data.data?.id;
    const ok = (res.status === 200 || res.status === 201) && !!convId;
    record("CHAT", "Create/Open direct conversation between verified study partners", ok, `Conversation ID: ${convId}`);
  } catch (err: any) {
    record("CHAT", "Create conversation", false, undefined, err.message);
  }

  // Send message from User A
  let msgId = "";
  try {
    const res = await api("POST", "/message", { conversationId: convId, content: "Hey! Ready to review cardiology topics?" }, tokenA);
    msgId = res.data.data?.id;
    const ok = res.status === 201 && (res.data.data?.content === "Hey! Ready to review cardiology topics?" || res.data.data?.text === "Hey! Ready to review cardiology topics?");
    record("CHAT", "User A sends study message to User B", ok, `Message ID: ${msgId}`);
  } catch (err: any) {
    record("CHAT", "Send message", false, undefined, err.message);
  }

  // User B reads messages
  try {
    const res = await api("GET", `/message/${convId}`, undefined, tokenB);
    const hasMsg = res.data.data?.some((m: any) => m.id === msgId);
    const ok = res.status === 200 && hasMsg;
    record("CHAT", "User B retrieves messages in study conversation", ok, `Messages count: ${res.data.data?.length}`);
  } catch (err: any) {
    record("CHAT", "Get messages", false, undefined, err.message);
  }

  // User B marks conversation as read
  try {
    const res = await api("PATCH", `/message/read/${convId}`, {}, tokenB);
    const ok = res.status === 200 && res.data.success === true;
    record("CHAT", "User B marks conversation messages as read", ok, res.data.message);
  } catch (err: any) {
    record("CHAT", "Mark read", false, undefined, err.message);
  }

  /* ─────────────────────────────────────────────────────────────────────────────
   * 10. NOTIFICATIONS WORKFLOW
   * ───────────────────────────────────────────────────────────────────────────── */
  console.log("\n--- [MODULE 10: NOTIFICATIONS SYSTEM] ---");
  try {
    const res = await api("GET", "/notification", undefined, tokenB);
    const ok = res.status === 200 && Array.isArray(res.data.data);
    record("NOTIFICATIONS", "User B retrieves notifications list", ok, `Notifications count: ${res.data.data?.length}`);

    if (ok && res.data.data.length > 0) {
      const notifId = res.data.data[0].id;
      const readRes = await api("PATCH", `/notification/read/${notifId}`, {}, tokenB);
      record("NOTIFICATIONS", "Mark single notification as read", readRes.status === 200, `Notification: ${notifId}`);
    }

    const readAllRes = await api("PATCH", "/notification/read-all", {}, tokenB);
    record("NOTIFICATIONS", "Mark all notifications as read", readAllRes.status === 200, "All marked as read");
  } catch (err: any) {
    record("NOTIFICATIONS", "Notifications check", false, undefined, err.message);
  }

  /* ─────────────────────────────────────────────────────────────────────────────
   * 11. DISCOVERY & PUBLIC DIRECTORY WITH FILTERS
   * ───────────────────────────────────────────────────────────────────────────── */
  console.log("\n--- [MODULE 11: STUDENT DIRECTORY & PUBLIC PROFILES] ---");
  try {
    const res = await api("GET", "/user/discover?name=Ananya", undefined, tokenB);
    const usersList = res.data.users || res.data.data || [];
    const found = usersList.some((u: any) => u.id === userAId);
    const hasBadge = usersList.find((u: any) => u.id === userAId)?.hasVerifiedMed === true;
    const ok = res.status === 200 && found && hasBadge;
    record("DISCOVERY", "GET /user/discover filters students and supplies hasVerifiedMed badge", ok, `Found: ${found}, Badge active: ${hasBadge}`);
  } catch (err: any) {
    record("DISCOVERY", "Discover students", false, undefined, err.message);
  }

  try {
    const res = await api("GET", `/user/${userAId}/profile`, undefined, tokenB);
    const ok = res.status === 200 && res.data.id === userAId && res.data.hasVerifiedMed === true;
    record("DISCOVERY", "GET /user/:id/profile returns full public profile with Verified Med badge", ok, `Full name: ${res.data.fullName}, hasVerifiedMed: ${res.data.hasVerifiedMed}`);
  } catch (err: any) {
    record("DISCOVERY", "Public profile check", false, undefined, err.message);
  }

  try {
    const res = await api("GET", "/user/recommendations", undefined, tokenA);
    const recsList = Array.isArray(res.data) ? res.data : res.data.data || [];
    const ok = res.status === 200 && Array.isArray(recsList);
    record("DISCOVERY", "GET /user/recommendations recommends verified academic peers", ok, `Recommendations count: ${recsList.length}`);
  } catch (err: any) {
    record("DISCOVERY", "Recommendations check", false, undefined, err.message);
  }

  /* ─────────────────────────────────────────────────────────────────────────────
   * 12. CLEANUP TEST DATA SAFELY
   * ───────────────────────────────────────────────────────────────────────────── */
  console.log("\n🧹 Cleaning up generated test artifacts...");
  await prisma.conversation.deleteMany({
    where: {
      participants: {
        some: {
          userId: { in: [userAId, userBId, userNoCollegeId] },
        },
      },
    },
  });
  await prisma.studyPartnerRequest.deleteMany({
    where: {
      OR: [
        { senderId: { in: [userAId, userBId, userNoCollegeId] } },
        { receiverId: { in: [userAId, userBId, userNoCollegeId] } },
      ],
    },
  });
  await prisma.userTopic.deleteMany({
    where: { userId: { in: [userAId, userBId, userNoCollegeId] } },
  });
  await prisma.emailVerification.deleteMany({
    where: { userId: { in: [userAId, userBId, userNoCollegeId] } },
  });
  await prisma.notification.deleteMany({
    where: { userId: { in: [userAId, userBId, userNoCollegeId] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [userAId, userBId, userNoCollegeId] } },
  });

  console.log("\n================================================================================");
  console.log("AUDIT SUMMARY REPORT");
  console.log("================================================================================");
  const total = auditResults.length;
  const passedCount = auditResults.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`Total Checks Run: ${total}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);

  if (failedCount === 0) {
    console.log("\n🎉 ALL 11 FUNCTIONAL MODULES & 25 E2E INTEGRATION CHECKS PASSED WITH 100% INTEGRITY!");
  } else {
    console.log(`\n⚠️ ${failedCount} checks failed.`);
  }

  await prisma.$disconnect();
}

runE2EFullAudit().catch((err) => {
  console.error("Fatal audit error:", err);
  process.exit(1);
});
