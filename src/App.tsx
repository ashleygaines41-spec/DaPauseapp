import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Pill,
  Calendar,
  PhoneCall,
  Users,
  Mic,
  AlertTriangle,
  Volume2,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  HeartPulse,
  Heart,
  Pause,
  Music,
  Trophy,
} from 'lucide-react';

import {
  Task,
  Medication,
  Appointment,
  EmergencyContact,
  MedicalProfile,
  UrgentCallAlert,
  VoiceSettings,
  FamilyCheckIn,
  GamificationState,
  MilestoneBadge,
} from './types';

import {
  INITIAL_TASKS,
  INITIAL_MEDICATIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_CONTACTS,
  INITIAL_MEDICAL_PROFILE,
  INITIAL_URGENT_ALERTS,
  INITIAL_VOICE_SETTINGS,
  INITIAL_CHECKINS,
  INITIAL_GAMIFICATION,
  INITIAL_MILESTONE_BADGES,
} from './utils/initialData';

import { soundEngine } from './utils/soundEngine';
import { speechEngine } from './utils/speechEngine';

import { Header } from './components/Header';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { UrgentCallBanner } from './components/UrgentCallBanner';
import { FamilyCheckInBanner } from './components/FamilyCheckInBanner';
import { StreakGamificationBanner } from './components/StreakGamificationBanner';
import { MilestoneBadgesModal } from './components/MilestoneBadgesModal';
import { TimelineSchedule } from './components/TimelineSchedule';
import { MedicationsView } from './components/MedicationsView';
import { AppointmentsView } from './components/AppointmentsView';
import { UrgentCallManager } from './components/UrgentCallManager';
import { EmergencyContactsManager } from './components/EmergencyContactsManager';
import { FamilyCheckInView } from './components/FamilyCheckInView';
import { SoundVoiceCustomizerView } from './components/SoundVoiceCustomizerView';
import { AccessibilitySettingsModal } from './components/AccessibilitySettingsModal';

