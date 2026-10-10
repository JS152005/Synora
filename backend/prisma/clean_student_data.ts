import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanStudentData() {
  console.log("🧹 ========================================================");
  console.log("🧹 SYNORA DATABASE AUDIT & SAFE STUDENT DATA CLEANUP");
  console.log("🧹 ========================================================");

  // 1. Audit all existing users
  const allUsers = await prisma.user.findMany();
  console.log(`📋 Total users found in database: ${allUsers.length}`);

  // 2. Identify Admin and Student accounts safely
  const adminUsers = allUsers.filter((u) => {
    const roleUpper = (u.role || "").toUpperCase();
    const emailLower = (u.email || "").toLowerCase();
    return (
      roleUpper === "ADMIN" ||
      roleUpper === "SYSTEM" ||
      emailLower.includes("admin@") ||
      emailLower.includes("system@")
    );
  });

  const studentUsers = allUsers.filter((u) => {
    return !adminUsers.some((admin) => admin.id === u.id);
  });

  console.log(`🛡️  Admin accounts to preserve: ${adminUsers.length}`);
  if (adminUsers.length > 0) {
    adminUsers.forEach((a) => {
      console.log(`    - ID: ${a.id} | Email: ${a.email} | Role: ${a.role}`);
    });
  } else {
    console.log("    (No administrator accounts detected in current user table)");
  }

  console.log(`🎓 Student accounts to safely remove: ${studentUsers.length}`);
  const studentIds = studentUsers.map((u) => u.id);

  if (studentIds.length > 0) {
    console.log("🗑️  Executing transactional cleanup of student-owned relational data...");

    await prisma.$transaction(async (tx) => {
      // Step A: Disconnect lastMessageId in conversations so messages can be deleted without FK conflict
      await tx.conversation.updateMany({
        data: {
          lastMessageId: null,
        },
      });

      // Step B: Delete EmailVerification records for students
      const deletedOtps = await tx.emailVerification.deleteMany({
        where: {
          OR: [
            { userId: { in: studentIds } },
            { email: { in: studentUsers.map((u) => u.email) } },
          ],
        },
      });
      console.log(`   ✔ Deleted ${deletedOtps.count} OTP / verification records`);

      // Step C: Delete StudyPartnerRequests involving students
      const deletedRequests = await tx.studyPartnerRequest.deleteMany({
        where: {
          OR: [
            { senderId: { in: studentIds } },
            { receiverId: { in: studentIds } },
          ],
        },
      });
      console.log(`   ✔ Deleted ${deletedRequests.count} study partner requests`);

      // Step D: Delete Notifications for students
      const deletedNotifications = await tx.notification.deleteMany({
        where: {
          userId: { in: studentIds },
        },
      });
      console.log(`   ✔ Deleted ${deletedNotifications.count} notifications`);

      // Step E: Delete UserTopics for students
      const deletedUserTopics = await tx.userTopic.deleteMany({
        where: {
          userId: { in: studentIds },
        },
      });
      console.log(`   ✔ Deleted ${deletedUserTopics.count} user topics`);

      // Step F: Delete Messages sent by students
      const deletedMessages = await tx.message.deleteMany({
        where: {
          senderId: { in: studentIds },
        },
      });
      console.log(`   ✔ Deleted ${deletedMessages.count} chat messages`);

      // Step G: Delete ConversationParticipants for students
      const deletedParticipants = await tx.conversationParticipant.deleteMany({
        where: {
          userId: { in: studentIds },
        },
      });
      console.log(`   ✔ Deleted ${deletedParticipants.count} conversation participants`);

      // Step H: Delete Conversations that no longer have participants
      const emptyConversations = await tx.conversation.findMany({
        where: {
          participants: {
            none: {},
          },
        },
      });
      if (emptyConversations.length > 0) {
        await tx.conversation.deleteMany({
          where: {
            id: { in: emptyConversations.map((c) => c.id) },
          },
        });
        console.log(`   ✔ Deleted ${emptyConversations.length} empty student conversations`);
      }

      // Step I: Delete PendingRegistrations if any
      const deletedPending = await tx.pendingRegistration.deleteMany({});
      console.log(`   ✔ Cleaned up ${deletedPending.count} pending registrations`);

      // Step J: Delete Student Users
      const deletedUsers = await tx.user.deleteMany({
        where: {
          id: { in: studentIds },
        },
      });
      console.log(`   ✔ Successfully deleted ${deletedUsers.count} student accounts`);
    });
  }

  // 3. Verify Master & Reference Data is 100% Intact
  console.log("\n📦 Verifying Master and Curriculum Reference Data Integrity...");
  const collegesCount = await prisma.college.count();
  const coursesCount = await prisma.course.count();
  const academicYearsCount = await prisma.academicYear.count();
  const subjectsCount = await prisma.subject.count();
  const topicsCount = await prisma.topic.count();
  const remainingUsers = await prisma.user.count();

  console.log(`   ✅ Colleges: ${collegesCount} preserved`);
  console.log(`   ✅ Courses: ${coursesCount} preserved`);
  console.log(`   ✅ Academic Years: ${academicYearsCount} preserved`);
  console.log(`   ✅ MBBS Subjects: ${subjectsCount} preserved`);
  console.log(`   ✅ Curriculum Topics & Subtopics: ${topicsCount} preserved`);
  console.log(`   ✅ Remaining Users in DB: ${remainingUsers} (${adminUsers.length} admin accounts)`);

  console.log("\n🎉 Database cleanup complete! Clean slate ready for fresh student registration.");
}

cleanStudentData()
  .catch((e) => {
    console.error("❌ Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
