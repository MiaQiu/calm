// Test Claude API to find working model
require('dotenv').config();
const fetch = require('node-fetch');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const modelsToTest = [
    'claude-opus-4-20250514',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-sonnet-20240620',
    'claude-3-sonnet-20240229',
    'claude-3-opus-20240229',
    'claude-3-haiku-20240307',
    'claude-2.1',
    'claude-2.0',
    'claude-instant-1.2'
];

async function testModel(modelName) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: modelName,
                system: 'You are a helpful assistant.',
                messages: [
                    { role: 'user', content: 'Say hello in 3 words.' }
                ],
                max_tokens: 50
            })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ SUCCESS: ${modelName}`);
            console.log(`   Response: ${data.content[0].text}`);
            console.log('');
            return true;
        } else {
            const errorText = await response.text();
            const error = JSON.parse(errorText);
            console.log(`❌ FAILED: ${modelName}`);
            console.log(`   Error: ${error.error.type} - ${error.error.message}`);
            console.log('');
            return false;
        }
    } catch (error) {
        console.log(`❌ ERROR: ${modelName}`);
        console.log(`   ${error.message}`);
        console.log('');
        return false;
    }
}

async function main() {
    console.log('🔍 Testing Claude API models...');
    console.log(`API Key: ${ANTHROPIC_API_KEY ? ANTHROPIC_API_KEY.substring(0, 20) + '...' : 'NOT SET'}`);
    console.log('');

    if (!ANTHROPIC_API_KEY) {
        console.error('❌ ANTHROPIC_API_KEY not found in .env file');
        process.exit(1);
    }

    let foundWorkingModel = false;

    for (const model of modelsToTest) {
        const success = await testModel(model);
        if (success && !foundWorkingModel) {
            foundWorkingModel = true;
            console.log(`🎉 RECOMMENDED MODEL: ${model}`);
            console.log('   Update server.js to use this model.');
            console.log('');
        }
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!foundWorkingModel) {
        console.log('');
        console.log('⚠️  No working models found!');
        console.log('   Possible issues:');
        console.log('   1. API key is invalid or expired');
        console.log('   2. Account doesn\'t have access to any models');
        console.log('   3. Billing/credits not set up');
        console.log('   4. Check https://console.anthropic.com for details');
    }
}

main();
