// Quick test for ElevenLabs Text-to-Speech API
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

console.log('🔍 Testing ElevenLabs API...\n');
console.log(`API Key: ${ELEVENLABS_API_KEY ? ELEVENLABS_API_KEY.substring(0, 15) + '...' : '❌ NOT SET'}`);
console.log(`Voice ID: ${ELEVENLABS_VOICE_ID}\n`);

if (!ELEVENLABS_API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY not found in .env file');
    process.exit(1);
}

async function testTextToSpeech() {
    const testText = "Hello! I'm here to support you. You're doing great.";

    console.log(`📝 Converting text to speech: "${testText}"\n`);

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: testText,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            console.error(`❌ API Error (${response.status}):`);
            console.error(error);
            return false;
        }

        // Save audio to file
        const buffer = await response.buffer();
        const filename = 'test-tts-output.mp3';
        fs.writeFileSync(filename, buffer);

        console.log('✅ SUCCESS!');
        console.log(`   Audio file saved: ${filename}`);
        console.log(`   File size: ${(buffer.length / 1024).toFixed(2)} KB`);
        console.log(`\n🎧 To play the audio:`);
        console.log(`   macOS: open ${filename}`);
        console.log(`   Linux: xdg-open ${filename}`);
        console.log(`   Windows: start ${filename}`);

        return true;

    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

async function checkSubscription() {
    console.log('📊 Checking subscription info...\n');

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
            method: 'GET',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY
            }
        });

        if (!response.ok) {
            console.error('⚠️  Could not fetch subscription info');
            return;
        }

        const data = await response.json();
        console.log('✅ Subscription Details:');
        console.log(`   Tier: ${data.tier || 'N/A'}`);
        console.log(`   Characters used: ${data.character_count || 0} / ${data.character_limit || 0}`);

        const remaining = (data.character_limit || 0) - (data.character_count || 0);
        console.log(`   Characters remaining: ${remaining}`);
        console.log('');

    } catch (error) {
        console.error('⚠️  Could not check subscription:', error.message);
        console.log('');
    }
}

async function listAvailableVoices() {
    console.log('🎤 Fetching available voices for your account...\n');

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            method: 'GET',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY
            }
        });

        if (!response.ok) {
            console.error('❌ Could not fetch voices');
            return null;
        }

        const data = await response.json();
        console.log(`✅ Found ${data.voices.length} available voices:\n`);

        // Show all available voices
        data.voices.forEach((voice, index) => {
            console.log(`${index + 1}. ${voice.name}`);
            console.log(`   ID: ${voice.voice_id}`);
            console.log(`   Category: ${voice.category || 'N/A'}`);
            if (voice.labels) {
                console.log(`   Labels: ${Object.entries(voice.labels).map(([k,v]) => `${k}:${v}`).join(', ')}`);
            }
            console.log('');
        });

        return data.voices;

    } catch (error) {
        console.error('❌ Error fetching voices:', error.message);
        return null;
    }
}

async function main() {
    await checkSubscription();

    const voices = await listAvailableVoices();

    if (voices && voices.length > 0) {
        // Try with the first available voice
        const firstVoice = voices[0];
        console.log(`\n🧪 Testing with available voice: ${firstVoice.name} (${firstVoice.voice_id})\n`);

        // Temporarily override the voice ID
        process.env.ELEVENLABS_VOICE_ID = firstVoice.voice_id;

        const success = await testTextToSpeech();

        if (success) {
            console.log(`\n💡 RECOMMENDED: Update your .env file with:`);
            console.log(`   ELEVENLABS_VOICE_ID=${firstVoice.voice_id}`);
        }
    }
}

main();
