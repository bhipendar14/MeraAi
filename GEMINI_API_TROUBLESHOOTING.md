# 🔧 Gemini API Troubleshooting Guide

## ❌ Current Issue: 403 Error

The Gemini API is returning a 403 Forbidden error, which typically indicates an authentication problem.

## 🔍 **Possible Causes & Solutions**

### 1. **API Key Issues**
- **Invalid API Key**: The key might be incorrect or expired
- **Permissions**: The key might not have the right permissions
- **Billing**: Google Cloud billing might not be enabled

### 2. **Model Availability**
- **Model Names**: Using incorrect model names
- **API Version**: Using wrong API endpoint version

## ✅ **Fixes Applied**

1. **Updated Model Names**: 
   - Changed from `gemini-2.0-flash` to `gemini-1.5-pro`
   - Changed from `gemini-2.0-flash-lite` to `gemini-1.5-flash`

2. **Updated API Endpoint**:
   - Changed from `/v1/` to `/v1beta/` for better compatibility

3. **Added Error Handling**:
   - Better error messages for different HTTP status codes
   - API key validation

## 🔑 **How to Fix Your API Key**

### Step 1: Get a New Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the new API key

### Step 2: Update Your Environment Variables
Replace the current API key in `.env.local`:

```env
# Replace this line:
GEMINI_API_KEY=AIzaSyD0VmHLF6QGCW08-I6PzhW645Nql0iN5lA

# With your new API key:
GEMINI_API_KEY=your_new_api_key_here
```

### Step 3: Enable Billing (If Required)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "Billing" and ensure it's enabled
4. The Generative AI API might require billing for higher usage

### Step 4: Check API Permissions
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Enabled APIs"
3. Make sure "Generative Language API" is enabled

## 🧪 **Test Your API Key**

You can test your API key with this curl command:

```bash
curl -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     -X POST 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY'
```

Replace `YOUR_API_KEY` with your actual API key.

## 🔄 **Alternative: Use OpenAI Instead**

If Gemini continues to have issues, you can switch to OpenAI:

1. Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `.env.local`:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   ```
3. I can update the code to use OpenAI instead

## 📞 **Next Steps**

1. **Try a new Gemini API key first** (most likely solution)
2. **Check Google Cloud billing and permissions**
3. **Test with the curl command above**
4. **Let me know if you want to switch to OpenAI**

The most common cause is an invalid or expired API key, so getting a fresh one from Google AI Studio should resolve the issue.