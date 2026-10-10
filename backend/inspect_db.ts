import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("USERS_COUNT:", users.length);
  console.log("USERS:", JSON.stringify(users, null, 2));

  const subjects = await prisma.subject.count();
  console.log("SUBJECTS_COUNT:", subjects);

  const topics = await prisma.topic.count();
  console.log("TOPICS_COUNT:", topics);

  const userTopics = await prisma.userTopic.count();
  console.log("USER_TOPICS_COUNT:", userTopics);

  const requests = await prisma.studyPartnerRequest.count();
  console.log("REQUESTS_COUNT:", requests);

  const conversations = await prisma.conversation.count();
  console.log("CONVERSATIONS_COUNT:", conversations);

  const messages = await prisma.message.count();
  console.log("MESSAGES_COUNT:", messages);
}

main()
  .catch((e) => {
    console.error("DB error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
