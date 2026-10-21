import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Volume2,
  Plus,
  Car,
  FileText,
  HeartPulse,
} from 'lucide-react';
import { Appointment, VoiceSettings } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { speechEngine } from '../utils/speechEngine';

interface AppointmentsViewProps {
  appointments: Appointment[];
  onAddAppointment: (apt: Omit<Appointment, 'id'>) => void;
  voiceSettings: VoiceSettings;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  onAddAppointment,
  voiceSettings,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newClinic, setNewClinic] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDate, setNewDate] = useState('2026-10-21');
  const [newTime, setNewTime] = useState('10:00');
  const [newNotes, setNewNotes] = useState('');
  const [newBuffer, setNewBuffer] = useState(25);

  const handleSpeakAppointment = (apt: Appointment) => {
    soundEngine.playReminderChime();
    const text = `Upcoming Appointment with ${apt.doctorName}, specialist in ${apt.specialty}. Scheduled on ${apt.date} at ${apt.time} at ${apt.clinicName}. Recommended travel buffer: leave ${apt.travelBufferMins} minutes before. Notes: ${apt.notes}`;
    speechEngine.speak(text, voiceSettings);
  };

  const handleAddApt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor.trim() || !newClinic.trim()) return;

    onAddAppointment({
      doctorName: newDoctor.trim(),
      specialty: newSpecialty.trim() || 'General Health Consultation',
      clinicName: newClinic.trim(),
      address: newAddress.trim() || 'Clinic Office',
      phone: newPhone.trim() || '(555) 000-0000',
      date: newDate,
      time: newTime,
      notes: newNotes.trim() || 'Routine follow-up visit.',
      travelBufferMins: Number(newBuffer) || 20,
    });

    soundEngine.playSuccessDing();
    if (voiceSettings.autoSpeakReminders) {
      speechEngine.speak(`Added appointment with ${newDoctor} for ${newDate} at ${newTime}.`, voiceSettings);
    }

    setNewDoctor('');
    setNewSpecialty('');
    setNewClinic('');
    setNewAddress('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2
              className={`font-black text-slate-900 tracking-tight ${
                voiceSettings.seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
              }`}
            >
              Upcoming Doctor & Clinic Appointments
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Scheduled clinical visits with travel buffers, clinic phone numbers, and voice briefings.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Appointment</span>
        </button>
      </div>

      {/* Appointment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition-all flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800">
                      {apt.specialty}
                    </span>
                    <h3
                      className={`font-black text-slate-900 mt-1 ${
                        voiceSettings.seniorMode ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                      }`}
                    >
                      {apt.doctorName}
                    </h3>
                    <p className="text-slate-600 font-semibold text-xs sm:text-sm">
                      {apt.clinicName}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-3 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold block">
                    {apt.date}
                  </span>
                  <span className="text-sm font-black font-mono text-slate-900 block mt-1">
                    {apt.time}
                  </span>
                </div>
              </div>

              {/* Location & Travel Buffer */}
              <div className="mt-4 space-y-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">{apt.address}</span>
                </div>

                <div className="flex items-center gap-2 text-indigo-800 bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
                  <Car className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-medium">
                    Travel buffer: Leave <strong>{apt.travelBufferMins} mins early</strong> for check-in and parking.
                  </span>
                </div>

                {apt.notes && (
                  <div className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                    <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="text-xs">{apt.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <a
                href={`tel:${apt.phone.replace(/[^0-9]/g, '')}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-800 font-bold text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Clinic</span>
              </a>

              <button
                onClick={() => handleSpeakAppointment(apt)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
              >
                <Volume2 className="w-4 h-4" />
                <span>Hear Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-indigo-700 p-5 text-white flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Add Doctor Appointment</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddApt} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Doctor / Provider Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jennifer Clark, MD"
                  value={newDoctor}
                  onChange={(e) => setNewDoctor(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Specialty
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ophthalmology, Podiatry"
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Clinic Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mercy Health Pavilion"
                    value={newClinic}
                    onChange={(e) => setNewClinic(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Clinic Address & Phone
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500 Medical Plaza, Suite 204 • (555) 789-0123"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 text-sm"
                />
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
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md"
                >
                  Save Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
