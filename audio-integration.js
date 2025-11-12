// Audio Integration Code
// Copy these functions into app.js to enable pre-recorded audio playback

// Add this function to the CalmApp class
async playPreRecordedResponse(audioBlob) {
    this.setState(AppState.RESPONDING);
    this.updateStatus('I hear you... Let me help');

    // Quick transcription for emotion detection
    const quickTranscript = await this.quickSpeechToText(audioBlob);
    const emotion = this.detectEmotion(quickTranscript);

    // Map emotions to audio files
    const audioMap = {
        'frustrated': '/audio/calm-frustrated.mp3',
        'angry': '/audio/calm-angry.mp3',
        'disappointed': '/audio/calm-disappointed.mp3',
        'overwhelmed': '/audio/calm-overwhelmed.mp3',
        'hopeless': '/audio/calm-hopeless.mp3',
        'shame': '/audio/calm-shame.mp3',
        'default': '/audio/calm-general.mp3'
    };

    const preRecordedUrl = audioMap[emotion] || audioMap['default'];

    // Play pre-recorded audio
    this.responseAudio.src = preRecordedUrl;

    // Handle audio events
    return new Promise((resolve) => {
        this.responseAudio.onended = () => {
            resolve();
        };
        this.responseAudio.onerror = (error) => {
            console.error('Audio playback error:', error);
            console.log(`Attempted to play: ${preRecordedUrl}`);
            // Continue even if audio fails
            resolve();
        };
        this.responseAudio.play().catch(error => {
            console.error('Failed to play audio:', error);
            resolve();
        });
    });
}

// Quick speech-to-text for emotion detection (simplified version)
// This runs in parallel with the full transcription
async quickSpeechToText(audioBlob) {
    // If you have backend, use the same endpoint
    // For frontend-only, use Web Speech API or return placeholder

    // Option 1: Use your backend (recommended)
    /*
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    return data.transcription;
    */

    // Option 2: Placeholder for testing
    await this.delay(500);
    return 'Sample text for emotion detection';
}

// Emotion detection from text
detectEmotion(text) {
    const lowerText = text.toLowerCase();

    // Pattern matching for different emotions
    const patterns = {
        frustrated: /frustrat|annoyed|irritat|exasperat|fed up/i,
        angry: /angry|mad|furious|rage|pissed|livid/i,
        disappointed: /disappoint|let down|failed|failure|not good enough/i,
        overwhelmed: /overwhelm|too much|can't handle|stressed|exhausted|drained/i,
        hopeless: /hopeless|give up|can't do this|impossible|no point|helpless/i,
        shame: /shame|ashamed|terrible parent|bad parent|bad mom|bad dad|guilt|guilty/i
    };

    // Check each pattern
    for (const [emotion, pattern] of Object.entries(patterns)) {
        if (pattern.test(lowerText)) {
            return emotion;
        }
    }

    // Default if no clear emotion detected
    return 'default';
}

// Updated processRecording function to use pre-recorded audio
async processRecording() {
    this.setState(AppState.PROCESSING);
    this.updateStatus('Processing your message...');
    this.buttonText.textContent = 'Processing...';

    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

    try {
        // Play pre-recorded response immediately
        if (this.isFirstMessage) {
            await this.playPreRecordedResponse(audioBlob);
        }

        // Meanwhile, process the full response
        const transcription = await this.speechToText(audioBlob);
        const llmResponse = await this.getLLMResponse(transcription);
        const audioUrl = await this.textToSpeech(llmResponse);

        // Play AI-generated response
        if (audioUrl) {
            await this.playResponse(audioUrl);
        } else {
            // If no audio URL, transition to ready state
            this.setState(AppState.IDLE);
            this.updateStatus('Tap to continue talking');
            this.buttonText.textContent = 'Continue Talking';
            this.showCloseButton();
        }

        this.isFirstMessage = false;
        this.conversationHistory.push({
            user: transcription,
            assistant: llmResponse
        });

    } catch (error) {
        console.error('Error processing recording:', error);
        this.updateStatus('Sorry, something went wrong. Please try again.', true);
        this.setState(AppState.IDLE);
        this.buttonText.textContent = 'Tap to Talk';
    }
}

// Helper: Check if audio files exist
async checkAudioFiles() {
    const requiredFiles = [
        '/audio/calm-frustrated.mp3',
        '/audio/calm-angry.mp3',
        '/audio/calm-disappointed.mp3',
        '/audio/calm-overwhelmed.mp3',
        '/audio/calm-hopeless.mp3',
        '/audio/calm-shame.mp3',
        '/audio/calm-general.mp3'
    ];

    const results = await Promise.all(
        requiredFiles.map(async (file) => {
            try {
                const response = await fetch(file, { method: 'HEAD' });
                return { file, exists: response.ok };
            } catch {
                return { file, exists: false };
            }
        })
    );

    const missing = results.filter(r => !r.exists);

    if (missing.length > 0) {
        console.warn('Missing audio files:', missing.map(m => m.file));
        console.warn('Add MP3 files to the /audio folder. See audio/README.md for details.');
    }

    return missing.length === 0;
}

// Call this in the init() method to check audio files on startup
// this.checkAudioFiles();
