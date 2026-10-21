/**
 * Speech Recognition and Synthesis Engine
 * Supports 3 customizable AI voices: Kore, Fenrir, Zephyr.
 */

import { VoiceId, VoiceSettings } from '../types';

export interface SpeechListenerCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface SpeakOptions {
  voiceName?: VoiceId;
  speechRate?: number;
  speechPitch?: number;
}

class SpeechEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentAudioElement: HTMLAudioElement | null = null;
  private isSpeaking: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.initVoices();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoices();
        };
      }
    }
  }

  private initVoices() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.voices = window.speechSynthesis.getVoices();
    }
    return this.voices;
  }

  public isSpeechRecognitionSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  /**
   * Start listening for voice commands
   */
  public startListening(callbacks: SpeechListenerCallbacks, continuous: boolean = false) {
    if (this.isListening) {
      this.stopListening();
    }

    if (!this.isSpeechRecognitionSupported()) {
      callbacks.onError?.('Voice recognition is not supported in this browser. You can type voice commands directly.');
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = continuous;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        callbacks.onResult?.(transcript, !!finalTranscript);
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          callbacks.onError?.(event.error);
        }
      };

      this.recognition.onend = () => {
        this.isListening = false;
        callbacks.onEnd?.();
      };

      this.recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      callbacks.onError?.(err?.message || 'Failed to start microphone');
    }
  }

  public stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {}
      this.recognition = null;
    }
    this.isListening = false;
  }

  public getIsListening(): boolean {
    return this.isListening;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Stop any ongoing speech playback
   */
  public stopSpeaking() {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {}
      this.currentAudioElement = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.isSpeaking = false;
  }

  /**
   * Speak text out loud.
   * Uses Gemini TTS backend with specified AI Voice (Kore, Fenrir, Zephyr)
   * or falls back seamlessly to browser Web Speech API.
   */
  public async speak(text: string, options?: SpeakOptions | Partial<VoiceSettings>): Promise<void> {
    if (!text || text.trim() === '') return;

    this.stopSpeaking();
    this.isSpeaking = true;

    const voiceName: VoiceId = (options as any)?.voiceName || 'Kore';
    const speechRate = options?.speechRate ?? 0.95;
    const speechPitch = options?.speechPitch ?? 1.0;

    // Try Gemini TTS endpoint if available
    try {
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          await this.playBase64Audio(data.audioBase64);
          this.isSpeaking = false;
          return;
        }
      }
    } catch (err) {
      // Graceful fallback to Web Speech API
    }

    // Web Speech API fallback with voice character mapping
    await this.speakBrowserSpeech(text, { voiceName, speechRate, speechPitch });
    this.isSpeaking = false;
  }

  private playBase64Audio(base64: string): Promise<void> {
    return new Promise((resolve) => {
      try {
        const audio = new Audio(`data:audio/wav;base64,${base64}`);
        this.currentAudioElement = audio;

        audio.onended = () => {
          this.currentAudioElement = null;
          resolve();
        };

        audio.onerror = () => {
          this.currentAudioElement = null;
          resolve();
        };

        audio.play().catch(() => {
          this.currentAudioElement = null;
          resolve();
        });
      } catch {
        resolve();
      }
    });
  }

  private speakBrowserSpeech(
    text: string,
    options: { voiceName: VoiceId; speechRate: number; speechPitch: number }
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.speechRate;

      // Adjust pitch according to voice profile
      let targetPitch = options.speechPitch;
      if (options.voiceName === 'Kore') {
        targetPitch = options.speechPitch * 1.05; // warm, comforting
      } else if (options.voiceName === 'Fenrir') {
        targetPitch = options.speechPitch * 0.92; // grounded, articulate
      } else if (options.voiceName === 'Zephyr') {
        targetPitch = options.speechPitch * 1.0; // bright, friendly
      }
      utterance.pitch = targetPitch;

      const voices = this.getAvailableVoices();
      if (voices.length > 0) {
        let preferred: SpeechSynthesisVoice | undefined;

        if (options.voiceName === 'Fenrir') {
          preferred =
            voices.find((v) => (v.name.includes('Male') || v.name.includes('David') || v.name.includes('George')) && v.lang.startsWith('en')) ||
            voices.find((v) => v.lang.startsWith('en'));
        } else if (options.voiceName === 'Zephyr') {
          preferred =
            voices.find((v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Alex')) && v.lang.startsWith('en')) ||
            voices.find((v) => v.lang.startsWith('en'));
        } else {
          // Kore (default warm female)
          preferred =
            voices.find((v) => (v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Victoria')) && v.lang.startsWith('en')) ||
            voices.find((v) => v.lang.startsWith('en'));
        }

        if (preferred) {
          utterance.voice = preferred;
        }
      }

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = () => {
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }
}

export const speechEngine = new SpeechEngine();
