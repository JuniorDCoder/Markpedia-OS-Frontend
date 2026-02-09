/**
 * Sound Notification Utility
 * Provides audio feedback for various app events
 */

// Sound URLs - using web audio API for generated tones
// You can replace these with actual audio file URLs if preferred

class SoundManager {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;
    private volume: number = 0.5;

    constructor() {
        // Initialize AudioContext on first user interaction
        if (typeof window !== 'undefined') {
            this.initOnInteraction();
        }
    }

    private initOnInteraction() {
        const init = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            document.removeEventListener('click', init);
            document.removeEventListener('keydown', init);
        };
        document.addEventListener('click', init, { once: true });
        document.addEventListener('keydown', init, { once: true });
    }

    private getContext(): AudioContext | null {
        if (!this.audioContext && typeof window !== 'undefined') {
            try {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.warn('Web Audio API not supported');
                return null;
            }
        }
        return this.audioContext;
    }

    /**
     * Play a notification tone
     */
    private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
        if (!this.enabled) return;
        
        const ctx = this.getContext();
        if (!ctx) return;

        try {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            // Fade in
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, ctx.currentTime + 0.02);
            
            // Fade out
            gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    /**
     * Play a two-tone notification
     */
    private playDoubleTone(freq1: number, freq2: number, duration: number) {
        if (!this.enabled) return;
        
        this.playTone(freq1, duration / 2);
        setTimeout(() => {
            this.playTone(freq2, duration / 2);
        }, (duration / 2) * 1000);
    }

    // ========================
    // PUBLIC SOUND METHODS
    // ========================

    /**
     * Message sent successfully
     */
    messageSent() {
        this.playTone(880, 0.1, 'sine'); // A5, short high tone
    }

    /**
     * Message received
     */
    messageReceived() {
        this.playDoubleTone(523, 659, 0.2); // C5 -> E5, pleasant notification
    }

    /**
     * Post created successfully
     */
    postCreated() {
        this.playTone(659, 0.15, 'sine'); // E5
        setTimeout(() => this.playTone(784, 0.15, 'sine'), 100); // G5
    }

    /**
     * Comment added
     */
    commentAdded() {
        this.playTone(698, 0.12, 'sine'); // F5
    }

    /**
     * Reaction added (like, love, etc.)
     */
    reactionAdded() {
        this.playTone(1047, 0.08, 'sine'); // C6, quick pop
    }

    /**
     * Error notification
     */
    error() {
        this.playTone(220, 0.2, 'square'); // A3, low warning tone
    }

    /**
     * Success notification
     */
    success() {
        this.playDoubleTone(523, 784, 0.25); // C5 -> G5
    }

    /**
     * Incoming call
     */
    incomingCall() {
        if (!this.enabled) return;
        
        const playRing = () => {
            this.playDoubleTone(440, 554, 0.3); // A4 -> C#5
        };
        
        playRing();
        setTimeout(playRing, 400);
        setTimeout(playRing, 800);
    }

    /**
     * Call connected
     */
    callConnected() {
        this.playDoubleTone(440, 880, 0.2); // A4 -> A5
    }

    /**
     * Call ended
     */
    callEnded() {
        this.playTone(330, 0.3, 'sine'); // E4
    }

    /**
     * Mention notification
     */
    mention() {
        this.playDoubleTone(784, 988, 0.15); // G5 -> B5
    }

    /**
     * Recognition received
     */
    recognition() {
        // Celebratory triple tone
        this.playTone(523, 0.1); // C5
        setTimeout(() => this.playTone(659, 0.1), 100); // E5
        setTimeout(() => this.playTone(784, 0.15), 200); // G5
    }

    /**
     * Typing indicator sound (subtle)
     */
    typing() {
        this.playTone(1200, 0.03, 'sine');
    }

    // ========================
    // SETTINGS
    // ========================

    /**
     * Enable or disable all sounds
     */
    setEnabled(enabled: boolean) {
        this.enabled = enabled;
        if (typeof window !== 'undefined') {
            localStorage.setItem('sound_enabled', String(enabled));
        }
    }

    /**
     * Check if sounds are enabled
     */
    isEnabled(): boolean {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('sound_enabled');
            if (stored !== null) {
                this.enabled = stored === 'true';
            }
        }
        return this.enabled;
    }

    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (typeof window !== 'undefined') {
            localStorage.setItem('sound_volume', String(this.volume));
        }
    }

    /**
     * Get current volume
     */
    getVolume(): number {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('sound_volume');
            if (stored !== null) {
                this.volume = parseFloat(stored);
            }
        }
        return this.volume;
    }
}

// Export singleton instance
export const soundManager = new SoundManager();

// Convenience exports
export const playMessageSent = () => soundManager.messageSent();
export const playMessageReceived = () => soundManager.messageReceived();
export const playPostCreated = () => soundManager.postCreated();
export const playCommentAdded = () => soundManager.commentAdded();
export const playReactionAdded = () => soundManager.reactionAdded();
export const playError = () => soundManager.error();
export const playSuccess = () => soundManager.success();
export const playIncomingCall = () => soundManager.incomingCall();
export const playCallConnected = () => soundManager.callConnected();
export const playCallEnded = () => soundManager.callEnded();
export const playMention = () => soundManager.mention();
export const playRecognition = () => soundManager.recognition();
