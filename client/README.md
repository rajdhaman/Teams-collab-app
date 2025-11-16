# Kriscent Teams Client

A modern, fully-featured React + TypeScript frontend for the Kriscent Teams real-time collaboration platform.

## Features

- ✅ **Authentication** - Firebase email/password auth with secure token management
- ✅ **Dashboard** - Projects overview and quick access
- ✅ **Kanban Board** - Drag-and-drop task management with real-time updates
- ✅ **Real-time Chat** - Socket.IO powered team messaging
- ✅ **Responsive Design** - Beautiful UI that works on all devices
- ✅ **Dark Mode** - Automatic theme switching with persistence
- ✅ **Role-based UI** - ADMIN, MANAGER, MEMBER visibility controls
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Modern Stack** - React 18, Vite, Tailwind CSS, Shadcn UI

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite (Lightning-fast builds)
- **Styling**: Tailwind CSS + Shadcn UI components
- **State Management**: Zustand
- **HTTP Client**: Axios with interceptors
- **Real-time**: Socket.IO client
- **Drag & Drop**: React Beautiful DnD
- **Authentication**: Firebase Auth
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Node.js 18+
- Backend server running on `http://localhost:3001`
- Firebase project configured

### Installation

```bash
cd client
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
# API & Socket
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
npm run dev
```

The app will start at `http://localhost:5173` with hot module reloading.

### Build for Production

```bash
npm run build
```

Optimized build output goes to `dist/`.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/          # Header, Sidebar
│   ├── ui/              # Shadcn components (Button, Card, Input, etc.)
│   ├── dialogs/         # Create/Edit dialogs
│   └── tasks/           # Task-specific components
├── pages/               # Page components (Login, Dashboard, Kanban, Chat)
├── services/            # API & Firebase services
├── hooks/               # Custom hooks (useAuth, useSocket)
├── store/               # Zustand global state
├── utils/               # Helpers (formatting, colors, cn utility)
├── types/               # TypeScript types
├── App.tsx              # Main app + routing
└── main.tsx             # Entry point

```

## Key Components

### Pages

- **LoginPage** - Firebase email/password authentication
- **RegisterPage** - User registration with team creation
- **DashboardPage** - Projects list and overview
- **KanbanPage** - Drag-and-drop Kanban board
- **ChatPage** - Real-time team messaging

### Layout

- **Header** - Navigation, user info, dark mode toggle, logout
- **Sidebar** - Main navigation menu

### Features

**Kanban Board**

- Drag tasks between TODO, IN_PROGRESS, DONE columns
- Real-time updates via Socket.IO
- Priority and due date display
- Task assignments

**Chat**

- Real-time messaging with Socket.IO
- Message history pagination
- Typing indicators
- User presence

**Responsive Design**

- Mobile-first approach
- Sidebar collapses on small screens
- Touch-friendly interactions
- Optimized layouts for all device sizes

## Styling

Using **Tailwind CSS** with custom Shadcn UI components:

- Dark mode support with `dark:` classes
- CSS variables for consistent theming
- Custom scrollbar styling
- Smooth animations and transitions

## Authentication Flow

1. User registers/logs in via Firebase
2. Firebase returns ID token
3. Token stored in localStorage
4. Backend validates token on each request
5. Axios interceptor adds token to headers
6. On 401, redirect to login

## Real-time Communication

**Socket.IO Events:**

- `join-team` - User joins team room
- `send-message` - New message broadcast
- `task-updated` - Task status change
- `task-deleted` - Task deleted
- `typing` - User is typing
- `stop-typing` - User stopped typing

## State Management (Zustand)

Global state includes:

- `user` - Current logged-in user
- `projects` - User's projects
- `tasks` - Current project's tasks
- `selectedProjectId` - Active project
- `darkMode` - Theme preference
- `sidebarOpen` - Sidebar visibility

## API Integration

All API calls use Axios with:

- Automatic Bearer token injection
- Base URL configured to backend
- Error handling with 401 redirects
- Response standardization

See `services/api.ts` for interceptor configuration.

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Set environment variables in Vercel dashboard.

### Netlify

```bash
npm run build
```

Deploy `dist/` folder to Netlify.

### Docker

```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

## Performance Tips

1. **Code Splitting** - Vite automatically code-splits routes
2. **Image Optimization** - Use optimized images
3. **Lazy Loading** - React Router v6 lazy code loading
4. **Bundle Analysis** - `npm run analyze`
5. **Caching** - Leverage browser caching with proper headers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Guide

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Use `useAuth()` for auth state
4. Use services for API calls
5. Use Zustand for global state

### Adding a New Component

1. Create in `src/components/`
2. Use Tailwind classes for styling
3. Accept props with TypeScript
4. Export from component directory index (if needed)

### Adding a New API Service

1. Create in `src/services/`
2. Use `api` axios instance
3. Define TypeScript interfaces
4. Export functions

## Troubleshooting

### "Failed to fetch" errors

- Check backend is running on `http://localhost:3001`
- Verify CORS is enabled on backend
- Check environment variables

### Socket.IO connection issues

- Ensure Socket.IO is configured correctly on backend
- Check WebSocket is enabled in firewall
- Verify `VITE_SOCKET_URL` environment variable

### Authentication failures

- Verify Firebase credentials in .env
- Check backend Token validation
- Clear localStorage and retry login

### Styling issues

- Ensure Tailwind is processing all files
- Check dark mode class on `<html>` element
- Verify CSS file is imported in main.tsx

## Contributing

1. Create feature branch
2. Make changes with TypeScript types
3. Test in browser
4. Submit pull request

## Future Enhancements

- [ ] File uploads & attachments
- [ ] Activity timeline & audit logs
- [ ] Advanced search & filtering
- [ ] Notifications center
- [ ] Email notifications
- [ ] Team management UI
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

## License

MIT - See LICENSE file

## Support

For issues and questions:

- GitHub Issues
- Discord community
- Documentation site

---

**Happy coding!** 🚀