export default function App() {
  // --- Persistent State ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('vocalcare_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('vocalcare_medications');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('vocalcare_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('vocalcare_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [medicalProfile, setMedicalProfile] = useState<MedicalProfile>(() => {
    const saved = localStorage.getItem('vocalcare_medical_profile');
    return saved ? JSON.parse(saved) : INITIAL_MEDICAL_PROFILE;
  });

  const [urgentAlerts, setUrgentAlerts] = useState<UrgentCallAlert[]>(() => {
    const saved = localStorage.getItem('vocalcare_urgent_alerts');
    return saved ? JSON.parse(saved) : INITIAL_URGENT_ALERTS;
  });

  const [checkIns, setCheckIns] = useState<FamilyCheckIn[]>(() => {
    const saved = localStorage.getItem('vocalcare_checkins');
    return saved ? JSON.parse(saved) : INITIAL_CHECKINS;
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const saved = localStorage.getItem('vocalcare_voice_settings');
    return saved ? JSON.parse(saved) : INITIAL_VOICE_SETTINGS;
  });

  const [gamification, setGamification] = useState<GamificationState>(() => {
    const saved = localStorage.getItem('vocalcare_gamification');
    return saved ? JSON.parse(saved) : INITIAL_GAMIFICATION;
  });

  const [badges, setBadges] = useState<MilestoneBadge[]>(() => {
    const saved = localStorage.getItem('vocalcare_badges');
    return saved ? JSON.parse(saved) : INITIAL_MILESTONE_BADGES;
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Active view tab: 'timeline' | 'medications' | 'appointments' | 'sounds' | 'checkins' | 'urgent' | 'contacts'
  const [activeTab, setActiveTab] = useState<
    'timeline' | 'medications' | 'appointments' | 'sounds' | 'checkins' | 'urgent' | 'contacts'
  >('timeline');

  // Modals state
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState(false);
  const [activeToast, setActiveToast] = useState<{
    message: string;
    type: 'info' | 'success' | 'alert';
  } | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('vocalcare_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('vocalcare_medications', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('vocalcare_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('vocalcare_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('vocalcare_medical_profile', JSON.stringify(medicalProfile));
  }, [medicalProfile]);

  useEffect(() => {
    localStorage.setItem('vocalcare_urgent_alerts', JSON.stringify(urgentAlerts));
  }, [urgentAlerts]);

  useEffect(() => {
    localStorage.setItem('vocalcare_checkins', JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    localStorage.setItem('vocalcare_voice_settings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  useEffect(() => {
    localStorage.setItem('vocalcare_gamification', JSON.stringify(gamification));
  }, [gamification]);

  useEffect(() => {
    localStorage.setItem('vocalcare_badges', JSON.stringify(badges));
  }, [badges]);

  // Request browser notification permission once
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // --- Background Reminder & Approaching Deadline Engine ---
  const alertedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkInterval = setInterval(() => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Check tasks
      tasks.forEach((t) => {
        if (!t.completed && !alertedIdsRef.current.has(t.id)) {
          const [h, m] = t.time.split(':').map((n) => parseInt(n, 10));
          const taskMinutes = h * 60 + m;
          const diff = taskMinutes - currentMinutes;

          // Alert if deadline approaching within 15 minutes or reached
          if (diff >= -5 && diff <= 15) {
            alertedIdsRef.current.add(t.id);
            triggerSpokenDeadlineReminder(
              `Deadline approaching for task: ${t.title} at ${t.time}.`,
              'task'
            );
          }
        }
      });

      // Check medications
      medications.forEach((med) => {
        med.scheduledTimes.forEach((time) => {
          const doseKey = `med-${med.id}-${time}`;
          const isTaken = !!med.takenToday[time];
          if (!isTaken && !alertedIdsRef.current.has(doseKey)) {
            const [h, m] = time.split(':').map((n) => parseInt(n, 10));
            const medMinutes = h * 60 + m;
            const diff = medMinutes - currentMinutes;

            if (diff >= -5 && diff <= 15) {
              alertedIdsRef.current.add(doseKey);
              triggerSpokenDeadlineReminder(
                `Medication reminder: Please take ${med.name} ${med.dosage}. Scheduled for ${time}. ${med.instructions}`,
                'medication'
              );
            }
          }
        });
      });
    }, 15000); // Check every 15 seconds

    return () => clearInterval(checkInterval);
  }, [tasks, medications, voiceSettings, isPaused, isMuted]);

  const triggerSpokenDeadlineReminder = (
    message: string,
    category: 'task' | 'medication' | 'urgent'
  ) => {
    showToast(message, category === 'urgent' ? 'alert' : 'info');

    // Trigger Desktop Notification if permitted
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification('Pause Reminder', {
        body: message,
        icon: '/favicon.ico',
      });
    }

    // If app is paused or muted, skip sound and spoken speech
    if (isPaused || isMuted) return;

    // Play user-customized tone (1 of 5 selectable tones)
    const selectedTone =
      category === 'medication'
        ? voiceSettings.medicationSound || 'celestial_chime'
        : category === 'urgent'
        ? voiceSettings.urgentSound || 'urgent_staccato'
        : voiceSettings.taskSound || 'gentle_harmony';
    soundEngine.playTone(selectedTone);

    // Speak with user-customized AI voice (1 of 3 selectable voices)
    if (voiceSettings.autoSpeakReminders) {
      const selectedVoice =
        category === 'medication'
          ? voiceSettings.medicationVoice || 'Kore'
          : category === 'urgent'
          ? voiceSettings.urgentVoice || 'Fenrir'
          : voiceSettings.taskVoice || 'Fenrir';

      speechEngine.speak(message, {
        voiceName: selectedVoice,
        speechRate: voiceSettings.speechRate,
        speechPitch: voiceSettings.speechPitch,
      });
    }
  };

  const showToast = (message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    setActiveToast({ message, type });
    setTimeout(() => {
      setActiveToast((curr) => (curr?.message === message ? null : curr));
    }, 6000);
  };

  // --- Gamification Points & Badges Engine ---
  const awardPoints = (points: number, reason: string) => {
    setGamification((prev) => {
      const newTotal = prev.totalPoints + points;
      return {
        ...prev,
        totalPoints: newTotal,
      };
    });
    showToast(`+${points} Points Earned! ⭐ (${reason})`, 'success');
  };

  const checkBadgeMilestones = (
    updatedTasksCount: number,
    updatedMedsCount: number,
    updatedCheckInsCount: number
  ) => {
    setBadges((prevBadges) =>
      prevBadges.map((badge) => {
        let currentCount = badge.currentCount;
        if (badge.category === 'punctuality') currentCount = updatedTasksCount;
        if (badge.category === 'medication') currentCount = updatedMedsCount;
        if (badge.category === 'family') currentCount = updatedCheckInsCount;

        const willUnlock = !badge.isUnlocked && currentCount >= badge.targetCount;
        if (willUnlock) {
          awardPoints(badge.pointsReward, `Badge Unlocked: ${badge.name}!`);
          soundEngine.playSuccessDing();
          speechEngine.speak(
            `Incredible achievement Ashley! You unlocked the ${badge.name} badge and earned ${badge.pointsReward} bonus points!`,
            { voiceName: voiceSettings.taskVoice }
          );
        }

        return {
          ...badge,
          currentCount,
          isUnlocked: badge.isUnlocked || willUnlock,
        };
      })
    );
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
    if (nextMuted) {
      speechEngine.stopSpeaking();
      showToast('Speech audio and sound effects muted', 'info');
    } else {
      showToast('Sound and speech enabled', 'success');
      soundEngine.playReminderChime();
    }
  };

  // Toggle Pause App
  const handleTogglePauseApp = () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    if (nextPaused) {
      speechEngine.stopSpeaking();
      soundEngine.playTick();
      showToast('Pause Mode Active: Spoken audio reminders temporarily silenced.', 'info');
      speechEngine.speak('App paused. Spoken audio reminders are silenced so you can rest.', {
        voiceName: voiceSettings.taskVoice,
      });
    } else {
      soundEngine.playSuccessDing();
      showToast('Pause Mode Resumed: Spoken reminders and audio alarms active.', 'success');
      speechEngine.speak('App resumed. Voice reminders and audio alarms are active.', {
        voiceName: voiceSettings.taskVoice,
      });
    }
  };

  // Senior Mode Toggle
  const handleToggleSeniorMode = () => {
    const updated = !voiceSettings.seniorMode;
    setVoiceSettings({ ...voiceSettings, seniorMode: updated });
    soundEngine.playSuccessDing();
    speechEngine.speak(
      updated ? 'Senior Friendly High Legibility Mode Enabled.' : 'Standard Display Mode Enabled.',
      { voiceName: voiceSettings.taskVoice }
    );
  };

  // Tasks actions with Gamification Points
  const handleToggleTask = (id: string) => {
    let completedNow = false;
    let taskTitle = '';

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          completedNow = !t.completed;
          taskTitle = t.title;
          return { ...t, completed: !t.completed };
        }
        return t;
      })
    );

    if (completedNow) {
      soundEngine.playSuccessDing();
      awardPoints(25, 'Task Completed on Schedule');
      const newTasksCount = gamification.tasksCompletedOnTime + 1;
      setGamification((prev) => ({
        ...prev,
        tasksCompletedOnTime: newTasksCount,
      }));
      checkBadgeMilestones(
        newTasksCount,
        gamification.medsTakenOnTime,
        gamification.checkInsSent
      );

      if (voiceSettings.autoSpeakReminders) {
        speechEngine.speak(`Great job! Completed: ${taskTitle}. +25 points earned!`, {
          voiceName: voiceSettings.taskVoice,
        });
      }
    }
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task removed from schedule', 'info');
  };

  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [...prev, task]);
    showToast(`Added: ${task.title}`, 'success');
  };

  // Medication actions with Gamification Points
  const handleToggleMedicationTaken = (medId: string, time: string) => {
    let isTakenNow = false;
    let medName = '';

    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === medId) {
          isTakenNow = !m.takenToday[time];
          medName = m.name;
          return {
            ...m,
            takenToday: {
              ...m.takenToday,
              [time]: !m.takenToday[time],
            },
          };
        }
        return m;
      })
    );

    if (isTakenNow) {
      soundEngine.playSuccessDing();
      awardPoints(15, 'Medication Taken on Time');
      const newMedsCount = gamification.medsTakenOnTime + 1;
      setGamification((prev) => ({
        ...prev,
        medsTakenOnTime: newMedsCount,
      }));
      checkBadgeMilestones(
        gamification.tasksCompletedOnTime,
        newMedsCount,
        gamification.checkInsSent
      );

      if (voiceSettings.autoSpeakReminders) {
        speechEngine.speak(`Marked ${medName} taken. +15 points earned!`, {
          voiceName: voiceSettings.medicationVoice,
        });
      }
    }
  };

  const handleAddMedication = (newMed: Omit<Medication, 'id'>) => {
    const med: Medication = {
      ...newMed,
      id: `med-${Date.now()}`,
    };
    setMedications((prev) => [...prev, med]);
    showToast(`Added medication: ${med.name}`, 'success');
  };

  // Appointment actions
  const handleAddAppointment = (newApt: Omit<Appointment, 'id'>) => {
    const apt: Appointment = {
      ...newApt,
      id: `apt-${Date.now()}`,
    };
    setAppointments((prev) => [...prev, apt]);
    showToast(`Added appointment with ${apt.doctorName}`, 'success');
  };

  // Urgent Alerts actions
  const handleResolveUrgentAlert = (id: string) => {
    setUrgentAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: !a.resolved } : a))
    );
    soundEngine.playSuccessDing();
    showToast('Urgent call status updated', 'success');
  };

  const handleAddUrgentAlert = (alertData: Omit<UrgentCallAlert, 'id'>) => {
    const newAlert: UrgentCallAlert = {
      ...alertData,
      id: `call-${Date.now()}`,
    };
    setUrgentAlerts((prev) => [newAlert, ...prev]);
    showToast(`Urgent call from ${newAlert.callerName}`, 'alert');
  };

  // Family Check-in actions with Gamification Points
  const handleSendCheckIn = (
    senderId: string,
    senderName: string,
    relationship: string,
    messageType: 'im_okay' | 'thinking_of_you' | 'meds_taken' | 'walk_done',
    messageText: string,
    avatarBg: string
  ) => {
    const newCheckIn: FamilyCheckIn = {
      id: `checkin-${Date.now()}`,
      senderId,
      senderName,
      relationship,
      avatarBg,
      messageType,
      messageText,
      timestamp: 'Just now',
      read: false,
    };
    setCheckIns((prev) => [newCheckIn, ...prev]);
    awardPoints(10, 'Family Check-in Sent');
    const newCheckInsCount = gamification.checkInsSent + 1;
    setGamification((prev) => ({
      ...prev,
      checkInsSent: newCheckInsCount,
    }));
    checkBadgeMilestones(
      gamification.tasksCompletedOnTime,
      gamification.medsTakenOnTime,
      newCheckInsCount
    );
  };

  const handleQuickReplyCheckIn = (id: string, replyText: string) => {
    setCheckIns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, quickReply: replyText, read: true } : c))
    );
    soundEngine.playSuccessDing();
    awardPoints(10, 'Family Check-in Reply');
    showToast(`Reply sent to family: "${replyText}" (+10 pts)`, 'success');
    speechEngine.speak(`Sent reply: ${replyText}`, {
      voiceName: voiceSettings.taskVoice || 'Zephyr',
    });
  };

  const handleDismissCheckInBanner = (id: string) => {
    setCheckIns((prev) => prev.map((c) => (c.id === id ? { ...c, read: true } : c)));
  };

  // Contacts actions
  const handleAddContact = (newContact: Omit<EmergencyContact, 'id'>) => {
    const contact: EmergencyContact = {
      ...newContact,
      id: `contact-${Date.now()}`,
    };
    setContacts((prev) => [...prev, contact]);
    showToast(`Added emergency contact: ${contact.name}`, 'success');
  };

  // Voice command execution handler
  const handleVoiceCommandResult = (result: {
    action: string;
    data: any;
    spokenResponse: string;
  }) => {
    const { action, data } = result;

    if (action === 'TRIGGER_SOS') {
      setIsVoiceOpen(false);
      setIsSOSOpen(true);
    } else if (action === 'ADD_TASK') {
      const title = data?.title || 'Daily Task';
      const time = data?.time || '15:00';
      handleAddTask({
        title,
        time,
        date: new Date().toISOString().split('T')[0],
        completed: false,
        priority: 'normal',
        category: 'general',
        notes: data?.notes,
      });
      setActiveTab('timeline');
    } else if (action === 'ADD_MEDICATION') {
      const name = data?.title || data?.name || 'Prescription';
      const dosage = data?.dosage || '1 dose';
      const time = data?.time || '09:00';
      handleAddMedication({
        name,
        dosage,
        instructions: data?.notes || 'Take as directed.',
        scheduledTimes: [time],
        takenToday: { [time]: false },
        streakDays: 1,
        pillColor: 'teal',
        pillShape: 'capsule',
        refillDaysRemaining: 30,
      });
      setActiveTab('medications');
    } else if (action === 'ADD_APPOINTMENT') {
      const doc = data?.title || data?.doctorName || 'Doctor Visit';
      const time = data?.time || '11:00';
      handleAddAppointment({
        doctorName: doc,
        specialty: 'Clinical Consultation',
        clinicName: 'Medical Group',
        address: 'Clinic Office',
        phone: '(555) 234-5678',
        date: new Date().toISOString().split('T')[0],
        time,
        notes: data?.notes || 'Scheduled via Pause voice assistant.',
        travelBufferMins: 20,
      });
      setActiveTab('appointments');
    } else if (action === 'QUERY_SCHEDULE') {
      setActiveTab('timeline');
    } else if (action === 'SIMULATE_URGENT_CALL') {
      handleAddUrgentAlert({
        callerName: 'Dr. Evelyn Evans (Cardiology)',
        callerTitle: 'Primary Specialist',
        callerNumber: '(555) 234-5678',
        urgencyLevel: 'high',
        timestamp: 'Just now',
        messageSummary: 'Urgent clinic message: Lab test review required before 2:45 PM.',
        voicemailTranscript:
          '"Hello Ashley, please give our nurse station a call back regarding your 2:45 appointment vitals."',
        resolved: false,
        actionRequired: 'Call clinic back to confirm arrival',
      });
      setActiveTab('urgent');
    }
  };

  const activeUrgentAlerts = urgentAlerts.filter((a) => !a.resolved);
  const unreadCheckIns = checkIns.filter((c) => !c.read);
  const primaryUnreadCheckIn = unreadCheckIns[0] || null;

  return (
    <div
      className={`min-h-screen bg-slate-100/70 text-slate-900 transition-all ${
        voiceSettings.seniorMode ? 'text-lg select-text font-sans' : 'text-base font-sans'
      }`}
    >
      {/* Top Application Header ("Pause") */}
      <Header
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        voiceSettings={voiceSettings}
        onUpdateVoiceSettings={setVoiceSettings}
        onToggleSeniorMode={handleToggleSeniorMode}
        onToggleMute={handleToggleMute}
        isMuted={isMuted}
        isPaused={isPaused}
        onTogglePauseApp={handleTogglePauseApp}
        urgentCount={activeUrgentAlerts.length}
        unreadCheckInCount={unreadCheckIns.length}
        onOpenUrgentCalls={() => setActiveTab('urgent')}
        onOpenCheckIns={() => setActiveTab('checkins')}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Prominent Streak & Gamification Counter Banner */}
        <StreakGamificationBanner
          gamification={gamification}
          badges={badges}
          onOpenBadgesModal={() => setIsBadgesModalOpen(true)}
          voiceSettings={voiceSettings}
        />

        {/* Family Check-in Non-Intrusive Notification Banner */}
        <FamilyCheckInBanner
          checkIn={primaryUnreadCheckIn}
          onDismiss={handleDismissCheckInBanner}
          onQuickReply={handleQuickReplyCheckIn}
          voiceSettings={voiceSettings}
        />

        {/* Urgent Call Top Banner (Always visible when there is an active priority alert) */}
        <UrgentCallBanner
          urgentAlerts={urgentAlerts}
          onResolveAlert={handleResolveUrgentAlert}
          onOpenDetails={() => setActiveTab('urgent')}
          onSimulateUrgentCall={() => {
            handleAddUrgentAlert({
              callerName: 'Dr. Evelyn Evans (Cardiology)',
              callerTitle: 'Primary Specialist',
              callerNumber: '(555) 234-5678',
              urgencyLevel: 'high',
              timestamp: 'Just now',
              messageSummary: 'Urgent clinic message: Lab test review required before 2:45 PM.',
              voicemailTranscript:
                '"Hello Ashley, please give our nurse station a call back regarding your 2:45 appointment vitals."',
              resolved: false,
              actionRequired: 'Call clinic back to confirm arrival',
            });
            setActiveTab('urgent');
          }}
          voiceSettings={voiceSettings}
        />

        {/* Navigation Tabs Bar */}
        <nav className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto">
          {[
            {
              id: 'timeline',
              label: 'Daily Timeline & Tasks',
              icon: Clock,
              badge: tasks.filter((t) => !t.completed).length,
              badgeColor: 'bg-teal-100 text-teal-800',
            },
            {
              id: 'medications',
              label: 'Medications & Prescriptions',
              icon: Pill,
              badge: medications.reduce(
                (sum, m) => sum + m.scheduledTimes.filter((t) => !m.takenToday[t]).length,
                0
              ),
              badgeColor: 'bg-rose-100 text-rose-800',
            },
            {
              id: 'appointments',
              label: 'Doctor Appointments',
              icon: Calendar,
              badge: appointments.length,
              badgeColor: 'bg-indigo-100 text-indigo-800',
            },
            {
              id: 'sounds',
              label: 'Sounds & AI Voices',
              icon: Music,
            },
            {
              id: 'checkins',
              label: 'Family Check-in',
              icon: Heart,
              badge: unreadCheckIns.length,
              badgeColor: 'bg-rose-500 text-white',
            },
            {
              id: 'urgent',
              label: 'Urgent Calls & Voicemail',
              icon: PhoneCall,
              badge: activeUrgentAlerts.length,
              badgeColor: 'bg-amber-500 text-white animate-pulse',
            },
            {
              id: 'contacts',
              label: 'Family SOS & Medical ID',
              icon: Users,
              badge: contacts.length,
              badgeColor: 'bg-slate-100 text-slate-700',
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                } ${voiceSettings.seniorMode ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'}`}
              >
                <Icon
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-slate-500'}`}
                />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-black shrink-0 ${
                      isActive ? 'bg-white text-teal-800' : tab.badgeColor
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab Views */}
        <section>
          {activeTab === 'timeline' && (
            <TimelineSchedule
              tasks={tasks}
              medications={medications}
              appointments={appointments}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onAddTask={handleAddTask}
              voiceSettings={voiceSettings}
            />
          )}

          {activeTab === 'medications' && (
            <MedicationsView
              medications={medications}
              onToggleMedicationTaken={handleToggleMedicationTaken}
              onAddMedication={handleAddMedication}
              voiceSettings={voiceSettings}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsView
              appointments={appointments}
              onAddAppointment={handleAddAppointment}
              voiceSettings={voiceSettings}
            />
          )}

          {activeTab === 'sounds' && (
            <SoundVoiceCustomizerView
              settings={voiceSettings}
              onUpdateSettings={setVoiceSettings}
              onOpenAccessibilityModal={() => setIsSettingsOpen(true)}
            />
          )}

          {activeTab === 'checkins' && (
            <FamilyCheckInView
              checkIns={checkIns}
              contacts={contacts}
              onSendCheckIn={handleSendCheckIn}
              onQuickReply={handleQuickReplyCheckIn}
              voiceSettings={voiceSettings}
            />
          )}

          {activeTab === 'urgent' && (
            <UrgentCallManager
              urgentAlerts={urgentAlerts}
              onResolveAlert={handleResolveUrgentAlert}
              onAddUrgentAlert={handleAddUrgentAlert}
              voiceSettings={voiceSettings}
            />
          )}

          {activeTab === 'contacts' && (
            <EmergencyContactsManager
              contacts={contacts}
              medicalProfile={medicalProfile}
              onAddContact={handleAddContact}
              onUpdateMedicalProfile={setMedicalProfile}
              voiceSettings={voiceSettings}
            />
          )}
        </section>
      </main>

      {/* Persistent Floating Emergency SOS & Voice Bar */}
      <aside aria-label="Quick Access Voice and SOS" className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
        {/* Floating Voice Trigger */}
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="flex items-center gap-2 p-3 sm:px-4 sm:py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-xl shadow-teal-600/35 border-2 border-white transition-transform active:scale-90"
          title="Speak to Pause Voice Assistant"
        >
          <Mic className="w-6 h-6 animate-pulse" />
          <span className="hidden sm:inline">Voice Assistant</span>
        </button>

        {/* Floating SOS Trigger */}
        <button
          onClick={() => setIsSOSOpen(true)}
          className="flex items-center gap-2 p-3 sm:px-4 sm:py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black shadow-xl shadow-rose-600/40 border-2 border-white transition-transform active:scale-90 ring-4 ring-rose-300/60"
          title="Emergency Family SOS"
        >
          <AlertTriangle className="w-6 h-6 animate-bounce" />
          <span className="hidden sm:inline">SOS HELP</span>
        </button>
      </aside>

      {/* Floating In-App Toast Alert */}
      {activeToast && (
        <div
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-bold text-sm sm:text-base flex items-center gap-3 border animate-bounce ${
            activeToast.type === 'alert'
              ? 'bg-rose-600 border-rose-300'
              : activeToast.type === 'success'
              ? 'bg-emerald-600 border-emerald-300'
              : 'bg-slate-900 border-slate-700'
          }`}
        >
          {activeToast.type === 'alert' ? (
            <AlertTriangle className="w-5 h-5 text-amber-200" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          )}
          <span>{activeToast.message}</span>
        </div>
      )}

      {/* Modals */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onVoiceCommandResult={handleVoiceCommandResult}
        voiceSettings={voiceSettings}
        contextData={{
          pendingTasks: tasks.filter((t) => !t.completed).map((t) => `${t.title} at ${t.time}`),
          medications: medications.map((m) => `${m.name} ${m.dosage}`),
          appointments: appointments.map((a) => `${a.doctorName} on ${a.date} at ${a.time}`),
        }}
      />

      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        contacts={contacts}
        medicalProfile={medicalProfile}
      />

      <MilestoneBadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        badges={badges}
        gamification={gamification}
        voiceSettings={voiceSettings}
      />

      <AccessibilitySettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={voiceSettings}
        onUpdateSettings={setVoiceSettings}
      />
    </div>
  );
}
