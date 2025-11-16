# Kriscent Teams App — Complete Real-Time Collaboration Platform

A modern, full-stack team collaboration platform enabling multiple teams to manage projects, create and assign tasks, communicate in real-time, and track progress with role-based access control and AI-assisted task management.

**Status:** Full-stack implementation in progress  
**Tech Stack:** Node.js + Express + MongoDB + Socket.IO | React + TypeScript + Tailwind CSS

---

## 🚀 Quick Start

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Fill in Firebase credentials and MongoDB Atlas URI
npm run dev  # Start with nodemon on port 3001
```

**Required Environment Variables** (`.env`):

```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/teamcollab
DB_NAME=teamcollab
CLIENT_URL=http://localhost:5173

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

# Optional: For server-side email/password login
FIREBASE_API_KEY=AIzaSy...your_web_api_key
```

### Frontend Setup (TODO — Coming Soon)

```bash
cd client
npm install
cp .env.example .env
npm run dev  # Start Vite dev server on port 5173
```

### Health Check

```bash
curl http://localhost:3001/health
# Expected: { "status": "OK", "timestamp": "...", "uptime": ... }
```

---

## 📋 Features Implemented

### ✅ Backend Complete

#### Authentication & Authorization

- [x] Firebase ID token verification
- [x] Role-based access control (ADMIN, MANAGER, MEMBER)
- [x] User registration with automatic team assignment (Admin for new teams, Member for existing)
- [x] Login support (ID token + optional email/password via REST)
- [x] Protected routes with `authenticate` + `roleCheck` middleware
- [x] Role assignment endpoint (Admin only)

#### Projects API

- [x] GET `/api/projects` — List team projects
- [x] POST `/api/projects` — Create project (Admin/Manager)
- [x] GET `/api/projects/:id` — Project details
- [x] PUT `/api/projects/:id` — Update project (Admin/Manager)
- [x] DELETE `/api/projects/:id` — Delete project (Admin)

#### Tasks API

- [x] GET `/api/tasks?projectId=X` — List tasks with filtering
- [x] POST `/api/tasks` — Create task
- [x] GET `/api/tasks/:id` — Task details
- [x] PUT `/api/tasks/:id` — Update task (status, assignment, priority)
- [x] DELETE `/api/tasks/:id` — Delete task
- [x] Kanban status: TODO → IN_PROGRESS → DONE

#### Messages API

- [x] POST `/api/messages` — Send chat message
- [x] GET `/api/messages?limit=50&skip=0` — Fetch chat history with pagination
- [x] DELETE `/api/messages/:id` — Delete message (sender/admin)
- [x] PUT `/api/messages/:id/read` — Mark as read

#### Real-Time Events (Socket.IO)

- [x] `join-team` — User joins team room
- [x] `send-message` — Chat message broadcast
- [x] `message-received` — Broadcast new message to team
- [x] `task-updated` — Notify team of task changes
- [x] `task-deleted` — Notify team of task deletion
- [x] `user-typing` — Typing indicator
- [x] `user-joined` / `user-left` — User presence

#### Validation & Error Handling

- [x] Joi validators for all inputs (projects, tasks, messages, auth)
- [x] Consistent JSON error responses with status codes
- [x] Role-based permission checks on protected endpoints
- [x] Team membership verification

#### Database Schemas

- [x] User (Firebase UID, email, name, role, teamId, isActive)
- [x] Team (name, members, adminId, timestamps)
- [x] Project (name, description, teamId, status, createdBy)
- [x] Task (title, description, status, projectId, assignedTo, priority, dueDate, position)
- [x] Message (content, senderId, teamId, messageType, readBy, timestamps)
- [x] Compound indexes for query performance

---

### ⏳ Frontend (TODO — Next Phase)

Will include:

- React 18 + TypeScript setup with Vite
- Firebase Auth UI (login/registration)
- Protected routes with role-based guards
- Dashboard with project/task management
- Kanban board with React Beautiful DnD
- Real-time chat component
- Team member management
- Natural language assistant interface
- Dark mode + responsive design
- Tailwind CSS + Shadcn UI

---

## 📊 API Endpoints Reference

### Authentication

```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # Login (ID token or email/password)
POST   /api/auth/role/:userId    # Change user role (Admin only)
GET    /api/auth/me              # Get current user
```

### Projects

```
GET    /api/projects             # All team projects
POST   /api/projects             # Create (Admin/Manager)
GET    /api/projects/:id         # Project details
PUT    /api/projects/:id         # Update (Admin/Manager)
DELETE /api/projects/:id         # Delete (Admin)
```

### Tasks

```
GET    /api/tasks?projectId=X    # Tasks in project
POST   /api/tasks?projectId=X    # Create task
GET    /api/tasks/:id            # Task details
PUT    /api/tasks/:id            # Update (status, assignment, priority)
DELETE /api/tasks/:id            # Delete
```

### Messages

```
GET    /api/messages             # Team chat (paginated)
POST   /api/messages             # Send message
DELETE /api/messages/:id         # Delete message
PUT    /api/messages/:id/read    # Mark as read
```

---

## 🔐 Role-Based Access Control (RBAC)

| Action             | ADMIN | MANAGER | MEMBER |
| ------------------ | ----- | ------- | ------ |
| View projects      | ✓     | ✓       | ✓      |
| Create project     | ✓     | ✓       | ✗      |
| Edit project       | ✓     | ✓       | ✗      |
| Delete project     | ✓     | ✗       | ✗      |
| Create task        | ✓     | ✓       | ✓      |
| Edit own task      | ✓     | ✓       | ✓      |
| Assign task        | ✓     | ✓       | ✓      |
| Delete task        | ✓     | ✓       | Own    |
| Manage roles       | ✓     | ✗       | ✗      |
| Send message       | ✓     | ✓       | ✓      |
| Delete own message | ✓     | ✓       | ✓      |

---

## 📡 Socket.IO Real-Time Events

### Client → Server

```javascript
// Join team/project
socket.emit("join-team", { teamId, userId });
socket.emit("leave-team", { teamId, userId });

