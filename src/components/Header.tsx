import React, { useState, useEffect } from 'react';
import {
  Mic,
  AlertTriangle,
  Volume2,
  VolumeX,
  PhoneCall,
  Accessibility,
  Clock,
  Sparkles,
  Sliders,
  Pause,
  Play,
  Heart,
} from 'lucide-react';
import { VoiceSettings, VoiceId } from '../types';
import { AI_VOICE_OPTIONS } from '../utils/initialData';
import { soundEngine } from '../utils/soundEngine';
import { speechEngine } from '../utils/speechEngine';

interface HeaderProps {
  onOpenVoice: () => void;
  onOpenSOS: () => void;
  onOpenSettings: () => void;
  voiceSettings: VoiceSettings;
  onUpdateVoiceSettings: (settings: VoiceSettings) => void;
  onToggleSeniorMode: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  isPaused: boolean;
  onTogglePauseApp: () => void;
  urgentCount: number;
  unreadCheckInCount: number;
  onOpenUrgentCalls: () => void;
  onOpenCheckIns: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenVoice,
  onOpenSOS,
  onOpenSettings,
  voiceSettings,
  onUpdateVoiceSettings,
  onToggleSeniorMode,
  onToggleMute,
  isMuted,
  isPaused,
  onTogglePauseApp,
  urgentCount,
  unreadCheckInCount,
  onOpenUrgentCalls,
  onOpenCheckIns,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isVoicePickerOpen, setIsVoicePickerOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const handleSelectQuickVoice = (voiceId: VoiceId) => {
    onUpdateVoiceSettings({
      ...voiceSettings,
      taskVoice: voiceId,
      medicationVoice: voiceId,
      urgentVoice: voiceId,
    });
    setIsVoicePickerOpen(false);
    soundEngine.playSuccessDing();
    speechEngine.speak(`Voice updated to ${voiceId}. I will now speak your reminders with this voice.`, {
      voiceName: voiceId,
      speechRate: voiceSettings.speechRate,
    });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Greeting ("Pause") */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <Pause className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-slate-900 tracking-tight text-2xl sm:text-3xl">
                Pause
              </h1>
              <span className="text-teal-600 font-bold text-xs sm:text-sm tracking-wide">
                Voice Care
              </span>
              {voiceSettings.seniorMode && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Senior Mode
                </span>
              )}
              {isPaused && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                  Reminders Paused
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{formattedTime}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
          {/* Quick AI Voice Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsVoicePickerOpen(!isVoicePickerOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 font-bold text-xs sm:text-sm transition-colors shadow-2xs"
              title="Change Voice Option for Reminders"
            >
              <Mic className="w-4 h-4 text-teal-600" />
              <span>Voice: {voiceSettings.taskVoice || 'Kore'}</span>
              <span className="text-[10px] text-teal-600">▼</span>
            </button>

            {isVoicePickerOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-fade-in space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                  Select Reminder AI Voice:
                </div>
                {AI_VOICE_OPTIONS.map((voice) => {
                  const isCurrent = (voiceSettings.taskVoice || 'Kore') === voice.id;
                  return (
                    <button
                      key={voice.id}
                      onClick={() => handleSelectQuickVoice(voice.id)}
                      className={`w-full p-2.5 rounded-xl text-left text-xs transition-colors flex items-center justify-between ${
                        isCurrent
                          ? 'bg-teal-600 text-white font-bold'
                          : 'hover:bg-slate-50 text-slate-800 font-medium'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{voice.name}</div>
                        <div
                          className={`text-[10px] ${
                            isCurrent ? 'text-teal-100' : 'text-slate-400'
                          }`}
                        >
                          {voice.character}
                        </div>
                      </div>
                      {isCurrent && <span className="text-white text-xs">✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pause / Resume Reminders Toggle */}
          <button
            onClick={onTogglePauseApp}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
              isPaused
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={isPaused ? 'Resume Spoken Reminders' : 'Pause Spoken Reminders for Resting'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-rose-600 text-rose-600" /> : <Pause className="w-4 h-4" />}
            <span>{isPaused ? 'Resume App' : 'Pause'}</span>
          </button>

          {/* Family Check-in Badge */}
          {unreadCheckInCount > 0 && (
            <button
              onClick={onOpenCheckIns}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs sm:text-sm hover:bg-rose-100 transition-colors"
              title="Family Check-in Received"
            >
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <span>{unreadCheckInCount} Check-in</span>
            </button>
          )}

          {/* Urgent Call Pill (if any) */}
          {urgentCount > 0 && (
            <button
              onClick={onOpenUrgentCalls}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-md animate-bounce hover:bg-amber-600 transition-colors"
              title="Urgent Call Requires Immediate Attention"
            >
              <PhoneCall className="w-4 h-4 animate-spin" />
              <span>{urgentCount} Urgent</span>
            </button>
          )}

          {/* Speak to App Button */}
          <button
            onClick={onOpenVoice}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-transform active:scale-95"
            title="Speak to App"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Voice Assistant</span>
          </button>

          {/* SOS Help Button */}
          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-sm transition-transform active:scale-95 ring-2 ring-rose-400/40"
            title="Emergency SOS Help"
          >
            <AlertTriangle className="w-4 h-4 text-amber-200" />
            <span>SOS</span>
          </button>

          {/* Senior High-Legibility Mode Toggle */}
          <button
            onClick={onToggleSeniorMode}
            className={`p-2 rounded-xl border transition-colors ${
              voiceSettings.seniorMode
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle Senior Mode"
          >
            <Accessibility className="w-4 h-4 text-teal-700" />
          </button>

          {/* Mute Audio Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-700" />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Voice & Sound Customizer"
          >
            <Sliders className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>
    </header>
  );
};
