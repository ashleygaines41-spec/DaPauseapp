import React, { useState } from 'react';
import {
  Users,
  Phone,
  MessageSquare,
  Plus,
  Shield,
  HeartPulse,
  Edit2,
  Check,
  MapPin,
  Volume2,
} from 'lucide-react';
import { EmergencyContact, MedicalProfile, VoiceSettings } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { speechEngine } from '../utils/speechEngine';

interface EmergencyContactsManagerProps {
  contacts: EmergencyContact[];
  medicalProfile: MedicalProfile;
  onAddContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  onUpdateMedicalProfile: (profile: MedicalProfile) => void;
  voiceSettings: VoiceSettings;
}

export const EmergencyContactsManager: React.FC<EmergencyContactsManagerProps> = ({
  contacts,
  medicalProfile,
  onAddContact,
  onUpdateMedicalProfile,
  voiceSettings,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRelationship, setNewRelationship] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isVip, setIsVip] = useState(true);

  // Edit medical profile mode
  const [isEditingMedical, setIsEditingMedical] = useState(false);
  const [allergiesText, setAllergiesText] = useState(medicalProfile.allergies.join(', '));
  const [conditionsText, setConditionsText] = useState(medicalProfile.conditions.join(', '));
  const [notesText, setNotesText] = useState(medicalProfile.emergencyNotes);
  const [addressText, setAddressText] = useState(medicalProfile.homeAddress);

  const handleSpeakContact = (contact: EmergencyContact) => {
    soundEngine.playReminderChime();
    const text = `Emergency Contact: ${contact.name}, ${contact.relationship}. Phone number is ${contact.phone}.`;
    speechEngine.speak(text, voiceSettings);
  };

  const handleSaveMedical = () => {
    onUpdateMedicalProfile({
      ...medicalProfile,
      allergies: allergiesText.split(',').map((s) => s.trim()).filter(Boolean),
      conditions: conditionsText.split(',').map((s) => s.trim()).filter(Boolean),
      emergencyNotes: notesText.trim(),
      homeAddress: addressText.trim(),
    });
    setIsEditingMedical(false);
    soundEngine.playSuccessDing();
    if (voiceSettings.autoSpeakReminders) {
      speechEngine.speak('Updated emergency medical ID profile.', voiceSettings);
    }
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const bgColors = ['bg-rose-500', 'bg-indigo-500', 'bg-teal-600', 'bg-amber-500', 'bg-emerald-600'];
    const chosenBg = bgColors[contacts.length % bgColors.length];

    onAddContact({
      name: newName.trim(),
      relationship: newRelationship.trim() || 'Emergency Contact',
      phone: newPhone.trim(),
      email: newEmail.trim() || '',
      isVip,
      avatarBg: chosenBg,
    });

    soundEngine.playSuccessDing();
    if (voiceSettings.autoSpeakReminders) {
      speechEngine.speak(`Added emergency contact ${newName}.`, voiceSettings);
    }

    setNewName('');
    setNewRelationship('');
    setNewPhone('');
    setNewEmail('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2
              className={`font-black text-slate-900 tracking-tight ${
                voiceSettings.seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
              }`}
            >
              Family SOS Contacts & Medical ID
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Instant one-tap family calls, distress messaging, and first-responder paramedic cards.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Family Contact</span>
        </button>
      </div>

      {/* Emergency Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition-all flex flex-col justify-between gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md ${contact.avatarBg}`}
                >
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-black text-slate-900 ${
                        voiceSettings.seniorMode ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                      }`}
                    >
                      {contact.name}
                    </h3>
                    {contact.isVip && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800">
                        VIP Family
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 font-semibold text-xs sm:text-sm">
                    {contact.relationship}
                  </p>
                  <p className="text-slate-800 font-mono text-sm font-bold mt-1">
                    {contact.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleSpeakContact(contact)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors shrink-0"
                title="Hear contact details aloud"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions: Call & SMS */}
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
              <a
                href={`tel:${contact.phone.replace(/[^0-9]/g, '')}`}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>

              <a
                href={`sms:${contact.phone.replace(/[^0-9]/g, '')}?body=Emergency%20check-in%20from%20VocalCare`}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Text Message</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* First Responder Medical ID Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-700">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg sm:text-xl">
                Paramedic & First Responder Medical ID
              </h3>
              <p className="text-xs text-slate-500">
                Critical health details accessible immediately during an emergency dispatch.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (isEditingMedical) {
                handleSaveMedical();
              } else {
                setIsEditingMedical(true);
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors self-start sm:self-center"
          >
            {isEditingMedical ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <Edit2 className="w-4 h-4 text-slate-600" />
                <span>Edit Medical Details</span>
              </>
            )}
          </button>
        </div>

        {isEditingMedical ? (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Known Allergies (comma separated)
              </label>
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Medical Conditions (comma separated)
              </label>
              <input
                type="text"
                value={conditionsText}
                onChange={(e) => setConditionsText(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Home Address
              </label>
              <input
                type="text"
                value={addressText}
                onChange={(e) => setAddressText(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Lockbox Code & First Responder Notes
              </label>
              <textarea
                rows={2}
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-sm pt-2">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Full Name & Age
              </span>
              <span className="font-bold text-slate-900 text-sm sm:text-base mt-0.5 block">
                {medicalProfile.fullName}
              </span>
              <span className="text-slate-500 text-xs">DOB: {medicalProfile.birthDate}</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Blood Group
              </span>
              <span className="font-black text-rose-600 text-base sm:text-lg mt-0.5 block">
                {medicalProfile.bloodType}
              </span>
              <span className="text-slate-500 text-xs">Donor compatible</span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 sm:col-span-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Severe Allergies
              </span>
              <span className="font-bold text-rose-700 mt-0.5 block">
                {medicalProfile.allergies.join(' • ')}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 sm:col-span-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Diagnosed Conditions
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {medicalProfile.conditions.join(' • ')}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 sm:col-span-2">
              <span className="text-[10px] font-bold uppercase text-slate-400 block flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Home Address & Lockbox
              </span>
              <span className="font-semibold text-slate-800 mt-0.5 block">
                {medicalProfile.homeAddress}
              </span>
              <span className="text-amber-800 font-medium text-xs mt-1 block">
                {medicalProfile.emergencyNotes}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-700 p-5 text-white flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Add Emergency Family Contact</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddContactSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Contact Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Gaines"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-slate-900 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Daughter, Neighbor, Doctor"
                    value={newRelationship}
                    onChange={(e) => setNewRelationship(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 000-0000"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-slate-900 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 text-slate-900 text-sm"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="vipCheckbox"
                  checked={isVip}
                  onChange={(e) => setIsVip(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded-sm border-slate-300 focus:ring-rose-500"
                />
                <label htmlFor="vipCheckbox" className="text-xs font-semibold text-slate-700">
                  Mark as High-Priority VIP (First to be contacted in SOS)
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
