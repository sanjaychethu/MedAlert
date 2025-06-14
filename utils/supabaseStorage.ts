import { supabase } from '@/lib/supabase';
import { Medication, VitalSigns, Caregiver, UserProfile } from '@/types/medication';

// Medications
export const saveMedicationsToSupabase = async (medications: Medication[]): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('medications')
    .upsert(
      medications.map(med => ({
        ...med,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }))
    );

  if (error) throw error;
};

export const getMedicationsFromSupabase = async (): Promise<Medication[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Vital Signs
export const saveVitalSignsToSupabase = async (vitals: VitalSigns[]): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('vital_signs')
    .upsert(
      vitals.map(vital => ({
        ...vital,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }))
    );

  if (error) throw error;
};

export const getVitalSignsFromSupabase = async (): Promise<VitalSigns[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('vital_signs')
    .select('*')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false });

  if (error) throw error;
  return data || [];
};

// Caregivers
export const saveCaregiversToSupabase = async (caregivers: Caregiver[]): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('caregivers')
    .upsert(
      caregivers.map(caregiver => ({
        ...caregiver,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      }))
    );

  if (error) throw error;
};

export const getCaregiversFromSupabase = async (): Promise<Caregiver[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('caregivers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

// User Profile
export const saveUserProfileToSupabase = async (profile: UserProfile): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      ...profile,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
};

export const getUserProfileFromSupabase = async (): Promise<UserProfile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  return data || null;
};

// Real-time subscriptions
export const subscribeToMedications = (callback: (medications: Medication[]) => void) => {
  return supabase
    .channel('medications')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'medications' },
      () => {
        getMedicationsFromSupabase().then(callback);
      }
    )
    .subscribe();
};

export const subscribeToVitalSigns = (callback: (vitals: VitalSigns[]) => void) => {
  return supabase
    .channel('vital_signs')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'vital_signs' },
      () => {
        getVitalSignsFromSupabase().then(callback);
      }
    )
    .subscribe();
};