import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import userTopicRoutes from "./routes/userTopicRoutes";
import subjectRoutes from "./routes/subject.routes";
import matchRoutes from "./routes/matchRoutes";
import studyPartnerRoutes from "./routes/studyPartnerRoutes";
import notificationRoutes from "./routes/notificationRoutes";

import conversationRoutes from "./routes/conversationRoutes";

import messageRoutes from "./routes/messageRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static("uploads"));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/user/topics", userTopicRoutes);
app.use("/subjects", subjectRoutes);
app.use("/match", matchRoutes);
app.use("/study-partner", studyPartnerRoutes);
app.use("/notification", notificationRoutes);


app.use("/conversation", conversationRoutes);
app.use("/message", messageRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Synora Backend Running");
});

export default app;