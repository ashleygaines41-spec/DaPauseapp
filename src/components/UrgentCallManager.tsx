import React, { useState } from 'react';
import {
  PhoneCall,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  PlusCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UrgentCallAlert, VoiceSettings } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { speechEngine } from '../utils/speechEngine';

interface UrgentCallManagerProps {
  urgentAlerts: UrgentCallAlert[];
  onResolveAlert: (id: string) => void;
  onAddUrgentAlert: (alert: Omit<UrgentCallAlert, 'id'>) => void;
  voiceSettings: VoiceSettings;
}

export const UrgentCallManager: React.FC<UrgentCallManagerProps> = ({
  urgentAlerts,
  onResolveAlert,
  onAddUrgentAlert,
  voiceSettings,
}) => {
  const [selectedAlert, setSelectedAlert] = useState<UrgentCallAlert | null>(
    urgentAlerts[0] || null
  );

  const handlePlayVoicemail = (alert: UrgentCallAlert) => {
    soundEngine.playUrgentRing();
    const text = alert.voicemailTranscript || alert.messageSummary;
    speechEngine.speak(`Voicemail audio from ${alert.callerName}: ${text}`, voiceSettings);
  };

  const handleSimulatePreset = (preset: 'doctor' | 'family' | 'hospital') => {
    soundEngine.playUrgentRing();

    let newAlert: Omit<UrgentCallAlert, 'id'>;
    if (preset === 'doctor') {
      newAlert = {
        callerName: 'Dr. Evelyn Evans (Cardiology)',
        callerTitle: 'Primary Specialist',
        callerNumber: '(555) 234-5678',
        urgencyLevel: 'high',
        timestamp: 'Just now',
        messageSummary: 'Urgent Lab Update: Your blood potassium and kidney panel results are ready. Please review with doctor today.',
        voicemailTranscript: '"Hello Ashley, this is Dr. Evans following up on your blood panel. Everything is overall stable, but we want to adjust your hydration before your afternoon visit. Please call us back or see us at 2:45 PM."',
        resolved: false,
        actionRequired: 'Confirm afternoon appointment vitals',
      };
    } else if (preset === 'family') {
      newAlert = {
        callerName: 'Sarah Gaines (Daughter)',
        callerTitle: 'Caregiver & Daughter',
        callerNumber: '(555) 912-3456',
        urgencyLevel: 'critical',
        timestamp: 'Just now',
        messageSummary: 'Family Check-in: Sarah tried calling twice. She is coming by at 3:30 PM with your fresh groceries.',
        voicemailTranscript: '"Mom, I called twice to make sure you took your morning blood pressure pill! Give me a quick ring back so I know you are feeling well. I am picking up your groceries now."',
        resolved: false,
        actionRequired: 'Call Sarah back immediately',
      };
    } else {
      newAlert = {
        callerName: 'Mercy Outpatient Imaging',
        callerTitle: 'Hospital Diagnostic Center',
        callerNumber: '(555) 888-9900',
        urgencyLevel: 'high',
        timestamp: 'Just now',
        messageSummary: 'Appointment Confirmation: Urgent confirmation required for ultrasound tomorrow morning at 9:00 AM.',
        voicemailTranscript: '"This is Mercy Imaging reminding you of your ultrasound scheduled tomorrow. Please remember nothing to eat after midnight. Press 1 or call us back to confirm your arrival."',
        resolved: false,
        actionRequired: 'Confirm fasting instructions',
      };
    }

    onAddUrgentAlert(newAlert);

    if (voiceSettings.autoSpeakReminders) {
      speechEngine.speak(
        `Urgent priority call incoming from ${newAlert.callerName}! ${newAlert.messageSummary}`,
        voiceSettings
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
            <PhoneCall className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2
              className={`font-black text-slate-900 tracking-tight ${
                voiceSettings.seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
              }`}
            >
              Urgent Calls & Priority Message Monitor
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Instant alerts and spoken announcements when someone important needs immediate attention.
            </p>
          </div>
        </div>

        {/* Quick Simulator Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => handleSimulatePreset('doctor')}
            className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-colors flex items-center gap-1.5"
            title="Simulate doctor call alert"
          >
            <PlusCircle className="w-4 h-4 text-amber-600" />
            <span>Test Doctor Call</span>
          </button>
          <button
            onClick={() => handleSimulatePreset('family')}
            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1.5"
            title="Simulate urgent daughter call"
          >
            <PlusCircle className="w-4 h-4 text-rose-600" />
            <span>Test Family Alert</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Call List + Voicemail Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Call List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
            Incoming & Logged Urgent Calls ({urgentAlerts.length})
          </h3>
          <div className="space-y-2.5">
            {urgentAlerts.map((alert) => {
              const isSelected = selectedAlert?.id === alert.id;
              return (
                <div
                  key={alert.id}
                  onClick={() => setSelectedAlert(alert)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50/80 border-amber-400 shadow-sm ring-1 ring-amber-300'
                      : alert.resolved
                      ? 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                      : 'bg-white border-slate-200 hover:border-amber-300 hover:bg-amber-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        alert.urgencyLevel === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {alert.urgencyLevel}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {alert.timestamp}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm sm:text-base mt-1.5 truncate">
                    {alert.callerName}
                  </h4>
                  <p className="text-xs text-slate-500">{alert.callerTitle}</p>

                  <div className="mt-2 text-xs text-slate-700 line-clamp-2 leading-relaxed">
                    {alert.messageSummary}
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        alert.resolved ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {alert.resolved ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> Immediate Action Required
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Call Details & Voicemail Player */}
        <div className="lg:col-span-2">
          {selectedAlert ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                      {selectedAlert.urgencyLevel} Urgency
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Received {selectedAlert.timestamp}
                    </span>
                  </div>
                  <h3
                    className={`font-black text-slate-900 mt-1.5 ${
                      voiceSettings.seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                    }`}
                  >
                    {selectedAlert.callerName}
                  </h3>
                  <p className="text-slate-600 font-semibold text-sm">
                    {selectedAlert.callerTitle} • {selectedAlert.callerNumber}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedAlert.callerNumber.replace(/[^0-9]/g, '')}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md transition-transform active:scale-95"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Back Now</span>
                  </a>
                </div>
              </div>

              {/* Voicemail Audio Simulation Card */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-amber-700" />
                    <span>Voice Message Recording</span>
                  </span>
                  <span className="text-xs font-semibold text-amber-700">Audio Available</span>
                </div>

                <p
                  className={`text-slate-800 leading-relaxed font-serif italic ${
                    voiceSettings.seniorMode ? 'text-lg' : 'text-sm sm:text-base'
                  }`}
                >
                  {selectedAlert.voicemailTranscript || selectedAlert.messageSummary}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handlePlayVoicemail(selectedAlert)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-transform active:scale-95"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Play Voice Message Aloud</span>
                  </button>
                </div>
              </div>

              {/* Action Required Box */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Action Recommended:
                  </span>
                  <p className="text-slate-900 font-bold text-sm sm:text-base mt-0.5">
                    {selectedAlert.actionRequired}
                  </p>
                </div>

                <button
                  onClick={() => onResolveAlert(selectedAlert.id)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors shrink-0 ${
                    selectedAlert.resolved
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{selectedAlert.resolved ? 'Mark Pending' : 'Mark Handled & Resolved'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400">
              <PhoneCall className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-slate-600">Select an urgent call from the list to view.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
