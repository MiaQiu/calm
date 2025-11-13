#!/bin/bash

# Generate Test Audio Files for Calm App
# This script uses MacOS built-in text-to-speech to create placeholder audio files
# Run: chmod +x generate-test-audio.sh && ./generate-test-audio.sh

echo "🎙️  Generating test audio files..."
echo ""

# Check if on MacOS
if ! command -v say &> /dev/null; then
    echo "❌ 'say' command not found. This script works on MacOS only."
    echo "For other systems, see QUICK-TEST.md for alternatives."
    exit 1
fi

# Create audio files using MacOS say command
echo "📝 Creating calm-frustrated.mp3..."
say -v Samantha "I hear you. Parenting can be incredibly frustrating, especially when things don't go as planned. Take a deep breath with me. You're doing the best you can, and it's okay to feel this way. Let's work through this together." -o calm-frustrated.m4a --data-format=aac
mv calm-frustrated.m4a calm-frustrated.mp3

echo "📝 Creating calm-angry.mp3..."
say -v Samantha "I understand you're feeling angry right now. That's a completely valid emotion. Let's pause for a moment and breathe together. In through your nose, out through your mouth. You're not alone in feeling this way." -o calm-angry.m4a --data-format=aac
mv calm-angry.m4a calm-angry.mp3

echo "📝 Creating calm-disappointed.mp3..."
say -v Samantha "I can hear the disappointment in your voice, and I want you to know that's okay. Every parent experiences moments like this. You're showing up and trying, and that matters so much. Let's talk about what happened." -o calm-disappointed.m4a --data-format=aac
mv calm-disappointed.m4a calm-disappointed.mp3

echo "📝 Creating calm-overwhelmed.mp3..."
say -v Samantha "It sounds like you're carrying a lot right now. Feeling overwhelmed is a sign that you care deeply. Let's slow down together and take this one step at a time. You don't have to figure everything out all at once." -o calm-overwhelmed.m4a --data-format=aac
mv calm-overwhelmed.m4a calm-overwhelmed.mp3

echo "📝 Creating calm-hopeless.mp3..."
say -v Samantha "I hear how hard this feels right now. When we're in the thick of it, it can seem like things will never change. But they will. You've gotten through difficult moments before, and you will again. I'm here with you." -o calm-hopeless.m4a --data-format=aac
mv calm-hopeless.m4a calm-hopeless.mp3

echo "📝 Creating calm-shame.mp3..."
say -v Samantha "Thank you for being brave enough to share this. Many parents feel shame about their struggles, but you're not a bad parent for feeling this way. You're a human parent doing your best in a challenging situation. Let's work on this together without judgment." -o calm-shame.m4a --data-format=aac
mv calm-shame.m4a calm-shame.mp3

echo "📝 Creating calm-general.mp3..."
say -v Samantha "Thank you for sharing what's on your heart. I'm here to listen without judgment and support you through this. Take a moment to breathe, and know that you're not alone in this journey." -o calm-general.m4a --data-format=aac
mv calm-general.m4a calm-general.mp3

echo ""
echo "✅ All 7 test audio files created!"
echo ""
echo "Files created:"
ls -lh *.mp3 2>/dev/null || echo "No MP3 files found"
echo ""
echo "🎯 Next steps:"
echo "1. Reload your app at http://localhost:8000"
echo "2. Test by recording your voice"
echo "3. One of these files will play randomly"
echo ""
echo "💡 These are TEST files using MacOS text-to-speech."
echo "   For production, replace with professional recordings."
echo "   See README.md for recording tips."
