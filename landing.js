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
        this.volumeThreshold = 0.01; // Lowered threshold for better sensitivity

        // DOM Elements
        this.breatheButton = document.getElementById('breatheButton');
        this.greetingText = document.getElementById('greetingText');
        this.invitationText = document.getElementById('invitationText');
        this.micIcon = document.getElementById('micIcon');
        this.buttonText = document.getElementById('buttonText');
        this.centerDot = document.getElementById('centerDot');
        this.statusMessage = document.getElementById('statusMessage');
        this.closeButton = document.getElementById('closeButton');
        this.responseAudio = document.getElementById('responseAudio');
        this.transcriptionDisplay = document.getElementById('transcriptionDisplay');
        this.transcriptionText = document.getElementById('transcriptionText');

        this.init();
    }

    init() {
        this.breatheButton.addEventListener('click', () => this.startSession());
        // Auto-start session after 2 seconds
        // setTimeout(() => {
        //     this.startSession();
        // }, 2000);
    }

    async startSession() {
        // Transform the UI
        this.greetingText.querySelector('h1').textContent = 'Calm';
        this.greetingText.querySelector('h1').style.fontSize = '2.5rem';
        const subtitle = document.getElementById('subtitle');
        if (subtitle) {
            subtitle.style.display = 'block';
        }
        this.invitationText.style.display = 'none';
        this.centerDot.style.display = 'none';
        this.micIcon.style.display = 'block';
        this.buttonText.style.display = 'block';
        this.statusMessage.style.display = 'block';

        // Start active listening
        await this.startActiveListening();
    }

    async playWelcomeAudio() {
        this.setState(AppState.RESPONDING);
        this.updateStatus('Welcome...');
        this.buttonText.textContent = 'Responding';

        try {
            this.responseAudio.src = '/audio/i_am_here.mp3';
            await this.responseAudio.play();

            // Wait for audio to finish
            await new Promise((resolve) => {
                this.responseAudio.onended = resolve;
                this.responseAudio.onerror = (error) => {
                    console.error('Audio playback error:', error);
                    resolve(); // Continue even if audio fails
                };
            });
        } catch (error) {
            console.error('Failed to play welcome audio:', error);
        }
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
            this.updateStatus('Listening... I\'m here when you need to talk');
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

            // Debug logging
            if (Math.random() < 0.1) { // Log 10% of the time to avoid spam
                console.log('Volume level:', volume.toFixed(4), 'Threshold:', this.volumeThreshold);
            }

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
        this.buttonText.textContent = 'Processing';

        // Create audio blob from chunks
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

        // Check if recording is too short (likely false positive)
        if (audioBlob.size < 1000) {
            console.log('Recording too short, ignoring');
            this.resumeListening();
            return;
        }

        try {
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

            return data.transcription;

        } catch (error) {
            console.error('Speech-to-text error:', error);
            throw error;
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
            throw error;
        }
    }

    async textToSpeech(text) {
        this.updateStatus('Preparing voice response...');

        try {
            console.log('Sending text to TTS:', text);

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

            console.log('TTS response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('TTS error response:', errorText);
                throw new Error(`TTS request failed: ${response.status} - ${errorText}`);
            }

            const audioBlob = await response.blob();
            console.log('Audio blob size:', audioBlob.size);
            return URL.createObjectURL(audioBlob);

        } catch (error) {
            console.error('Text-to-speech error:', error);
            return null;
        }
    }

    async playResponse(audioUrl) {
        if (!audioUrl) {
            return;
        }

        this.setState(AppState.RESPONDING);
        this.updateStatus('Playing response...');
        this.buttonText.textContent = 'Responding';

        this.responseAudio.src = audioUrl;
        await this.responseAudio.play();

        // Wait for audio to finish
        await new Promise((resolve) => {
            this.responseAudio.onended = resolve;
        });
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
        this.breatheButton.classList.remove('listening', 'speaking', 'processing', 'responding');
        if (newState === AppState.LISTENING) {
            this.breatheButton.classList.add('listening');
        } else if (newState === AppState.SPEAKING) {
            this.breatheButton.classList.add('speaking');
        } else if (newState === AppState.PROCESSING) {
            this.breatheButton.classList.add('processing');
        } else if (newState === AppState.RESPONDING) {
            this.breatheButton.classList.add('responding');
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
        this.closeButton.addEventListener('click', () => this.handleClose());
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

        // Reload page to restart
        window.location.reload();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new CalmApp();
});
