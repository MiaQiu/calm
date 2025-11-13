# Pre-Recorded Audio Files

This folder contains calming pre-recorded messages that play immediately after the parent shares their initial concern. These provide instant emotional support while the AI processes their full response.

## Recommended Audio Files

Create warm, empathetic audio recordings (30-60 seconds each) for different emotional states:

### Required Files:

1. **calm-frustrated.mp3**
   - For: Parents expressing frustration
   - Sample script: "I hear you. Parenting can be incredibly frustrating, especially when things don't go as planned. Take a deep breath with me... You're doing the best you can, and it's okay to feel this way. Let's work through this together."

2. **calm-angry.mp3**
   - For: Parents expressing anger
   - Sample script: "I understand you're feeling angry right now. That's a completely valid emotion. Let's pause for a moment and breathe together... In through your nose, out through your mouth. You're not alone in feeling this way."

3. **calm-disappointed.mp3**
   - For: Parents expressing disappointment
   - Sample script: "I can hear the disappointment in your voice, and I want you to know that's okay. Every parent experiences moments like this. You're showing up and trying, and that matters so much. Let's talk about what happened."

4. **calm-overwhelmed.mp3**
   - For: Parents feeling overwhelmed
   - Sample script: "It sounds like you're carrying a lot right now. Feeling overwhelmed is a sign that you care deeply. Let's slow down together and take this one step at a time. You don't have to figure everything out all at once."

5. **calm-hopeless.mp3**
   - For: Parents expressing hopelessness or despair
   - Sample script: "I hear how hard this feels right now. When we're in the thick of it, it can seem like things will never change. But they will. You've gotten through difficult moments before, and you will again. I'm here with you."

6. **calm-shame.mp3**
   - For: Parents expressing shame or guilt
   - Sample script: "Thank you for being brave enough to share this. Many parents feel shame about their struggles, but you're not a bad parent for feeling this way. You're a human parent doing your best in a challenging situation. Let's work on this together without judgment."

7. **calm-general.mp3** (Default/Fallback)
   - For: When emotion isn't clearly identified or mixed emotions
   - Sample script: "Thank you for sharing what's on your heart. I'm here to listen without judgment and support you through this. Take a moment to breathe, and know that you're not alone in this journey."

## Recording Tips

### Voice Characteristics:
- **Tone**: Warm, calm, gentle, non-judgmental
- **Pace**: Slow and steady (helps with calming)
- **Pitch**: Lower/medium (more soothing than high-pitched)
- **Pauses**: Include breathing pauses where appropriate

### Technical Specs:
- **Format**: MP3
- **Bitrate**: 128 kbps or higher
- **Sample Rate**: 44.1 kHz
- **Duration**: 30-60 seconds
- **Volume**: Normalized (consistent across all files)

### Recording Services:
1. **Professional**: Hire voice actor on Fiverr/Upwork
2. **AI-Generated**: Use ElevenLabs, Play.ht, or similar (consistent quality)
3. **Self-Record**: Use Audacity, GarageBand, or similar software

## Implementation

Once you have your MP3 files in this folder, update the `playPreRecordedResponse()` function in `app.js` to use them:

```javascript
async playPreRecordedResponse(audioBlob) {
    this.setState(AppState.RESPONDING);
    this.updateStatus('I hear you... Let me help');

    // Quick analysis to select appropriate audio
    const quickTranscript = await this.quickSpeechToText(audioBlob);
    const emotion = this.detectEmotion(quickTranscript);

    const audioMap = {
        'frustrated': '/audio/frustrated1.mp3',
        'angry': '/audio/frustrated2.mp3',
        'disappointed': '/audio/frustrated1.mp3',
        'overwhelmed': '/audio/overwhelmed1.mp3',
        'hopeless': '/audio/overwhelmed2.mp3',
        'shame': '/audio/guilt1.mp3',
        'default': '/audio/guilt2.mp3'
    };

    const preRecordedUrl = audioMap[emotion] || audioMap['default'];

    this.responseAudio.src = preRecordedUrl;
    await this.responseAudio.play();
}
```

## Emotion Detection

Add a simple keyword-based emotion detection function:

```javascript
detectEmotion(text) {
    const lowerText = text.toLowerCase();

    if (lowerText.match(/frustrat|annoyed|irritat/)) return 'frustrated';
    if (lowerText.match(/angry|mad|furious|rage/)) return 'angry';
    if (lowerText.match(/disappoint|let down|failed/)) return 'disappointed';
    if (lowerText.match(/overwhelm|too much|can't handle|stressed/)) return 'overwhelmed';
    if (lowerText.match(/hopeless|give up|can't do this|impossible/)) return 'hopeless';
    if (lowerText.match(/shame|ashamed|terrible parent|bad parent|guilt/)) return 'shame';

    return 'default';
}
```

## File Naming Convention

Always use kebab-case with the `calm-` prefix:
- ✅ `calm-frustrated.mp3`
- ✅ `calm-general.mp3`
- ❌ `Frustrated.mp3`
- ❌ `calm_angry.mp3`

## Testing Your Audio

1. Place your MP3 files in this folder
2. Update `app.js` with the implementation code above
3. Test by recording messages with different emotional keywords
4. Verify the correct audio plays for each emotion type

## Notes

- Keep messages **non-judgmental** and validating
- Focus on **emotional support first**, practical advice second
- Include **breathing exercises** or calming techniques
- Ensure messages feel like a **real person** is listening
- Test with actual parents for feedback
