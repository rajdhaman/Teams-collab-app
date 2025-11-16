# Kriscent Teams App — Real-Time Team Collaboration Platform

![Status](https://img.shields.io/badge/Status-Full%20Stack-brightgreen)  
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)  
![React](https://img.shields.io/badge/React-18-blue)  
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)  
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)  
![Firebase](https://img.shields.io/badge/Firebase-9.0-orange)  
![License](https://img.shields.io/badge/License-MIT-blue)

A comprehensive, full-stack real-time team collaboration platform with project management, Kanban task tracking, live chat, and **AI-assisted natural-language task management**. Built with Node.js + Express + MongoDB on the backend and React + TypeScript + Vite on the frontend.

## 🎯 Key Features

### ✅ Implemented

#### Backend
- **Authentication & Authorization**
  - Firebase ID token verification
  - Role-based access control (ADMIN, MANAGER, MEMBER)
  - Protected API endpoints with middleware
  - User registration and login flows

- **Project Management**
  - Create, read, update, delete projects
  - Project status tracking (active, archived, completed)
  - Team-scoped project access

- **Task Management**
  - Kanban-style task tracking (TODO → IN_PROGRESS → DONE)
  - Task assignment and priority levels (LOW, MEDIUM, HIGH)
  - Due dates and task descriptions
  - Position-based ordering for drag-and-drop

- **Real-Time Communication**
  - Live team chat with Socket.IO
  - Message history with pagination
  - Typing indicators and presence tracking
  - Read receipts

- **Validation & Error Handling**
  - Comprehensive Joi input validation
  - Consistent JSON error responses
  - Role-based permission checks
  - Team membership verification

#### Frontend
- **Authentication & UI**
  - Firebase authentication with email/password
  - Protected routes with auth guards
  - Responsive login/register pages
  - User profile display with role badges

- **Dashboard & Navigation**
  - Collapsible sidebar (desktop: toggles between icon-only and full width)
  - Responsive header with user info and quick actions
  - Mobile-friendly drawer navigation
  - Dark mode toggle with localStorage persistence

- **Project Management UI**
  - Project list with creation dialog
  - Project detail views
  - Edit/delete project dialogs
  - Status and member information

- **Task Management UI**
  - Kanban board with drag-and-drop (react-beautiful-dnd)
  - Task creation and editing dialogs
  - Task cards with assignee, priority, due date
  - Status transitions (TODO → IN_PROGRESS → DONE)
  - Responsive grid layout on mobile

- **Team Management**
  - View team members and roles
  - Role editing (ADMIN only)
  - Member removal capabilities
  - Role permissions reference guide
  - Mobile-responsive member cards

- **Chat Interface**
  - Real-time message display
  - Message input with send button
  - User presence indicators
  - Message history

- **🆕 Built-in AI Assistant**
  - Natural language task commands
  - Support for:
    - `create task <title> | description: ...`
    - `complete task <title>`
    - `delete task <title>`
  - Intelligent parsing with friendly feedback
  - Dialog interface with command history
  - Live response messages

### ⏳ Coming Soon
- Advanced task filtering & search
- Activity timeline & audit logs
- File attachments & rich media
- Email notifications
- Fuzzy task matching in assistant
- GPT/LLM integration for smarter NLP

---

## 📚 Documentation

| Document                                                             | Purpose                                                        |
| -------------------------------------------------------------------- | -------------------------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)                                 | Complete system design, schemas, flows, and decision rationale |
| [server/README.md](./server/README.md)                               | Backend setup, API reference, testing guide, and deployment    |
| [POSTMAN_COLLECTION.json](./POSTMAN_COLLECTION.json)                 | Ready-to-import Postman collection for API testing             |
| [.github/copilot-instructions.md](./.github/copilot-instructions.md) | AI agent guidelines for development                            |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **npm** 9+ or **yarn**
- **MongoDB Atlas** (free cluster)
- **Firebase Project** (for authentication)
- **Git**

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/Kriscent-teams-app.git
cd Kriscent-teams-app
```

### 2️⃣ Backend Setup (5 minutes)

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/teamcollab
DB_NAME=teamcollab
CLIENT_URL=http://localhost:5173

# Firebase (get from Firebase Console → Project Settings → Service Account)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

Start backend:

```bash
npm run dev
```

**Verify** (in another terminal):

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "OK",
  "timestamp": "2025-11-16T12:00:00.000Z",
  "uptime": 12.345
}
```

### 3️⃣ Frontend Setup (5 minutes)

```bash
cd ../client
npm install
```

Create `client/.env.local`:

```env
VITE_API_URL=http://localhost:3001
VITE_FIREBASE_CONFIG_KEY=your_firebase_key
```

Start frontend dev server:

```bash
npm run dev
```

**Access the app:**

- Open `http://localhost:5173` in your browser
- Login with Firebase credentials
- Start creating projects and tasks!

### 4️⃣ Full-Stack Verification

| Component | Command | Verify |
|-----------|---------|--------|
| Backend | `npm run dev` (in `server/`) | `http://localhost:3001/health` → 200 OK |
| Frontend | `npm run dev` (in `client/`) | `http://localhost:5173` → Login page loads |
| MongoDB | MongoDB Atlas dashboard | Green connection indicator |
| Firebase | Firebase Console | Active project with users |

---

## 📋 Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18+ | JavaScript runtime |
| **Express.js** | 5.x | Web framework |
| **MongoDB** | 6.0+ | NoSQL database |
| **Mongoose** | 8.x | MongoDB ODM |
| **Firebase Admin SDK** | 12.x | Authentication & Authorization |
| **Socket.IO** | 4.x | Real-time bidirectional communication |
| **Joi** | 17.x | Data validation schema |
| **Helmet** | 7.x | Security headers |
| **CORS** | 2.x | Cross-origin request handling |
| **Express Rate Limiter** | 7.x | Rate limiting (100 req/15 min) |
| **dotenv** | 16.x | Environment variable management |
| **Jest** | 29.x | Testing framework (dev) |
| **Supertest** | 6.x | HTTP assertion library (dev) |
| **Nodemon** | 3.x | Auto-restart on changes (dev) |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.x | UI library |
| **TypeScript** | 5.x | Type safety |
| **Vite** | 5.x | Build tool & dev server |
| **React Router** | 6.x | Client-side routing |
| **Tailwind CSS** | 3.x | Utility-first CSS framework |
| **Shadcn/UI** | Latest | Pre-built React components |
| **Socket.IO Client** | 4.x | Real-time client |
| **Firebase** | 10.x | Authentication SDK |
| **React Beautiful DnD** | 13.x | Drag-and-drop UI primitives |
| **Lucide React** | 0.x | Icon library |
| **Zustand** | 4.x | State management |
| **Axios** | 1.x | HTTP client |
| **ESLint** | 8.x | Code quality (dev) |
| **Prettier** | 3.x | Code formatter (dev) |

### DevOps & Deployment

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **MongoDB Atlas** | Cloud database | 512 MB |
| **Firebase** | Auth & Hosting | Yes (generous free tier) |
| **Render.com** | Backend hosting | Yes (auto-sleeps after 15 min inactivity) |
| **Vercel** | Frontend hosting | Yes (with GitHub integration) |
| **GitHub** | Version control | Yes |

---

## 🆕 Extra Features

### 1. **AI-Assisted Task Management (Built-in Assistant)**

A natural language interface for managing tasks without clicking through dialogs.

**How to Use:**

1. Click the **chat bubble icon** in the header
2. Enter a natural language command:
   - `create task Write monthly report | description: Summary of progress`
   - `complete task Write monthly report`
   - `delete task Write monthly report`
3. Click **Run** to execute
4. View results in the conversation history

**Under the Hood:**

- Simple regex-based parser that recognizes task operations
- Maps commands to existing `taskService` API calls
- Real-time feedback with success/error messages
- Task matching is case-insensitive by title

**Future Enhancements:**

- Fuzzy task matching with similarity scoring
- Confirmation dialogs for destructive operations
- Integration with GPT/Claude for smarter parsing
- Support for more commands (assign task, set priority, etc.)
- Voice input via Web Speech API

### 2. **Responsive Sidebar**

Smart navigation that adapts to screen size:

- **Desktop (lg+):** Full sidebar with toggle (icon-only ↔ full-width)
- **Mobile:** Drawer that slides in from left, closes on navigation
- **Smooth Transitions:** CSS transitions between states
- **Persistent State:** Desktop collapse state saved in Zustand store

**Components:**

- `Sidebar.tsx` — Main navigation component
- `appStore.ts` — `desktopSidebarOpen` state management

### 3. **Responsive Team Member Cards**

Mobile-optimized team management interface:

- **Desktop View:** Horizontal layout with inline controls
- **Mobile View:** Vertical stacking with full-width buttons
- **Adaptive Text:** Smaller fonts on mobile, larger on desktop
- **Smart Badge Placement:** Role badge visible on mobile header
- **Truncation:** Text truncates gracefully on small screens

**Responsive Breakpoints:**

- Mobile: `< md` (640px)
- Tablet/Desktop: `md+` (640px+)

### 4. **Dark Mode Toggle**

Professional dark theme with localStorage persistence:

- Click sun/moon icon in header to toggle
- Uses Tailwind's `dark:` classes throughout
- Preference persists across sessions
- Smooth transitions between themes

### 5. **Role-Based UI Components**

Components that show/hide based on user role:

- Admin-only controls (delete, role change)
- Manager-specific actions
- Member-read-only sections
- Consistent permission display

### 6. **Real-Time Updates**

Socket.IO integration for live data:

- New messages appear instantly
- Task assignments update live
- User presence tracking
- No page refresh needed

---

## 📊 API Overview

### Authentication (4 endpoints)

```
POST   /api/auth/register       Register new user
POST   /api/auth/login          Login (ID token or email/password)
POST   /api/auth/role/:userId   Change user role (Admin only)
GET    /api/auth/me             Get current user
```

### Projects (5 endpoints)

```
GET    /api/projects            List team projects
POST   /api/projects            Create project (Admin/Manager)
GET    /api/projects/:id        Project details
PUT    /api/projects/:id        Update (Admin/Manager)
DELETE /api/projects/:id        Delete (Admin only)
```

### Tasks (6 endpoints)

```
GET    /api/tasks?projectId=X   List tasks
POST   /api/tasks?projectId=X   Create task
GET    /api/tasks/:id           Task details
PUT    /api/tasks/:id           Update (status, assignment, priority)
DELETE /api/tasks/:id           Delete task
```

### Messages (4 endpoints)

```
GET    /api/messages            Get chat history (paginated)
POST   /api/messages            Send message
DELETE /api/messages/:id        Delete message
PUT    /api/messages/:id/read   Mark as read
```

### Teams (3 endpoints)

```
GET    /api/teams/info          Get team information
GET    /api/teams/members       List team members
PUT    /api/teams/members/:id   Update member role
```

---

## 🔐 Role-Based Access Control

| Feature             | ADMIN | MANAGER | MEMBER |
| ------------------- | :---: | :-----: | :----: |
| View projects       |   ✓   |    ✓    |   ✓    |
| Create/edit project |   ✓   |    ✓    |   ✗    |
| Delete project      |   ✓   |    ✗    |   ✗    |
| Create task         |   ✓   |    ✓    |   ✓    |
| Edit own task       |   ✓   |    ✓    |   ✓    |
| Edit any task       |   ✓   |    ✓    |   ✗    |
| Assign task         |   ✓   |    ✓    |   ✓    |
| Delete task         |   ✓   |    ✓    |  Own   |
| Manage user roles   |   ✓   |    ✗    |   ✗    |
| Send messages       |   ✓   |    ✓    |   ✓    |
| Delete own message  |   ✓   |    ✓    |   ✓    |

---

## 🏗️ Project Structure

```
Kriscent-teams-app/
├── server/                              # Backend (Node.js + Express)
│   ├── config/
│   │   ├── db.js                       # MongoDB connection
│   │   └── firebase.js                 # Firebase admin initialization
│   ├── models/
│   │   ├── Users.js
│   │   ├── Team.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   └── Message.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── messageController.js
│   │   └── settingsController.js
│   ├── routes/
│   │   ├── authRoute.js
│   │   ├── projectRoute.js
│   │   ├── taskRoute.js
│   │   ├── messageRoute.js
│   │   └── teamRoute.js
│   ├── middlewares/
│   │   ├── auth.js                    # Firebase token verification
│   │   ├── validation.js              # Joi schema validation
│   │   └── roleCheck.js               # RBAC enforcement
│   ├── validators/
│   │   ├── authValidators.js
│   │   ├── projectValidators.js
│   │   ├── taskValidators.js
│   │   └── messageValidators.js
│   ├── socket/
│   │   └── socketHandler.js           # Socket.IO event handlers
│   ├── server.js                       # Express + Socket.IO entry point
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── client/                              # Frontend (React + TypeScript + Vite)
│   ├── public/                         # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── dialogs/
│   │   │   │   ├── CreateProjectDialog.tsx
│   │   │   │   ├── EditProjectDialog.tsx
│   │   │   │   ├── CreateTaskDialog.tsx
│   │   │   │   ├── EditTaskDialog.tsx
│   │   │   │   └── AssistantDialog.tsx         # 🆕 NLP Task Assistant
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx                 # Collapsible sidebar
│   │   │   │   └── Header.tsx
│   │   │   ├── tasks/
│   │   │   │   └── TaskCard.tsx
│   │   │   └── ui/
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Dialog.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Badge.tsx
│   │   │       └── ...
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   ├── TasksPage.tsx
│   │   │   ├── KanbanPage.tsx
│   │   │   ├── TeamPage.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── AnalyticsPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts                 # Axios instance
│   │   │   ├── authService.ts
│   │   │   ├── firebase.ts
│   │   │   ├── projectService.ts
│   │   │   ├── taskService.ts
│   │   │   ├── messageService.ts
│   │   │   ├── teamService.ts
│   │   │   └── settingsService.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts             # Auth context & user state
│   │   │   └── useSocket.ts           # Socket.IO connection
│   │   ├── store/
│   │   │   └── appStore.ts            # Zustand global state
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript interfaces
│   │   ├── utils/
│   │   │   ├── helpers.ts
│   │   │   └── dragDropUtils.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.local
│   ├── .eslintrc.cjs
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── README.md
│
├── ARCHITECTURE.md                     # System design & decision rationale
├── POSTMAN_COLLECTION.json            # API testing collection
├── README.md                           # This file (main project docs)
├── .gitignore
├── .github/
│   └── copilot-instructions.md        # AI development guidelines
└── LICENSE (MIT)
```

---

## 🧪 Testing

### Backend

```bash
cd server
npm test
```

Covers:
- Input validation (Joi schemas)
- CRUD operations
- Role-based access control
- Error handling
- Socket.IO broadcasting

### Frontend

```bash
cd client
npm test
```

Recommended tools:
- **Vitest** for unit tests
- **React Testing Library** for component tests
- **Cypress** for E2E tests

### Manual Testing

Use [POSTMAN_COLLECTION.json](./POSTMAN_COLLECTION.json):

1. Import into Postman
2. Set environment variables (auto-captured after login)
3. Run requests in sequence

### Real-Time Testing

Test Socket.IO in browser console:

```javascript
const socket = io("http://localhost:3001");
socket.emit("join-team", { teamId: "...", userId: "..." });
socket.on("message-received", (msg) => console.log("New message:", msg));
socket.emit("send-message", { teamId: "...", content: "Hello!" });
```

---

## 🚀 Deployment

### Quick Deploy (10 minutes)

#### Backend → Render.com

1. Push to GitHub
2. Create Web Service on Render
3. Connect GitHub repo
4. Add environment variables (`.env` contents)
5. Deploy → live at `https://your-app.onrender.com`

#### Frontend → Vercel

1. Connect GitHub repo to Vercel
2. Set `VITE_API_URL=https://your-app.onrender.com`
3. Deploy → auto-deploys on push

#### Database → MongoDB Atlas

1. Create M0 (free) cluster
2. Create database user
3. Whitelist Render.com IP
4. Use connection string in backend `.env`

---

## 🔒 Security

### Implemented

- [x] Firebase ID token verification
- [x] Role-based access control (RBAC)
- [x] Input validation (Joi on all endpoints)
- [x] CORS restricted to CLIENT_URL
- [x] Rate limiting (100 req/15 min)
- [x] Mongoose ODM (prevents SQL injection)
- [x] Helmet.js security headers
- [x] Team membership verification

### Future

- [ ] HTTPS + TLS
- [ ] 2FA/MFA
- [ ] Audit logging
- [ ] IP whitelisting
- [ ] Session management
- [ ] OWASP security audit

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make changes and test thoroughly
4. Commit: `git commit -m "feat: add X"`
5. Push and create pull request

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Add JSDoc comments for complex functions
- Test all new endpoints/components

---

## 📞 Support

- **Issues:** GitHub Issues
- **Docs:** [ARCHITECTURE.md](./ARCHITECTURE.md), [server/README.md](./server/README.md)
- **API Testing:** [POSTMAN_COLLECTION.json](./POSTMAN_COLLECTION.json)

---

## 📄 License

MIT License — see LICENSE file

---

## 🎯 Roadmap

### Phase 1: ✅ Core Complete

- [x] Backend API (20+ endpoints)
- [x] Frontend UI (React + TypeScript)
- [x] Real-time chat (Socket.IO)
- [x] Task management (Kanban)
- [x] Team management
- [x] Authentication (Firebase)

### Phase 2: ⏳ Enhanced Features

- [x] AI-assisted task assistant
- [x] Responsive sidebar
- [x] Dark mode
- [ ] Advanced search & filtering
- [ ] Activity timeline
- [ ] File uploads

### Phase 3: 🔜 Production Polish

- [ ] E2E tests (Cypress)
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG)
- [ ] Security audit (OWASP)
- [ ] OpenAPI/Swagger docs
- [ ] Desktop app (Electron)

---

<div align="center">

**Built with ❤️ by the Kriscent Team**

[GitHub](https://github.com/yourusername/Kriscent-teams-app) • [Docs](./ARCHITECTURE.md) • [API Reference](./server/README.md)

**Version:** 1.0 Full Stack Complete  
**Last Updated:** November 16, 2025

</div>
