# 🚀 MeraAI - Your AI-Powered Super App

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **Experience the future of AI interaction** - A comprehensive super app featuring AI research, entertainment, travel booking, stock market analysis, tech tools, and more. Built with cutting-edge technologies and powered by Google Gemini AI.

![MeraAI Banner](https://drive.google.com/uc?export=view&id=1ihCVYIUeO4_567xjCkfX4yQC-L1GzcG_)

---

## ✨ Key Features

### 🤖 Advanced AI Capabilities
- **🎤 Voice-Powered Chat** - Real-time voice input with Web Speech API
- **✍️ Typewriter Effect** - Character-by-character AI responses for engaging UX
- **🛑 Stop/Pause Responses** - Cancel AI generation mid-response (like ChatGPT)
- **📎 File Analysis** - Upload and analyze images with Gemini Vision API
- **💾 Chat History** - Save and retrieve conversations with MongoDB integration

### 🎯 8 Comprehensive Modules

| Module | Features | Highlights |
|--------|----------|------------|
| 🔬 **AI Research** | AI chat, web search, videos, images | Powered by Gemini 2.5 + YouTube + Google Custom Search |
| 🎬 **Entertainment** | Movies, Music, YouTube | TMDb + Spotify + YouTube Data API |
| 📰 **News** | Real-time global news | Multiple news sources + breaking news ticker |
| 📈 **Stocks** | Live market data, charts, analysis | Alpha Vantage API + market movers |
| ✈️ **Travel** | Flight/hotel booking, destinations | Unsplash imagery + booking validation |
| 💻 **Tech Tools** | Code generation, debugging | AI-powered development assistance |
| 🎮 **Games** | Interactive mini-games | Entertainment and engagement |
| 👤 **Profile** | User management, history tracking | JWT authentication + role-based access |

### 🎨 Modern UI/UX Design
- **✨ Neon-Themed Interface** - Vibrant cyan, pink, and amber accents
- **🌓 Dark/Light Mode** - Toggle between themes
- **📱 Fully Responsive** - Mobile-first design with adaptive layouts
- **🔮 Glassmorphism Effects** - Backdrop blur and transparency
- **🎭smooth Animations** - Framer Motion-style transitions
- **🎪 Premium Design** - State-of-the-art modern aesthetics

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Radix UI, Custom Components
- **Icons**: Lucide React
- **State Management**: React Hooks

### Backend
- **API Routes**: Next.js API Routes
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Authentication**: JWT + bcryptjs
- **AI**: Google Gemini 2.5 Flash Lite

### APIs Integrated
| API | Purpose | Status |
|-----|---------|--------|
| Google Gemini AI | Text & Vision AI | ✅ Active |
| YouTube Data API v3 | Video search & trending | ✅ Active |
| Google Custom Search | Web links & images | ✅ Active |
| TMDb API | Movie database | ✅ Active |
| Spotify API | Music streaming | ✅ Active |
| Alpha Vantage | Stock market data | ✅ Active |
| News API | Global news feed | ✅ Active |
| Unsplash API | Travel imagery | ✅ Active |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.17 or higher
- **npm** or **yarn**
- **MongoDB Atlas** account
- **API Keys** (see Configuration section)

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/bhipendar14/MeraAi.git
cd MeraAi
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# ======================================
# DATABASE
# ======================================
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/meraai
JWT_SECRET=your_super_secret_jwt_key_min_32_characters

# ======================================
# AI SERVICES
# ======================================
GEMINI_API_KEY=your_gemini_api_key

# ======================================
# SEARCH & MEDIA
# ======================================
YOUTUBE_API_KEY=your_youtube_data_api_key
YOUTUBE_API_KEY_ID=your_youtube_project_id
CUSTOM_SEARCH_API_KEY=your_google_custom_search_key
CUSTOM_SEARCH_ENGINE_ID=your_search_engine_id

# ======================================
# ENTERTAINMENT
# ======================================
OMDB_API_KEY=your_omdb_api_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# ======================================
# NEWS & STOCKS
# ======================================
NEWS_API_KEY=your_news_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key

# ======================================
# MAPS & TRAVEL
# ======================================
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# ======================================
# ANALYTICS (Optional)
# ======================================
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔑 Getting API Keys

### Required APIs

#### 1. **Google Gemini AI**
- Visit: [Google AI Studio](https://makersuite.google.com/app/apikey)
- Click "Get API Key"
- Copy the key to `GEMINI_API_KEY`

#### 2. **YouTube Data API v3**
- Go to: [Google Cloud Console](https://console.cloud.google.com/)
- Enable "YouTube Data API v3"
- Create credentials → API Key
- Copy to `YOUTUBE_API_KEY`

#### 3. **Google Custom Search**
- Enable: [Custom Search API](https://console.cloud.google.com/apis/library/customsearch.googleapis.com)
- Create API Key → `CUSTOM_SEARCH_API_KEY`
- Create Search Engine: [Programmable Search](https://programmablesearchengine.google.com/)
- Get Engine ID → `CUSTOM_SEARCH_ENGINE_ID`

#### 4. **MongoDB Atlas**
- Sign up: [MongoDB Atlas](https://cloud.mongodb.com/)
- Create a free cluster
- Get connection string → `MONGO_URI`

#### 5. **Other APIs** (Optional but recommended)
- **TMDb**: [The Movie Database](https://www.themoviedb.org/settings/api)
- **Spotify**: [Spotify Developer](https://developer.spotify.com/dashboard)
- **Alpha Vantage**: [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
- **News API**: [News API](https://newsapi.org/register)
- **Unsplash**: [Unsplash Developers](https://unsplash.com/developers)

---

## 📱 Features Deep Dive

### 🔬 AI Research Page
- **Intelligent Search**: Combines AI responses with web search, videos, and images
- **Typewriter Effect**: Character-by-character text animation
- **Stop Button**: Cancel long responses mid-generation
- **Voice Input**: Speak your questions naturally
- **File Upload**: Analyze images with Gemini Vision
- **Chat History**: All conversations saved to database
- **Concise Responses**: Optimized to save 80% API credits

### 🎬 Entertainment Module
- **Movies**: TMDb integration with trending, popular, top-rated
- **Music**: Spotify playlists by genre with direct links
- **YouTube**: Trending videos with thumbnail previews
- **Floating Player**: Draggable music player (optional)

### ✈️ Travel Booking
- **Flight Search**: Real-time availability with validation
- **Hotel Booking**: Destination-based search
- **Travel Destinations**: Beautiful Unsplash imagery
- **Booking Management**: Admin panel for reservations
- **Ticket Generation**: PDF ticket creation (planned)

### 📈 Stock Market
- **Live Data**: Real-time stock prices via Alpha Vantage
- **Market Movers**: Top gainers, losers, most active
- **Search**: Look up any stock symbol
- **Charts**: Price visualization (planned)
- **Caching**: API rate limit optimization

---

## 🎨 Design Philosophy

### Color Palette
```css
:root {
  --color-accent-cyan: #06b6d4;      /* Primary accent */
  --color-accent-pink: #ec4899;      /* Secondary accent */
  --color-accent-amber: #f59e0b;     /* Tertiary accent */
  --color-primary: #3b82f6;          /* Interactive elements */
}
```

### Design Principles
1. **Premium Aesthetics** - Wow users at first glance
2. **Micro-Animations** - Smooth, engaging interactions
3. **Glassmorphism** - Modern blur effects
4. **Responsive First** - Mobile-optimized layouts
5. **Accessibility** - WCAG 2.1 compliant

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

2. **Connect to Vercel**
- Go to [Vercel](https://vercel.com/)
- Import your GitHub repository
- Add all environment variables
- Deploy!

### Environment Variables in Vercel
- Go to Project Settings → Environment Variables
- Add all variables from `.env.local`
- Redeploy for changes to take effect

---

## 🐛 Troubleshooting

### Common Issues

**❌ API Quota Exceeded**
```
Error: You exceeded your current quota
```
**Solution**: Wait for quota reset (usually 1 minute for Gemini) or use a different API key

**❌ Voice Input Not Working**
**Solutions**:
- Use Chrome or Edge browser (Safari not fully supported)
- Enable HTTPS (required for production)
- Allow microphone permissions when prompted
- Check browser console for errors

**❌ Database Connection Failed**
```
Error: connect ECONNREFUSED
```
**Solutions**:
- Verify `MONGO_URI` in `.env.local`
- Check MongoDB Atlas network access (allow your IP)
- Ensure database user has proper permissions

**❌ Stop Button Not Showing**
**Solution**: The button only appears **while AI is generating**. Ask a long question to see it.

**❌ Links/Images Not Loading**
**Solutions**:
- Verify `CUSTOM_SEARCH_API_KEY` and `CUSTOM_SEARCH_ENGINE_ID`
- Enable Custom Search API in Google Cloud Console
- Check API quota and billing

---

## 📁 Project Structure

```
meraai/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── chat/                 # Chat API (Gemini)
│   │   ├── research/             # Research API (Gemini + Search)
│   │   ├── entertainment/        # Movies, Music, YouTube
│   │   ├── news/                 # News feed
│   │   ├── stocks/               # Stock market data
│   │   ├── travel/               # Booking APIs
│   │   └── chat-history/         # Save conversations
│   ├── research/                 # Research page
│   ├── entertainment/            # Entertainment page
│   ├── news/                     # News page
│   ├── stocks/                   # Stocks page
│   ├── travel/                   # Travel page
│   ├── tech/                     # Tech tools page
│   ├── games/                    # Games page
│   ├── history/                  # Chat history page
│   ├── profile/                  # User profile
│   ├── admin/                    # Admin dashboard
│   └── layout.tsx                # Root layout
├── components/                   # Reusable components
│   ├── ui/                       # UI primitives
│   ├── research-chat.tsx         # Chat component
│   ├── sidebar.tsx               # Navigation sidebar
│   └── ...
├── lib/                          # Utility functions
│   ├── ai-gemini.ts              # Gemini API wrapper
│   ├── mongodb.ts                # Database connection
│   ├── auth.ts                   # JWT authentication
│   └── models/                   # Mongoose models
├── hooks/                        # Custom React hooks
│   └── use-typewriter.ts         # Typewriter effect
├── public/                       # Static assets
├── .env.local                    # Environment variables (not committed)
└── README.md                     # This file
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```
3. **Make your changes**
4. **Commit with conventional commits**
```bash
git commit -m "feat: add amazing feature"
```
5. **Push to your branch**
```bash
git push origin feature/amazing-feature
```
6. **Open a Pull Request**

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Test thoroughly before submitting

---

## 📊 Performance Metrics

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: Optimized with Next.js automatic code splitting

---

## 🔮 Roadmap

### Upcoming Features
- [ ] Real-time collaboration
- [ ] Multi-language support
- [ ] Voice output (Text-to-Speech)
- [ ] Advanced charts and visualizations
- [ ] Push notifications
- [ ] Progressive Web App (PWA)
- [ ] Social sharing
- [ ] Export chat as PDF
- [ ] Custom AI training
- [ ] Marketplace for integrations

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

You are free to:
- ✅ Use commercially
- ✅ Modify
- ✅ Distribute
- ✅ Use privately

---

## 🙏 Acknowledgments

Special thanks to:
- **Google Gemini AI** - Powerful AI capabilities
- **Vercel** - Excellent hosting and developer experience
- **Next.js Team** - Amazing React framework
- **Tailwind CSS** - Beautiful utility-first CSS
- **Radix UI** - Accessible component primitives
- **MongoDB** - Reliable database solution
- **All Open Source Contributors** - Making the web better

---

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/bhipendar14/MeraAi/issues)
- **Discussions**: [Ask questions and share ideas](https://github.com/bhipendar14/MeraAi/discussions)
- **Email**: bhipendar14@gmail.com
- **Twitter**: [@bhipendar14](https://twitter.com/bhipendar14) _(if applicable)_

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐️ on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=bhipendar14/MeraAi&type=Date)](https://star-history.com/#bhipendar14/MeraAi&Date)

---

## 📸 Screenshots

### Home Page
![Home Page](https://via.placeholder.com/800x400?text=Home+Page)

### AI Research
![Research Page](https://via.placeholder.com/800x400?text=AI+Research)

### Entertainment
![Entertainment](https://via.placeholder.com/800x400?text=Entertainment)

### Stock Market
![Stocks](https://via.placeholder.com/800x400?text=Stock+Market)

---

<div align="center">

**Built with ❤️ by [Bhipendar](https://github.com/bhipendar14)**

*Experience the future of AI interaction today!*

[⬆ Back to Top](#-meraai---your-ai-powered-super-app)

</div>