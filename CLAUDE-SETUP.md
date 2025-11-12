# Claude API Integration Setup

Your app now uses **Claude 3.5 Sonnet** for empathetic, compassionate coaching responses!

## ✅ What's Already Done

- ✅ Backend configured for Claude API (Messages API)
- ✅ Frontend enabled to call Claude endpoint
- ✅ Fallback to placeholder if backend not running
- ✅ Error handling and logging
- ✅ Optimized system prompt for parenting coaching

## 🚀 Quick Setup

### Step 1: Get Your Anthropic API Key

1. Sign up at https://console.anthropic.com
2. Go to API Keys section
3. Create a new API key
4. Copy the key (starts with `sk-ant-`)

### Step 2: Add to Environment Config

Edit your `.env` file:
```bash
nano .env
```

Add your key:
```
DEEPGRAM_API_KEY=your_deepgram_key_here
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

### Step 3: Restart Backend Server

```bash
# Stop the current server (Ctrl+C if running)

# Start with new config
npm start
```

### Step 4: Test Claude Integration

1. Open http://localhost:3000
2. Speak something (e.g., "I'm frustrated with my child")
3. Check browser console (F12) for:
   ```
   Claude response: [actual empathetic response]
   ```

## 🎯 Claude Model & Configuration

Your app uses:
- **Model**: `claude-3-5-sonnet-20241022` (latest Sonnet)
- **Max tokens**: 200 (2-3 sentences, perfect for coaching)
- **Temperature**: 0.7 (balanced creativity and consistency)

### Why Claude 3.5 Sonnet?

Perfect for your app because:
- ✅ **Empathetic and warm** - Natural, caring tone
- ✅ **Context aware** - Maintains conversation flow
- ✅ **Concise** - Can give brief, actionable responses
- ✅ **Fast** - Low latency (~1-2 seconds)
- ✅ **Reliable** - Consistent quality

## 📊 Expected Response Times

With Claude + Deepgram:
- **Speech-to-text** (Deepgram): 300-500ms
- **LLM response** (Claude): 1-2 seconds
- **Total**: ~2-3 seconds from speech end to response

## 🎨 System Prompt

The app uses this coaching-focused prompt:

```
You are a compassionate AI coach helping overwhelmed parents. Your role is to:
1. Listen with empathy and validate their feelings
2. Help them calm down and regulate their emotions
3. Provide practical, actionable tips to rebuild relationships with their children
4. Keep responses conversational, warm, and brief (2-3 sentences max)
5. Focus on emotional support first, then practical guidance
6. Use a gentle, non-judgmental tone
```

You can customize this in `app.js` at the `buildSystemPrompt()` function (line 386).

## 🔍 Verification

### Check Health Status
Visit: http://localhost:3000/api/health

Should show:
```json
{
  "status": "ok",
  "services": {
    "deepgram": true,
    "claude": true,
    "elevenlabs": true
  }
}
```

### Check Console Logs
After speaking, you should see:
1. **Browser console**: `Claude response: [the response]`
2. **Server logs**: `Claude response: [the response]`

If you see "Using placeholder response" - backend isn't connected.

## 💰 Pricing

Anthropic Claude 3.5 Sonnet pricing:
- **Input**: $3.00 per million tokens
- **Output**: $15.00 per million tokens

**Typical parent session cost:**
- 10-minute conversation (~20 exchanges)
- Input tokens: ~2,000 ($0.006)
- Output tokens: ~800 ($0.012)
- **Total: ~$0.02 per session** (2 cents)

Plus Deepgram: ~$0.043 per 10 minutes

**Combined total**: ~$0.06 per 10-minute session

## 🐛 Troubleshooting

### "Failed to get LLM response"
- Check your API key in `.env`
- Verify you have Anthropic credits
- Check server logs for detailed errors

### "Using placeholder response (backend not running)"
- Backend server not running - run `npm start`
- Check if frontend is served from backend (http://localhost:3000)
- Verify port 3000 is available

### Response quality issues

**If responses are too long:**
Edit `server.example.js` line 71:
```javascript
max_tokens: 150  // Reduce from 200
```

**If responses are too conservative:**
Edit `app.js` line 321:
```javascript
temperature: 0.8  // Increase from 0.7
```

**If responses aren't empathetic enough:**
Enhance the system prompt in `app.js` at `buildSystemPrompt()`.

### API rate limits
Claude has rate limits:
- Free tier: 50 requests per day
- Paid tier: Much higher limits

Check your usage at: https://console.anthropic.com

## 🎭 Claude vs Other Models

| Feature | Claude 3.5 Sonnet | GPT-4 | GPT-3.5 |
|---------|------------------|--------|---------|
| Empathy | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Speed | ~1-2s | ~2-3s | ~1s |
| Cost/session | $0.02 | $0.05 | $0.002 |
| Context window | 200K | 128K | 16K |
| Best for | Coaching, therapy | General purpose | Speed/cost |

**Claude is ideal for your emotional support use case.**

## 📈 Optimizations

### Reduce Latency Further
1. **Streaming responses** - Start playing audio before full response
2. **Parallel processing** - Start TTS while Claude is finishing
3. **Prompt caching** - Reuse system prompt (saves tokens)

### Improve Response Quality
1. **Few-shot examples** - Add example conversations to prompt
2. **Conversation memory** - Currently maintains full history
3. **Emotion detection** - Adjust tone based on detected emotion

## 🔐 Security Best Practices

✅ **Do:**
- Keep API keys in `.env` file (never commit to git)
- Use backend to protect keys
- Monitor API usage regularly
- Set up rate limiting if needed

❌ **Don't:**
- Put API keys in frontend code
- Commit `.env` file to version control
- Share API keys publicly

## 🧪 Testing Conversation Flow

Test different scenarios:

1. **Frustration:**
   - "I'm so frustrated with my child right now"
   - Expect: Validation + breathing/calming technique

2. **Guilt/Shame:**
   - "I yelled at my kid and feel terrible"
   - Expect: Non-judgmental validation + self-compassion

3. **Overwhelm:**
   - "I can't handle everything anymore"
   - Expect: Empathy + breaking down into steps

4. **Follow-up questions:**
   - "What should I do next?"
   - Expect: Practical, actionable advice

## 📝 Sample Conversation

**User**: "I'm so frustrated, my 5-year-old won't listen to anything I say"

**Claude**: "I hear how frustrated you're feeling. It's exhausting when our children seem to tune us out. Let's take a breath together—you're not alone in this. What's one moment today where they did listen, even briefly? Sometimes starting with what's working, even in small ways, can help us find our way forward."

**User**: "Well, they did clean up their toys when I asked nicely this morning"

**Claude**: "That's wonderful! See, you already have a strategy that worked—asking nicely rather than demanding. Children respond so much better to gentle requests than commands. Could you try using that same calm tone next time, maybe getting down to their eye level first?"

## 🎯 Next Steps

1. ✅ Get Claude working (this guide)
2. Add ElevenLabs for voice responses
3. Test full conversation flow
4. Fine-tune system prompt based on feedback
5. Deploy to production

## 📚 Resources

- [Anthropic Claude Documentation](https://docs.anthropic.com)
- [Claude Prompt Engineering Guide](https://docs.anthropic.com/claude/docs/prompt-engineering)
- [API Reference](https://docs.anthropic.com/claude/reference/messages_post)

## Support

Having issues?
1. Check server logs: Look for error messages
2. Check browser console: F12 → Console tab
3. Verify API key: Test at console.anthropic.com
4. Check credits: Ensure you have available balance
