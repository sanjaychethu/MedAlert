import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Plus, 
  Clock, 
  TrendingUp, 
  Bell,
  Search,
  Calendar,
  Target,
  Award
} from 'lucide-react-native';
import MedicationCard from '@/components/MedicationCard';
import AddMedicationModal from '@/components/AddMedicationModal';
import { Medication } from '@/types/medication';
import { getMedications, saveMedications } from '@/utils/storage';
import { getMedicationsFromSupabase, saveMedicationsToSupabase } from '@/utils/supabaseStorage';
import { mockMedications } from '@/utils/mockData';

export default function MedicationsScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      // Try to load from Supabase first
      let storedMedications = await getMedicationsFromSupabase();
      
      if (storedMedications.length === 0) {
        // Fallback to local storage
        storedMedications = await getMedications();
        
        if (storedMedications.length === 0) {
          // Use mock data as last resort
          storedMedications = mockMedications;
          await saveMedications(storedMedications);
          await saveMedicationsToSupabase(storedMedications);
        }
      }
      
      setMedications(storedMedications);
    } catch (error) {
      console.error('Error loading medications:', error);
      Alert.alert('Error', 'Failed to load medications');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMedications();
    setRefreshing(false);
  };

  const handleAddMedication = async (medicationData: Omit<Medication, 'id'>) => {
    try {
      const newMedication: Medication = {
        ...medicationData,
        id: Date.now().toString(),
      };

      const updatedMedications = [...medications, newMedication];
      setMedications(updatedMedications);
      
      // Save to both local and cloud storage
      await saveMedications(updatedMedications);
      await saveMedicationsToSupabase(updatedMedications);
      
      setShowAddModal(false);
      Alert.alert('Success', 'Medication added successfully');
    } catch (error) {
      console.error('Error adding medication:', error);
      Alert.alert('Error', 'Failed to add medication');
    }
  };

  const handleTakeMedication = async (medicationId: string) => {
    try {
      const updatedMedications = medications.map(med => {
        if (med.id === medicationId) {
          const newTotalDoses = med.totalDoses + 1;
          const newAdherenceRate = Math.round(((newTotalDoses - med.missedDoses) / newTotalDoses) * 100);
          
          return {
            ...med,
            lastTaken: new Date().toISOString(),
            totalDoses: newTotalDoses,
            adherenceRate: newAdherenceRate,
            pillsRemaining: Math.max(0, med.pillsRemaining - 1),
          };
        }
        return med;
      });

      setMedications(updatedMedications);
      
      // Save to both local and cloud storage
      await saveMedications(updatedMedications);
      await saveMedicationsToSupabase(updatedMedications);
      
      Alert.alert('Success', 'Medication marked as taken');
    } catch (error) {
      console.error('Error updating medication:', error);
      Alert.alert('Error', 'Failed to update medication');
    }
  };

  const getUpcomingMedications = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinutes;

    return medications.filter(med => {
      return med.times.some(time => {
        const [hour, minute] = time.split(':').map(Number);
        const medicationTime = hour * 60 + minute;
        return medicationTime >= currentTime && medicationTime <= currentTime + 120; // Next 2 hours
      });
    });
  };

  const getTodaysAdherence = () => {
    const totalDoses = medications.reduce((sum, med) => sum + med.times.length, 0);
    const takenDoses = medications.filter(med => {
      const lastTaken = med.lastTaken ? new Date(med.lastTaken) : null;
      const today = new Date();
      return lastTaken && 
             lastTaken.toDateString() === today.toDateString();
    }).length;

    return totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;
  };

  const getWeeklyAdherence = () => {
    const totalWeeklyDoses = medications.reduce((sum, med) => sum + (med.times.length * 7), 0);
    const totalTaken = medications.reduce((sum, med) => sum + (med.totalDoses - med.missedDoses), 0);
    
    return totalWeeklyDoses > 0 ? Math.round((totalTaken / totalWeeklyDoses) * 100) : 100;
  };

  const getLowStockMedications = () => {
    return medications.filter(med => med.pillsRemaining <= 5).length;
  };

  const upcomingMedications = getUpcomingMedications();
  const todaysAdherence = getTodaysAdherence();
  const weeklyAdherence = getWeeklyAdherence();
  const lowStock = getLowStockMedications();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading medications...</Text>
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
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.title}>Your Medications</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            accessibilityRole="button"
            accessibilityLabel="Notifications"
          >
            <Bell size={24} color="#6b7280" />
            {(upcomingMedications.length > 0 || lowStock > 0) && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {upcomingMedications.length + lowStock}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Enhanced Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}>
              <TrendingUp size={20} color="#16a34a" />
            </View>
            <Text style={styles.statValue}>{todaysAdherence}%</Text>
            <Text style={styles.statLabel}>Today's Adherence</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}>
              <Clock size={20} color="#2563eb" />
            </View>
            <Text style={styles.statValue}>{upcomingMedications.length}</Text>
            <Text style={styles.statLabel}>Upcoming</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#fef3c7' }]}>
              <Target size={20} color="#f59e0b" />
            </View>
            <Text style={styles.statValue}>{medications.length}</Text>
            <Text style={styles.statLabel}>Active Meds</Text>
          </View>
        </View>

        {/* Weekly Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Award size={20} color="#2563eb" />
              <Text style={styles.progressTitle}>Adherence Goal</Text>
              <Text style={styles.progressPercentage}>{weeklyAdherence}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${weeklyAdherence}%`,
                    backgroundColor: weeklyAdherence >= 90 ? '#16a34a' : weeklyAdherence >= 75 ? '#f59e0b' : '#dc2626'
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressSubtext}>
              Keep up the great work! You're {weeklyAdherence >= 90 ? 'exceeding' : 'working towards'} your 90% goal.
            </Text>
          </View>
        </View>

        {/* Upcoming Medications */}
        {upcomingMedications.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming (Next 2 Hours)</Text>
              <View style={styles.urgencyBadge}>
                <Clock size={12} color="#ffffff" />
                <Text style={styles.urgencyText}>Soon</Text>
              </View>
            </View>
            {upcomingMedications.map((medication) => (
              <MedicationCard
                key={`upcoming-${medication.id}`}
                medication={medication}
                onTake={() => handleTakeMedication(medication.id)}
                nextDose={medication.times.find(time => {
                  const now = new Date();
                  const [hour, minute] = time.split(':').map(Number);
                  const medicationTime = new Date();
                  medicationTime.setHours(hour, minute, 0, 0);
                  return medicationTime > now;
                })}
              />
            ))}
          </View>
        )}

        {/* Low Stock Alert */}
        {lowStock > 0 && (
          <View style={styles.section}>
            <View style={styles.alertCard}>
              <View style={styles.alertIcon}>
                <Bell size={20} color="#f59e0b" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>Refill Reminder</Text>
                <Text style={styles.alertText}>
                  {lowStock} medication{lowStock > 1 ? 's' : ''} running low. Contact your pharmacy to refill.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => Alert.alert('Coming Soon', 'Calendar view will be available in a future update')}
            >
              <Calendar size={16} color="#2563eb" />
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.scheduleCard}>
            {medications.map((medication) => (
              <View key={medication.id} style={styles.scheduleItem}>
                <View style={styles.scheduleTime}>
                  <Text style={styles.scheduleTimeText}>
                    {medication.times[0]}
                  </Text>
                </View>
                <View style={styles.scheduleMed}>
                  <Text style={styles.scheduleMedName}>{medication.name}</Text>
                  <Text style={styles.scheduleMedDose}>{medication.dosage}</Text>
                </View>
                <TouchableOpacity
                  style={styles.quickTakeButton}
                  onPress={() => handleTakeMedication(medication.id)}
                >
                  <Text style={styles.quickTakeText}>✓</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* All Medications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>All Medications</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Add new medication"
            >
              <Plus size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>
          
          {medications.map((medication) => (
            <MedicationCard
              key={medication.id}
              medication={medication}
              onPress={() => console.log('View medication details:', medication.id)}
            />
          ))}
        </View>

        {medications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No medications added yet</Text>
            <Text style={styles.emptyText}>
              Tap the + button to add your first medication and start tracking your health journey
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Add your first medication"
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.emptyButtonText}>Add Medication</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <AddMedicationModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddMedication}
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
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 4,
  },
  addButton: {
    padding: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#2563eb',
    marginLeft: 4,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  progressPercentage: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#2563eb',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  alertIcon: {
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#92400e',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#92400e',
  },
  scheduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  scheduleTime: {
    width: 60,
    marginRight: 16,
  },
  scheduleTimeText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#2563eb',
  },
  scheduleMed: {
    flex: 1,
  },
  scheduleMedName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#111827',
    marginBottom: 2,
  },
  scheduleMedDose: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  quickTakeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  quickTakeText: {
    fontSize: 18,
    color: '#16a34a',
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
    lineHeight: 24,
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