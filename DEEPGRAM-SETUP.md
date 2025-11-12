# Deepgram Integration Setup

Your app is now configured to use Deepgram for fast, low-latency speech-to-text transcription!

## ✅ What's Already Done

- ✅ Backend endpoint configured for Deepgram API
- ✅ Frontend updated to call the backend endpoint
- ✅ Fallback to placeholder if backend not running
- ✅ Error handling and logging

## 🚀 Quick Setup (5 minutes)

### Step 1: Get Your Deepgram API Key

If you already have it, skip to Step 2. Otherwise:
1. Sign up at https://deepgram.com (free tier available)
2. Go to API Keys section
3. Copy your API key

### Step 2: Set Up Backend

```bash
# 1. Install dependencies (if not already done)
npm install

# 2. Create .env file from example
cp .env.example .env

# 3. Edit .env and add your Deepgram API key
nano .env
```

In your `.env` file:
```
DEEPGRAM_API_KEY=your_actual_deepgram_api_key_here
OPENAI_API_KEY=your_openai_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

### Step 3: Organize Files for Backend

```bash
# Create public directory
mkdir -p public

# Move frontend files to public folder
cp index.html public/
cp styles.css public/
cp app.js public/
cp -r audio public/

# Rename server file
mv server.example.js server.js
```

### Step 4: Start the Backend Server

```bash
npm start
```

You should see:
```
🎙️  Calm AI Coach server running on port 3000
📝 Frontend: http://localhost:3000
🏥 Health check: http://localhost:3000/api/health
```

### Step 5: Test It!

1. Open http://localhost:3000
2. Allow microphone access
3. Start speaking when the button shows "Listening"
4. Check the browser console (F12) to see the actual transcription

## 🔍 Verification

### Check Backend is Running
Visit: http://localhost:3000/api/health

Should show:
```json
{
  "status": "ok",
  "services": {
    "deepgram": true,
    "openai": true,
    "elevenlabs": true
  }
}
```

### Check Transcription Works
After speaking:
1. Open browser console (F12 → Console)
2. Look for: `Transcription: [your actual words]`
3. If you see "Using placeholder transcription" - backend isn't connected

## 🎯 Deepgram Features Used

Your app uses Deepgram's **Nova-2** model with:
- **`smart_format=true`** - Automatically adds punctuation and formatting
- **Low latency** - Typical response time 300-500ms
- **High accuracy** - 95%+ for clear audio

## 📊 Expected Latency

With Deepgram, you should see:
- **Speech-to-text**: 300-500ms
- **Total processing**: ~2-4 seconds (including LLM and TTS)

Much faster than OpenAI Whisper (2-5 seconds for STT alone)!

## 🐛 Troubleshooting

### "Failed to transcribe audio"
- Check your API key in `.env`
- Verify you have Deepgram credits
- Check console for detailed error messages

### "Using placeholder transcription"
- Backend server not running - run `npm start`
- Wrong port - make sure backend is on port 3000
- Check if frontend is served from backend (http://localhost:3000)

### Audio format issues
The app records in `audio/webm` format which Deepgram supports. If you encounter issues:
- Try different browsers (Chrome/Edge work best)
- Check microphone permissions
- Verify audio is actually being recorded

### CORS errors
If testing frontend separately from backend:
- Serve frontend from backend (`public/` folder)
- Or add CORS middleware to server.js:
```javascript
const cors = require('cors');
app.use(cors());
```

## 💰 Pricing

Deepgram pricing (as of 2024):
- **Pay-as-you-go**: $0.0043/minute (~$0.26/hour)
- **Free tier**: $200 credit to start

A typical 10-minute parent session costs: **~$0.043** (4 cents)

## 🔄 Alternative: Frontend-Only (No Backend)

If you want to call Deepgram directly from frontend (not recommended for production):

```javascript
// In app.js - speechToText() function
const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
    method: 'POST',
    headers: {
        'Authorization': `Token YOUR_DEEPGRAM_KEY`, // ⚠️ Exposes API key!
        'Content-Type': audioBlob.type
    },
    body: audioBlob
});
```

**Warning**: This exposes your API key in the browser. Only use for testing!

## 📈 Next Steps

1. ✅ Get Deepgram working
2. Add LLM integration (OpenAI/Claude)
3. Add TTS integration (ElevenLabs)
4. Test full conversation flow
5. Deploy to production

## 🎤 Advanced: Streaming Mode (Future Enhancement)

For even lower latency, you can use Deepgram's WebSocket streaming API:
- Transcription starts as user speaks (real-time)
- No need to wait for silence detection
- Can start LLM processing before speech ends

See Deepgram docs for WebSocket implementation: https://developers.deepgram.com/docs/streaming

## 📝 Testing Checklist

- [ ] Backend server starts without errors
- [ ] Health check returns status OK
- [ ] Frontend loads at http://localhost:3000
- [ ] Microphone permission granted
- [ ] Voice detection triggers recording
- [ ] Console shows actual transcription (not placeholder)
- [ ] Transcription matches what you said
- [ ] Pre-recorded audio plays after transcription
- [ ] App returns to listening mode

## Support

If you get stuck:
1. Check server logs for errors
2. Check browser console for frontend errors
3. Verify API key is correct in `.env`
4. Test API key directly: https://developers.deepgram.com/docs/getting-started
