import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  Switch 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, CreditCard as Edit, Shield, Heart, Phone, Mail, Calendar, FileText, Settings, Bell, Accessibility, Volume2, Eye, Languages, LogOut } from 'lucide-react-native';
import { UserProfile } from '@/types/medication';
import { getUserProfile, saveUserProfile } from '@/utils/storage';
import { getUserProfileFromSupabase, saveUserProfileToSupabase } from '@/utils/supabaseStorage';
import { mockUserProfile } from '@/utils/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserProfile | null>(null);
  const { signOut, user } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Try to load from Supabase first
      let userProfile = await getUserProfileFromSupabase();
      
      if (!userProfile) {
        // Fallback to local storage
        userProfile = await getUserProfile();
        
        if (!userProfile) {
          // Use mock data as last resort
          userProfile = {
            ...mockUserProfile,
            email: user?.email || mockUserProfile.email,
            name: user?.user_metadata?.full_name || mockUserProfile.name,
          };
          await saveUserProfile(userProfile);
          await saveUserProfileToSupabase(userProfile);
        }
      }
      
      setProfile(userProfile);
      setEditForm(userProfile);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm) return;
    
    try {
      await saveUserProfile(editForm);
      await saveUserProfileToSupabase(editForm);
      setProfile(editForm);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', 'Failed to sign out');
            } else {
              router.replace('/(auth)/sign-in');
            }
          },
        },
      ]
    );
  };

  const handlePreferenceChange = (key: keyof UserProfile['preferences'], value: boolean) => {
    if (!editForm) return;
    
    setEditForm({
      ...editForm,
      preferences: {
        ...editForm.preferences,
        [key]: value
      }
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Profile</Text>
            <Text style={styles.title}>Your Information</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => editing ? handleSaveProfile() : setEditing(!editing)}
              accessibilityRole="button"
              accessibilityLabel={editing ? 'Save profile' : 'Edit profile'}
            >
              {editing ? (
                <Text style={styles.saveButtonText}>Save</Text>
              ) : (
                <Edit size={24} color="#2563eb" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
              accessibilityRole="button"
              accessibilityLabel="Sign out"
            >
              <LogOut size={24} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Picture & Basic Info */}
        <View style={styles.section}>
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <User size={48} color="#6b7280" />
            </View>
            <View style={styles.profileInfo}>
              {editing ? (
                <TextInput
                  style={styles.input}
                  value={editForm?.name}
                  onChangeText={(text) => setEditForm(prev => prev ? {...prev, name: text} : null)}
                  placeholder="Full Name"
                  accessibilityLabel="Full name input"
                />
              ) : (
                <Text style={styles.profileName}>{profile.name}</Text>
              )}
              <Text style={styles.profileAge}>
                Age {calculateAge(profile.dateOfBirth)} • {profile.bloodType}
              </Text>
              <View style={styles.profileContact}>
                <Mail size={16} color="#6b7280" />
                <Text style={styles.contactText}>{profile.email}</Text>
              </View>
              <View style={styles.profileContact}>
                <Phone size={16} color="#6b7280" />
                <Text style={styles.contactText}>{profile.phone}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Medical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>
          
          <View style={styles.medicalCard}>
            <View style={styles.medicalHeader}>
              <Heart size={20} color="#dc2626" />
              <Text style={styles.medicalTitle}>Health Summary</Text>
            </View>
            
            <View style={styles.medicalGrid}>
              <View style={styles.medicalItem}>
                <Text style={styles.medicalLabel}>Blood Type</Text>
                <Text style={styles.medicalValue}>{profile.bloodType}</Text>
              </View>
              
              <View style={styles.medicalItem}>
                <Text style={styles.medicalLabel}>Date of Birth</Text>
                <Text style={styles.medicalValue}>
                  {new Date(profile.dateOfBirth).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.medicalCategory}>
              <Text style={styles.categoryTitle}>Medical Conditions</Text>
              <View style={styles.tagContainer}>
                {profile.medicalConditions.map((condition, index) => (
                  <View key={index} style={[styles.tag, styles.conditionTag]}>
                    <Text style={styles.tagText}>{condition}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.medicalCategory}>
              <Text style={styles.categoryTitle}>Allergies</Text>
              <View style={styles.tagContainer}>
                {profile.allergies.map((allergy, index) => (
                  <View key={index} style={[styles.tag, styles.allergyTag]}>
                    <Text style={[styles.tagText, { color: '#dc2626' }]}>{allergy}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          {profile.emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              {contact.isPrimary && (
                <View style={styles.primaryBadge}>
                  <Shield size={12} color="#ffffff" />
                  <Text style={styles.primaryText}>Primary</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Insurance Information */}
        {profile.insuranceInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insurance Information</Text>
            <View style={styles.insuranceCard}>
              <View style={styles.insuranceHeader}>
                <Shield size={20} color="#16a34a" />
                <Text style={styles.insuranceTitle}>{profile.insuranceInfo.provider}</Text>
              </View>
              <View style={styles.insuranceDetails}>
                <View style={styles.insuranceItem}>
                  <Text style={styles.insuranceLabel}>Policy Number</Text>
                  <Text style={styles.insuranceValue}>{profile.insuranceInfo.policyNumber}</Text>
                </View>
                <View style={styles.insuranceItem}>
                  <Text style={styles.insuranceLabel}>Group Number</Text>
                  <Text style={styles.insuranceValue}>{profile.insuranceInfo.groupNumber}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          <View style={styles.preferencesCard}>
            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Bell size={20} color="#2563eb" />
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Notifications</Text>
                  <Text style={styles.preferenceDescription}>
                    Receive medication reminders and health alerts
                  </Text>
                </View>
              </View>
              <Switch
                value={editing ? editForm?.preferences.notifications : profile.preferences.notifications}
                onValueChange={(value) => editing && handlePreferenceChange('notifications', value)}
                disabled={!editing}
                trackColor={{ false: '#e5e7eb', true: '#bfdbfe' }}
                thumbColor={profile.preferences.notifications ? '#2563eb' : '#6b7280'}
              />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Volume2 size={20} color="#2563eb" />
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Reminder Sound</Text>
                  <Text style={styles.preferenceDescription}>
                    Current: {profile.preferences.reminderSound}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => Alert.alert('Coming Soon', 'Sound selection will be available in a future update')}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <Shield size={20} color="#2563eb" />
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Emergency Location</Text>
                  <Text style={styles.preferenceDescription}>
                    Share location during emergencies
                  </Text>
                </View>
              </View>
              <Switch
                value={editing ? editForm?.preferences.emergencyLocation : profile.preferences.emergencyLocation}
                onValueChange={(value) => editing && handlePreferenceChange('emergencyLocation', value)}
                disabled={!editing}
                trackColor={{ false: '#e5e7eb', true: '#bfdbfe' }}
                thumbColor={profile.preferences.emergencyLocation ? '#2563eb' : '#6b7280'}
              />
            </View>

            <View style={styles.preferenceItem}>
              <View style={styles.preferenceInfo}>
                <FileText size={20} color="#2563eb" />
                <View style={styles.preferenceText}>
                  <Text style={styles.preferenceTitle}>Data Sharing</Text>
                  <Text style={styles.preferenceDescription}>
                    Share health data with caregivers
                  </Text>
                </View>
              </View>
              <Switch
                value={editing ? editForm?.preferences.dataSharing : profile.preferences.dataSharing}
                onValueChange={(value) => editing && handlePreferenceChange('dataSharing', value)}
                disabled={!editing}
                trackColor={{ false: '#e5e7eb', true: '#bfdbfe' }}
                thumbColor={profile.preferences.dataSharing ? '#2563eb' : '#6b7280'}
              />
            </View>
          </View>
        </View>

        {/* Accessibility Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          
          <View style={styles.accessibilityCard}>
            <TouchableOpacity style={styles.accessibilityItem}>
              <Accessibility size={20} color="#2563eb" />
              <Text style={styles.accessibilityText}>Voice Commands</Text>
              <Text style={styles.accessibilityStatus}>Enabled</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.accessibilityItem}>
              <Eye size={20} color="#2563eb" />
              <Text style={styles.accessibilityText}>High Contrast Mode</Text>
              <Text style={styles.accessibilityStatus}>Auto</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.accessibilityItem}>
              <Languages size={20} color="#2563eb" />
              <Text style={styles.accessibilityText}>Language</Text>
              <Text style={styles.accessibilityStatus}>English</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingsItem}>
              <Settings size={20} color="#6b7280" />
              <Text style={styles.settingsText}>App Settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <Shield size={20} color="#6b7280" />
              <Text style={styles.settingsText}>Privacy & Security</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.settingsItem}>
              <FileText size={20} color="#6b7280" />
              <Text style={styles.settingsText}>Terms & Conditions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.section}>
          <View style={styles.versionCard}>
            <Text style={styles.versionText}>MedAlert Healthcare Companion</Text>
            <Text style={styles.versionNumber}>Version 1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#dc2626',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  signOutButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#2563eb',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  profileAge: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginBottom: 8,
  },
  profileContact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 8,
  },
  input: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#2563eb',
    paddingBottom: 4,
    marginBottom: 4,
  },
  medicalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  medicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  medicalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  medicalGrid: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  medicalItem: {
    flex: 1,
    marginRight: 16,
  },
  medicalLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginBottom: 4,
  },
  medicalValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  medicalCategory: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  conditionTag: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  allergyTag: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2563eb',
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  contactRelationship: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 2,
  },
  insuranceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  insuranceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insuranceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  insuranceDetails: {
    paddingLeft: 28,
  },
  insuranceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  insuranceLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  insuranceValue: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  preferencesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  preferenceInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    marginLeft: 12,
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  changeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
  },
  changeButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  accessibilityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  accessibilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  accessibilityText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginLeft: 12,
  },
  accessibilityStatus: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  settingsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingsText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginLeft: 12,
  },
  versionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  versionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  versionNumber: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
});