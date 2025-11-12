# Calm - AI Parenting Coach

A simple, voice-based AI coaching app for overwhelmed parents. One tap to start talking, and receive compassionate support and practical guidance.

## Features

- **One-Tap Interface**: Simple, calming UI designed for stressed parents
- **Voice-First**: Speak naturally about your challenges
- **Empathetic Responses**: Pre-recorded calming messages followed by personalized AI coaching
- **Continuous Conversation**: Keep talking until you feel better
- **Mobile-Friendly**: Works on any device with a microphone

## Getting Started

### Local Development

1. Open `index.html` in a web browser
2. Allow microphone permissions when prompted
3. Tap the button to start talking

For production deployment, you'll need a web server due to browser security restrictions on microphone access.

### Quick Server Setup

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## API Integration

The app is structured with placeholder functions for three main API integrations. You'll need to implement these in `app.js`:

### 1. Speech-to-Text (Whisper API Recommended)

**Location**: `app.js:112` - `speechToText()` function

**Recommended Service**: OpenAI Whisper API

```javascript
async speechToText(audioBlob) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${YOUR_OPENAI_API_KEY}`
        },
        body: formData
    });

    const data = await response.json();
    return data.text;
}
```

**Alternative Options**:
- Google Cloud Speech-to-Text
- Azure Speech Services
- AssemblyAI
- Rev.ai

### 2. LLM for Coaching Responses

**Location**: `app.js:139` - `getLLMResponse()` function

**Recommended Service**: OpenAI GPT-4 or Anthropic Claude

**Example with OpenAI**:

```javascript
async getLLMResponse(transcription) {
    const systemPrompt = this.buildSystemPrompt();
    const messages = this.buildConversationContext(transcription);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${YOUR_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            temperature: 0.7,
            max_tokens: 150
        })
    });

    const data = await response.json();
    return data.choices[0].message.content;
}
```

**Example with Anthropic Claude**:

```javascript
async getLLMResponse(transcription) {
    const systemPrompt = this.buildSystemPrompt();
    const messages = this.buildConversationContext(transcription);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': YOUR_ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            system: systemPrompt,
            messages: messages,
            max_tokens: 150
        })
    });

    const data = await response.json();
    return data.content[0].text;
}
```

### 3. Text-to-Speech (ElevenLabs Recommended)

**Location**: `app.js:176` - `textToSpeech()` function

**Recommended Service**: ElevenLabs (natural, empathetic voices)

```javascript
async textToSpeech(text) {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': YOUR_ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        })
    });

    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
}
```

**Recommended Voices**: Choose a warm, empathetic voice (e.g., "Bella" or "Rachel")

**Alternative Options**:
- Google Cloud Text-to-Speech
- Azure Speech Services
- Amazon Polly
- Play.ht

### 4. Pre-recorded Audio Files

**Location**: `app.js:93` - `playPreRecordedResponse()` function

Add logic to select appropriate pre-recorded MP3 files based on initial emotion detection:

```javascript
async playPreRecordedResponse(audioBlob) {
    // Quick emotion detection from initial transcription
    const quickTranscript = await this.quickSpeechToText(audioBlob);
    const emotion = this.detectEmotion(quickTranscript);

    const audioMap = {
        'frustrated': '/audio/calm-frustrated.mp3',
        'angry': '/audio/calm-angry.mp3',
        'disappointed': '/audio/calm-disappointed.mp3',
        'overwhelmed': '/audio/calm-overwhelmed.mp3',
        'default': '/audio/calm-general.mp3'
    };

    const preRecordedUrl = audioMap[emotion] || audioMap['default'];
    await this.playResponse(preRecordedUrl);
}
```

## Backend Setup (Recommended)

For security, API keys should NOT be exposed in frontend code. Create a backend server to handle API calls:

### Example Node.js/Express Backend

```javascript
// server.js
const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public')); // Serve frontend files

// Speech-to-Text endpoint
app.post('/api/speech-to-text', async (req, res) => {
    // Forward to Whisper API with your API key
    // Return transcription
});

// LLM endpoint
app.post('/api/llm', async (req, res) => {
    // Forward to OpenAI/Claude with your API key
    // Return response
});

// Text-to-Speech endpoint
app.post('/api/text-to-speech', async (req, res) => {
    // Forward to ElevenLabs with your API key
    // Return audio stream
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## Customization

### Changing the System Prompt

Edit the `buildSystemPrompt()` function in `app.js:213` to customize the AI coach's personality and approach.

### Adjusting Colors

Modify CSS variables in `styles.css:6-13` to change the color scheme:

```css
:root {
    --primary-bg: #f5f7fa;        /* Background color */
    --primary-color: #6b9bd1;     /* Main button color */
    --listening-color: #e8a87c;   /* Recording state color */
    --success-color: #81c784;     /* Success/responding color */
}
```

### Button Size and Text

- Button size: `styles.css:69-71`
- Text labels: `app.js` - search for `buttonText.textContent`

## Browser Compatibility

- Chrome/Edge: Full support ✓
- Safari: Full support ✓
- Firefox: Full support ✓
- Mobile browsers: Full support ✓ (requires HTTPS in production)

## Security Notes

1. **HTTPS Required**: Microphone access requires HTTPS in production
2. **API Keys**: Never expose API keys in frontend code - use a backend server
3. **CORS**: Configure CORS properly when using external APIs
4. **Data Privacy**: Consider HIPAA/GDPR compliance for storing user conversations

## Deployment

### Quick Deploy Options

1. **Vercel/Netlify** (with serverless functions for API routes)
2. **Firebase Hosting** (with Cloud Functions)
3. **AWS S3 + CloudFront** (with Lambda for API routes)
4. **Heroku/Railway** (full-stack deployment)

Remember to set up environment variables for API keys in your deployment platform.

## License

MIT License - feel free to modify and use for your project.

## Support

For issues or questions about the UI implementation, please open an issue in your repository.