// Messaging
socket.emit("send-message", { teamId, content, senderId });

// Task updates
socket.emit("task-updated", { teamId, task });
socket.emit("task-deleted", { teamId, taskId });

// Presence
socket.emit("typing", { teamId, userId, userName });
socket.emit("stop-typing", { teamId, userId });
```

### Server → Client

```javascript
socket.on("message-received", (msg) => {
  /* new message */
});
socket.on("task-changed", (data) => {
  /* task update */
});
socket.on("task-removed", (data) => {
  /* task deleted */
});
socket.on("user-joined", (data) => {
  /* user online */
});
socket.on("user-left", (data) => {
  /* user offline */
});
socket.on("user-typing", (data) => {
  /* typing bubble */
});
socket.on("user-stopped-typing", (data) => {
  /* hide bubble */
});
```

---

## 🧪 Testing the Backend

### Manual Testing with Postman

1. **Register a user:**

   - POST `http://localhost:3001/api/auth/register`
   - Body: `{ "email": "alice@example.com", "password": "SecurePass123!", "name": "Alice", "teamName": "Acme Team" }`
   - Response: User created with role ADMIN (new team) or MEMBER (existing team)

2. **Login with ID token:**

   - Get ID token from Firebase client SDK or REST API
   - POST `http://localhost:3001/api/auth/login`
   - Body: `{ "idToken": "eyJ..." }`
   - Response: User object with role and populated teamId

3. **Create a project:**

   - POST `http://localhost:3001/api/projects`
   - Headers: `Authorization: Bearer <idToken>`
   - Body: `{ "name": "Q4 Planning", "description": "2024 Q4 initiatives" }`
   - Expected: 201 with project object

4. **Create a task:**

   - POST `http://localhost:3001/api/tasks?projectId=64a0f...`
   - Headers: `Authorization: Bearer <idToken>`
   - Body: `{ "title": "Design homepage", "priority": "HIGH", "dueDate": "2025-12-31" }`
   - Expected: 201 with task object

5. **Send a message:**

   - POST `http://localhost:3001/api/messages`
   - Headers: `Authorization: Bearer <idToken>`
   - Body: `{ "content": "Great work on the UI!" }`
   - Expected: 201 with message object (saved to DB + broadcast via Socket.IO)

6. **Update task status:**
   - PUT `http://localhost:3001/api/tasks/<taskId>`
   - Headers: `Authorization: Bearer <idToken>`
   - Body: `{ "status": "IN_PROGRESS" }`
   - Expected: 200 with updated task

### Unit & Integration Tests (Jest)

```bash
cd server
npm test
```

Tests include:

- Validator schema validation
- Controller logic (create/read/update/delete)
- RBAC enforcement
- Error handling
- Socket.IO event broadcasting

---

## 🔧 Architecture Highlights

### Middleware Stack

1. **helmet** — Security headers
2. **CORS** — Cross-origin request handling (CLIENT_URL)
3. **body parser** — JSON request body parsing
4. **rate limiter** — 100 requests per 15 minutes on `/api/` routes
5. **validate** — Joi schema validation (attaches to `req.validatedBody`)
6. **authenticate** — Firebase ID token verification (attaches to `req.user`, `req.userId`, `req.userRole`, `req.teamId`)
7. **roleCheck** — Role-based authorization

