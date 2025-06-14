import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Plus, 
  MessageCircle, 
  Users, 
  Shield,
  Phone 
} from 'lucide-react-native';
import CaregiverCard from '@/components/CaregiverCard';
import AddCaregiverModal from '@/components/AddCaregiverModal';
import { Caregiver } from '@/types/medication';
import { getCaregivers, saveCaregivers } from '@/utils/storage';
import { getCaregiversFromSupabase, saveCaregiversToSupabase } from '@/utils/supabaseStorage';
import { mockCaregivers } from '@/utils/mockData';

export default function CaregiversScreen() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadCaregivers();
  }, []);

  const loadCaregivers = async () => {
    try {
      // Try to load from Supabase first
      let storedCaregivers = await getCaregiversFromSupabase();
      
      if (storedCaregivers.length === 0) {
        // Fallback to local storage
        storedCaregivers = await getCaregivers();
        
        if (storedCaregivers.length === 0) {
          // Use mock data as last resort
          storedCaregivers = mockCaregivers;
          await saveCaregivers(storedCaregivers);
          await saveCaregiversToSupabase(storedCaregivers);
        }
      }
      
      setCaregivers(storedCaregivers);
    } catch (error) {
      console.error('Error loading caregivers:', error);
      Alert.alert('Error', 'Failed to load caregivers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCaregivers();
    setRefreshing(false);
  };

  const handleAddCaregiver = async (caregiverData: Omit<Caregiver, 'id'>) => {
    try {
      const newCaregiver: Caregiver = {
        ...caregiverData,
        id: Date.now().toString(),
      };

      const updatedCaregivers = [...caregivers, newCaregiver];
      setCaregivers(updatedCaregivers);
      
      // Save to both local and cloud storage
      await saveCaregivers(updatedCaregivers);
      await saveCaregiversToSupabase(updatedCaregivers);
      
      setShowAddModal(false);
      Alert.alert('Success', 'Caregiver added successfully');
    } catch (error) {
      console.error('Error adding caregiver:', error);
      Alert.alert('Error', 'Failed to add caregiver');
    }
  };

  const handleCall = async (phone: string, name: string) => {
    try {
      const phoneUrl = `tel:${phone}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Unable to make phone calls on this device');
      }
    } catch (error) {
      console.error('Error making call:', error);
      Alert.alert('Call', `Would call ${name} at ${phone}`);
    }
  };

  const handleMessage = (caregiver: Caregiver) => {
    Alert.alert(
      'Message',
      `Would open messaging with ${caregiver.name}`,
      [{ text: 'OK' }]
    );
  };

  const getActiveCaregiversCount = () => {
    return caregivers.filter(caregiver => caregiver.isActive).length;
  };

  const getPrimaryCaregivers = () => {
    return caregivers.filter(caregiver => caregiver.role === 'primary');
  };

  const getMedicalProfessionals = () => {
    return caregivers.filter(caregiver => caregiver.role === 'medical');
  };

  const getSecondaryCaregivers = () => {
    return caregivers.filter(caregiver => caregiver.role === 'secondary');
  };

  const activeCaregivers = getActiveCaregiversCount();
  const primaryCaregivers = getPrimaryCaregivers();
  const medicalProfessionals = getMedicalProfessionals();
  const secondaryCaregivers = getSecondaryCaregivers();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading caregivers...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Care Network</Text>
            <Text style={styles.title}>Your Support Team</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Add new caregiver"
          >
            <Plus size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Users size={20} color="#2563eb" />
            </View>
            <Text style={styles.statValue}>{caregivers.length}</Text>
            <Text style={styles.statLabel}>Total Caregivers</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Shield size={20} color="#16a34a" />
            </View>
            <Text style={styles.statValue}>{activeCaregivers}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Phone size={20} color="#ea580c" />
            </View>
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>Emergency</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Contact</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickActionButton, styles.emergencyButton]}
              onPress={() => handleCall('112', 'Emergency Services')}
              accessibilityRole="button"
              accessibilityLabel="Call emergency services"
            >
              <Phone size={24} color="#ffffff" />
              <Text style={[styles.quickActionText, { color: '#ffffff' }]}>Emergency</Text>
            </TouchableOpacity>
            
            {primaryCaregivers.length > 0 && (
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => handleCall(primaryCaregivers[0].phone, primaryCaregivers[0].name)}
                accessibilityRole="button"
                accessibilityLabel="Call primary caregiver"
              >
                <Users size={24} color="#2563eb" />
                <Text style={styles.quickActionText}>Primary</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.quickActionButton}
              accessibilityRole="button"
              accessibilityLabel="Send group message"
            >
              <MessageCircle size={24} color="#16a34a" />
              <Text style={styles.quickActionText}>Group Chat</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Primary Caregivers */}
        {primaryCaregivers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Primary Caregivers</Text>
            {primaryCaregivers.map((caregiver) => (
              <CaregiverCard
                key={caregiver.id}
                caregiver={caregiver}
                onCall={() => handleCall(caregiver.phone, caregiver.name)}
                onMessage={() => handleMessage(caregiver)}
              />
            ))}
          </View>
        )}

        {/* Medical Professionals */}
        {medicalProfessionals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Professionals</Text>
            {medicalProfessionals.map((caregiver) => (
              <CaregiverCard
                key={caregiver.id}
                caregiver={caregiver}
                onCall={() => handleCall(caregiver.phone, caregiver.name)}
                onMessage={() => handleMessage(caregiver)}
              />
            ))}
          </View>
        )}

        {/* Secondary Caregivers */}
        {secondaryCaregivers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Secondary Caregivers</Text>
            {secondaryCaregivers.map((caregiver) => (
              <CaregiverCard
                key={caregiver.id}
                caregiver={caregiver}
                onCall={() => handleCall(caregiver.phone, caregiver.name)}
                onMessage={() => handleMessage(caregiver)}
              />
            ))}
          </View>
        )}

        {/* Care Coordination */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Care Coordination</Text>
          <View style={styles.coordinationCard}>
            <View style={styles.coordinationHeader}>
              <MessageCircle size={20} color="#2563eb" />
              <Text style={styles.coordinationTitle}>Recent Activity</Text>
            </View>
            <View style={styles.coordinationActivity}>
              <View style={styles.activityItem}>
                <View style={styles.activityDot} />
                <Text style={styles.activityText}>
                  Dr. Rajesh reviewed your medication schedule - 2h ago
                </Text>
              </View>
              <View style={styles.activityItem}>
                <View style={styles.activityDot} />
                <Text style={styles.activityText}>
                  Priya checked your vital signs update - 4h ago
                </Text>
              </View>
              <View style={styles.activityItem}>
                <View style={styles.activityDot} />
                <Text style={styles.activityText}>
                  Amit sent a message about appointment - 1d ago
                </Text>
              </View>
            </View>
          </View>
        </View>

        {caregivers.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No caregivers added yet</Text>
            <Text style={styles.emptyText}>
              Build your care network by adding family members, friends, and medical professionals
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Add your first caregiver"
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.emptyButtonText}>Add Caregiver</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <AddCaregiverModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddCaregiver}
      />
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
  addButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    textAlign: 'center',
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
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emergencyButton: {
    backgroundColor: '#dc2626',
    borderColor: '#dc2626',
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  coordinationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  coordinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coordinationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  coordinationActivity: {
    paddingLeft: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
    marginTop: 6,
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 8,
  },
});