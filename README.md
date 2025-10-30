# 🚀 MeraAI - AI-Powered Super App

A comprehensive AI-powered super app built with Next.js, featuring multiple modules for research, entertainment, travel, stocks, games, and more. Experience the future of AI interaction with voice input, real-time data, and beautiful neon-themed UI.

![MeraAI Banner](https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop&q=80)

## ✨ Features

### 🎤 **Voice-Powered AI Chat**
- **Real-time voice input** with Web Speech API
- **Auto-transcription** and instant AI responses
- **Modern waveform animations** like ChatGPT/Gemini
- **Multi-language support** (English optimized)

### 🎯 **8 Core Modules**
1. **🔬 AI Research** - Powered by Google Gemini AI
2. **🎬 Entertainment** - Movies, Music, YouTube trending
3. **📰 News** - Real-time global news updates
4. **📈 Stocks** - Live market data and analysis
5. **✈️ Travel** - Booking, recommendations, maps
6. **💻 Tech Tools** - Code generation and debugging
7. **🎮 Games** - Mini-games and entertainment
8. **👤 Profile** - User management and history

### 🎨 **Modern UI/UX**
- **Neon-themed design** with glowing effects
- **Dark/Light mode** toggle
- **Fully responsive** mobile-first design
- **Smooth animations** and transitions
- **Glassmorphism effects** and backdrop blur

### 🔐 **Authentication & Security**
- **JWT-based authentication**
- **Role-based access control** (User/Admin)
- **Secure API endpoints**
- **Environment variable protection**

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **AI**: Google Gemini API
- **Database**: MongoDB Atlas
- **Authentication**: JWT, bcryptjs
- **APIs**: Multiple third-party integrations
- **Deployment**: Vercel-ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/meraai.git
cd meraai
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
# Database
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# AI Services
GEMINI_API_KEY=your_gemini_api_key

# External APIs
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
OMDB_API_KEY=your_omdb_api_key
SPOTIFY_CLIENT_SECRET=your_spotify_secret

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Mobile Responsive Design

MeraAI is built with mobile-first approach:

- **Responsive grid layouts** for all modules
- **Touch-friendly interface** with proper spacing
- **Mobile navigation** with slide-out sidebar
- **Optimized voice input** for mobile devices
- **Adaptive text sizes** and button layouts

## 🎤 Voice Input Setup

The voice input feature works out of the box with:

- **Chrome/Edge browsers** (recommended)
- **HTTPS connection** (required for production)
- **Microphone permissions** (auto-requested)
- **Real-time transcription** with auto-send

### Voice Commands Examples:
- "What is artificial intelligence?"
- "Show me trending movies"
- "Book a flight to Paris"
- "Explain quantum computing"

## 🔧 Configuration

### API Keys Required:
1. **Gemini AI** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **MongoDB** - Set up at [MongoDB Atlas](https://cloud.mongodb.com/)
3. **Google Maps** - Get from [Google Cloud Console](https://console.cloud.google.com/)
4. **OMDb** - Get from [OMDb API](http://www.omdbapi.com/apikey.aspx)
5. **Spotify** - Get from [Spotify Developer](https://developer.spotify.com/)

### Environment Setup:
- Development: Uses `.env.local`
- Production: Set environment variables in your hosting platform

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify**: Add build command `npm run build`
- **Railway**: Configure environment variables
- **DigitalOcean**: Use App Platform with Node.js

## 📊 Features Overview

| Module | Features | Status |
|--------|----------|--------|
| 🔬 Research | AI Chat, Voice Input, File Upload | ✅ Complete |
| 🎬 Entertainment | Movies, Music, YouTube | ✅ Complete |
| 📰 News | Real-time news, Categories | ✅ Complete |
| 📈 Stocks | Live data, Charts | ✅ Complete |
| ✈️ Travel | Booking, Maps, Recommendations | ✅ Complete |
| 💻 Tech | Code tools, Debugging | ✅ Complete |
| 🎮 Games | Mini-games, Entertainment | ✅ Complete |
| 👤 Profile | User management, History | ✅ Complete |

## 🎨 Customization

### Theme Colors
Edit `globals.css` to customize the neon color scheme:
```css
:root {
  --color-accent-cyan: #06b6d4;
  --color-accent-pink: #ec4899;
  --color-accent-amber: #f59e0b;
  /* Add your custom colors */
}
```

### Adding New Modules
1. Create new page in `app/your-module/page.tsx`
2. Add navigation item in `components/nav-items.ts`
3. Create API routes in `app/api/your-module/`
4. Add to trending cards if needed

## 🐛 Troubleshooting

### Common Issues:

**Voice input not working:**
- Use Chrome or Edge browser
- Ensure HTTPS connection
- Allow microphone permissions
- Check console for errors

**API errors:**
- Verify environment variables
- Check API key validity
- Ensure proper CORS settings

**Database connection:**
- Verify MongoDB URI
- Check network access
- Ensure proper authentication

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for powerful AI capabilities
- **Vercel** for excellent hosting platform
- **Tailwind CSS** for beautiful styling
- **Radix UI** for accessible components
- **Next.js** for the amazing framework

## 📞 Support

- **Documentation**: Check this README
- **Issues**: Open a GitHub issue
- **Email**: support@meraai.com
- **Discord**: Join our community

---

**Built with ❤️ by the MeraAI Team**

*Experience the future of AI interaction today!*