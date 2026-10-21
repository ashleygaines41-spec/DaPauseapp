import React from 'react';
import { Heart, CheckCircle2, MessageCircle, X, Volume2, Sparkles } from 'lucide-react';
import { FamilyCheckIn, VoiceSettings } from '../types';
import { speechEngine } from '../utils/speechEngine';
import { soundEngine } from '../utils/soundEngine';

interface FamilyCheckInBannerProps {
  checkIn: FamilyCheckIn | null;
  onDismiss: (id: string) => void;
  onQuickReply: (id: string, replyText: string) => void;
  voiceSettings: VoiceSettings;
}

export const FamilyCheckInBanner: React.FC<FamilyCheckInBannerProps> = ({
  checkIn,
  onDismiss,
  onQuickReply,
  voiceSettings,
}) => {
  if (!checkIn) return null;

  const handleSpeakCheckIn = () => {
    soundEngine.playCheckInChime();
    const text = `Family check-in from ${checkIn.senderName}, ${checkIn.relationship}: ${checkIn.messageText}`;
    speechEngine.speak(text, {
      voiceName: voiceSettings.taskVoice || 'Zephyr',
      speechRate: voiceSettings.speechRate,
    });
  };

  const quickReplies = ['❤️ Love you too!', '👍 Doing great!', '☕ Relaxing now'];

  return (
    <aside aria-label="Family Check-in Notification" className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-teal-500/10 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 shadow-xs transition-all animate-fade-in relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left side: Avatar & Message */}
        <div className="flex items-start gap-3.5">
          <div
            className={`w-12 h-12 rounded-2xl text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm ${checkIn.avatarBg}`}
          >
            {checkIn.senderName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                Family Check-in
              </span>
              <span className="text-xs text-slate-500 font-medium">{checkIn.timestamp}</span>
            </div>
            <h4 className="font-bold text-slate-900 text-base sm:text-lg mt-0.5">
              {checkIn.senderName} ({checkIn.relationship})
            </h4>
            <p className="text-slate-800 font-medium text-sm sm:text-base mt-1 leading-relaxed">
              "{checkIn.messageText}"
            </p>
          </div>
        </div>

        {/* Right side: Audio and Quick Actions */}
        <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleSpeakCheckIn}
            className="p-2.5 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition-colors shadow-2xs"
            title="Hear family check-in read aloud"
          >
            <Volume2 className="w-4 h-4 text-rose-600" />
          </button>

          {/* Quick Replies Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => onQuickReply(checkIn.id, reply)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 text-slate-800 hover:text-teal-800 border border-slate-200 font-bold text-xs transition-colors shadow-2xs"
              >
                {reply}
              </button>
            ))}
          </div>

          <button
            onClick={() => onDismiss(checkIn.id)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
            title="Dismiss Notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
