// Check ElevenLabs account status and capabilities
require('dotenv').config();
const fetch = require('node-fetch');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

console.log('🔍 Checking ElevenLabs Account Status\n');

async function checkUser() {
    try {
        const response = await fetch('https://api.elevenlabs.io/v1/user', {
            method: 'GET',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY
            }
        });

        if (!response.ok) {
            console.error('❌ Could not fetch user info');
            return;
        }

        const data = await response.json();
        console.log('👤 User Information:');
        console.log(JSON.stringify(data, null, 2));
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function checkSubscription() {
    try {
        const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
            method: 'GET',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY
            }
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('❌ Could not fetch subscription info:');
            console.error(error);
            return;
        }

        const data = await response.json();
        console.log('💳 Subscription Information:');
        console.log(JSON.stringify(data, null, 2));
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function main() {
    await checkUser();
    await checkSubscription();

    console.log('\n📝 Summary:');
    console.log('   ElevenLabs free tier has very limited access.');
    console.log('   Most voices require a paid subscription (Creator tier or above).');
    console.log('   \n   Options:');
    console.log('   1. Upgrade to a paid ElevenLabs plan (~$5-11/month)');
    console.log('   2. Use an alternative TTS service (Google Cloud TTS, Azure, etc.)');
    console.log('   3. Disable TTS and use text-only responses for now');
}

main();
