# Vercel Deployment Guide

## Environment Variables to Add in Vercel Dashboard

Go to your Vercel project → Settings → Environment Variables and add:

### Required Variables:
```
MONGO_URI=mongodb+srv://bhipendarkumar31:1234@cluster0.p6clo.mongodb.net/MeraAi1
JWT_SECRET=my_secreate_key
GEMINI_API_KEY=AIzaSyDgfR2hyqxhABpLsVdumR5XKkJscAOAQeY
OMDB_API_KEY=a820102
SPOTIFY_CLIENT_SECRET=14311604af364de6b135335b2649aaa1
ALPHA_VANTAGE_API_KEY=KKDZ5X4KB5MD0BHT
```

### Optional Variables:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=(get from Google Cloud Console if you want maps)
```

## Deployment Steps:

### Method 1: GitHub Integration (Recommended)
1. Push code to GitHub
2. Go to vercel.com
3. Sign in with GitHub
4. Click "New Project"
5. Import your repository
6. Add environment variables
7. Deploy!

### Method 2: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

## Post-Deployment Checklist:
- [ ] All environment variables added
- [ ] MongoDB connection working
- [ ] API routes responding
- [ ] YouTube API working
- [ ] Gemini AI working (check quota)
- [ ] Travel booking working
- [ ] Entertainment features working

## Troubleshooting:
- If build fails, check Next.js config
- If APIs don't work, verify environment variables
- If MongoDB fails, check network access in MongoDB Atlas
- If images don't load, check next.config.js domains

## Your App Features:
✅ AI Chat with Gemini
✅ YouTube Video Browser
✅ Travel Booking System
✅ Entertainment Hub (Music/Movies)
✅ Tech Module
✅ Research Assistant
✅ User Authentication
✅ Responsive Design

## Performance Tips:
- Enable Vercel Analytics
- Use Vercel Edge Functions for better performance
- Enable ISR (Incremental Static Regeneration) for cached content
- Optimize images with Next.js Image component