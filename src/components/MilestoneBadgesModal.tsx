import React from 'react';
import {
  X,
  Trophy,
  Award,
  Flame,
  CheckCircle2,
  Lock,
  Star,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { MilestoneBadge, GamificationState, VoiceSettings } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { speechEngine } from '../utils/speechEngine';

interface MilestoneBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  badges: MilestoneBadge[];
  gamification: GamificationState;
  voiceSettings: VoiceSettings;
}

export const MilestoneBadgesModal: React.FC<MilestoneBadgesModalProps> = ({
  isOpen,
  onClose,
  badges,
  gamification,
  voiceSettings,
}) => {
  if (!isOpen) return null;

  const handleCelebrateBadge = (badge: MilestoneBadge) => {
    soundEngine.playSuccessDing();
    const text = badge.isUnlocked
      ? `Badge Achieved: ${badge.name}! ${badge.description}. You earned ${badge.pointsReward} bonus points.`
      : `Milestone in progress: ${badge.name}. Current progress is ${badge.currentCount} out of ${badge.targetCount}. Keep going!`;

    speechEngine.speak(text, {
      voiceName: voiceSettings.taskVoice || 'Fenrir',
      speechRate: voiceSettings.speechRate,
    });
  };

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/20 text-white shadow-inner">
              <Trophy className="w-7 h-7 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-white/25 text-amber-100">
                  Gamification & Badges
                </span>
                <span className="text-xs text-amber-100 font-semibold">
                  {unlockedCount} of {badges.length} Unlocked
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                Milestone Achievements Gallery
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Total Points & Current Streak Bar */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-600 fill-amber-500 animate-bounce" />
            <span className="font-bold text-slate-800">
              Current Consistency: <strong>{gamification.currentStreakDays}-Day Streak</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 font-black text-amber-900">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            <span>{gamification.totalPoints} Health Points</span>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {badges.map((badge) => {
              const percent = Math.min(
                100,
                Math.round((badge.currentCount / badge.targetCount) * 100)
              );

              return (
                <div
                  key={badge.id}
                  onClick={() => handleCelebrateBadge(badge)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    badge.isUnlocked
                      ? 'bg-amber-50/60 border-amber-300 hover:shadow-md hover:border-amber-400'
                      : 'bg-slate-50 border-slate-200 opacity-75 hover:opacity-100 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                          badge.isUnlocked
                            ? 'bg-gradient-to-tr from-amber-400 to-orange-400 text-white shadow-amber-400/30'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {badge.isUnlocked ? (
                          <Award className="w-6 h-6" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              badge.badgeLevel === 'Gold'
                                ? 'bg-amber-100 text-amber-800'
                                : badge.badgeLevel === 'Platinum'
                                ? 'bg-purple-100 text-purple-800'
                                : badge.badgeLevel === 'Silver'
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {badge.badgeLevel}
                          </span>
                          {badge.isUnlocked && (
                            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Achieved
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                          {badge.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    <button
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 transition-colors shrink-0"
                      title="Listen to badge voice info"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Progress & Points Reward */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600">
                        Progress: {badge.currentCount}/{badge.targetCount}
                      </span>
                      <span className="font-black text-amber-800">
                        +{badge.pointsReward} pts
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          badge.isUnlocked ? 'bg-amber-500' : 'bg-teal-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Points earned: +25 for on-time tasks, +15 for medications, +10 for check-ins.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
