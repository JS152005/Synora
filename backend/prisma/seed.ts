import { PrismaClient } from "@prisma/client";
import subjects from "./subjects.json";
import topics from "./topics.json";

const prisma = new PrismaClient();

async function main() {
  console.log("Clearing existing data...");

  await prisma.userTopic.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();

  console.log("Importing subjects...");

  await prisma.subject.createMany({
    data: subjects,
    skipDuplicates: true,
  });

  console.log("Importing topics...");

  for (const topic of topics) {
    await prisma.topic.create({
      data: {
        id: topic.id,
        code: topic.code,
        name: topic.name,
        level: topic.level,
        subjectId: topic.subjectId,
        parentTopicId: topic.parentTopicId || null,
      },
    });
  }

  console.log("✅ Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });