import React from 'react';
import {
  Flame,
  Award,
  Trophy,
  Star,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { GamificationState, MilestoneBadge, VoiceSettings } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { speechEngine } from '../utils/speechEngine';

interface StreakGamificationBannerProps {
  gamification: GamificationState;
  badges: MilestoneBadge[];
  onOpenBadgesModal: () => void;
  voiceSettings: VoiceSettings;
}

export const StreakGamificationBanner: React.FC<StreakGamificationBannerProps> = ({
  gamification,
  badges,
  onOpenBadgesModal,
  voiceSettings,
}) => {
  const unlockedBadges = badges.filter((b) => b.isUnlocked);
  const nextMilestone = badges.find((b) => !b.isUnlocked);

  const handleSpeakStreak = () => {
    soundEngine.playSuccessDing();
    const text = `Congratulations Ashley! You have a ${gamification.currentStreakDays}-day streak of completing your daily tasks and health routines. You have earned ${gamification.totalPoints} total points and unlocked ${unlockedBadges.length} milestone badges. Keep up the wonderful work!`;
    speechEngine.speak(text, {
      voiceName: voiceSettings.taskVoice || 'Fenrir',
      speechRate: voiceSettings.speechRate,
    });
  };

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-4 sm:p-5 text-white shadow-lg shadow-orange-500/20 border-2 border-amber-300 relative overflow-hidden transition-all">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Prominent Streak Counter */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex flex-col items-center justify-center text-white border-2 border-white/40 shadow-inner shrink-0 relative group">
            <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-amber-200 fill-amber-300 animate-bounce" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-100">
              Streak
            </span>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-200"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-white/25 text-xs font-black uppercase tracking-wider text-amber-100 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Active Milestone
              </span>
              <span className="text-xs text-amber-100 font-semibold">
                Best: {gamification.bestStreakDays} Days
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-0.5">
              <h3
                className={`font-black text-white tracking-tight ${
                  voiceSettings.seniorMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
                }`}
              >
                {gamification.currentStreakDays}-Day Streak!
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-amber-100 font-medium mt-0.5">
              Tasks & medications completed consistently without missing deadlines.
            </p>
          </div>
        </div>

        {/* Center: Total Points */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 sm:px-5 sm:py-3.5 border border-white/20 flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-black shadow-sm">
              <Star className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-100">
                Total Health Points
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {gamification.totalPoints} pts
              </div>
            </div>
          </div>
          <span className="text-[11px] font-bold text-amber-100 bg-white/15 px-2 py-1 rounded-lg">
            +25 pts / on-time task
          </span>
        </div>

        {/* Right: Badges Preview & Trigger */}
        <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center -space-x-2">
            {unlockedBadges.slice(0, 3).map((badge) => (
              <div
                key={badge.id}
                className="w-10 h-10 rounded-full bg-white text-slate-900 border-2 border-amber-400 flex items-center justify-center shadow-md font-bold text-xs"
                title={`${badge.name}: ${badge.description}`}
              >
                <Trophy className="w-5 h-5 text-amber-500 fill-amber-400" />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeakStreak}
              className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Hear streak and points announcement"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
            </button>

            <button
              onClick={onOpenBadgesModal}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-amber-50 font-black text-xs sm:text-sm shadow-md flex items-center gap-1.5 transition-transform active:scale-95 shrink-0"
            >
              <span>{unlockedBadges.length} Badges</span>
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Next Milestone Progress Bar */}
      {nextMilestone && (
        <div className="mt-3 pt-3 border-t border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-100">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-200" />
            <span>
              Next Milestone: <strong>{nextMilestone.name}</strong> ({nextMilestone.currentCount}/
              {nextMilestone.targetCount})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-36 bg-black/20 rounded-full h-2 overflow-hidden border border-white/20">
              <div
                className="bg-amber-300 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round((nextMilestone.currentCount / nextMilestone.targetCount) * 100)
                  )}%`,
                }}
              />
            </div>
            <span className="font-bold text-[11px] text-white">
              +{nextMilestone.pointsReward} pts reward
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
