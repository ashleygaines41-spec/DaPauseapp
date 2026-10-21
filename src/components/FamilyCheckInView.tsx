import React, { useState } from 'react';
import {
  Heart,
  CheckCircle2,
  Send,
  MessageCircle,
  Users,
  Volume2,
  Sparkles,
  Smile,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { FamilyCheckIn, EmergencyContact, VoiceSettings } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { speechEngine } from '../utils/speechEngine';

interface FamilyCheckInViewProps {
  checkIns: FamilyCheckIn[];
  contacts: EmergencyContact[];
  onSendCheckIn: (
    senderId: string,
    senderName: string,
    relationship: string,
    messageType: 'im_okay' | 'thinking_of_you' | 'meds_taken' | 'walk_done',
    messageText: string,
    avatarBg: string
  ) => void;
  onQuickReply: (id: string, replyText: string) => void;
  voiceSettings: VoiceSettings;
}

export const FamilyCheckInView: React.FC<FamilyCheckInViewProps> = ({
  checkIns,
  contacts,
  onSendCheckIn,
  onQuickReply,
  voiceSettings,
}) => {
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(
    contacts[0] || null
  );
  const [customNote, setCustomNote] = useState('');

  const handleQuickSend = (
    type: 'im_okay' | 'thinking_of_you' | 'meds_taken' | 'walk_done',
    customText?: string
  ) => {
    soundEngine.playCheckInChime();

    let text = customText || '';
    if (!text) {
      if (type === 'im_okay') text = "I'm okay! Having a peaceful day. Everything is going well.";
      if (type === 'thinking_of_you') text = 'Thinking of you! Sending you love and warm wishes. ❤️';
      if (type === 'meds_taken') text = 'Just took all my scheduled medications with breakfast!';
      if (type === 'walk_done') text = 'Finished my gentle daily walk around the neighborhood. Feeling great!';
    }

    onSendCheckIn(
      selectedContact?.id || 'senior-self',
      selectedContact ? selectedContact.name : 'You (Ashley)',
      selectedContact ? selectedContact.relationship : 'Caregiver Update',
      type,
      text,
      selectedContact ? selectedContact.avatarBg : 'bg-teal-600'
    );

    if (voiceSettings.autoSpeakReminders) {
      speechEngine.speak(`Sent check-in: ${text}`, {
        voiceName: voiceSettings.taskVoice || 'Zephyr',
      });
    }

    setCustomNote('');
  };

  const handleSpeakCheckIn = (checkIn: FamilyCheckIn) => {
    soundEngine.playCheckInChime();
    const text = `${checkIn.senderName} (${checkIn.relationship}) sent a check-in: ${checkIn.messageText}. ${
      checkIn.quickReply ? `Your reply was: ${checkIn.quickReply}` : ''
    }`;
    speechEngine.speak(text, {
      voiceName: voiceSettings.taskVoice || 'Zephyr',
      speechRate: voiceSettings.speechRate,
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
          <div>
            <h2
              className={`font-black text-slate-900 tracking-tight ${
                voiceSettings.seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
              }`}
            >
              Family Check-in & Peace of Mind Hub
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Send single-tap "I'm okay" or "Thinking of you" messages with non-intrusive notifications.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-teal-50 border border-teal-200 text-teal-800 text-xs sm:text-sm font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Non-intrusive Family Connectivity</span>
        </div>
      </div>

      {/* Senior Instant 1-Tap Check-in Card */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 text-white rounded-3xl p-6 shadow-xl shadow-teal-700/20 border border-teal-500 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-amber-200" />
            <div>
              <h3 className="font-black text-lg sm:text-xl text-white">
                Quick 1-Tap Senior Check-in
              </h3>
              <p className="text-teal-100 text-xs sm:text-sm">
                Tap once to reassure all designated family members without calling or texting.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleQuickSend('im_okay')}
            className="p-4 rounded-2xl bg-white hover:bg-emerald-50 text-slate-900 text-left shadow-md transition-all active:scale-95 group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                1-Tap Send
              </span>
            </div>
            <div className="mt-3">
              <span className="font-black text-base text-slate-900 block group-hover:text-emerald-700">
                "I'm Okay"
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Reassure everyone you are safe & doing well
              </span>
            </div>
          </button>

          <button
            onClick={() => handleQuickSend('thinking_of_you')}
            className="p-4 rounded-2xl bg-white hover:bg-rose-50 text-slate-900 text-left shadow-md transition-all active:scale-95 group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-rose-100 text-rose-600">
                <Heart className="w-5 h-5 fill-rose-600" />
              </span>
              <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                1-Tap Send
              </span>
            </div>
            <div className="mt-3">
              <span className="font-black text-base text-slate-900 block group-hover:text-rose-700">
                "Thinking of You"
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Send love & warm thoughts to family
              </span>
            </div>
          </button>

          <button
            onClick={() => handleQuickSend('meds_taken')}
            className="p-4 rounded-2xl bg-white hover:bg-teal-50 text-slate-900 text-left shadow-md transition-all active:scale-95 group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-teal-100 text-teal-700">
                <Smile className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-black uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                1-Tap Send
              </span>
            </div>
            <div className="mt-3">
              <span className="font-black text-base text-slate-900 block group-hover:text-teal-700">
                "Medications Taken"
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Confirm scheduled pills are completed
              </span>
            </div>
          </button>

          <button
            onClick={() => handleQuickSend('walk_done')}
            className="p-4 rounded-2xl bg-white hover:bg-amber-50 text-slate-900 text-left shadow-md transition-all active:scale-95 group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                <CheckCircle2 className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                1-Tap Send
              </span>
            </div>
            <div className="mt-3">
              <span className="font-black text-base text-slate-900 block group-hover:text-amber-700">
                "Walk Finished"
              </span>
              <span className="text-xs text-slate-500 block mt-0.5">
                Share healthy morning activity update
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Family Check-in Simulator + History Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Designated Family Contact Sender */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Designated Family Check-in Sender
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Simulate incoming check-in messages from designated family contacts or caregivers.
          </p>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-600">
              Select Contact
            </label>
            <div className="space-y-1.5">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    selectedContact?.id === contact.id
                      ? 'bg-teal-50 border-teal-500 shadow-2xs'
                      : 'hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center text-sm ${contact.avatarBg}`}
                    >
                      {contact.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {contact.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">{contact.relationship}</p>
                    </div>
                  </div>
                  {selectedContact?.id === contact.id && (
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold uppercase text-slate-600">
              Quick Preset from {selectedContact?.name.split(' ')[0] || 'Family'}:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  handleQuickSend('thinking_of_you', `Thinking of you! Hope you have a wonderful day. ❤️`)
                }
                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200 text-center transition-colors"
              >
                "Thinking of You"
              </button>
              <button
                onClick={() =>
                  handleQuickSend('im_okay', `I'm okay! Just checked in to say hi and see how you are doing.`)
                }
                className="p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-200 text-center transition-colors"
              >
                "I'm Okay"
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Check-in Activity Log Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center justify-between">
            <span>Recent Family Check-in Messages ({checkIns.length})</span>
            <span className="text-xs text-slate-400 font-medium">Non-intrusive activity</span>
          </h3>

          <div className="space-y-3">
            {checkIns.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center text-slate-400">
                <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-semibold text-slate-600">No family check-ins yet today.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Tap "I'm Okay" or "Thinking of You" above to send one now!
                </p>
              </div>
            ) : (
              checkIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-2xl text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm ${checkIn.avatarBg}`}
                      >
                        {checkIn.senderName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                            {checkIn.senderName}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            ({checkIn.relationship})
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {checkIn.timestamp}
                          </span>
                        </div>
                        <p className="text-slate-800 font-medium text-sm sm:text-base mt-1 leading-relaxed">
                          "{checkIn.messageText}"
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSpeakCheckIn(checkIn)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-colors shrink-0"
                      title="Hear check-in message"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Existing Reply if any */}
                  {checkIn.quickReply ? (
                    <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center gap-2 text-xs sm:text-sm text-teal-950 font-medium">
                      <MessageCircle className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>
                        Your reply: <strong>{checkIn.quickReply}</strong>
                      </span>
                    </div>
                  ) : (
                    /* Quick Reply Buttons */
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-400">Quick reply:</span>
                      {['❤️ Love you too!', '👍 Doing great!', '☕ Having tea now'].map(
                        (reply) => (
                          <button
                            key={reply}
                            onClick={() => onQuickReply(checkIn.id, reply)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 text-xs font-bold transition-colors"
                          >
                            {reply}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
