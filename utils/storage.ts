import AsyncStorage from '@react-native-async-storage/async-storage';
import { Medication, MedicationLog, VitalSigns, Caregiver, UserProfile } from '@/types/medication';

const STORAGE_KEYS = {
  MEDICATIONS: '@medalert_medications',
  MEDICATION_LOGS: '@medalert_medication_logs',
  VITAL_SIGNS: '@medalert_vital_signs',
  CAREGIVERS: '@medalert_caregivers',
  USER_PROFILE: '@medalert_user_profile',
};

// Medications
export const saveMedications = async (medications: Medication[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
  } catch (error) {
    console.error('Error saving medications:', error);
    throw error;
  }
};

export const getMedications = async (): Promise<Medication[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting medications:', error);
    return [];
  }
};

// Medication Logs
export const saveMedicationLogs = async (logs: MedicationLog[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.MEDICATION_LOGS, JSON.stringify(logs));
  } catch (error) {
    console.error('Error saving medication logs:', error);
    throw error;
  }
};

export const getMedicationLogs = async (): Promise<MedicationLog[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MEDICATION_LOGS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting medication logs:', error);
    return [];
  }
};

// Vital Signs
export const saveVitalSigns = async (vitals: VitalSigns[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.VITAL_SIGNS, JSON.stringify(vitals));
  } catch (error) {
    console.error('Error saving vital signs:', error);
    throw error;
  }
};

export const getVitalSigns = async (): Promise<VitalSigns[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.VITAL_SIGNS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting vital signs:', error);
    return [];
  }
};

// Caregivers
export const saveCaregivers = async (caregivers: Caregiver[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CAREGIVERS, JSON.stringify(caregivers));
  } catch (error) {
    console.error('Error saving caregivers:', error);
    throw error;
  }
};

export const getCaregivers = async (): Promise<Caregiver[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CAREGIVERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting caregivers:', error);
    return [];
  }
};

// User Profile
export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (): Promise<UserProfile | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};