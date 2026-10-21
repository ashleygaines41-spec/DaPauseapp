import React from 'react';
import {
  PhoneCall,
  Volume2,
  CheckCircle,
  FileText,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { UrgentCallAlert, VoiceSettings } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { speechEngine } from '../utils/speechEngine';

interface UrgentCallBannerProps {
  urgentAlerts: UrgentCallAlert[];
  onResolveAlert: (id: string) => void;
  onOpenDetails: (alert: UrgentCallAlert) => void;
  onSimulateUrgentCall: () => void;
  voiceSettings: VoiceSettings;
}

export const UrgentCallBanner: React.FC<UrgentCallBannerProps> = ({
  urgentAlerts,
  onResolveAlert,
  onOpenDetails,
  onSimulateUrgentCall,
  voiceSettings,
}) => {
  const activeAlerts = urgentAlerts.filter((a) => !a.resolved);

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4 flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>All important calls and doctor messages are currently resolved.</span>
        </div>
        <button
          onClick={onSimulateUrgentCall}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-semibold text-xs border border-teal-200 transition-colors"
          title="Simulate an urgent call alert to test audio and speech"
        >
          <PlusCircle className="w-3.5 h-3.5 text-teal-600" />
          <span>Simulate Urgent Call</span>
        </button>
      </div>
    );
  }

  const primaryAlert = activeAlerts[0];

  const handleSpeakAlert = () => {
    soundEngine.playUrgentRing();
    const announcement = `Attention: You have an urgent incoming call notice from ${primaryAlert.callerName}. ${primaryAlert.messageSummary}`;
    speechEngine.speak(announcement, voiceSettings);
  };

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white rounded-2xl p-4 sm:p-5 shadow-lg shadow-amber-500/20 border-2 border-amber-300 relative overflow-hidden animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Caller info */}
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-white text-amber-600 rounded-2xl shadow-md shrink-0 animate-bounce">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-md bg-white/20 text-xs font-black uppercase tracking-wider text-amber-100 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Urgent Attention Required
              </span>
              <span className="text-xs text-amber-100 font-medium">
                {primaryAlert.timestamp}
              </span>
            </div>
            <h3
              className={`font-black text-white mt-1 ${
                voiceSettings.seniorMode ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
              }`}
            >
              {primaryAlert.callerName} ({primaryAlert.callerTitle})
            </h3>
            <p
              className={`text-amber-50 mt-1 leading-relaxed ${
                voiceSettings.seniorMode ? 'text-base font-medium' : 'text-xs sm:text-sm'
              }`}
            >
              {primaryAlert.messageSummary}
            </p>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleSpeakAlert}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs sm:text-sm backdrop-blur-sm transition-colors"
            title="Listen to urgent call audio announcement"
          >
            <Volume2 className="w-4 h-4" />
            <span>Hear Alert</span>
          </button>

          <a
            href={`tel:${primaryAlert.callerNumber.replace(/[^0-9]/g, '')}`}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-amber-100 font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95"
          >
            <PhoneCall className="w-4 h-4 text-amber-600" />
            <span>Return Call</span>
          </a>

          <button
            onClick={() => onOpenDetails(primaryAlert)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm transition-colors"
            title="Read voicemail transcript and action items"
          >
            <FileText className="w-4 h-4" />
            <span>Voicemail</span>
          </button>

          <button
            onClick={() => onResolveAlert(primaryAlert.id)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors"
            title="Mark this urgent call as handled"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Resolved</span>
          </button>
        </div>
      </div>
    </div>
  );
};
