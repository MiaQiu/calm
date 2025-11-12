# Quick Start Guide

Get your Calm AI Coach app running in 5 minutes!

## Option 1: Test Frontend Only (No Backend)

Perfect for testing the UI and voice recording functionality.

1. **Open in browser**:
   ```bash
   # Just open index.html in your browser
   open index.html

   # OR use a simple server
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

2. **Allow microphone access** when prompted

3. **Test the UI**:
   - Tap the button to start recording
   - Speak into your microphone
   - Tap again to stop
   - The app will simulate processing (no actual API calls)

## Option 2: Full Stack with Backend (Recommended)

This enables actual speech-to-text, AI responses, and text-to-speech.

### Step 1: Get API Keys

1. **OpenAI API Key** (for speech-to-text and AI chat):
   - Sign up at https://platform.openai.com
   - Go to API Keys section
   - Create new key

2. **ElevenLabs API Key** (for text-to-speech):
   - Sign up at https://elevenlabs.io
   - Go to Profile → API Keys
   - Copy your key

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API keys
nano .env
```

Add your keys:
```
OPENAI_API_KEY=sk-...your-key-here
ELEVENLABS_API_KEY=...your-key-here
```

### Step 4: Set Up Frontend Files

```bash
# Create public directory and move frontend files
mkdir -p public
cp index.html public/
cp styles.css public/
cp app.js public/
```

### Step 5: Update Frontend to Use Backend

In `public/app.js`, uncomment the API call sections:

**Speech-to-Text** (app.js:112):
```javascript
async speechToText(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    return data.transcription;
}
```

**LLM Response** (app.js:139):
```javascript
async getLLMResponse(transcription) {
    const systemPrompt = this.buildSystemPrompt();
    const conversationContext = this.buildConversationContext(transcription);

    const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            system: systemPrompt,
            messages: conversationContext
        })
    });

    const data = await response.json();
    return data.response;
}
```

**Text-to-Speech** (app.js:176):
```javascript
async textToSpeech(text) {
    const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
    });

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
}
```

### Step 6: Rename Server File

```bash
mv server.example.js server.js
```

### Step 7: Start the Server

```bash
npm start
```

Visit http://localhost:3000

## Testing the App

1. **Click** the large blue button
2. **Speak** about a parenting challenge: "I'm feeling frustrated because my child won't listen to me"
3. **Click again** to stop recording
4. **Listen** to the AI coach's response
5. **Continue** the conversation as needed
6. **Click "I'm Done for Now"** when finished

## Troubleshooting

### Microphone not working
- Ensure you're using HTTPS (or localhost)
- Check browser permissions (chrome://settings/content/microphone)
- Try a different browser

### API errors
- Check your API keys in .env
- Verify you have credits/quota on OpenAI and ElevenLabs
- Check console for detailed error messages (F12 → Console)

### Audio not playing
- Check browser audio permissions
- Ensure ElevenLabs API key is valid
- Try a different voice ID

## Next Steps

1. **Add Pre-recorded Audio**: Create calming MP3 files and implement logic in `playPreRecordedResponse()`
2. **Customize Prompts**: Edit `buildSystemPrompt()` to match your coaching style
3. **Adjust UI**: Modify colors, text, and styling in `styles.css`
4. **Deploy**: Choose a hosting platform (Vercel, Netlify, Heroku)

## Cost Estimates

Based on typical usage:

- **OpenAI Whisper**: ~$0.006 per minute of audio
- **OpenAI GPT-4**: ~$0.03 per conversation turn
- **ElevenLabs**: ~$0.18 per 1000 characters (~150 words)

A 10-minute conversation: ~$0.50-1.00

Consider using GPT-3.5-turbo for lower costs (~80% cheaper).

## Support

- Check README.md for detailed documentation
- Review API documentation for troubleshooting
- Adjust temperature and max_tokens for different response styles
