import React, { useState } from 'react';
import {
  Pill,
  CheckCircle2,
  Clock,
  Volume2,
  Plus,
  Flame,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Medication, VoiceSettings } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { speechEngine } from '../utils/speechEngine';

interface MedicationsViewProps {
  medications: Medication[];
  onToggleMedicationTaken: (medId: string, time: string) => void;
  onAddMedication: (med: Omit<Medication, 'id'>) => void;
  voiceSettings: VoiceSettings;
}

export const MedicationsView: React.FC<MedicationsViewProps> = ({
  medications,
  onToggleMedicationTaken,
  onAddMedication,
  voiceSettings,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedInstructions, setNewMedInstructions] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00');
  const [newMedColor, setNewMedColor] = useState('teal');

  const speakMedication = (med: Medication, time: string) => {
    soundEngine.playMedicationChime();
    const text = `Essential Medication Reminder: Time for ${med.name}, ${med.dosage}. Instructions: ${med.instructions}. Scheduled for ${time}.`;
    speechEngine.speak(text, voiceSettings);
  };

  const handleToggleTaken = (med: Medication, time: string) => {
    const isNowTaken = !med.takenToday[time];
    if (isNowTaken) {
      soundEngine.playSuccessDing();
      if (voiceSettings.autoSpeakReminders) {
        speechEngine.speak(`Marked ${med.name} as taken. Great job staying on track with your health!`, voiceSettings);
      }
    }
    onToggleMedicationTaken(med.id, time);
  };

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim()) return;

    onAddMedication({
      name: newMedName.trim(),
      dosage: newMedDosage.trim(),
      instructions: newMedInstructions.trim() || 'Take with water as directed.',
      scheduledTimes: [newMedTime],
      takenToday: { [newMedTime]: false },
      streakDays: 1,
      pillColor: newMedColor,
      pillShape: 'capsule',
      refillDaysRemaining: 30,
    });

    soundEngine.playSuccessDing();
    if (voiceSettings.autoSpeakReminders) {
      speechEngine.speak(`Added medication ${newMedName} for ${newMedTime}.`, voiceSettings);
    }

    setNewMedName('');
    setNewMedDosage('');
    setNewMedInstructions('');
    setIsAddModalOpen(false);
  };

  const totalDoses = medications.reduce((sum, m) => sum + m.scheduledTimes.length, 0);
  const takenDoses = medications.reduce(
    (sum, m) => sum + m.scheduledTimes.filter((t) => m.takenToday[t]).length,
    0
  );
  const adherencePercent = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2
                className={`font-black text-slate-900 tracking-tight ${
                  voiceSettings.seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                }`}
              >
                Essential Medications & Daily Prescriptions
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Spoken reminders throughout the day to ensure zero missed doses.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Adherence Streak Badge */}
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Today's Adherence
              </div>
              <div className="text-sm font-black">
                {takenDoses} of {totalDoses} Doses ({adherencePercent}%)
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Medication Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 hover:shadow-md transition-all flex flex-col justify-between gap-4 relative overflow-hidden"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 shadow-inner">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700">
                      Prescription
                    </span>
                    <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {med.streakDays}-Day Streak
                    </span>
                  </div>
                  <h3
                    className={`font-black text-slate-900 mt-1 ${
                      voiceSettings.seniorMode ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                    }`}
                  >
                    {med.name}
                  </h3>
                  <div className="text-teal-700 font-bold text-sm mt-0.5">
                    Dosage: {med.dosage}
                  </div>
                </div>
              </div>

              {/* Refill warning badge */}
              <div className="text-right shrink-0">
                <span
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${
                    med.refillDaysRemaining <= 14
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {med.refillDaysRemaining} Days Supply
                </span>
              </div>
            </div>

            {/* Food & intake instructions */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider mb-0.5">
                Directions:
              </span>
              {med.instructions}
            </div>

            {/* Dose Checkboxes for Each Scheduled Time */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Scheduled Doses Today:
              </span>
              <div className="grid grid-cols-1 gap-2">
                {med.scheduledTimes.map((time) => {
                  const taken = !!med.takenToday[time];
                  return (
                    <div
                      key={time}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                        taken
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                          : 'bg-slate-50 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="font-bold font-mono text-sm">{time}</span>
                        {taken && (
                          <span className="text-xs font-semibold text-emerald-700">
                            (Taken on time)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speakMedication(med, time)}
                          className="p-2 rounded-xl bg-white hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 shadow-2xs transition-colors"
                          title="Speak reminder for this dose"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleTaken(med, time)}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 ${
                            taken
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-white hover:bg-teal-50 text-teal-800 border border-teal-300'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{taken ? 'Taken' : 'Take Now'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Medication Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-700 p-5 text-white flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Pill className="w-5 h-5" />
                <span>Add Essential Medication</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMed} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Medication Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amlodipine or Atorvastatin"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10 mg or 1 tablet"
                    value={newMedDosage}
                    onChange={(e) => setNewMedDosage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Reminder Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Food & Intake Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Take with morning breakfast and full glass of water."
                  value={newMedInstructions}
                  onChange={(e) => setNewMedInstructions(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 text-sm"
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
                  className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md"
                >
                  Save Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
