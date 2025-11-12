// App State
const AppState = {
    IDLE: 'idle',
    LISTENING: 'listening',
    SPEAKING: 'speaking',
    PROCESSING: 'processing',
    RESPONDING: 'responding'
};

class CalmApp {
    constructor() {
        this.state = AppState.IDLE;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.conversationHistory = [];
        this.isFirstMessage = true;

        // Voice Activity Detection
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.vadCheckInterval = null;
        this.silenceTimeout = null;
        this.isSpeaking = false;
        this.silenceThreshold = 2000; // 2 seconds of silence to stop
        this.volumeThreshold = 0.02; // Adjust based on testing

        // DOM Elements
        this.mainButton = document.getElementById('mainButton');
        this.buttonText = this.mainButton.querySelector('.button-text');
        this.statusMessage = document.getElementById('statusMessage');
        this.closeButton = document.getElementById('closeButton');
        this.responseAudio = document.getElementById('responseAudio');
        this.transcriptionDisplay = document.getElementById('transcriptionDisplay');
        this.transcriptionText = document.getElementById('transcriptionText');

        this.init();
    }

    init() {
        // Request microphone permission and start active listening
        this.startActiveListening();

        // Event Listeners
        this.closeButton.addEventListener('click', () => this.handleClose());
        this.responseAudio.addEventListener('ended', () => this.onAudioEnded());

        // Button shows status only, not interactive for start/stop
        this.mainButton.style.cursor = 'default';
    }