### Project Structure

```
server/
├── config/
│   ├── db.js         # MongoDB connection
│   └── firebase.js   # Firebase Admin SDK
├── models/           # Mongoose schemas
│   ├── User.js, Team.js, Project.js, Task.js, Message.js
├── controllers/      # Business logic
├── routes/           # API endpoints
├── middlewares/      # Auth, validation, role checks
├── validators/       # Joi schemas
├── socket/           # Socket.IO handlers
└── server.js         # Express + Socket.IO entrypoint
```

---

## 🚀 Deployment

### Backend Deployment (Render.com)

1. Push code to GitHub
2. Connect Render to repo
3. Set environment variables (Firebase, MongoDB Atlas, CORS origin)
4. Deploy on push to `main`
5. Backend will be live at `https://your-app.onrender.com`

### Frontend Deployment (Vercel)

1. Create React app in `/client`
2. Connect GitHub repo to Vercel
3. Set `REACT_APP_API_URL=https://your-app.onrender.com` env var
4. Deploy — automatic on push

### Database (MongoDB Atlas)

1. Create M0 (free) or M5 cluster
2. Whitelist backend server IP
3. Create connection string: `mongodb+srv://user:password@cluster.mongodb.net/teamcollab`
4. Add to backend `.env` as `MONGO_URI`

---

## 📝 Next Steps

### Phase 2: Frontend Implementation

1. Create React app with Vite + TypeScript
2. Set up Firebase Auth UI
3. Build dashboard layout (sidebar, header)
4. Implement project management CRUD UI
5. Add Kanban board with drag-and-drop
6. Integrate Socket.IO for real-time chat
7. Add natural language assistant
8. Style with Tailwind CSS + Shadcn UI + dark mode

### Phase 3: Advanced Features

1. NLP assistant for task creation ("Create task X in project Y")
2. Task activity log and audit trail
3. User presence indicators
4. Rich message formatting (mentions, links, emoji)
5. File upload support
6. Notifications (desktop, email)
7. Advanced search and filtering

### Phase 4: Testing & Polish

1. E2E testing with Cypress
2. Performance optimization
3. Accessibility audit (WCAG)
4. Mobile responsiveness testing
5. Security audit (OWASP)
6. Bug fixes and refinements

---

## 🔒 Security Checklist

- [x] Firebase ID token verification
- [x] HTTPS enforcement (on deployed platforms)
- [x] CORS restricted to CLIENT_URL
- [x] Rate limiting on API routes
- [x] Input validation (Joi)
- [x] Role-based access control
- [x] No passwords logged or stored on server
- [x] Mongoose ORM (no SQL injection)
- [ ] HTTPS on development (add mkcert)
- [ ] Audit logging (future)
- [ ] 2FA support (future)
- [ ] Session timeout (future)

---

## 📦 Dependencies

### Backend (`package.json`)

```json
{
  "dependencies": {
    "express": "^5.1.0",
    "mongoose": "^8.19.4",
    "firebase-admin": "^13.6.0",
    "socket.io": "^4.8.1",
    "joi": "^18.0.1",
    "cors": "^2.8.5",
    "helmet": "^8.1.0",
    "express-rate-limit": "^8.2.1",
    "dotenv": "^17.2.3"
  },
  "devDependencies": {
    "nodemon": "^3.1.11",
    "jest": "^29.5.0",
    "supertest": "^6.3.3"
  }
}
```

### Frontend (coming)

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "typescript": "^5.3.0",
    "tailwindcss": "^3.4.0",
    "@shadcn/ui": "*",
    "react-beautiful-dnd": "^13.1.0",
    "socket.io-client": "^4.8.1",
    "firebase": "^10.8.0",
    "zustand": "^4.5.0",
    "react-query": "^3.39.3"
  }
}
```

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit with clear messages: `git commit -m "feat: add X feature"`
4. Push and create a pull request

---

## 📄 License

MIT

---

## 🎯 Key Learnings & Best Practices

1. **Separation of Concerns:** Middlewares, controllers, validators, and routes are clearly separated
2. **Reusable Patterns:** Auth, validation, and error handling middleware are DRY and composable
3. **Database Optimization:** Compound indexes on frequently queried fields
4. **Real-Time Architecture:** Socket.IO rooms for team isolation and efficient broadcasting
5. **Security First:** Input validation, role checks, and token verification on every protected endpoint
6. **Scalability:** Stateless API design allows horizontal scaling; Socket.IO namespace support for sharding

---

## 📞 Support

For issues, questions, or feature requests, please open a GitHub issue or contact the development team.

---

**Last Updated:** November 15, 2025  
**Version:** 1.0 (Backend Complete, Frontend Pending)
