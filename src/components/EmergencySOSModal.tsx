import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Phone,
  MessageSquare,
  X,
  Volume2,
  VolumeX,
  ShieldAlert,
  MapPin,
  HeartPulse,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { EmergencyContact, MedicalProfile } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { speechEngine } from '../utils/speechEngine';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: EmergencyContact[];
  medicalProfile: MedicalProfile;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onClose,
  contacts,
  medicalProfile,
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(true);
  const [broadcastSent, setBroadcastSent] = useState<boolean>(false);
  const [sirenPlaying, setSirenPlaying] = useState<boolean>(true);

  useEffect(() => {
    let timer: any;
    if (isOpen) {
      setCountdown(5);
      setIsCountingDown(true);
      setBroadcastSent(false);
      setSirenPlaying(true);
      soundEngine.startSiren();
      speechEngine.speak('Emergency SOS activated. Alerting family contacts in 5 seconds. Tap cancel to abort if this is a mistake.');

      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsCountingDown(false);
            setBroadcastSent(true);
            speechEngine.speak('Emergency broadcast sent to your family contacts and primary doctor. Help is on the way.');
            return 0;
          }
          soundEngine.playTick();
          return prev - 1;
        });
      }, 1000);
    } else {
      soundEngine.stopSiren();
      speechEngine.stopSpeaking();
    }

    return () => {
      clearInterval(timer);
      soundEngine.stopSiren();
    };
  }, [isOpen]);

  const toggleSiren = () => {
    if (sirenPlaying) {
      soundEngine.stopSiren();
      setSirenPlaying(false);
    } else {
      soundEngine.startSiren();
      setSirenPlaying(true);
    }
  };

  const handleCancel = () => {
    soundEngine.stopSiren();
    speechEngine.speak('Emergency alert cancelled.');
    onClose();
  };

  if (!isOpen) return null;

  const distressMessage = encodeURIComponent(
    `EMERGENCY ALERT: ${medicalProfile.fullName} triggered an SOS emergency request. ` +
    `Current Address: ${medicalProfile.homeAddress}. ` +
    `Medical: ${medicalProfile.conditions.join(', ')}. ` +
    `Lockbox: ${medicalProfile.emergencyNotes}. ` +
    `Please respond immediately!`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-red-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-4 border-rose-600 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Banner with siren flashing */}
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white text-rose-600 flex items-center justify-center shadow-lg animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black uppercase tracking-widest text-amber-200">
                  SOS Emergency Mode
                </span>
                {broadcastSent && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-xs font-bold text-white flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Broadcast Sent
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                Emergency Assistance Center
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSiren}
              className={`p-3 rounded-2xl transition-colors ${
                sirenPlaying ? 'bg-amber-400 text-slate-900 font-bold' : 'bg-white/20 text-white'
              }`}
              title={sirenPlaying ? 'Mute Siren Alarm' : 'Unmute Siren Alarm'}
            >
              {sirenPlaying ? <Volume2 className="w-6 h-6 animate-pulse" /> : <VolumeX className="w-6 h-6" />}
            </button>
            <button
              onClick={handleCancel}
              className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              title="Close Emergency Modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Countdown / Status Box */}
          {isCountingDown ? (
            <div className="p-6 bg-rose-50 border-2 border-rose-300 rounded-2xl text-center space-y-4">
              <p className="text-sm sm:text-base font-bold text-rose-900">
                Automatic Emergency Broadcast in:
              </p>
              <div className="text-6xl sm:text-7xl font-black text-rose-600 animate-pulse tracking-tighter">
                {countdown}
              </div>
              <p className="text-xs sm:text-sm text-rose-700">
                Alerting all family contacts, sending GPS location & medical profile.
              </p>
              <button
                onClick={handleCancel}
                className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg sm:text-xl shadow-lg transition-transform active:scale-98"
              >
                I AM OKAY — CANCEL ALERT
              </button>
            </div>
          ) : (
            <div className="p-5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-base sm:text-lg">
                  Emergency Alert Dispatched Successfully
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
                  High-priority SOS notification broadcasted to Sarah Gaines, Mark Gaines, and Dr. Evans.
                </p>
              </div>
            </div>
          )}

          {/* Direct 911 Dial Button */}
          <div className="p-4 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-600/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="p-3 bg-white/20 rounded-xl">
                <Phone className="w-8 h-8 animate-pulse text-amber-200" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  Immediate Life-Threatening Emergency
                </div>
                <div className="text-xl sm:text-2xl font-black">Call 911 Emergency Services</div>
              </div>
            </div>
            <a
              href="tel:911"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-red-700 hover:bg-amber-100 font-black text-lg text-center shadow-md transition-transform active:scale-95"
            >
              CALL 911 NOW
            </a>
          </div>

          {/* Quick Access Family Contacts */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-rose-600" />
              <span>Quick-Access Family & Emergency Contacts</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-rose-50/50 hover:border-rose-300 transition-all flex flex-col justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl text-white font-bold flex items-center justify-center shrink-0 ${contact.avatarBg}`}
                    >
                      {contact.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 truncate text-sm sm:text-base">
                          {contact.name}
                        </h4>
                        {contact.isVip && (
                          <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                            VIP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{contact.relationship}</p>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">{contact.phone}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80">
                    <a
                      href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`sms:${contact.phone.replace(/[^0-9]/g, '')}?body=${distressMessage}`}
                      className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Text SOS</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* First Responder Medical ID Card */}
          <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                <HeartPulse className="w-5 h-5 text-rose-600" />
                <span>Paramedic & First Responder Medical ID</span>
              </h4>
              <span className="text-xs font-semibold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                Blood Type: {medicalProfile.bloodType}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 block uppercase text-[10px]">
                  Known Allergies:
                </span>
                <span className="font-semibold text-rose-700">
                  {medicalProfile.allergies.join(', ')}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500 block uppercase text-[10px]">
                  Medical Conditions:
                </span>
                <span className="font-semibold text-slate-800">
                  {medicalProfile.conditions.join(', ')}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200 sm:col-span-2">
                <span className="font-bold text-slate-500 block uppercase text-[10px] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Home Address & Lockbox Info:
                </span>
                <span className="font-semibold text-slate-800 block">
                  {medicalProfile.homeAddress}
                </span>
                <span className="text-xs text-amber-700 font-medium block mt-1">
                  {medicalProfile.emergencyNotes}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm transition-colors"
          >
            Dismiss SOS Modal
          </button>
        </div>
      </div>
    </div>
  );
};