    async startActiveListening() {
        try {
            // Get microphone stream
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Set up audio context for voice activity detection
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            this.microphone.connect(this.analyser);
            this.analyser.fftSize = 512;

            // Set up media recorder
            this.stream = stream;
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                await this.processRecording();
            };

            // Start monitoring for voice activity
            this.setState(AppState.LISTENING);
            this.updateStatus('Listening... Start speaking when ready');
            this.buttonText.textContent = 'Listening';
            this.monitorVoiceActivity();

        } catch (error) {
            console.error('Error starting active listening:', error);
            this.updateStatus('Microphone access needed. Please allow microphone permissions.', true);
        }
    }

    monitorVoiceActivity() {
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        this.vadCheckInterval = setInterval(() => {
            // Skip monitoring when processing or responding
            if (this.state === AppState.PROCESSING || this.state === AppState.RESPONDING) {
                return;
            }

            this.analyser.getByteTimeDomainData(dataArray);

            // Calculate volume level
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                const normalized = (dataArray[i] - 128) / 128;
                sum += normalized * normalized;
            }
            const volume = Math.sqrt(sum / bufferLength);

            // Check if speaking
            if (volume > this.volumeThreshold) {
                this.onSpeechDetected();
            } else {
                this.onSilenceDetected();
            }
        }, 100); // Check every 100ms
    }

    onSpeechDetected() {
        // Clear any pending silence timeout
        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
            this.silenceTimeout = null;
        }

        // Start recording if not already
        if (!this.isSpeaking && this.state === AppState.LISTENING) {
            console.log('Speech detected - starting recording');
            this.isSpeaking = true;
            this.audioChunks = [];
            this.mediaRecorder.start();
            this.setState(AppState.SPEAKING);
            this.updateStatus('I\'m listening...');
            this.buttonText.textContent = 'Speaking';
        }
    }

    onSilenceDetected() {
        // If speaking, start silence timeout
        if (this.isSpeaking && !this.silenceTimeout) {
            this.silenceTimeout = setTimeout(() => {
                this.onSpeechEnded();
            }, this.silenceThreshold);
        }
    }

    onSpeechEnded() {
        if (!this.isSpeaking) return;

        console.log('Speech ended - stopping recording');
        this.isSpeaking = false;
        this.silenceTimeout = null;

        // Stop recording
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
    }

    async processRecording() {
        // Stop monitoring temporarily
        if (this.vadCheckInterval) {
            clearInterval(this.vadCheckInterval);
            this.vadCheckInterval = null;
        }

        this.setState(AppState.PROCESSING);
        this.updateStatus('Processing your message...');
        this.buttonText.textContent = 'Processing...';

        // Create audio blob from chunks
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

        // Check if recording is too short (likely false positive)
        if (audioBlob.size < 1000) {
            console.log('Recording too short, ignoring');
            this.resumeListening();
            return;
        }

        try {
            // DISABLED: Pre-recorded audio (keeping code for later use)
            // if (this.isFirstMessage) {
            //     await this.playPreRecordedResponse(audioBlob);
            // }

            // Convert speech to text
            const transcription = await this.speechToText(audioBlob);

            // Check if transcription is empty or too short (likely noise/silence)
            if (!transcription || transcription.trim().length < 3) {
                console.log('Transcription too short or empty, ignoring');
                this.resumeListening();
                return;
            }

            // Get LLM response
            const llmResponse = await this.getLLMResponse(transcription);

            // Convert text to speech
            const audioUrl = await this.textToSpeech(llmResponse);

            // Play the response
            await this.playResponse(audioUrl);

            this.isFirstMessage = false;
            this.conversationHistory.push({
                user: transcription,
                assistant: llmResponse
            });

            // Show close button after first interaction
            this.showCloseButton();

            // Resume listening after response
            this.resumeListening();

        } catch (error) {
            console.error('Error processing recording:', error);
            this.updateStatus('Sorry, something went wrong. Resuming listening...', true);
            setTimeout(() => {
                this.resumeListening();
            }, 2000);
        }
    }

    resumeListening() {
        this.audioChunks = [];
        this.setState(AppState.LISTENING);
        this.updateStatus('Listening... I\'m here when you need to talk');
        this.buttonText.textContent = 'Listening';

        // Resume voice activity monitoring
        this.monitorVoiceActivity();
    }

    async playPreRecordedResponse(audioBlob) {
        this.setState(AppState.RESPONDING);
        this.updateStatus('I hear you... Let me help');
        this.buttonText.textContent = 'Responding...';

        // Randomly select one of the pre-recorded MP3 files
        const audioFiles = [
            '/audio/frustration1.mp3',
            '/audio/frustration2.mp3',
            '/audio/Overwhelm1.mp3',
            '/audio/Overwhelm2.mp3',
            '/audio/guilt1.mp3',
            '/audio/guilt2.mp3'
        ];

        // Pick a random file
        const randomIndex = Math.floor(Math.random() * audioFiles.length);
        const preRecordedUrl = audioFiles[randomIndex];

        console.log(`Playing: ${preRecordedUrl}`);

        // Pause for 1 second before playing
        await this.delay(1000);

        // Play the pre-recorded audio
        try {
            this.responseAudio.src = preRecordedUrl;
            await this.responseAudio.play();

            // Wait for audio to finish
            await new Promise((resolve) => {
                this.responseAudio.onended = resolve;
                this.responseAudio.onerror = (error) => {
                    console.error('Audio playback error:', error);
                    console.log('Make sure MP3 files exist in /audio folder');
                    resolve(); // Continue even if audio fails
                };
            });
        } catch (error) {
            console.error('Failed to play audio:', error);
            console.log('Make sure MP3 files exist in /audio folder');
        }
    }

    async speechToText(audioBlob) {
        this.updateStatus('Converting your voice to text...');

        try {
            // Send audio to backend for Deepgram transcription
            const formData = new FormData();
            formData.append('audio', audioBlob);

            const response = await fetch('/api/speech-to-text', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Transcription failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('Transcription:', data.transcription);

            // Display transcription in UI
            this.showTranscription(data.transcription);

            return data.transcription;

        } catch (error) {
            console.error('Speech-to-text error:', error);
            // Fallback to placeholder for testing without backend
            console.log('Using placeholder transcription (backend not running)');
            await this.delay(1500);
            const placeholderText = 'Sample transcription: I am feeling very frustrated with my child today...';

            // Display placeholder transcription in UI
            this.showTranscription(placeholderText);

            return placeholderText;
        }
    }

    async getLLMResponse(transcription) {
        this.updateStatus('Preparing a thoughtful response...');

        const systemPrompt = this.buildSystemPrompt();
        const conversationContext = this.buildConversationContext(transcription);

        try {
            // Send to backend for Claude API processing
            const response = await fetch('/api/llm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    system: systemPrompt,
                    messages: conversationContext,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`LLM request failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('Claude response:', data.response);
            return data.response;

        } catch (error) {
            console.error('LLM error:', error);
            // Fallback to placeholder for testing without backend
            console.log('Using placeholder response (backend not running)');
            await this.delay(2000);
            return 'I understand that you\'re feeling frustrated. Parenting is challenging, and it\'s okay to feel overwhelmed. Let\'s take this step by step together.';
        }
    }

    async textToSpeech(text) {
        this.updateStatus('Preparing voice response...');

        try {
            // Send to ElevenLabs TTS service via backend
            const response = await fetch('/api/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_monolingual_v1'
                })
            });

            if (!response.ok) {
                throw new Error(`TTS request failed: ${response.status}`);
            }

            const audioBlob = await response.blob();
            return URL.createObjectURL(audioBlob);

        } catch (error) {
            console.error('Text-to-speech error:', error);
            console.log('Skipping audio playback (TTS not available)');
            return null; // Gracefully handle TTS errors
        }
    }

    async playResponse(audioUrl) {
        if (!audioUrl) {
            // If no audio URL (placeholder), just transition back to listening
            return;
        }

        this.setState(AppState.RESPONDING);
        this.updateStatus('Playing response...');
        this.buttonText.textContent = 'Responding...';

        this.responseAudio.src = audioUrl;
        await this.responseAudio.play();

        // Wait for audio to finish
        await new Promise((resolve) => {
            this.responseAudio.onended = resolve;
        });
    }

    onAudioEnded() {
        // After audio finishes, return to listening
        this.resumeListening();
    }

    buildSystemPrompt() {
        return `You are a compassionate AI coach helping overwhelmed parents. Your role is to:
1. Listen with empathy and validate their feelings
2. Help them calm down and regulate their emotions
3. Provide practical, actionable tips to rebuild relationships with their children
4. Keep responses conversational, warm, and brief (2-3 sentences max)
5. Focus on emotional support first, then practical guidance
6. Use a gentle, non-judgmental tone`;
    }

    buildConversationContext(newMessage) {
        const messages = [];

        // Add conversation history
        this.conversationHistory.forEach(turn => {
            messages.push({ role: 'user', content: turn.user });
            messages.push({ role: 'assistant', content: turn.assistant });
        });

        // Add new message
        messages.push({ role: 'user', content: newMessage });

        return messages;
    }

    setState(newState) {
        this.state = newState;

        // Update button appearance
        this.mainButton.classList.remove('listening', 'speaking', 'processing', 'responding');
        if (newState === AppState.LISTENING) {
            this.mainButton.classList.add('listening');
        } else if (newState === AppState.SPEAKING) {
            this.mainButton.classList.add('speaking');
        } else if (newState === AppState.PROCESSING) {
            this.mainButton.classList.add('processing');
        } else if (newState === AppState.RESPONDING) {
            this.mainButton.classList.add('responding');
        }
    }

    updateStatus(message, isError = false) {
        this.statusMessage.textContent = message;
        this.statusMessage.classList.toggle('error', isError);
    }

    showTranscription(text) {
        this.transcriptionText.textContent = text;
        this.transcriptionDisplay.style.display = 'block';
    }

    hideTranscription() {
        this.transcriptionDisplay.style.display = 'none';
        this.transcriptionText.textContent = '';
    }

    showCloseButton() {
        this.closeButton.style.display = 'block';
    }

    handleClose() {
        // Stop all monitoring and recording
        if (this.vadCheckInterval) {
            clearInterval(this.vadCheckInterval);
        }
        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
        }
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        if (this.audioContext) {
            this.audioContext.close();
        }

        // Reset app state
        this.conversationHistory = [];
        this.isFirstMessage = true;
        this.isSpeaking = false;
        this.setState(AppState.IDLE);
        this.updateStatus('Session ended. Refresh the page to start again.');
        this.buttonText.textContent = 'Session Ended';
        this.hideTranscription();
        this.closeButton.style.display = 'none';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CalmApp();
});
