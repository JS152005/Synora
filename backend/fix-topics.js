const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "prisma", "topics.json");

const topics = JSON.parse(fs.readFileSync(filePath, "utf8"));

// Normalize parentTopicId
for (const topic of topics) {
  if (
    topic.parentTopicId === "" ||
    topic.parentTopicId === undefined ||
    topic.parentTopicId === null
  ) {
    topic.parentTopicId = null;
  }
}

// Build lookup map
const map = new Map();
for (const topic of topics) {
  map.set(topic.id, topic);
}

// Calculate level recursively
function getLevel(topic) {
  if (topic.level) return topic.level;

  if (!topic.parentTopicId) {
    topic.level = 1;
    return 1;
  }

  const parent = map.get(topic.parentTopicId);

  if (!parent) {
    topic.level = 1;
    return 1;
  }

  topic.level = getLevel(parent) + 1;
  return topic.level;
}

// Add code and level
for (const topic of topics) {
  topic.code = `TOP_${topic.id}`;
  getLevel(topic);
}

// Save file
fs.writeFileSync(filePath, JSON.stringify(topics, null, 2));

console.log(`✅ Updated ${topics.length} topics successfully.`);