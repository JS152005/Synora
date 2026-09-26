![Project Status](https://img.shields.io/badge/Status-Active%20Development-orange)
![Frontend](https://img.shields.io/badge/Frontend-Under%20Development-yellow)
![Backend](https://img.shields.io/badge/Backend-In%20Development-yellow)
# Synora

### The Smart Medical Student Collaboration Platform

Synora is a **medical education collaboration platform** designed to help students learn, teach, collaborate, share resources, find study partners, discuss academic topics, and build professional connections.

It brings together ideas from professional networking, online communities, academic discussion platforms, collaboration tools, and resource-sharing platforms — but with a dedicated focus on **medical education**.

> **Synora is not a social media platform.**
> Every feature is designed around academic collaboration, knowledge sharing, research, and student growth.

---

## 🎯 Vision

Build a scalable academic ecosystem where medical students can:

* 📚 Learn from each other
* 🧑‍🏫 Teach and share knowledge
* 🤝 Find study partners
* 💬 Discuss academic topics
* 📄 Share notes and resources
* 🧠 Practice and prepare for exams
* 🔬 Collaborate on research
* 👥 Join study groups
* 🌐 Build academic networks
* 🏆 Recognize meaningful contributions

---

## 👥 Target Users

### Primary Users

* MBBS students
* BDS students
* Nursing students
* Pharmacy students
* Physiotherapy students

### Future Expansion

The platform is designed to eventually support:

* Doctors
* Professors
* Researchers
* Medical institutions
* Hospitals

---

# ✨ Planned Features

## 🔐 Authentication

* User registration
* Login / logout
* JWT authentication
* Protected routes
* Persistent login
* Password hashing
* Remember me
* Role-based authorization
* Future OAuth support

---

## 👤 Student Profiles

Each student can build an academic profile containing:

* Profile picture
* Cover image
* Full name
* Bio
* College
* Course
* Academic year
* Country / State
* Subjects
* Skills
* Languages
* Interests
* Research interests
* Achievements
* Certificates
* Social links
* Followers / Following
* Academic statistics

---

## 🏠 Dashboard

The dashboard will provide a personalized overview of:

* Recent posts
* Suggested students
* Trending subjects
* Recent resources
* Study groups
* Connection requests
* Notifications
* Leaderboard
* Upcoming exams
* Recent discussions
* Quick actions

---

## 🔎 Discover & Peer Matching

Students can discover other students using filters such as:

* College
* Country
* State
* Course
* Academic year
* Subjects
* Skills
* Research interests
* Languages
* Online status

Students can also be matched based on:

* Same college
* Same academic year
* Same subjects
* Shared interests
* Same exams
* Research interests
* Mentorship
* Location

---

## 📚 Subjects

Each subject can contain:

* Subject information
* Notes
* Resources
* MCQs
* Videos
* Clinical cases
* Discussions
* Top contributors

---

## 📁 Resource Sharing

Students can upload and discover:

* PDFs
* PPTs
* Images
* Books
* Handwritten notes
* Clinical cases
* Lab records
* Previous question papers
* Reference materials

Resources will support:

* Tags
* Views
* Downloads
* Likes
* Bookmarks
* Comments
* Subject categorization

---

## 📝 Academic Feed

Students can publish:

* Questions
* Study notes
* Clinical cases
* Articles
* Exam tips
* Research updates
* Images
* Polls

Posts support:

* Likes
* Comments
* Replies
* Bookmarks
* Sharing
* Reporting

---

## 💬 Real-Time Communication

### One-to-One Chat

* Real-time messaging
* Typing indicators
* Seen status
* Online status
* Image sharing
* Document sharing

### Group Chat

* Group conversations
* Member management
* Real-time messaging

### Future

* Voice messages
* Video calling

---

## 👥 Study Groups

Students can:

* Create study groups
* Invite members
* Share announcements
* Discuss topics
* Share resources
* Create assignments

---

## 🔍 Global Search

Search across:

* Students
* Subjects
* Resources
* Groups
* Posts
* Colleges

---

## 🔔 Notifications

Real-time notifications for:

* Messages
* Likes
* Comments
* Connection requests
* Accepted requests
* Mentions
* Study group invitations
* Resource uploads
* Exam reminders

---

## 🏆 Gamification

Meaningful academic participation can be recognized through:

* Experience points
* Badges
* Ranks
* Contributor recognition
* Weekly leaderboards
* Certificates

---

# 🤖 Future AI Features

AI functionality is **not part of the initial implementation**.

The architecture will be designed to allow future integration of:

* Note summarization
* Flashcard generation
* Quiz generation
* Study planning
* Medical dictionary
* Research assistant
* AI tutor

---

# 🛡️ Security

Security is a core part of the platform.

Planned security measures include:

* JWT authentication
* Secure password hashing
* Rate limiting
* Helmet
* CORS configuration
* Input validation
* Input sanitization
* Secure file validation
* Role-based authorization
* Audit logging

---

# 🏗️ Architecture

```text
┌──────────────────────────────┐
│        React Frontend        │
│     TypeScript + Vite        │
└──────────────┬───────────────┘
               │
               │ REST API
               ▼
┌──────────────────────────────┐
│       Express Backend        │
│          Node.js             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         Prisma ORM           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         PostgreSQL           │
└──────────────────────────────┘

        ┌─────────────────┐
        │   Cloudinary    │
        │ Files & Images  │
        └─────────────────┘

        ┌─────────────────┐
        │    Socket.IO    │
        │ Real-time Data  │
        └─────────────────┘
```

The backend follows a clean separation of concerns between:

* Controllers
* Services
* Routes
* Middleware
* Validation
* Utilities
* Configuration

---

# 🧰 Tech Stack

## Frontend

| Technology       | Purpose                 |
| ---------------- | ----------------------- |
| React            | UI                      |
| TypeScript       | Type safety             |
| Vite             | Development & build     |
| Tailwind CSS     | Styling                 |
| Redux Toolkit    | Global state            |
| React Query      | Server state            |
| Axios            | API communication       |
| React Hook Form  | Forms                   |
| Zod              | Validation              |
| React Router DOM | Routing                 |
| Socket.IO Client | Real-time communication |

## Backend

| Technology    | Purpose                    |
| ------------- | -------------------------- |
| Node.js       | Runtime                    |
| Express.js    | API framework              |
| TypeScript    | Type safety                |
| Prisma        | ORM                        |
| PostgreSQL    | Database                   |
| JWT           | Authentication             |
| bcrypt        | Password hashing           |
| Socket.IO     | Real-time communication    |
| Cloudinary    | File & image storage       |
| Multer        | File uploads               |
| Helmet        | HTTP security              |
| Rate Limiting | API protection             |
| CORS          | Cross-origin configuration |

## Deployment

```text
Frontend  → Vercel
Backend   → Railway / Render
Database  → PostgreSQL
Storage   → Cloudinary
```

---

# 🗄️ Database

Synora will use a scalable, normalized PostgreSQL database managed through Prisma.

Core entities include:

```text
Users
Profiles
Connections
Connection Requests
Posts
Comments
Replies
Likes
Bookmarks
Subjects
Resources
Groups
Members
Messages
Notifications
Achievements
Badges
Reports
```

Relationships will use proper foreign keys and Prisma relations.

---

# 📂 Project Structure

```text
synora/
│
├── frontend/
│   └── src/
│       ├── api/
│       ├── assets/
│       ├── components/
│       ├── config/
│       ├── contexts/
│       ├── features/
│       ├── hooks/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── store/
│       ├── styles/
│       ├── types/
│       └── utils/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── sockets/
│   │   └── utils/
│   │
│   ├── prisma/
│   └── uploads/
│
└── README.md
```

---

# 🎨 UI / UX Principles

Synora aims for a:

* Modern interface
* Minimal design
* Professional experience
* Medical education-focused visual identity
* Responsive layout
* Accessible interface
* Desktop-first experience
* Tablet support
* Mobile support
* Dark-mode-ready design

The interface will use:

* Clean typography
* Rounded cards
* Soft visual styling
* Loading skeletons
* Empty states
* Error states
* Toast notifications
* Subtle animations

---

# 💻 Development Approach

Synora is being developed incrementally.

Every feature should follow this development flow:

```text
1. Database Schema
        ↓
2. API Endpoints
        ↓
3. Backend Logic
        ↓
4. Validation
        ↓
5. Frontend UI
        ↓
6. State Management
        ↓
7. API Integration
        ↓
8. Responsive Design
        ↓
9. Error Handling
        ↓
10. Testing
```

The goal is to build each feature completely rather than implementing disconnected pieces.

---

# 📏 Development Principles

The project follows these principles:

* TypeScript-first development
* Reusable components
* Feature-based architecture
* Separation of concerns
* SOLID principles
* Consistent naming conventions
* Environment variables for configuration
* API layer separation
* Production-oriented error handling
* No unnecessary duplication
* No deprecated libraries
* No inline styles
* Reusable custom hooks
* Maintainable folder structure

---

# 🚀 Getting Started

> The project is currently under active development.

Once the initial project structure is available:

### 1. Clone the repository

```bash
git clone https://github.com/JS152005/synora.git
cd synora
```

### 2. Install dependencies

Frontend:

```bash
cd frontend
npm install
```

Backend:

```bash
cd ../backend
npm install
```

### 3. Configure environment variables

Create the required `.env` files for:

```text
Database
JWT
Cloudinary
API configuration
Other application secrets
```

Never commit `.env` files or production secrets to GitHub.

### 4. Start the development servers

Frontend:

```bash
npm run dev
```

Backend:

```bash
npm run dev
```

> Setup commands may change as development progresses.

---

# 🛣️ Roadmap

### Phase 1 — Foundation

* [ ] Project setup
* [ ] Frontend architecture
* [ ] Backend architecture
* [ ] PostgreSQL setup
* [ ] Prisma setup
* [ ] Authentication
* [ ] User profiles

### Phase 2 — Core Collaboration

* [ ] Connections
* [ ] Discover students
* [ ] Search
* [ ] Subjects
* [ ] Resources
* [ ] Bookmarks
* [ ] Feed

### Phase 3 — Communication

* [ ] One-to-one messaging
* [ ] Group messaging
* [ ] Real-time notifications
* [ ] Study groups

### Phase 4 — Community

* [ ] Discussions
* [ ] Clinical cases
* [ ] Academic contributions
* [ ] Gamification
* [ ] Leaderboards

### Phase 5 — Administration

* [ ] Admin dashboard
* [ ] Moderation
* [ ] Reports
* [ ] College verification
* [ ] Platform analytics

### Phase 6 — Future Intelligence

* [ ] AI note summarization
* [ ] AI flashcard generation
* [ ] AI quiz generation
* [ ] AI study planner
* [ ] Research assistant
* [ ] AI tutor

---

# 🤝 Contributing

Contributions are welcome.

If you would like to contribute:

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Make your changes
4. Test your changes
5. Commit your changes

```bash
git commit -m "feat: add your feature"
```

6. Push the branch

```bash
git push origin feature/your-feature
```

7. Open a Pull Request

Please keep contributions focused, documented, tested, and consistent with the project's architecture.

---

# 🔒 Security

If you discover a security vulnerability, please **do not open a public GitHub issue with sensitive details**.

Instead, contact the project maintainer privately with information about the vulnerability and steps to reproduce it.

---

# 📄 License

License information will be added as the project reaches its initial release.

---

# 🌟 Project Status

**Status:** 🚧 Active Development

Synora is currently being built from the ground up.

The architecture and feature set may evolve as development progresses.

---

## 🎯 Long-Term Goal

Synora aims to become a scalable academic collaboration ecosystem for medical students — combining:

```text
Professional Networking
        +
Academic Communities
        +
Knowledge Sharing
        +
Study Collaboration
        +
Research Collaboration
        +
Resource Sharing
```

into one platform designed specifically for **medical education**.

---

## 👨‍💻 Author

**Jothi Prakash B S**

GitHub: [@JS152005](https://github.com/JS152005)

---

⭐ If you find Synora interesting, consider giving the repository a star and following the project as it develops.
