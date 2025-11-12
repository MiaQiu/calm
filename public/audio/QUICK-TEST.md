# Quick Test - Add Sample MP3 Files

To test the random audio playback feature immediately, you need to add MP3 files to this folder.

## Option 1: Quick Test with Any MP3 Files

If you just want to test the functionality, you can temporarily use ANY MP3 files you have:

1. Find any 7 MP3 files on your computer (music, podcasts, anything)
2. Copy them to this folder and rename them:
   - `calm-frustrated.mp3`
   - `calm-angry.mp3`
   - `calm-disappointed.mp3`
   - `calm-overwhelmed.mp3`
   - `calm-hopeless.mp3`
   - `calm-shame.mp3`
   - `calm-general.mp3`

3. Test the app - it will randomly play one of these files

## Option 2: Generate Test Audio with Text-to-Speech

Use a free online TTS service to quickly generate test files:

### Using MacOS (Built-in):
```bash
# Run these commands in Terminal from the /audio folder:
say -v Samantha "I hear you. Take a deep breath. You're not alone in this." -o calm-frustrated.mp3 --file-format=mp4f

say -v Samantha "I understand you're feeling angry right now. Let's pause and breathe together." -o calm-angry.mp3 --file-format=mp4f

say -v Samantha "I can hear the disappointment in your voice. Every parent experiences moments like this." -o calm-disappointed.mp3 --file-format=mp4f

say -v Samantha "It sounds like you're carrying a lot right now. Let's take this one step at a time." -o calm-overwhelmed.mp3 --file-format=mp4f

say -v Samantha "I hear how hard this feels. Things will change. You've gotten through difficult moments before." -o calm-hopeless.mp3 --file-format=mp4f

say -v Samantha "Thank you for being brave enough to share this. You're not a bad parent for feeling this way." -o calm-shame.mp3 --file-format=mp4f

say -v Samantha "Thank you for sharing what's on your heart. I'm here to listen without judgment." -o calm-general.mp3 --file-format=mp4f
```

Note: MacOS `say` command creates M4A files with .mp3 extension. They will still work in browsers.

### Using Windows (Built-in):
Use PowerShell with Windows Speech:
```powershell
Add-Type -AssemblyName System.Speech
$speak = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speak.SetOutputToWaveFile("calm-general.wav")
$speak.Speak("Thank you for sharing what's on your heart. I'm here to listen.")
$speak.Dispose()
```

Then convert WAV to MP3 using an online converter or FFmpeg.

## Option 3: Online Text-to-Speech Services (Best Quality)

Free options for testing:
1. **TTSMaker.com** - Free, no signup, natural voices
2. **NaturalReaders.com** - Free tier available
3. **Speechify.com** - Free trial

Paid options for production:
1. **ElevenLabs** - Most natural, empathetic voices ($5/month)
2. **Play.ht** - High quality voices ($19/month)

## Verify Files Are Working

After adding MP3 files, run this test:

1. Reload the app: http://localhost:8000
2. Open browser console (F12 → Console tab)
3. Record something and check console for: `Playing: /audio/calm-[emotion].mp3`
4. Verify audio plays

## Current Status

Run this command to see which files you have:
```bash
ls -la /Users/mia/calm/audio/*.mp3
```

If you see "No such file or directory", you need to add MP3 files.

## Remove Test Files Later

Once you have proper recordings, simply replace these test files with your professional recordings using the same filenames.
