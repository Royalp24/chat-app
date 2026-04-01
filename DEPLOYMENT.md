# Deployment Guide - EphemeralChat

Complete step-by-step guide to deploy EphemeralChat to production.

## Prerequisites

- GitHub account
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- Git installed locally

## Step 1: Push to GitHub

### 1.1 Create GitHub Repository

```bash
cd chat-app
git init
git add .
git commit -m "Initial commit: EphemeralChat application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/chat-app.git
git push -u origin main
```

### 1.2 Verify on GitHub

Visit https://github.com/YOUR_USERNAME/chat-app to confirm code is pushed.

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account

1. Go to https://render.com
2. Sign up with GitHub (recommended for easier deployment)
3. Authorize the app to access your GitHub repos

### 2.2 Create Web Service

1. Click **New +** → **Web Service**
2. Select your **chat-app** repository
3. Configure:
   - **Name**: `chat-app-api` (or your choice)
   - **Environment**: `Node`
   - **Build Command**: `npm install --prefix backend`
   - **Start Command**: `npm start --prefix backend`
   - **Root Directory**: `/` (leave as is)

### 2.3 Add Environment Variables

Click **Environment** and add:

```
KEY                VALUE
PORT               3001
NODE_ENV           production
CORS_ORIGIN        https://your-frontend-url.vercel.app
INACTIVITY_TIMEOUT 3600000
```

(Replace `your-frontend-url` with your actual Vercel domain)

### 2.4 Deploy

1. Click **Create Web Service**
2. Render will automatically deploy when you push to GitHub
3. Wait 2-3 minutes for deployment to complete
4. Copy your backend URL (e.g., `https://chat-app-api.onrender.com`)
5. Save this URL for the frontend deployment

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Connect GitHub to Vercel

1. Go to https://vercel.com
2. Click **New Project**
3. Select **Import Git Repository**
4. Find and select your **chat-app** repo
5. Click **Import**

### 3.2 Configure Project

1. **Project Name**: `chat-app` (or your choice)
2. **Framework Preset**: `Vite`
3. **Root Directory**: `./frontend`

### 3.3 Add Environment Variables

Click **Environment Variables** and add:

```
KEY                    VALUE
VITE_BACKEND_URL       https://your-backend-url.onrender.com
```

(Use the backend URL you saved from Step 2)

### 3.4 Deploy

1. Click **Deploy**
2. Wait for deployment to complete (usually 1-2 minutes)
3. You'll see your frontend URL (e.g., `https://chat-app.vercel.app`)

---

## Step 4: Update Backend CORS

Now that you have your frontend URL, update the backend CORS setting:

### 4.1 Update Render Environment Variables

1. Go to your Render backend service
2. Click **Environment**
3. Update `CORS_ORIGIN` to your Vercel URL
4. Click **Save**
5. Render will auto-redeploy with new settings

---

## Step 5: Test Production

1. Visit your frontend URL: `https://your-app.vercel.app`
2. Test all features:
   - ✅ Create a new chat
   - ✅ Join with code
   - ✅ Send messages
   - ✅ Edit messages
   - ✅ Delete messages
   - ✅ See typing indicators
   - ✅ Download chat (creator only)
   - ✅ End session (creator only)

---

## Post-Deployment

### Custom Domain (Optional)

**Vercel:**
1. Go to your Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed

**Render:**
1. Go to your Render service → **Settings**
2. Add custom domain under **Custom Domain**
3. Update DNS records as instructed

### Monitoring

**Render Dashboard:**
- View logs: Click **Logs** tab
- Monitor performance: Check **Metrics**
- Restart service: **Environment** → **Restart**

**Vercel Dashboard:**
- View deployments: **Deployments** tab
- Check logs: Click any deployment → **Logs**
- Monitor analytics: **Analytics** tab

### Updating Code

Simply push changes to GitHub:

```bash
git add .
git commit -m "Update: [description]"
git push
```

Both Vercel and Render will auto-deploy the changes.

---

## Troubleshooting

### Backend not connecting

1. **Check CORS_ORIGIN** in Render environment variables
2. **Verify backend URL** in frontend environment variables
3. **Check backend logs** on Render dashboard
4. **Restart backend** service

### Frontend shows "Cannot connect to server"

1. Verify `VITE_BACKEND_URL` is correct in Vercel environment
2. Check if backend is running (visit backend URL in browser)
3. Verify CORS is enabled on backend
4. Check browser console for errors

### Session timing out immediately

1. Check `INACTIVITY_TIMEOUT` is set to `3600000` (60 minutes in ms)
2. Clear browser cache and refresh
3. Check backend logs for timeout errors

### Messages not persisting

This is **expected behavior** - messages are intentionally ephemeral and only exist during active sessions. This is by design.

---

## Database (If You Add Persistence Later)

The current app uses in-memory storage. To add a database:

1. Install database client: `npm install prisma` or `npm install mongoose`
2. Create database schema
3. Update `sessionManager.js` to use database instead of in-memory
4. Add database URL to environment variables
5. Redeploy

---

## Scaling Considerations

### Current Setup (Free Tier)
- Supports 50-100 concurrent users
- Max 10 participants per session
- In-memory session storage
- Auto-sleeps on inactivity (Render free tier)

### To Scale Further
1. **Upgrade Render Plan** for persistent uptime
2. **Add Redis** for cross-server session management
3. **Use Load Balancer** for multiple backend instances
4. **Add Database** for user accounts and analytics

---

## Security Checklist

- ✅ HTTPS enforced (via hosting platforms)
- ✅ CORS properly configured
- ✅ Environment variables not committed to GitHub
- ✅ Socket.IO events validated
- ✅ No sensitive data in logs
- ✅ API rate limiting ready (add middleware if needed)

---

## Health Check

Your backend has a health check endpoint:

```bash
curl https://your-backend-url.onrender.com/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-04-01T...",
  "activeSessions": 2
}
```

---

## Support

- Backend logs: Render Dashboard → Logs
- Frontend errors: Browser DevTools → Console
- Network issues: Browser DevTools → Network tab

For more help, check the main README.md file.
