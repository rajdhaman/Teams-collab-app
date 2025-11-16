# Quick GitHub Push Commands for Kriscent Teams App

## Step 1: Configure Git (First Time Only)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
```

## Step 2: Initialize Repository & Push

Run these commands in order from `D:\Node_JS\Kriscent-teams-app`:

```powershell
# Navigate to project root
cd D:\Node_JS\Kriscent-teams-app

# Initialize git (if not already initialized)
git init

# Add all files (respects .gitignore)
git add .

# Create first commit
git commit -m "feat: initial commit - Kriscent Teams App full stack

- Backend: Node.js + Express + MongoDB + Socket.IO
- Frontend: React + TypeScript + Tailwind + Shadcn
- Features: Authentication, Projects, Tasks, Chat, AI Assistant
- Security: Firebase Auth, RBAC, Input Validation
- Real-time: Socket.IO for live updates"

# Set remote repository (REPLACE YOUR_USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/Kriscent-teams-app.git

# Set main branch and push
git branch -M main
git push -u origin main
```

## Step 3: Verify Push

```powershell
# Check remote
git remote -v

# Check status
git status

# View commit log
git log --oneline -5
```

## Subsequent Updates

After the initial push, use these commands for updates:

```powershell
# Add changes
git add .

# Commit with meaningful message
git commit -m "feat/fix/docs: description of changes"

# Push to GitHub (auto-triggers Render & Vercel deployments)
git push origin main
```

## Useful Git Commands

```powershell
# View all branches
git branch -a

# View changes before committing
git diff

# View commit history
git log --oneline

# Undo last commit (be careful!)
git reset --soft HEAD~1

# Create a new branch for features
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

## Deployment Automatic on Push

Once configured:

- **Push to main** → Render backend auto-deploys
- **Push to main** → Vercel frontend auto-deploys

No manual deployment needed! Just commit and push.

---

## Troubleshooting Git

### "fatal: destination path already exists"

```powershell
# If .git folder exists, you're already initialized
ls -la .git

# If you want to reinitialize
rm -r .git
git init
```

### Authentication failed

```powershell
# Use GitHub token instead of password (recommended)
# 1. Create token: github.com/settings/tokens
# 2. Use as password when prompted
# Or configure permanently:
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/Kriscent-teams-app.git
```

### Large files being tracked

```powershell
# If you accidentally pushed node_modules or .env:
# 1. Add to .gitignore
# 2. Remove from tracking:
git rm --cached node_modules -r
git rm --cached .env
git commit -m "remove: excluded files from git"
git push
```

---

**Ready to push? Replace YOUR_USERNAME and run the commands above! 🚀**
