# 🚀 Deployment Guide: Render + Vercel

## Overview
This guide walks you through deploying the chat app to Render (backend) and Vercel (frontend).

**Estimated Time:** 15-20 minutes  
**Cost:** FREE (both services offer free tiers)

---

## 📋 Prerequisites

You'll need:
1. ✅ GitHub account (to connect repositories)
2. ✅ Render account (free at https://render.com)
3. ✅ Vercel account (free at https://vercel.com)

---

## 🔧 Step 1: Initialize Git Repository

First, let's push your code to GitHub:

```bash
# From project root
git init
git add .
git commit -m "Initial commit: Chat app with video calling"
git remote add origin https://github.com/YOUR_USERNAME/chat-app.git
git branch -M main
git push -u origin main
```

---

## 🛫 Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (easiest option)
3. Authorize Render to access your GitHub repositories

### 2.2 Create New Web Service
1. Click **"New +"** button → **"Web Service"**
2. Select your `chat-app` repository
3. Fill in these details:
   - **Name:** `chat-app-backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### 2.3 Configure Environment Variables
Add these environment variables in Render dashboard:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `CORS_ORIGIN` | (You'll update this after deploying frontend) |

For now, set `CORS_ORIGIN` to: `http://localhost:5173`

### 2.4 Deploy
1. Click **"Create Web Service"**
2. Render will automatically deploy
3. Wait for the green checkmark (takes 1-2 minutes)
4. Your backend URL will be: `https://chat-app-backend.onrender.com` (or similar)
5. **SAVE THIS URL** - you'll need it for the frontend!

---

## 🌐 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel to access your GitHub repositories

### 3.2 Import Project
1. Click **"Add New"** → **"Project"**
2. Select your `chat-app` repository
3. Choose `Frontend Root Directory`: `./frontend`

### 3.3 Configure Environment Variables
In Vercel dashboard, add this environment variable:

| Key | Value |
|-----|-------|
| `VITE_BACKEND_URL` | `https://chat-app-backend.onrender.com` (use your Render URL) |

### 3.4 Deploy
1. Click **"Deploy"**
2. Vercel will build and deploy
3. Wait for completion (takes 1-3 minutes)
4. Your frontend URL will be: `https://chat-app.vercel.app` (or similar)

---

## 🔄 Step 4: Update Backend CORS

Now that you know both URLs, update the backend:

### 4.1 In Render Dashboard:
1. Go to your `chat-app-backend` service
2. Click **"Environment"**
3. Update `CORS_ORIGIN` to:
   ```
   https://chat-app.vercel.app
   ```
4. Click **"Save"** (this triggers a redeploy)

---

## ✅ Step 5: Verify Deployment

### Check Backend Health:
```
https://chat-app-backend.onrender.com/health
```
Should return: `{"status":"ok","timestamp":"...","activeSessions":0}`

### Check Frontend:
Open: `https://chat-app.vercel.app`
You should see the landing page

---

## 🧪 Step 6: Test Cross-Device

Now you can test from different devices:

### Test from Computer:
1. Open `https://chat-app.vercel.app`
2. Click **"Create Session"**
3. Enter your name
4. Copy the session code

### Test from Phone:
1. Open same link on phone (same WiFi or different network)
2. Click **"Join Session"**
3. Paste the session code
4. Enter your name

### Full Call Test:
1. **Computer:** Click **"Start Call"**
2. **Phone:** Accept incoming call
3. **Both:** Verify you see each other's video
4. **Both:** Test mute/camera/end call buttons

---

## 🐛 Troubleshooting

### Issue: Frontend Can't Connect to Backend
**Solution:**
1. Verify `VITE_BACKEND_URL` is correct in Vercel
2. Check Render backend is running (green status)
3. Verify CORS is set to your Vercel URL
4. Wait 5 minutes after CORS update (Render needs to redeploy)

### Issue: "CORS error" in Console
**Solution:**
1. Check backend logs in Render dashboard
2. Verify `CORS_ORIGIN` includes your exact Vercel URL
3. No trailing slashes in CORS_ORIGIN

### Issue: Video/Audio Not Working
**Solution:**
1. Grant camera/microphone permissions
2. Check browser console for permission errors
3. Try different browser
4. Check internet connection speed

### Issue: Backend Keeps Restarting
**Solution:**
1. Check Render logs for errors
2. Verify environment variables are set
3. Make sure Node version is compatible

---

## 📊 Performance Notes

### On Free Tier:
- Backend will "spin down" after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds
- Video quality depends on network speed
- Max participants tested: 10 (WebRTC p2p)

### Optimization Tips:
- Close other browser tabs to reduce latency
- Ensure good WiFi signal
- Don't run bandwidth-heavy apps during calls
- Use modern browsers (Chrome/Firefox/Safari)

---

## 🔐 Security Notes

### Current Setup:
- Uses HTTP/HTTPS (no authentication yet)
- Session codes are short (6-10 chars)
- Any code sharing = anyone can join

### For Production, Consider:
- Add user authentication
- Encrypt session codes
- Rate limiting
- HTTPS only (already using on Vercel/Render)

---

## 📱 Testing Checklist

### Functionality:
- [ ] Can create session
- [ ] Can join session with code
- [ ] Chat messages send/receive
- [ ] Can start call as creator
- [ ] Guest receives call notification
- [ ] Video stream shows for both
- [ ] Mute toggle works
- [ ] Camera toggle works
- [ ] End call works

### Cross-Device:
- [ ] Desktop + Mobile same WiFi
- [ ] Desktop + Mobile different network
- [ ] Mobile + Mobile on same session
- [ ] Video quality is acceptable
- [ ] No major lag/latency

### Edge Cases:
- [ ] Join after call started
- [ ] Creator leaves during call
- [ ] Guest leaves during call
- [ ] Internet drops and recovers
- [ ] Browser tab closed and reopened

---

## 🎉 You're Live!

Your chat app is now deployed! Share your Vercel URL with friends and test it out.

**Your Live URLs:**
- Frontend: `https://chat-app.vercel.app`
- Backend: `https://chat-app-backend.onrender.com`

---

## 📞 Support

If you encounter issues:
1. Check browser console (F12)
2. Check Render logs
3. Check Vercel logs
4. Verify environment variables match

Happy testing! 🚀

