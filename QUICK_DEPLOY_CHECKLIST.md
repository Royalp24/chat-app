# 🚀 Quick Deployment Checklist

## Timeline: 15-20 minutes

### ✅ Prerequisites (5 min)
- [ ] GitHub account created
- [ ] Render account created  
- [ ] Vercel account created
- [ ] Code pushed to GitHub

### ✅ Render Backend Deployment (5 min)
- [ ] Connect GitHub to Render
- [ ] Create new Web Service
- [ ] Select `chat-app` repository
- [ ] Set Build Command: `npm install`
- [ ] Set Start Command: `npm start`
- [ ] Add Environment Variables:
  - NODE_ENV = production
  - PORT = 3001
  - CORS_ORIGIN = http://localhost:5173
- [ ] Click Deploy
- [ ] Wait for green checkmark
- [ ] **SAVE YOUR RENDER URL** (e.g., `https://chat-app-backend.onrender.com`)

### ✅ Vercel Frontend Deployment (5 min)
- [ ] Connect GitHub to Vercel
- [ ] Create new Project
- [ ] Select `chat-app` repository
- [ ] Set Root Directory: `./frontend`
- [ ] Add Environment Variable:
  - VITE_BACKEND_URL = {YOUR_RENDER_URL}
- [ ] Click Deploy
- [ ] Wait for deployment complete
- [ ] **SAVE YOUR VERCEL URL** (e.g., `https://chat-app.vercel.app`)

### ✅ Update Backend CORS (2 min)
- [ ] Go to Render backend settings
- [ ] Find `CORS_ORIGIN` environment variable
- [ ] Update to: `{YOUR_VERCEL_URL}`
- [ ] Save (triggers redeploy)
- [ ] Wait for green checkmark

### ✅ Verify Deployment (2 min)
- [ ] Test backend: `{YOUR_RENDER_URL}/health`
- [ ] Open frontend: `{YOUR_VERCEL_URL}`
- [ ] Try creating a session

### ✅ Cross-Device Testing (5 min)
- [ ] Test on computer
- [ ] Test on phone
- [ ] Create session from one device
- [ ] Join from another device
- [ ] Start call and verify video works

---

## 🔗 Useful Links

- **Render Dashboard:** https://dashboard.render.com
- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Repository:** (your repo URL)

---

## 📝 Important URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | (Update after deployment) |
| Backend (Render) | (Update after deployment) |
| Backend Health | (Update after deployment)/health |

---

## 🆘 If Something Breaks

1. **Can't connect to backend?**
   - Check Render status (green?)
   - Check CORS_ORIGIN in Render settings
   - Wait 5 minutes for changes to apply

2. **Frontend won't load?**
   - Check Vercel deployment status
   - Clear browser cache (Ctrl+Shift+Delete)
   - Try private/incognito window

3. **Video not working?**
   - Grant camera permissions
   - Check browser console for errors
   - Try different browser

---

**Ready to deploy? Follow DEPLOYMENT_GUIDE.md step by step!** 🚀

