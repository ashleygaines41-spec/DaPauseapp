import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Volume2,
  Plus,
  Calendar,
  Sparkles,
  Pill,
  HeartPulse,
  Tag,
  Trash2,
} from 'lucide-react';
import { Task, Medication, Appointment, VoiceSettings, TaskCategory, Priority } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { speechEngine } from '../utils/speechEngine';

interface TimelineScheduleProps {
  tasks: Task[];
  medications: Medication[];
  appointments: Appointment[];
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  voiceSettings: VoiceSettings;
}

export const TimelineSchedule: React.FC<TimelineScheduleProps> = ({
  tasks,
  medications,
  appointments,
  onToggleTask,
  onDeleteTask,
  onAddTask,
  voiceSettings,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'health'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('14:00');
  const [newTaskCategory, setNewTaskCategory] = useState<TaskCategory>('general');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('normal');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  // Combine tasks, medication doses, and appointments into unified timeline items
  type TimelineItem = {
    id: string;
    type: 'task' | 'medication' | 'appointment';
    title: string;
    time: string; // HH:mm
    completed: boolean;
    priority?: Priority;
    category?: string;
    notes?: string;
    rawItem: any;
  };

  const timelineItems: TimelineItem[] = [];

  // Add tasks
  tasks.forEach((t) => {
    timelineItems.push({
      id: t.id,
      type: 'task',
      title: t.title,
      time: t.time,
      completed: t.completed,
      priority: t.priority,
      category: t.category,
      notes: t.notes,
      rawItem: t,
    });
  });

  // Add medication scheduled times
  medications.forEach((m) => {
    m.scheduledTimes.forEach((scheduledTime) => {
      const isTaken = !!m.takenToday[scheduledTime];
      timelineItems.push({
        id: `med-${m.id}-${scheduledTime}`,
        type: 'medication',
        title: `Medication: ${m.name} (${m.dosage})`,
        time: scheduledTime,
        completed: isTaken,
        priority: 'high',
        category: 'health',
        notes: m.instructions,
        rawItem: m,
      });
    });
  });

  // Add appointments
  appointments.forEach((apt) => {
    timelineItems.push({
      id: apt.id,
      type: 'appointment',
      title: `Doctor: ${apt.doctorName} (${apt.specialty})`,
      time: apt.time,
      completed: false,
      priority: 'high',
      category: 'health',
      notes: `${apt.clinicName} - ${apt.address}`,
      rawItem: apt,
    });
  });

  // Sort chronologically by time
  timelineItems.sort((a, b) => a.time.localeCompare(b.time));

  // Calculate current minutes from midnight for countdowns
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const getDueStatus = (timeStr: string, completed: boolean) => {
    if (completed) return { label: 'Completed', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', isOverdue: false, isApproaching: false };
    const [h, m] = timeStr.split(':').map((n) => parseInt(n, 10));
    const itemMinutes = h * 60 + m;
    const diff = itemMinutes - currentMinutes;

    if (diff < 0) {
      const overdueMins = Math.abs(diff);
      return {
        label: overdueMins > 60 ? `Overdue by ${Math.floor(overdueMins / 60)}h ${overdueMins % 60}m` : `Overdue by ${overdueMins}m`,
        color: 'text-rose-700 bg-rose-50 border-rose-300 font-bold',
        isOverdue: true,
        isApproaching: false,
      };
    } else if (diff <= 30) {
      return {
        label: `Deadline in ${diff} mins!`,
        color: 'text-amber-800 bg-amber-100 border-amber-300 font-black animate-pulse',
        isOverdue: false,
        isApproaching: true,
      };
    } else if (diff <= 120) {
      return {
        label: `In ${Math.floor(diff / 60)}h ${diff % 60}m`,
        color: 'text-teal-700 bg-teal-50 border-teal-200 font-medium',
        isOverdue: false,
        isApproaching: false,
      };
    } else {
      return {
        label: 'Upcoming today',
        color: 'text-slate-600 bg-slate-100 border-slate-200',
        isOverdue: false,
        isApproaching: false,
      };
    }
  };

  // Find immediate next upcoming item
  const nextUpItem = timelineItems.find((item) => !item.completed);

  // Filtered items
  const filteredItems = timelineItems.filter((item) => {
    if (filter === 'pending') return !item.completed;
    if (filter === 'completed') return item.completed;
    if (filter === 'health') return item.type === 'medication' || item.type === 'appointment' || item.category === 'health';
    return true;
  });

  const handleSpeakItem = (item: TimelineItem) => {
    soundEngine.playReminderChime();
    const text = `${item.title}, scheduled for ${item.time}. ${item.notes ? item.notes : ''}`;
    speechEngine.speak(text, voiceSettings);
  };

  const handleSpeakEntireSchedule = () => {
    soundEngine.playReminderChime();
    const pendingCount = timelineItems.filter((i) => !i.completed).length;
    let briefing = `Here is your daily schedule overview. You have ${pendingCount} pending items remaining today. `;
    filteredItems.forEach((item, index) => {
      briefing += `Item ${index + 1}: At ${item.time}, ${item.title}. ${item.completed ? 'Status: completed.' : 'Status: pending.'} `;
    });
    speechEngine.speak(briefing, voiceSettings);
  };

  const handleToggle = (item: TimelineItem) => {
    if (item.type === 'task') {
      const willBeCompleted = !item.completed;
      if (willBeCompleted) {
        soundEngine.playSuccessDing();
        if (voiceSettings.autoSpeakReminders) {
          speechEngine.speak(`Completed: ${item.title}. Well done!`, voiceSettings);
        }
      }
      onToggleTask(item.id);
    }
  };

  const submitAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      title: newTaskTitle.trim(),
      time: newTaskTime,
      date: new Date().toISOString().split('T')[0],
      completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
      notes: newTaskNotes.trim() || undefined,
      recurring: 'once',
    });

    soundEngine.playSuccessDing();
    if (voiceSettings.autoSpeakReminders) {
      speechEngine.speak(`Added new task: ${newTaskTitle} for ${newTaskTime}.`, voiceSettings);
    }

    setNewTaskTitle('');
    setNewTaskNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h2
            className={`font-black text-slate-900 tracking-tight flex items-center gap-2 ${
              voiceSettings.seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}
          >
            <Clock className="w-6 h-6 text-teal-600" />
            <span>Today's Daily Assignments & Tasks</span>
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Chronological order of daily duties, medicines, and doctor deadlines.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Read Entire Schedule Aloud */}
          <button
            onClick={handleSpeakEntireSchedule}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs sm:text-sm border border-teal-200 shadow-xs transition-colors"
            title="Read all today's schedule items aloud in order"
          >
            <Volume2 className="w-4 h-4 text-teal-600" />
            <span>Read Schedule Aloud</span>
          </button>

          {/* Add Task Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-600/20 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Daily Task</span>
          </button>
        </div>
      </div>

      {/* Next Up Spotlight Banner */}
      {nextUpItem && (
        <div className="bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-700 text-white rounded-3xl p-5 sm:p-6 shadow-xl shadow-teal-700/20 border border-teal-500 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md text-amber-200 shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-black text-xs uppercase tracking-wider">
                    Next Up Now
                  </span>
                  <span className="text-teal-100 font-bold text-xs sm:text-sm flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Scheduled for {nextUpItem.time}
                  </span>
                </div>
                <h3
                  className={`font-black text-white mt-1 ${
                    voiceSettings.seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                  }`}
                >
                  {nextUpItem.title}
                </h3>
                {nextUpItem.notes && (
                  <p className="text-teal-100 text-xs sm:text-sm mt-1 max-w-2xl">
                    {nextUpItem.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => handleSpeakItem(nextUpItem)}
                className="p-3 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="Hear this next item read aloud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              {nextUpItem.type === 'task' && (
                <button
                  onClick={() => handleToggle(nextUpItem)}
                  className="px-5 py-3 rounded-xl bg-white text-teal-800 hover:bg-teal-50 font-black text-sm sm:text-base shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Mark Done</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All Timeline Items (${timelineItems.length})` },
          { id: 'pending', label: `Pending (${timelineItems.filter((i) => !i.completed).length})` },
          { id: 'health', label: 'Medications & Doctors' },
          { id: 'completed', label: `Completed (${timelineItems.filter((i) => i.completed).length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              filter === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chronological List of Items */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-600 text-base">No items match this filter.</p>
            <p className="text-xs text-slate-400 mt-1">Tap 'Add Daily Task' or use voice to schedule one.</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const status = getDueStatus(item.time, item.completed);
            return (
              <div
                key={item.id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                  item.completed
                    ? 'bg-slate-50/70 opacity-75'
                    : status.isApproaching
                    ? 'bg-amber-50/40'
                    : 'hover:bg-slate-50/50'
                }`}
              >
                {/* Left: Checkbox / Icon + Title */}
                <div className="flex items-start gap-3.5 min-w-0">
                  {item.type === 'task' ? (
                    <button
                      onClick={() => handleToggle(item)}
                      className="mt-0.5 text-slate-400 hover:text-teal-600 transition-colors shrink-0"
                      title={item.completed ? 'Mark uncompleted' : 'Mark completed'}
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-300 hover:text-teal-500" />
                      )}
                    </button>
                  ) : item.type === 'medication' ? (
                    <div className="mt-0.5 p-1.5 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                      <Pill className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="mt-0.5 p-1.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                      <HeartPulse className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-slate-800 text-sm sm:text-base font-mono">
                        {item.time}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] border ${status.color}`}
                      >
                        {status.label}
                      </span>
                      {item.priority === 'high' && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold text-[10px] uppercase">
                          High Priority
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold uppercase">
                        {item.type}
                      </span>
                    </div>

                    <h4
                      className={`font-bold text-slate-900 mt-1 leading-snug ${
                        item.completed ? 'line-through text-slate-400' : ''
                      } ${voiceSettings.seniorMode ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'}`}
                    >
                      {item.title}
                    </h4>

                    {item.notes && (
                      <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Audio Speak button & Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleSpeakItem(item)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-colors"
                    title="Speak this item aloud"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  {item.type === 'task' && (
                    <button
                      onClick={() => onDeleteTask(item.id)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-teal-700 p-5 text-white flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Add Daily Task & Deadline</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitAddTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Task Title / Assignment
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Check blood sugar or Submit pharmacy paperwork"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 text-sm sm:text-base font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Scheduled Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Priority Level
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Medium</option>
                    <option value="high">High (Urgent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as TaskCategory)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500 text-slate-900 text-sm"
                >
                  <option value="health">Health & Vitals</option>
                  <option value="chores">Daily Chores & Meals</option>
                  <option value="family">Family & Social</option>
                  <option value="errands">Errands & Shopping</option>
                  <option value="work">Study & Administration</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Notes / Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Extra reminders, instructions or tips..."
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
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
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
