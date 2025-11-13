// Example Node.js/Express Backend Server
// This keeps your API keys secure and handles all external API calls

const express = require('express');
const multer = require('multer');
const FormData = require('form-data');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(express.json());
app.use(express.static('.')); // Serve static files from root (for Vercel compatibility)
app.use(express.static('public')); // Also serve from public folder for any remaining files

// Configuration from environment variables
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'; // Default: Bella

// Speech-to-Text endpoint using Deepgram
app.post('/api/speech-to-text', upload.single('audio'), async (req, res) => {
    try {
        const audioBuffer = req.file.buffer;

        // Call Deepgram API
        const response = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${DEEPGRAM_API_KEY}`,
                'Content-Type': req.file.mimetype || 'audio/webm'
            },
            body: audioBuffer
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Deepgram API error:', response.status, errorText);
            throw new Error(`Deepgram API error: ${response.status}`);
        }

        const data = await response.json();
        const transcription = data.results.channels[0].alternatives[0].transcript;
        res.json({ transcription });

    } catch (error) {
        console.error('Speech-to-text error:', error);
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
});

// LLM endpoint using Claude API
app.post('/api/llm', async (req, res) => {
    try {
        const { system, messages, temperature = 0.7 } = req.body;

        console.log('Received messages:', JSON.stringify(messages, null, 2));

        // Filter out empty messages
        const validMessages = messages.filter(msg =>
            msg && msg.content && msg.content.trim() !== ''
        );

        console.log('Valid messages after filtering:', JSON.stringify(validMessages, null, 2));

        if (validMessages.length === 0) {
            throw new Error('No valid messages to send to Claude');
        }

        // Call Anthropic Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-opus-4-20250514',
                system: system,
                messages: validMessages,
                max_tokens: 200,
                temperature: temperature
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Claude API error:', response.status, errorText);
            throw new Error(`Claude API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.content || !data.content[0] || !data.content[0].text) {
            console.error('Invalid Claude API response:', JSON.stringify(data));
            throw new Error('Invalid response from Claude API');
        }

        const responseText = data.content[0].text;

        console.log('Claude response:', responseText);
        res.json({ response: responseText });

    } catch (error) {
        console.error('LLM error:', error);
        res.status(500).json({ error: 'Failed to get LLM response' });
    }
});

// Text-to-Speech endpoint using ElevenLabs
app.post('/api/text-to-speech', async (req, res) => {
    try {
        const { text, voice_id = ELEVENLABS_VOICE_ID, model_id = 'eleven_monolingual_v1' } = req.body;

        console.log('TTS request - text length:', text?.length, 'voice_id:', voice_id);

        // Call ElevenLabs API
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: model_id,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', response.status, errorText);
            throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
        }

        // Stream audio back to client
        res.setHeader('Content-Type', 'audio/mpeg');
        response.body.pipe(res);

    } catch (error) {
        console.error('Text-to-speech error:', error);
        res.status(500).json({ error: 'Failed to generate speech', details: error.message });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        services: {
            deepgram: !!DEEPGRAM_API_KEY,
            claude: !!ANTHROPIC_API_KEY,
            elevenlabs: !!ELEVENLABS_API_KEY
        }
    });
});

const PORT = process.env.PORT || 3000;

// Only start server if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🎙️  Calm AI Coach server running on port ${PORT}`);
        console.log(`📝 Frontend: http://localhost:${PORT}`);
        console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    });
}

// Export for Vercel serverless
module.exports = app;

// Alternative: Using Anthropic Claude instead of OpenAI
/*
app.post('/api/llm', async (req, res) => {
    try {
        const { system, messages, temperature = 0.7 } = req.body;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                system: system,
                messages: messages,
                max_tokens: 150
            })
        });

        const data = await response.json();
        res.json({ response: data.content[0].text });

    } catch (error) {
        console.error('Claude API error:', error);
        res.status(500).json({ error: 'Failed to get Claude response' });
    }
});
*/
