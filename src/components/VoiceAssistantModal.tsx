import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  X,
  Volume2,
  Sparkles,
  ArrowRight,
  Send,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { speechEngine } from '../utils/speechEngine';
import { soundEngine } from '../utils/soundEngine';
import { VoiceSettings } from '../types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceCommandResult: (result: {
    action: string;
    data: any;
    spokenResponse: string;
  }) => void;
  voiceSettings: VoiceSettings;
  contextData: any;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onVoiceCommandResult,
  voiceSettings,
  contextData,
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [typedCommand, setTypedCommand] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [assistantMessage, setAssistantMessage] = useState<string>(
    'Listening... Speak clearly to manage tasks, medications, doctor appointments, or request help.'
  );

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setAssistantMessage(
        'Listening... Speak clearly to manage tasks, medications, doctor appointments, or request help.'
      );
      startMic();
    } else {
      stopMic();
      speechEngine.stopSpeaking();
    }
    return () => {
      stopMic();
    };
  }, [isOpen]);

  const startMic = () => {
    setIsListening(true);
    speechEngine.startListening({
      onStart: () => setIsListening(true),
      onResult: (text, isFinal) => {
        setTranscript(text);
        if (isFinal && text.trim().length > 3) {
          processVoiceInput(text);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setAssistantMessage(`Microphone: ${err}. You can also type your command below.`);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const stopMic = () => {
    speechEngine.stopListening();
    setIsListening(false);
  };

  const toggleMic = () => {
    if (isListening) {
      stopMic();
    } else {
      startMic();
    }
  };

  const processVoiceInput = async (inputText: string) => {
    if (!inputText.trim()) return;
    stopMic();
    setIsProcessing(true);
    setAssistantMessage('Processing your request with VocalCare intelligence...');

    try {
      const response = await fetch('/api/voice/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: inputText,
          context: contextData,
        }),
      });

      let data: any;
      if (response.ok) {
        data = await response.json();
      } else {
        // Fallback rule parsing
        data = fallbackParse(inputText);
      }

      const responseSpoken = data.spokenResponse || 'Your request has been processed.';
      setAssistantMessage(responseSpoken);

      // Play chime and speak answer
      soundEngine.playReminderChime();
      if (voiceSettings.autoSpeakReminders) {
        await speechEngine.speak(responseSpoken, voiceSettings);
      }

      onVoiceCommandResult(data);
    } catch (err: any) {
      console.error('Voice processing error:', err);
      const fallback = fallbackParse(inputText);
      setAssistantMessage(fallback.spokenResponse);
      if (voiceSettings.autoSpeakReminders) {
        await speechEngine.speak(fallback.spokenResponse, voiceSettings);
      }
      onVoiceCommandResult(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  const fallbackParse = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('sos') || lower.includes('help') || lower.includes('emergency')) {
      return {
        action: 'TRIGGER_SOS',
        spokenResponse: 'Opening emergency SOS now. Emergency contacts are ready to be alerted.',
        data: {},
      };
    }
    if (lower.includes('med') || lower.includes('pill') || lower.includes('take')) {
      return {
        action: 'ADD_MEDICATION',
        spokenResponse: `Noted your medication request: ${text}.`,
        data: { name: text.replace(/add medication|take pill/gi, '').trim() || 'Medication' },
      };
    }
    if (lower.includes('appointment') || lower.includes('doctor')) {
      return {
        action: 'ADD_APPOINTMENT',
        spokenResponse: `Adding doctor appointment: ${text}.`,
        data: { doctorName: 'Doctor Visit', notes: text },
      };
    }
    if (lower.includes('schedule') || lower.includes('what') || lower.includes('today')) {
      return {
        action: 'QUERY_SCHEDULE',
        spokenResponse: 'Here is your daily schedule overview. Check your timeline for upcoming deadlines.',
        data: {},
      };
    }
    if (lower.includes('urgent') || lower.includes('call') || lower.includes('doctor call')) {
      return {
        action: 'SIMULATE_URGENT_CALL',
        spokenResponse: 'Simulating an urgent incoming call alert for demonstration.',
        data: {},
      };
    }
    return {
      action: 'ADD_TASK',
      spokenResponse: `Added reminder: ${text}. I will keep track and alert you.`,
      data: { title: text },
    };
  };

  const sampleCommands = [
    'What do I have scheduled next?',
    'Remind me to take blood pressure pill at 2:00 PM',
    'Add doctor appointment with Dr. Evans tomorrow at 2:45 PM',
    'Emergency SOS - I need family help!',
    'Simulate urgent doctor call',
    'Read my daily assignments aloud',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Sparkles className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Voice Assistant</h2>
              <p className="text-teal-100 text-xs sm:text-sm">
                Speak naturally or tap any sample command below
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close Voice Assistant"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Animated Listening Visualizer */}
          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-teal-50/60 to-slate-50 rounded-2xl border border-teal-100">
            <div className="relative mb-5">
              <button
                onClick={toggleMic}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 ${
                  isListening
                    ? 'bg-rose-500 shadow-rose-500/40 scale-105 animate-pulse ring-8 ring-rose-200'
                    : isProcessing
                    ? 'bg-amber-500 shadow-amber-500/30'
                    : 'bg-teal-600 shadow-teal-600/30 hover:bg-teal-700'
                }`}
                title={isListening ? 'Tap to Stop Listening' : 'Tap to Start Listening'}
              >
                {isProcessing ? (
                  <Loader2 className="w-10 h-10 animate-spin" />
                ) : isListening ? (
                  <Mic className="w-10 h-10 animate-bounce" />
                ) : (
                  <MicOff className="w-10 h-10" />
                )}
              </button>

              {/* Sound wave ripple rings */}
              {isListening && (
                <div className="absolute inset-0 -z-10 rounded-full animate-ping bg-teal-400 opacity-25"></div>
              )}
            </div>

            <p className="text-sm sm:text-base font-semibold text-slate-700 text-center">
              {isListening
                ? 'Listening to your voice... Speak now.'
                : isProcessing
                ? 'Processing command...'
                : 'Microphone paused. Tap the microphone icon or type below.'}
            </p>

            {/* Live Transcript Display */}
            <div className="mt-4 w-full bg-white rounded-xl p-4 border border-slate-200 shadow-xs min-h-[60px] flex items-center justify-center text-center">
              <p
                className={`text-slate-800 ${
                  voiceSettings.seniorMode ? 'text-lg sm:text-xl font-medium' : 'text-base'
                }`}
              >
                {transcript ? (
                  `"${transcript}"`
                ) : (
                  <span className="text-slate-400 italic">
                    {isListening ? 'Say something...' : 'Waiting for voice input...'}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Assistant Response Box */}
          <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200/80 flex items-start gap-3">
            <div className="p-2 bg-teal-600 text-white rounded-xl shrink-0 mt-0.5">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                Spoken Response
              </span>
              <p
                className={`text-teal-950 mt-0.5 leading-relaxed ${
                  voiceSettings.seniorMode ? 'text-lg font-medium' : 'text-sm sm:text-base'
                }`}
              >
                {assistantMessage}
              </p>
            </div>
          </div>

          {/* Quick Voice Suggestions */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Tap Any Command to Execute Instantly</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleCommands.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(cmd);
                    processVoiceInput(cmd);
                  }}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-left text-xs sm:text-sm text-slate-700 hover:text-teal-900 transition-colors group"
                >
                  <span className="font-medium pr-2">{cmd}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Text Input Option for quiet environments */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typedCommand.trim()) {
                setTranscript(typedCommand);
                processVoiceInput(typedCommand);
                setTypedCommand('');
              }
            }}
            className="flex items-center gap-2 pt-2 border-t border-slate-100"
          >
            <input
              type="text"
              value={typedCommand}
              onChange={(e) => setTypedCommand(e.target.value)}
              placeholder="Or type a command (e.g. 'Remind me to take pill at 5 PM')..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-800 text-sm sm:text-base"
            />
            <button
              type="submit"
              disabled={!typedCommand.trim() || isProcessing}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold flex items-center gap-1.5 shadow-sm text-sm"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
