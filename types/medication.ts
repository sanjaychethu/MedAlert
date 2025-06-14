export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  instructions: string;
  prescribedBy: string;
  refillReminder: boolean;
  pillsRemaining: number;
  totalPills: number;
  isActive: boolean;
  adherenceRate: number;
  lastTaken?: string;
  missedDoses: number;
  totalDoses: number;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  takenAt: string;
  scheduledTime: string;
  status: 'taken' | 'missed' | 'late';
  notes?: string;
}

export interface VitalSigns {
  id: string;
  timestamp: string;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  bloodGlucose?: number;
  notes?: string;
}

export interface Caregiver {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  role: 'primary' | 'secondary' | 'medical';
  permissions: string[];
  avatar?: string;
  isActive: boolean;
  lastActive?: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
  isEmergencyService: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  medicalConditions: string[];
  allergies: string[];
  bloodType?: string;
  emergencyContacts: EmergencyContact[];
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  preferences: {
    notifications: boolean;
    reminderSound: string;
    emergencyLocation: boolean;
    dataSharing: boolean;
  };
}