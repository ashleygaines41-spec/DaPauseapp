import React, { useState } from 'react';
import {
  X,
  Volume2,
  Accessibility,
  Sliders,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Music,
  Mic,
  Play,
  Pill,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { VoiceSettings, ToneId, VoiceId } from '../types';
import { SOUND_TONE_OPTIONS, AI_VOICE_OPTIONS } from '../utils/initialData';
import { speechEngine } from '../utils/speechEngine';
import { soundEngine } from '../utils/soundEngine';

interface AccessibilitySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: VoiceSettings) => void;
}

export const AccessibilitySettingsModal: React.FC<AccessibilitySettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'voices_sounds' | 'accessibility'>('voices_sounds');

  if (!isOpen) return null;

  const playToneSample = (toneId: ToneId) => {
    soundEngine.playTone(toneId);
  };

  const playVoiceSample = (voiceId: VoiceId) => {
    soundEngine.playReminderChime();
    let sampleText = '';
    if (voiceId === 'Kore') {
      sampleText = 'Hello Ashley, this is Kore. I will speak with a gentle and warm voice to remind you of your medications and daily tasks.';
    } else if (voiceId === 'Fenrir') {
      sampleText = 'Greetings, this is Fenrir. I speak clearly and articulately to keep your daily assignments and schedule on time.';
    } else {
      sampleText = 'Hi there! This is Zephyr. I am bright, cheerful, and ready to help you and your family stay connected.';
    }
    speechEngine.speak(sampleText, {
      voiceName: voiceId,
      speechRate: settings.speechRate,
      speechPitch: settings.speechPitch,
    });
  };

  const handleUpdate = (updates: Partial<VoiceSettings>) => {
    const updated = { ...settings, ...updates };
    onUpdateSettings(updated);
  };

  const resetDefaults = () => {
    const defaults: VoiceSettings = {
      seniorMode: true,
      speechRate: 0.95,
      speechPitch: 1.0,
      autoSpeakReminders: true,
      soundEffectsEnabled: true,
      continuousListening: false,
      taskSound: 'gentle_harmony',
      taskVoice: 'Fenrir',
      medicationSound: 'celestial_chime',
      medicationVoice: 'Kore',
      urgentSound: 'urgent_staccato',
      urgentVoice: 'Fenrir',
    };
    onUpdateSettings(defaults);
    soundEngine.playSuccessDing();
    speechEngine.speak('Voice and tone settings restored to recommended defaults.', defaults);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 text-teal-200">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Voice & Sound Customizer
              </h2>
              <p className="text-teal-100 text-xs sm:text-sm">
                Choose from 5 tones and 3 AI voices for tasks, medications & urgent alerts.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('voices_sounds')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'voices_sounds'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Reminder Sounds & AI Voices</span>
          </button>
          <button
            onClick={() => setActiveTab('accessibility')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'accessibility'
                ? 'border-teal-600 text-teal-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Accessibility className="w-4 h-4" />
            <span>Senior Mode & Speech Pace</span>
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'voices_sounds' ? (
            <div className="space-y-6">
              {/* Voice Previews Strip */}
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                    <Mic className="w-4 h-4 text-teal-700" />
                    <span>3 Available AI Voices (Tap to Preview)</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {AI_VOICE_OPTIONS.map((voice) => (
                    <button
                      key={voice.id}
                      onClick={() => playVoiceSample(voice.id)}
                      className="p-3 rounded-xl bg-white border border-teal-200 hover:border-teal-500 hover:shadow-xs text-left transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 text-sm">{voice.id}</span>
                          <Play className="w-3.5 h-3.5 text-teal-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {voice.character}
                        </p>
                      </div>
                      <span className="mt-2 text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md inline-block">
                        {voice.recommendedFor}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound Tones Strip */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Music className="w-4 h-4 text-slate-600" />
                    <span>5 Available Reminder Tones (Tap to Test)</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SOUND_TONE_OPTIONS.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => playToneSample(tone.id)}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-xs text-center transition-all group"
                      title={tone.description}
                    >
                      <Volume2 className="w-4 h-4 text-slate-500 group-hover:text-teal-600 mx-auto mb-1" />
                      <span className="font-bold text-slate-800 text-xs block leading-tight">
                        {tone.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                        {tone.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignment Category 1: General Tasks */}
              <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm sm:text-base">
                        General Daily Tasks & Assignments
                      </h4>
                      <p className="text-xs text-slate-500">
                        Plays when daily deadlines approach or tasks are due.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Reminder Tone (5 Choices)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={settings.taskSound}
                        onChange={(e) => handleUpdate({ taskSound: e.target.value as ToneId })}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
                      >
                        {SOUND_TONE_OPTIONS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => playToneSample(settings.taskSound)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200"
                        title="Test Tone"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      AI Speaking Voice (3 Choices)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={settings.taskVoice}
                        onChange={(e) => handleUpdate({ taskVoice: e.target.value as VoiceId })}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-teal-500"
                      >
                        {AI_VOICE_OPTIONS.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => playVoiceSample(settings.taskVoice)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 border border-slate-200"
                        title="Test Voice"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Category 2: Essential Medications */}
              <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-rose-100 text-rose-800">
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm sm:text-base">
                        Medication & Prescription Reminders
                      </h4>
                      <p className="text-xs text-slate-500">
                        Plays for morning, midday, evening, and bedtime pill schedules.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Medication Chime Tone (5 Choices)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={settings.medicationSound}
                        onChange={(e) =>
                          handleUpdate({ medicationSound: e.target.value as ToneId })
                        }
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500"
                      >
                        {SOUND_TONE_OPTIONS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => playToneSample(settings.medicationSound)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200"
                        title="Test Tone"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Medication AI Voice (3 Choices)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={settings.medicationVoice}
                        onChange={(e) =>
                          handleUpdate({ medicationVoice: e.target.value as VoiceId })
                        }
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500"
                      >
                        {AI_VOICE_OPTIONS.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => playVoiceSample(settings.medicationVoice)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200"
                        title="Test Voice"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assignment Category 3: Urgent Alerts & Emergency */}
              <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm sm:text-base">
                        Urgent Incoming Calls & Priority Alerts
                      </h4>
                      <p className="text-xs text-slate-500">
                        Plays for critical doctor notices, VIP family calls, and emergency SOS.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Urgent Alert Tone (5 Choices)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={settings.urgentSound}
                        onChange={(e) => handleUpdate({ urgentSound: e.target.value as ToneId })}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                      >
                        {SOUND_TONE_OPTIONS.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => playToneSample(settings.urgentSound)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200"
                        title="Test Tone"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                      Urgent AI Voice (3 Choices)
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={settings.urgentVoice}
                        onChange={(e) => handleUpdate({ urgentVoice: e.target.value as VoiceId })}
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500"
                      >
                        {AI_VOICE_OPTIONS.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => playVoiceSample(settings.urgentVoice)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200"
                        title="Test Voice"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Senior High-Legibility Mode Toggle */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">Senior Friendly Mode</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-xs font-bold">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Enlarges headings and body text, increases color contrast, and expands touch button targets.
                  </p>
                </div>
                <button
                  onClick={() => handleUpdate({ seniorMode: !settings.seniorMode })}
                  className={`w-14 h-8 rounded-full transition-colors relative p-1 shrink-0 ${
                    settings.seniorMode ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                      settings.seniorMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Auto-Speak Reminders */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <span className="font-bold text-slate-900 text-base block">
                    Automatic Voice Announcements
                  </span>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Speaks upcoming deadlines and medication reminders aloud without needing to press anything.
                  </p>
                </div>
                <button
                  onClick={() => handleUpdate({ autoSpeakReminders: !settings.autoSpeakReminders })}
                  className={`w-14 h-8 rounded-full transition-colors relative p-1 shrink-0 ${
                    settings.autoSpeakReminders ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${
                      settings.autoSpeakReminders ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Speech Rate (Speed) Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">
                    Voice Speaking Speed: {Math.round(settings.speechRate * 100)}%
                  </label>
                  <span className="text-xs text-slate-500">
                    {settings.speechRate <= 0.85
                      ? 'Gentle & Slow'
                      : settings.speechRate >= 1.1
                      ? 'Brisk'
                      : 'Senior Friendly'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.25"
                  step="0.05"
                  value={settings.speechRate}
                  onChange={(e) => handleUpdate({ speechRate: parseFloat(e.target.value) })}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                  <span>0.75x (Slower)</span>
                  <span>1.0x (Normal)</span>
                  <span>1.25x (Faster)</span>
                </div>
              </div>

              {/* Speech Pitch Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-slate-800">
                    Voice Pitch Cadence: {settings.speechPitch}x
                  </label>
                </div>
                <input
                  type="range"
                  min="0.85"
                  max="1.15"
                  step="0.05"
                  value={settings.speechPitch}
                  onChange={(e) => handleUpdate({ speechPitch: parseFloat(e.target.value) })}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Warm & Deep</span>
                  <span>Standard</span>
                  <span>Bright</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-200/60 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Recommended</span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-colors"
          >
            Done & Save
          </button>
        </div>
      </div>
    </div>
  );
};
