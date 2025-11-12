// Test ElevenLabs Text-to-Speech API
require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Test with a simple message
const testText = "Hello! I'm here to support you through this difficult moment. You're doing great.";

async function getVoices() {
    console.log('🎤 Fetching available voices...\n');

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/voices', {
            method: 'GET',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY
            }
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Failed to fetch voices:', response.status);
            console.error('   Error:', error);
            return null;
        }

        const data = await response.json();
        console.log(`✅ Found ${data.voices.length} available voices:\n`);

        // Display voices with their details
        data.voices.forEach((voice, index) => {
            console.log(`${index + 1}. ${voice.name}`);
            console.log(`   ID: ${voice.voice_id}`);
            console.log(`   Category: ${voice.category || 'N/A'}`);
            console.log(`   Description: ${voice.description || 'N/A'}`);
            console.log('');
        });

        return data.voices;
    } catch (error) {
        console.error('❌ Error fetching voices:', error.message);
        return null;
    }
}

async function testTextToSpeech(voiceId, voiceName) {
    console.log(`\n🎙️  Testing voice: ${voiceName} (${voiceId})`);

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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
            console.error(`   ❌ Failed: ${response.status}`);
            console.error(`   Error: ${error}`);
            return false;
        }

        // Save audio to file
        const buffer = await response.buffer();
        const filename = `test-voice-${voiceName.replace(/\s+/g, '-').toLowerCase()}.mp3`;
        fs.writeFileSync(filename, buffer);

        console.log(`   ✅ SUCCESS! Audio saved to: ${filename}`);
        console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);
        console.log(`   Text: "${testText}"`);

        return true;
    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        return false;
    }
}

async function testSubscriptionInfo() {
    console.log('\n📊 Checking subscription info...\n');

    try {
        const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
            method: 'GET',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY
            }
        });

        if (!response.ok) {
            console.error('❌ Could not fetch subscription info');
            return;
        }

        const data = await response.json();
        console.log('✅ Subscription Details:');
        console.log(`   Tier: ${data.tier || 'N/A'}`);
        console.log(`   Character Count: ${data.character_count || 0}`);
        console.log(`   Character Limit: ${data.character_limit || 0}`);
        console.log(`   Can Extend: ${data.can_extend_character_limit || false}`);
        console.log('');
    } catch (error) {
        console.error('❌ Error fetching subscription:', error.message);
    }
}

async function main() {
    console.log('🔍 Testing ElevenLabs API...');
    console.log(`API Key: ${ELEVENLABS_API_KEY ? ELEVENLABS_API_KEY.substring(0, 20) + '...' : 'NOT SET'}`);
    console.log('');

    if (!ELEVENLABS_API_KEY) {
        console.error('❌ ELEVENLABS_API_KEY not found in .env file');
        process.exit(1);
    }

    // Get subscription info
    await testSubscriptionInfo();

    // Get available voices
    const voices = await getVoices();

    if (!voices || voices.length === 0) {
        console.log('⚠️  No voices available. Check your API key and account status.');
        return;
    }

    // Find recommended voices for empathetic coaching
    console.log('🎯 Recommended voices for parenting coaching:');
    const recommendedNames = ['rachel', 'bella', 'charlotte', 'serena', 'emily'];
    const recommendedVoices = voices.filter(v =>
        recommendedNames.some(name => v.name.toLowerCase().includes(name))
    );

    if (recommendedVoices.length > 0) {
        console.log(`   Found ${recommendedVoices.length} recommended voices\n`);

        // Test the first recommended voice
        const testVoice = recommendedVoices[0];
        console.log(`\n🧪 Testing recommended voice: ${testVoice.name}`);
        const success = await testTextToSpeech(testVoice.voice_id, testVoice.name);

        if (success) {
            console.log('\n✅ RECOMMENDED VOICE FOR YOUR APP:');
            console.log(`   Name: ${testVoice.name}`);
            console.log(`   ID: ${testVoice.voice_id}`);
            console.log(`   Update your .env file with: ELEVENLABS_VOICE_ID=${testVoice.voice_id}`);
        }
    } else {
        // Test with first available voice
        console.log('   No specifically recommended voices found. Testing first available voice.\n');
        const testVoice = voices[0];
        await testTextToSpeech(testVoice.voice_id, testVoice.name);

        console.log(`\n💡 TIP: Browse all voices and pick one that sounds warm and empathetic.`);
        console.log(`   Update .env with: ELEVENLABS_VOICE_ID=<voice_id>`);
    }

    console.log('\n🎧 To play the generated audio:');
    console.log('   macOS: open test-voice-*.mp3');
    console.log('   Linux: xdg-open test-voice-*.mp3');
    console.log('   Windows: start test-voice-*.mp3');
}

main();
