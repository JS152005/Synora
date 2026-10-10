import { PrismaClient } from "@prisma/client";
import subjects from "./subjects.json";
import topics from "./topics.json";
import colleges from "./colleges.json";
import courses from "./courses.json";
import academicYears from "./academicYears.json";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting idempotent database seed & migration...");

  // 1. Seed Courses
  console.log("📚 Upserting courses...");
  for (const c of courses) {
    await prisma.course.upsert({
      where: { code: c.code },
      update: {
        name: c.name,
        durationYears: c.durationYears,
        active: c.active,
      },
      create: {
        code: c.code,
        name: c.name,
        durationYears: c.durationYears,
        active: c.active,
      },
    });
  }
  console.log(`✅ Upserted ${courses.length} courses.`);

  // 2. Seed Academic Years
  console.log("📅 Upserting academic years...");
  for (const ay of academicYears) {
    const course = await prisma.course.findUnique({
      where: { code: ay.courseCode },
    });
    if (course) {
      await prisma.academicYear.upsert({
        where: {
          courseId_yearCode: {
            courseId: course.id,
            yearCode: ay.yearCode,
          },
        },
        update: {
          displayName: ay.displayName,
          order: ay.order,
          active: true,
        },
        create: {
          courseId: course.id,
          yearCode: ay.yearCode,
          displayName: ay.displayName,
          order: ay.order,
          active: true,
        },
      });
    }
  }
  console.log(`✅ Upserted academic years.`);

  // 3. Seed Top 200 Medical Colleges
  console.log("🏥 Upserting top 200 Indian MBBS medical colleges...");
  for (const col of colleges) {
    await prisma.college.upsert({
      where: { code: col.code },
      update: {
        name: col.name,
        officialName: col.officialName,
        city: col.city,
        state: col.state,
        country: col.country,
        type: col.type,
        emailDomains: col.emailDomains,
        hasVerifiedDomain: col.hasVerifiedDomain,
        active: col.active,
      },
      create: {
        code: col.code,
        name: col.name,
        officialName: col.officialName,
        city: col.city,
        state: col.state,
        country: col.country,
        type: col.type,
        emailDomains: col.emailDomains,
        hasVerifiedDomain: col.hasVerifiedDomain,
        active: col.active,
      },
    });
  }
  console.log(`✅ Upserted ${colleges.length} medical colleges.`);

  // 4. Seed Subjects
  console.log("📖 Upserting 19 MBBS curriculum subjects...");
  for (const sub of subjects) {
    await prisma.subject.upsert({
      where: { code: sub.code },
      update: {
        name: sub.name,
      },
      create: {
        id: sub.id,
        code: sub.code,
        name: sub.name,
      },
    });
  }
  console.log(`✅ Upserted ${subjects.length} subjects.`);

  // 5. Seed Topics & Subtopics (Sorted by level so parents exist before children)
  console.log("🌳 Upserting curriculum topic & subtopic hierarchy...");
  const sortedTopics = [...topics].sort((a, b) => a.level - b.level);
  for (const t of sortedTopics) {
    await prisma.topic.upsert({
      where: { code: t.code },
      update: {
        name: t.name,
        level: t.level,
        subjectId: t.subjectId,
        parentTopicId: t.parentTopicId || null,
      },
      create: {
        id: t.id,
        code: t.code,
        name: t.name,
        level: t.level,
        subjectId: t.subjectId,
        parentTopicId: t.parentTopicId || null,
      },
    });
  }
  console.log(`✅ Upserted ${topics.length} topics & subtopics.`);

  // 6. Safe Existing Users Migration
  console.log("👥 Safely migrating existing user records...");
  const existingUsers = await prisma.user.findMany();
  for (const user of existingUsers) {
    const normalizedEmail = user.email.trim().toLowerCase();

    // Find if user already matched a college
    let matchedCollegeId = user.collegeId;
    if (!matchedCollegeId && user.college) {
      const col = await prisma.college.findFirst({
        where: {
          OR: [
            { name: { equals: user.college, mode: "insensitive" } },
            { officialName: { contains: user.college, mode: "insensitive" } },
          ],
        },
      });
      if (col) {
        matchedCollegeId = col.id;
      }
    }

    // Match course
    let matchedCourseId = user.courseId;
    if (!matchedCourseId && user.course) {
      const crs = await prisma.course.findFirst({
        where: {
          code: { equals: user.course, mode: "insensitive" },
        },
      });
      if (crs) {
        matchedCourseId = crs.id;
      }
    }

    const isInstitutionalEmail =
      normalizedEmail.endsWith(".edu") ||
      normalizedEmail.endsWith(".ac.in") ||
      normalizedEmail.endsWith(".org") ||
      normalizedEmail.includes("aiims") ||
      normalizedEmail.includes("medical");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: normalizedEmail,
        personalEmail: user.personalEmail || normalizedEmail,
        collegeEmail:
          user.collegeEmail || (isInstitutionalEmail ? normalizedEmail : null),
        collegeId: matchedCollegeId,
        courseId: matchedCourseId,
        // Do NOT mark as verified unless actually verified through the dual OTP system
        personalEmailVerified: user.personalEmailVerified || false,
        collegeEmailVerified: user.collegeEmailVerified || false,
        isVerified: user.isVerified || false,
        status: user.status || "PENDING_EMAIL_VERIFICATION",
      },
    });
  }
  console.log(`✅ Successfully checked & migrated ${existingUsers.length} users.`);

  console.log("🎉 Complete database seed & safe migration finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });