export type Priority = 'high' | 'medium' | 'normal';

export type TaskCategory = 'health' | 'chores' | 'family' | 'work' | 'errands' | 'general';

export type ToneId =
  | 'gentle_harmony'
  | 'celestial_chime'
  | 'modern_pulse'
  | 'classic_bell'
  | 'urgent_staccato';

export type VoiceId = 'Kore' | 'Fenrir' | 'Zephyr';

export interface SoundToneOption {
  id: ToneId;
  name: string;
  description: string;
  category: 'Calming' | 'Melodic' | 'Crisp' | 'Classic' | 'Alert';
}

export interface VoiceOption {
  id: VoiceId;
  name: string;
  character: string;
  accent: string;
  recommendedFor: string;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  time: string; // HH:mm format, e.g. "09:30"
  date: string; // YYYY-MM-DD
  completed: boolean;
  priority: Priority;
  notes?: string;
  recurring?: 'daily' | 'weekdays' | 'once';
  alerted?: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions: string; // e.g. "Take with food and full glass of water"
  scheduledTimes: string[]; // ["08:00", "20:00"]
  takenToday: Record<string, boolean>; // e.g. { "08:00": true, "20:00": false }
  streakDays: number;
  pillColor: string; // e.g. "rose", "emerald", "amber", "blue", "purple"
  pillShape: 'round' | 'capsule' | 'oval';
  refillDaysRemaining: number;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  address: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes: string;
  travelBufferMins: number;
  alerted?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  isVip: boolean;
  avatarBg: string;
}

export interface MedicalProfile {
  fullName: string;
  birthDate: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  primaryDoctor: string;
  doctorPhone: string;
  homeAddress: string;
  emergencyNotes: string;
}

export interface UrgentCallAlert {
  id: string;
  callerName: string;
  callerTitle: string; // e.g. "Primary Care Physician" or "Daughter"
  callerNumber: string;
  urgencyLevel: 'critical' | 'high' | 'moderate';
  timestamp: string;
  messageSummary: string;
  voicemailTranscript?: string;
  resolved: boolean;
  actionRequired: string;
}

export interface FamilyCheckIn {
  id: string;
  senderId: string;
  senderName: string;
  relationship: string;
  avatarBg: string;
  messageType: 'im_okay' | 'thinking_of_you' | 'meds_taken' | 'walk_done';
  messageText: string;
  timestamp: string;
  read: boolean;
  quickReply?: string | null;
}

export interface MilestoneBadge {
  id: string;
  name: string;
  description: string;
  badgeLevel: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  category: 'streak' | 'punctuality' | 'medication' | 'family' | 'mastery';
  targetCount: number;
  currentCount: number;
  isUnlocked: boolean;
  pointsReward: number;
}

export interface GamificationState {
  totalPoints: number;
  currentStreakDays: number;
  bestStreakDays: number;
  tasksCompletedOnTime: number;
  medsTakenOnTime: number;
  checkInsSent: number;
  unlockedBadgeIds: string[];
}

export interface VoiceSettings {
  seniorMode: boolean;
  speechRate: number; // 0.7 to 1.3
  speechPitch: number; // 0.8 to 1.2
  autoSpeakReminders: boolean;
  soundEffectsEnabled: boolean;
  continuousListening: boolean;
  preferredVoice?: string;
  // Custom sound tone and AI voice assignments:
  taskSound: ToneId;
  taskVoice: VoiceId;
  medicationSound: ToneId;
  medicationVoice: VoiceId;
  urgentSound: ToneId;
  urgentVoice: VoiceId;
}
