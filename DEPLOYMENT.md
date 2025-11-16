# Kriscent Teams App — GitHub & Deployment Guide

Complete step-by-step instructions for pushing code to GitHub and deploying to production.

## 📋 Prerequisites

Before you start, have these ready:

- [GitHub Account](https://github.com/signup) (free)
- [Render.com Account](https://render.com/register) (free tier available)
- [Vercel Account](https://vercel.com/signup) (free with GitHub)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) (free cluster)
- [Firebase Project](https://console.firebase.google.com/) (already set up)
- Git installed (`git --version` to verify)

---

## 🚀 Step 1: Initialize Git & Push to GitHub (10 minutes)

### 1.1 Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. **Repository name:** `Kriscent-teams-app`
3. **Description:** Real-time team collaboration platform
4. **Public:** Yes (or Private if preferred)
5. **Initialize:** Don't initialize (we'll push existing code)
6. Click **Create repository**

### 1.2 Initialize Git Locally

```powershell
cd D:\Node_JS\Kriscent-teams-app

# Initialize git repository
git init

# Add all files (respects .gitignore)
git add .

# Create initial commit
git commit -m "feat: initial commit - full stack team collaboration platform"

# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/Kriscent-teams-app.git

# Push to GitHub (main branch)
git branch -M main
git push -u origin main
```

**Verify on GitHub:** Visit `https://github.com/YOUR_USERNAME/Kriscent-teams-app` and see all files uploaded ✅

### 1.3 Verify Files in GitHub

Your repo should contain:

```
README.md
.gitignore
POSTMAN_COLLECTION.json
ARCHITECTURE.md
server/
  package.json
  server.js
  .env.example
  config/
  models/
  controllers/
  routes/
  middlewares/
  validators/
  socket/
client/
  package.json
  vite.config.ts
  tsconfig.json
  src/
  public/
```

---

## 🔧 Step 2: Deploy Backend to Render.com (15 minutes)

### 2.1 Create Render Web Service

1. Go to [render.com/dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Choose **Deploy an existing repository** → **GitHub**
4. Search for `Kriscent-teams-app` and select it
5. Connect your account if prompted

### 2.2 Configure Backend Service

Fill in the following:

| Field             | Value                      |
| ----------------- | -------------------------- |
| **Name**          | `kriscent-backend`         |
| **Environment**   | `Node`                     |
| **Region**        | Choose closest to you      |
| **Branch**        | `main`                     |
| **Build Command** | `cd server && npm install` |
| **Start Command** | `cd server && npm start`   |
| **Instance Type** | `Free`                     |

### 2.3 Add Environment Variables

Click **Environment** and add:

```env
PORT=3001
NODE_ENV=production
MONGO_URI=<your-mongodb-atlas-connection-string>
DB_NAME=teamcollab
CLIENT_URL=https://your-frontend-url.vercel.app

# Firebase (from Firebase Console → Project Settings → Service Account JSON)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-key-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nXXX...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
```

⚠️ **Important:** Replace values with your actual credentials from:

- MongoDB Atlas connection string (Database → Connect → Copy connection string)
- Firebase service account (Firebase Console → Project Settings → Service Accounts → Generate key)

### 2.4 Deploy

1. Click **Create Web Service**
2. Render will build and deploy automatically
3. View logs in the **Logs** tab
4. When status shows **Live**, note your URL: `https://kriscent-backend.onrender.com`

### 2.5 Test Backend

```bash
# Test health check
curl https://kriscent-backend.onrender.com/health

# Should return:
# {"status":"OK","timestamp":"...","uptime":...}
```

✅ **Backend deployed!**

---

## 🌐 Step 3: Deploy Frontend to Vercel (10 minutes)

### 3.1 Connect to Vercel

1. Go to [vercel.com/import](https://vercel.com/import)
2. Click **Import Git Repository**
3. Paste your GitHub repo URL: `https://github.com/YOUR_USERNAME/Kriscent-teams-app`
4. Select account and click **Continue**

### 3.2 Configure Frontend Project

1. **Project name:** `kriscent-frontend`
2. **Framework:** Select **Vite** from dropdown (or **Other**)
3. **Root directory:** Select `./client`
4. **Build command:** `npm run build`
5. **Output directory:** `dist`

### 3.3 Add Environment Variables

Under **Environment Variables**, add:

```env
VITE_API_URL=https://kriscent-backend.onrender.com
VITE_FIREBASE_API_KEY=your-firebase-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

Get these from Firebase Console → Project Settings → Web App config.

### 3.4 Deploy

1. Click **Deploy**
2. Wait for build to complete (2-3 minutes)
3. When status shows **Ready**, view your frontend: `https://kriscent-frontend-xxxxx.vercel.app`

### 3.5 Test Frontend

1. Visit your frontend URL
2. You should see the **Login** page
3. Login with your Firebase credentials
4. Create a project and task to verify backend connection ✅

---

## 🔄 Step 4: Update Configuration & Links

### 4.1 Update Backend CORS

Since frontend URL has changed, update Render environment:

1. Go to Render dashboard → Select **kriscent-backend**
2. Settings → Environment
3. Update `CLIENT_URL`:
   ```
   CLIENT_URL=https://kriscent-frontend-xxxxx.vercel.app
   ```
4. Click **Save Changes** (backend will redeploy)

### 4.2 Update README.md Deployment Links

In your repo's main `README.md`, update the deployment section with your actual URLs:

```markdown
## 🚀 Deployment

### Live URLs

- **Frontend:** https://kriscent-frontend-xxxxx.vercel.app
- **Backend API:** https://kriscent-backend.onrender.com
- **API Health:** https://kriscent-backend.onrender.com/health
```

Commit and push:

```bash
git add README.md
git commit -m "docs: update deployment URLs"
git push origin main
```

---

## 🧪 Step 5: Full Verification

Test the complete flow:

### 5.1 Frontend Test

```
1. Visit frontend URL
2. Register new account with email/password
3. Create a project
4. Create a task
5. Mark task as complete
6. Open assistant (chat icon) and try: "create task Test | description: Testing"
```

### 5.2 Backend Test

```bash
# Check health
curl https://kriscent-backend.onrender.com/health

# List tasks (replace TOKEN and PROJECT_ID)
curl -H "Authorization: Bearer TOKEN" \
  https://kriscent-backend.onrender.com/api/tasks?projectId=PROJECT_ID
```

### 5.3 Real-Time Test

Open browser console on frontend and test Socket.IO:

```javascript
// Messages should appear in real-time chat
// Other team members' changes appear instantly
```

---

## 📝 Useful Commands

### Check Deployment Status

```bash
# View Render logs
# Dashboard → Select service → Logs

# View Vercel logs
# Dashboard → Select project → Deployments → View Logs

# View MongoDB connection
# Atlas → Database → Deployment → Metrics
```

### Redeploy from GitHub

**Automatic:** Any push to `main` branch auto-deploys

- Render: Updates backend
- Vercel: Updates frontend

**Manual:** Render/Vercel dashboards → Deployment → Manual Deploy

### Update Environment Variables

**Render:** Dashboard → Select service → Settings → Environment → Edit

**Vercel:** Dashboard → Settings → Environment Variables → Edit

---

## 🔐 Security Checklist

Before going live:

- [x] `.env` and `serviceAccountKey.json` in `.gitignore`
- [x] No secrets in code comments
- [x] Firebase rules configured (not in this guide, but important)
- [x] MongoDB IP whitelist: Add Render backend IP
- [x] CORS: Frontend URL set in backend env
- [x] Rate limiting: Enabled (100 req/15 min)
- [ ] HTTPS: Both Render & Vercel provide free SSL ✅
- [ ] Custom domain: Optional (can add after)

---

## 🐛 Troubleshooting

### Backend won't deploy

**Error:** `Cannot find module` in Render logs

**Solution:**

```bash
cd server
npm install
# Check package.json has all dependencies
```

### Frontend blank page

**Error:** 404 or blank screen

**Solution:**

1. Check console for errors (F12)
2. Verify `VITE_API_URL` in Vercel env vars
3. Ensure backend is running (`/health` endpoint)

### Socket.IO connection fails

**Error:** WebSocket connection fails

**Solution:**

1. Check CORS in backend (should include frontend URL)
2. Verify both services are running
3. Check browser console network tab

### MongoDB connection fails

**Error:** `MongoServerSelectionError` in logs

**Solution:**

1. Verify connection string in `.env`
2. Whitelist Render IP: MongoDB Atlas → Network Access → Add IP → 0.0.0.0/0 (not recommended for prod)
3. Create database user and password
4. Test locally first: `npm start` in server/

### Firebase auth fails

**Error:** `Firebase config missing` or auth error

**Solution:**

1. Verify Firebase credentials in both `.env` files
2. Firebase Console → Project Settings → Verify API keys
3. Check email/password user exists
4. Enable Email/Password provider

---

## 📚 Next Steps

After successful deployment:

1. **Set up custom domain** (optional)

   - Render: Settings → Custom Domain
   - Vercel: Domains tab

2. **Enable MongoDB backups**

   - Atlas: Settings → Backups

3. **Add monitoring**

   - Render: Metrics tab
   - Vercel: Analytics
   - Firebase: Console Alerts

4. **Optimize performance**

   - Enable caching
   - Minify assets
   - Use CDN (Vercel does this)

5. **Scale if needed**
   - Render: Upgrade instance type
   - Vercel: Premium plan
   - MongoDB: Upgrade cluster

---

## 📞 Support Resources

| Issue                   | Link                                             |
| ----------------------- | ------------------------------------------------ |
| Render Docs             | https://render.com/docs                          |
| Vercel Docs             | https://vercel.com/docs                          |
| MongoDB Troubleshooting | https://docs.mongodb.com/manual/troubleshooting/ |
| Firebase Console        | https://console.firebase.google.com              |
| GitHub Docs             | https://docs.github.com                          |

---

<div align="center">

**Your app is now live! 🎉**

Share your URLs with your team and start collaborating!

</div>
