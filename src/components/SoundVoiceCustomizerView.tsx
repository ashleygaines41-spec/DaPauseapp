import React from 'react';
import {
  Music,
  Mic,
  Volume2,
  Play,
  Check,
  RotateCcw,
  Sparkles,
  Clock,
  Pill,
  AlertTriangle,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { VoiceSettings, ToneId, VoiceId } from '../types';
import { SOUND_TONE_OPTIONS, AI_VOICE_OPTIONS } from '../utils/initialData';
import { soundEngine } from '../utils/soundEngine';
import { speechEngine } from '../utils/speechEngine';

interface SoundVoiceCustomizerViewProps {
  settings: VoiceSettings;
  onUpdateSettings: (newSettings: VoiceSettings) => void;
  onOpenAccessibilityModal: () => void;
}

export const SoundVoiceCustomizerView: React.FC<SoundVoiceCustomizerViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenAccessibilityModal,
}) => {
  const handlePlayTone = (toneId: ToneId) => {
    soundEngine.playTone(toneId);
  };

  const handlePlayVoice = (voiceId: VoiceId) => {
    soundEngine.playReminderChime();
    let sample = '';
    if (voiceId === 'Kore') {
      sample = 'Hello Ashley, I am Kore. I will speak with a gentle and warm voice to remind you of your medications and daily tasks.';
    } else if (voiceId === 'Fenrir') {
      sample = 'Greetings, I am Fenrir. I speak clearly and articulately to keep your daily assignments and schedule organized.';
    } else {
      sample = 'Hi there! I am Zephyr. I am bright, cheerful, and ready to keep you and your family informed.';
    }

    speechEngine.speak(sample, {
      voiceName: voiceId,
      speechRate: settings.speechRate,
      speechPitch: settings.speechPitch,
    });
  };

  const testCategoryReminder = (category: 'task' | 'medication' | 'urgent') => {
    const tone =
      category === 'medication'
        ? settings.medicationSound
        : category === 'urgent'
        ? settings.urgentSound
        : settings.taskSound;

    const voice =
      category === 'medication'
        ? settings.medicationVoice
        : category === 'urgent'
        ? settings.urgentVoice
        : settings.taskVoice;

    soundEngine.playTone(tone);

    let message = '';
    if (category === 'medication') {
      message = 'Medication reminder: Time to take your Lisinopril 10 milligrams with breakfast and a glass of water.';
    } else if (category === 'urgent') {
      message = 'Attention: Urgent incoming priority alert from Dr. Evans Cardiology department.';
    } else {
      message = 'Daily task reminder: Upcoming deadline for your blood pressure check in 15 minutes.';
    }

    speechEngine.speak(message, {
      voiceName: voice,
      speechRate: settings.speechRate,
      speechPitch: settings.speechPitch,
    });
  };

  const updateSetting = (key: keyof VoiceSettings, value: any) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    soundEngine.playSuccessDing();
  };

  const resetDefaults = () => {
    const defaults: VoiceSettings = {
      ...settings,
      taskSound: 'gentle_harmony',
      taskVoice: 'Fenrir',
      medicationSound: 'celestial_chime',
      medicationVoice: 'Kore',
      urgentSound: 'urgent_staccato',
      urgentVoice: 'Fenrir',
    };
    onUpdateSettings(defaults);
    soundEngine.playSuccessDing();
    speechEngine.speak('Reminder sounds and AI voices have been reset to default.', {
      voiceName: 'Kore',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-50 text-teal-700">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h2
              className={`font-black text-slate-900 tracking-tight ${
                settings.seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
              }`}
            >
              Reminder Sounds & AI Voice Customizer
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Customize 5 distinct audio tones and 3 AI voices assigned to tasks, medications, and urgent alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            title="Reset to recommended defaults"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={onOpenAccessibilityModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            <span>Speech Speed & Pace</span>
          </button>
        </div>
      </div>

      {/* Grid: 5 Sound Tones & 3 AI Voices Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5 Sound Tones Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  5 Selectable Audio Tones
                </h3>
                <p className="text-xs text-slate-500">Tap the play button on any tone to listen.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
              Synthesized Audio
            </span>
          </div>

          <div className="space-y-2.5">
            {SOUND_TONE_OPTIONS.map((tone) => (
              <div
                key={tone.id}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/30 transition-all flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {tone.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {tone.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{tone.description}</p>
                </div>

                <button
                  onClick={() => handlePlayTone(tone.id)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 shrink-0"
                  title="Play tone preview"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Test Tone</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3 AI Voices Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  3 AI Speaking Voices
                </h3>
                <p className="text-xs text-slate-500">Tap play to hear each AI voice speak.</p>
              </div>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">
              Gemini & Speech Synthesis
            </span>
          </div>

          <div className="space-y-3">
            {AI_VOICE_OPTIONS.map((voice) => (
              <div
                key={voice.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-teal-300 bg-slate-50/50 hover:bg-teal-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 text-base">{voice.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                      {voice.recommendedFor}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{voice.character}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Accent: {voice.accent}</p>
                </div>

                <button
                  onClick={() => handlePlayVoice(voice.id)}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-transform active:scale-95 shrink-0 self-start sm:self-center"
                  title="Listen to voice sample"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Preview Voice</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignment Section: Configure 3 Categories */}
      <div className="space-y-4">
        <h3 className="font-black text-slate-900 text-lg sm:text-xl flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <span>Assign Sounds & AI Voices to Reminder Categories</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Category 1: General Tasks */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-teal-100 text-teal-800">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">Daily Tasks & Assignments</h4>
                  <p className="text-xs text-slate-500">Deadlines, chores & scheduling</p>
                </div>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Reminder Sound Tone:
                </label>
                <select
                  value={settings.taskSound}
                  onChange={(e) => updateSetting('taskSound', e.target.value as ToneId)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-teal-500"
                >
                  {SOUND_TONE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  AI Speaking Voice:
                </label>
                <select
                  value={settings.taskVoice}
                  onChange={(e) => updateSetting('taskVoice', e.target.value as VoiceId)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-teal-500"
                >
                  {AI_VOICE_OPTIONS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => testCategoryReminder('task')}
              className="w-full py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Volume2 className="w-4 h-4 text-teal-600" />
              <span>Test Task Alert</span>
            </button>
          </div>

          {/* Category 2: Medications */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-800">
                  <Pill className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">Medication Reminders</h4>
                  <p className="text-xs text-slate-500">Pills, vitals & prescriptions</p>
                </div>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Medication Chime Tone:
                </label>
                <select
                  value={settings.medicationSound}
                  onChange={(e) => updateSetting('medicationSound', e.target.value as ToneId)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-rose-500"
                >
                  {SOUND_TONE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Medication AI Voice:
                </label>
                <select
                  value={settings.medicationVoice}
                  onChange={(e) => updateSetting('medicationVoice', e.target.value as VoiceId)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-rose-500"
                >
                  {AI_VOICE_OPTIONS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => testCategoryReminder('medication')}
              className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Volume2 className="w-4 h-4 text-rose-600" />
              <span>Test Medication Alert</span>
            </button>
          </div>

          {/* Category 3: Urgent Alerts */}
          <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-base">Urgent Alerts & Calls</h4>
                  <p className="text-xs text-slate-500">Doctor calls & emergency notices</p>
                </div>
              </div>

              {/* Tone Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Urgent Alert Tone:
                </label>
                <select
                  value={settings.urgentSound}
                  onChange={(e) => updateSetting('urgentSound', e.target.value as ToneId)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-amber-500"
                >
                  {SOUND_TONE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Voice Selection */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Urgent AI Voice:
                </label>
                <select
                  value={settings.urgentVoice}
                  onChange={(e) => updateSetting('urgentVoice', e.target.value as VoiceId)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-amber-500"
                >
                  {AI_VOICE_OPTIONS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => testCategoryReminder('urgent')}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Volume2 className="w-4 h-4 text-amber-600" />
              <span>Test Urgent Alert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
