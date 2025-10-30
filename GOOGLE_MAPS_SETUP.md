# Google Maps Integration Setup

## How to get Google Maps API Key

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Create a new project or select an existing one

3. **Enable Required APIs**
   - Go to "APIs & Services" > "Library"
   - Enable these APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API

4. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

5. **Secure Your API Key (Recommended)**
   - Click on your API key to edit it
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domain (e.g., `localhost:3000/*` for development)
   - Under "API restrictions", select "Restrict key" and choose the APIs you enabled

6. **Add to Environment Variables**
   - Open `.env.local` file
   - Replace `your_google_maps_api_key_here` with your actual API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC4R6AN7SmxjPUIGKdGKdGKdGKdGKdGKdG
   ```

7. **Restart Development Server**
   ```bash
   npm run dev
   ```

## Features Enabled with Google Maps

✅ **Real Google Maps Integration**
- Interactive map with zoom, pan, and satellite view
- Real-time place search and location finding
- Accurate positioning based on coordinates

✅ **Automatic Place Search**
- When you enter a destination, the map automatically centers on that location
- Uses Google Places API for accurate location finding

✅ **Enhanced Markers**
- Custom markers for each place
- Click markers to see place details
- Selected place highlighted with different marker

✅ **Fallback System**
- If no API key is provided, falls back to the interactive map
- Graceful error handling if API fails to load

## Without Google Maps API Key

The system will automatically use the fallback interactive map which provides:
- Visual representation of places
- Clickable markers
- Place information panels
- Links to Google Maps for directions

## Cost Information

- Google Maps API has a free tier with generous limits
- Most small to medium applications stay within free limits
- Monitor usage in Google Cloud Console