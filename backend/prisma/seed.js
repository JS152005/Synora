"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const subjects_json_1 = __importDefault(require("./subjects.json"));
const topics_json_1 = __importDefault(require("./topics.json"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Clearing existing data...");
    await prisma.userTopic.deleteMany();
    await prisma.topic.deleteMany();
    await prisma.subject.deleteMany();
    console.log("Importing subjects...");
    await prisma.subject.createMany({
        data: subjects_json_1.default,
        skipDuplicates: true,
    });
    console.log("Importing topics...");
    for (const topic of topics_json_1.default) {
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
//# sourceMappingURL=seed.js.map