# Active Listening Mode

Your Calm app now uses **active listening** - it automatically detects when you start and stop speaking, so you don't need to press buttons!

## How It Works

### 1. **App Starts Listening Automatically**
   - When you load the page, the app immediately asks for microphone permission
   - Once granted, it starts listening continuously
   - The button shows "Listening" with a slow blue pulse

### 2. **Voice Activity Detection**
   - The app monitors audio levels in real-time
   - When it detects your voice (volume above threshold), it automatically starts recording
   - Button changes to "Speaking" with an orange pulse
   - Status shows "I'm listening..."

### 3. **Automatic Stop**
   - When you stop talking, the app waits for **2 seconds of silence**
   - After 2 seconds of silence, it automatically stops recording
   - Then processes your message and plays a response

### 4. **Continuous Cycle**
   - After playing the response, the app returns to listening mode
   - You can speak again whenever you're ready
   - No need to press anything - just talk naturally!

### 5. **Ending the Session**
   - Click "I'm Done for Now" button to end your session
   - This stops the microphone and closes the app
   - Refresh the page to start a new session

## Visual States

| State | Button Color | Button Text | What's Happening |
|-------|-------------|-------------|------------------|
| **Listening** | Blue (slow pulse) | "Listening" | Waiting for you to speak |
| **Speaking** | Orange (fast pulse) | "Speaking" | Recording your voice |
| **Processing** | Gray | "Processing..." | Converting speech to text |
| **Responding** | Green | "Responding..." | Playing audio response |

## Adjusting Sensitivity

If the app is too sensitive or not sensitive enough, you can adjust these settings in `app.js`:

### Volume Threshold (line 26)
```javascript
this.volumeThreshold = 0.02; // Lower = more sensitive, Higher = less sensitive
```
- **Too sensitive** (triggers on background noise)? Increase to `0.03` or `0.04`
- **Not sensitive enough** (doesn't detect your voice)? Decrease to `0.01` or `0.015`

### Silence Timeout (line 25)
```javascript
this.silenceThreshold = 2000; // Milliseconds of silence before stopping
```
- **Stops too quickly**? Increase to `3000` (3 seconds) or `4000` (4 seconds)
- **Takes too long to stop**? Decrease to `1500` (1.5 seconds) or `1000` (1 second)

## Troubleshooting

### "The app triggers when there's no speech"
- Increase `volumeThreshold` to make it less sensitive
- Check for background noise (fans, AC, etc.)
- Try moving to a quieter location

### "The app doesn't detect my voice"
- Decrease `volumeThreshold` to make it more sensitive
- Speak louder or move closer to the microphone
- Check microphone permissions in browser settings
- Test your microphone in browser settings

### "Recording stops in the middle of my sentence"
- Increase `silenceThreshold` to wait longer before stopping
- Try to speak more continuously without long pauses
- Or adjust your speaking pace

### "Recording takes too long to stop after I'm done"
- Decrease `silenceThreshold` to stop faster
- This is the tradeoff for not cutting off mid-sentence

### "Microphone permission denied"
- Check browser settings (chrome://settings/content/microphone)
- Some browsers require HTTPS for microphone access
- Try a different browser

### "False positives - recording tiny clips"
The app filters out recordings under 1KB (app.js line 174) to prevent false positives. You can adjust this threshold if needed.

## Best Practices

1. **Speak naturally** - No need to pause for buttons
2. **Wait for the button** to show "Listening" before speaking again
3. **Speak clearly** - Background noise can affect detection
4. **Use headphones** - Prevents feedback and echo issues
5. **Quiet environment** - Works best without background noise

## Technical Details

The active listening uses:
- **Web Audio API** - For real-time audio analysis
- **AnalyserNode** - To measure volume levels
- **MediaRecorder** - To capture audio
- **Voice Activity Detection (VAD)** - Custom algorithm based on volume thresholds

The app checks audio levels every **100ms** and makes decisions about when to start/stop recording based on consistent speech patterns.

## Privacy Note

- Audio is only recorded when speech is detected
- Recordings are processed and then discarded
- The microphone is only active during your session
- Clicking "I'm Done for Now" completely stops the microphone
- No audio is stored or saved anywhere

## Future Improvements

Potential enhancements:
1. Use machine learning-based VAD for better accuracy
2. Add visual feedback showing current volume level
3. Allow user to manually trigger recording if needed
4. Add "pause listening" button for temporary breaks
5. Implement wake word detection (e.g., "Hey Calm")
