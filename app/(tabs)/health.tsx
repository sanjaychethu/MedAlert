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
import { Plus, Calendar, TrendingUp, Activity, Heart, Thermometer, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, ChartBar as BarChart3, Target } from 'lucide-react-native';
import VitalSignCard from '@/components/VitalSignCard';
import AddVitalSignsModal from '@/components/AddVitalSignsModal';
import { VitalSigns } from '@/types/medication';
import { getVitalSigns, saveVitalSigns } from '@/utils/storage';
import { getVitalSignsFromSupabase, saveVitalSignsToSupabase } from '@/utils/supabaseStorage';
import { mockVitalSigns } from '@/utils/mockData';

export default function HealthScreen() {
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadVitalSigns();
  }, []);

  const loadVitalSigns = async () => {
    try {
      // Try to load from Supabase first
      let storedVitals = await getVitalSignsFromSupabase();
      
      if (storedVitals.length === 0) {
        // Fallback to local storage
        storedVitals = await getVitalSigns();
        
        if (storedVitals.length === 0) {
          // Use mock data as last resort
          storedVitals = mockVitalSigns;
          await saveVitalSigns(storedVitals);
          await saveVitalSignsToSupabase(storedVitals);
        }
      }
      
      setVitalSigns(storedVitals.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ));
    } catch (error) {
      console.error('Error loading vital signs:', error);
      Alert.alert('Error', 'Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVitalSigns();
    setRefreshing(false);
  };

  const handleAddVitalSigns = async (vitalData: Omit<VitalSigns, 'id'>) => {
    try {
      const newVitalSigns: VitalSigns = {
        ...vitalData,
        id: Date.now().toString(),
      };

      const updatedVitals = [newVitalSigns, ...vitalSigns];
      setVitalSigns(updatedVitals);
      
      // Save to both local and cloud storage
      await saveVitalSigns(updatedVitals);
      await saveVitalSignsToSupabase(updatedVitals);
      
      setShowAddModal(false);
      Alert.alert('Success', 'Health reading recorded successfully');
    } catch (error) {
      console.error('Error adding vital signs:', error);
      Alert.alert('Error', 'Failed to record health reading');
    }
  };

  const getLatestVitals = () => {
    if (vitalSigns.length === 0) return null;
    return vitalSigns[0];
  };

  const getVitalStatus = (type: string, value: number): 'normal' | 'warning' | 'critical' => {
    switch (type) {
      case 'systolic':
        if (value < 90 || value > 140) return 'critical';
        if (value < 100 || value > 130) return 'warning';
        return 'normal';
      case 'diastolic':
        if (value < 60 || value > 90) return 'critical';
        if (value < 70 || value > 85) return 'warning';
        return 'normal';
      case 'heartRate':
        if (value < 50 || value > 100) return 'critical';
        if (value < 60 || value > 90) return 'warning';
        return 'normal';
      case 'temperature':
        if (value < 95 || value > 101) return 'critical';
        if (value < 97 || value > 99.5) return 'warning';
        return 'normal';
      case 'oxygenSaturation':
        if (value < 90) return 'critical';
        if (value < 95) return 'warning';
        return 'normal';
      case 'bloodGlucose':
        if (value < 70 || value > 180) return 'critical';
        if (value < 80 || value > 140) return 'warning';
        return 'normal';
      default:
        return 'normal';
    }
  };

  const getTrend = (type: string): 'up' | 'down' | 'stable' => {
    if (vitalSigns.length < 2) return 'stable';
    
    const latest = vitalSigns[0];
    const previous = vitalSigns[1];
    
    let latestValue: number | undefined;
    let previousValue: number | undefined;
    
    switch (type) {
      case 'systolic':
        latestValue = latest.bloodPressure?.systolic;
        previousValue = previous.bloodPressure?.systolic;
        break;
      case 'heartRate':
        latestValue = latest.heartRate;
        previousValue = previous.heartRate;
        break;
      case 'temperature':
        latestValue = latest.temperature;
        previousValue = previous.temperature;
        break;
      case 'oxygenSaturation':
        latestValue = latest.oxygenSaturation;
        previousValue = previous.oxygenSaturation;
        break;
      case 'bloodGlucose':
        latestValue = latest.bloodGlucose;
        previousValue = previous.bloodGlucose;
        break;
    }
    
    if (latestValue === undefined || previousValue === undefined) return 'stable';
    if (latestValue > previousValue) return 'up';
    if (latestValue < previousValue) return 'down';
    return 'stable';
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getHealthScore = () => {
    const latestVitals = getLatestVitals();
    if (!latestVitals) return 0;

    let score = 0;
    let totalChecks = 0;

    if (latestVitals.bloodPressure) {
      const systolicStatus = getVitalStatus('systolic', latestVitals.bloodPressure.systolic);
      const diastolicStatus = getVitalStatus('diastolic', latestVitals.bloodPressure.diastolic);
      score += systolicStatus === 'normal' ? 25 : systolicStatus === 'warning' ? 15 : 5;
      score += diastolicStatus === 'normal' ? 25 : diastolicStatus === 'warning' ? 15 : 5;
      totalChecks += 2;
    }

    if (latestVitals.heartRate) {
      const status = getVitalStatus('heartRate', latestVitals.heartRate);
      score += status === 'normal' ? 25 : status === 'warning' ? 15 : 5;
      totalChecks += 1;
    }

    if (latestVitals.temperature) {
      const status = getVitalStatus('temperature', latestVitals.temperature);
      score += status === 'normal' ? 25 : status === 'warning' ? 15 : 5;
      totalChecks += 1;
    }

    if (latestVitals.bloodGlucose) {
      const status = getVitalStatus('bloodGlucose', latestVitals.bloodGlucose);
      score += status === 'normal' ? 25 : status === 'warning' ? 15 : 5;
      totalChecks += 1;
    }

    return totalChecks > 0 ? Math.round(score / totalChecks) : 0;
  };

  const getCriticalAlerts = () => {
    const latestVitals = getLatestVitals();
    if (!latestVitals) return [];

    const alerts = [];

    if (latestVitals.bloodPressure) {
      if (getVitalStatus('systolic', latestVitals.bloodPressure.systolic) === 'critical') {
        alerts.push('High systolic blood pressure detected');
      }
      if (getVitalStatus('diastolic', latestVitals.bloodPressure.diastolic) === 'critical') {
        alerts.push('High diastolic blood pressure detected');
      }
    }

    if (latestVitals.heartRate && getVitalStatus('heartRate', latestVitals.heartRate) === 'critical') {
      alerts.push('Abnormal heart rate detected');
    }

    if (latestVitals.temperature && getVitalStatus('temperature', latestVitals.temperature) === 'critical') {
      alerts.push('Abnormal temperature detected');
    }

    if (latestVitals.oxygenSaturation && getVitalStatus('oxygenSaturation', latestVitals.oxygenSaturation) === 'critical') {
      alerts.push('Low oxygen saturation detected');
    }

    if (latestVitals.bloodGlucose && getVitalStatus('bloodGlucose', latestVitals.bloodGlucose) === 'critical') {
      alerts.push('Abnormal blood sugar level detected');
    }

    return alerts;
  };

  const latestVitals = getLatestVitals();
  const healthScore = getHealthScore();
  const criticalAlerts = getCriticalAlerts();

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading health data...</Text>
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
            <Text style={styles.greeting}>Health Dashboard</Text>
            <Text style={styles.title}>Monitor Your Vitals</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Add new health reading"
          >
            <Plus size={24} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* Health Score */}
        <View style={styles.section}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Target size={24} color="#2563eb" />
              <Text style={styles.scoreTitle}>Health Score</Text>
            </View>
            <View style={styles.scoreContent}>
              <Text style={styles.scoreValue}>{healthScore}</Text>
              <Text style={styles.scoreMax}>/100</Text>
            </View>
            <View style={styles.scoreBar}>
              <View 
                style={[
                  styles.scoreProgress, 
                  { 
                    width: `${healthScore}%`,
                    backgroundColor: healthScore >= 80 ? '#16a34a' : healthScore >= 60 ? '#f59e0b' : '#dc2626'
                  }
                ]} 
              />
            </View>
            <Text style={styles.scoreDescription}>
              {healthScore >= 80 ? 'Excellent health indicators' : 
               healthScore >= 60 ? 'Good health with room for improvement' : 
               'Consider consulting your healthcare provider'}
            </Text>
          </View>
        </View>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.alertsCard}>
              <View style={styles.alertsHeader}>
                <AlertTriangle size={20} color="#dc2626" />
                <Text style={styles.alertsTitle}>Health Alerts</Text>
              </View>
              {criticalAlerts.map((alert, index) => (
                <View key={index} style={styles.alertItem}>
                  <View style={styles.alertDot} />
                  <Text style={styles.alertText}>{alert}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.contactDoctorButton}>
                <Text style={styles.contactDoctorText}>Contact Healthcare Provider</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Last Reading Info */}
        {latestVitals && (
          <View style={styles.lastReadingContainer}>
            <View style={styles.lastReadingHeader}>
              <Calendar size={16} color="#6b7280" />
              <Text style={styles.lastReadingText}>
                Last reading: {formatDate(latestVitals.timestamp)}
              </Text>
            </View>
          </View>
        )}

        {/* Current Vitals */}
        {latestVitals && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Readings</Text>
            
            {latestVitals.bloodPressure && (
              <VitalSignCard
                title="Blood Pressure"
                value={`${latestVitals.bloodPressure.systolic}/${latestVitals.bloodPressure.diastolic}`}
                unit="mmHg"
                icon="heart"
                status={getVitalStatus('systolic', latestVitals.bloodPressure.systolic)}
                trend={getTrend('systolic')}
              />
            )}

            {latestVitals.heartRate && (
              <VitalSignCard
                title="Heart Rate"
                value={latestVitals.heartRate.toString()}
                unit="bpm"
                icon="activity"
                status={getVitalStatus('heartRate', latestVitals.heartRate)}
                trend={getTrend('heartRate')}
              />
            )}

            {latestVitals.temperature && (
              <VitalSignCard
                title="Temperature"
                value={latestVitals.temperature.toString()}
                unit="°F"
                icon="thermometer"
                status={getVitalStatus('temperature', latestVitals.temperature)}
                trend={getTrend('temperature')}
              />
            )}

            {latestVitals.oxygenSaturation && (
              <VitalSignCard
                title="Oxygen Saturation"
                value={latestVitals.oxygenSaturation.toString()}
                unit="%"
                icon="droplets"
                status={getVitalStatus('oxygenSaturation', latestVitals.oxygenSaturation)}
                trend={getTrend('oxygenSaturation')}
              />
            )}

            {latestVitals.weight && (
              <VitalSignCard
                title="Weight"
                value={latestVitals.weight.toString()}
                unit="kg"
                icon="activity"
                status="normal"
                trend={getTrend('weight')}
              />
            )}

            {latestVitals.bloodGlucose && (
              <VitalSignCard
                title="Blood Sugar"
                value={latestVitals.bloodGlucose.toString()}
                unit="mg/dL"
                icon="droplets"
                status={getVitalStatus('bloodGlucose', latestVitals.bloodGlucose)}
                trend={getTrend('bloodGlucose')}
              />
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowAddModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Measure blood pressure"
            >
              <Heart size={24} color="#dc2626" />
              <Text style={styles.quickActionText}>Blood Pressure</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowAddModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Measure blood sugar"
            >
              <Activity size={24} color="#2563eb" />
              <Text style={styles.quickActionText}>Blood Sugar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowAddModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Record weight"
            >
              <Thermometer size={24} color="#ea580c" />
              <Text style={styles.quickActionText}>Weight</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Insights</Text>
          <View style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <TrendingUp size={20} color="#16a34a" />
              <Text style={styles.insightTitle}>7-Day Trend Analysis</Text>
            </View>
            <Text style={styles.insightText}>
              {criticalAlerts.length === 0 
                ? 'Your vital signs are showing positive trends. Keep up the good work with medication adherence and healthy lifestyle choices.'
                : 'Some readings need attention. Consider sharing these results with your healthcare provider for personalized advice.'
              }
            </Text>
            <View style={styles.insightMetrics}>
              <View style={styles.insightMetric}>
                <Text style={[styles.insightMetricValue, { 
                  color: criticalAlerts.length === 0 ? '#16a34a' : '#f59e0b' 
                }]}>
                  {criticalAlerts.length === 0 ? '✓' : '!'}
                </Text>
                <Text style={styles.insightMetricLabel}>
                  {criticalAlerts.length === 0 ? 'All Normal' : 'Needs Attention'}
                </Text>
              </View>
              <View style={styles.insightMetric}>
                <Text style={styles.insightMetricValue}>{vitalSigns.length}</Text>
                <Text style={styles.insightMetricLabel}>Total Readings</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent History */}
        {vitalSigns.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent History</Text>
            {vitalSigns.slice(1, 4).map((vital, index) => (
              <View key={vital.id} style={styles.historyItem}>
                <View style={styles.historyDate}>
                  <Calendar size={16} color="#6b7280" />
                  <Text style={styles.historyDateText}>
                    {formatDate(vital.timestamp)}
                  </Text>
                </View>
                <View style={styles.historyValues}>
                  {vital.bloodPressure && (
                    <View style={styles.historyValue}>
                      <Text style={styles.historyValueLabel}>BP:</Text>
                      <Text style={styles.historyValueText}>
                        {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                      </Text>
                    </View>
                  )}
                  {vital.heartRate && (
                    <View style={styles.historyValue}>
                      <Text style={styles.historyValueLabel}>HR:</Text>
                      <Text style={styles.historyValueText}>{vital.heartRate} bpm</Text>
                    </View>
                  )}
                  {vital.bloodGlucose && (
                    <View style={styles.historyValue}>
                      <Text style={styles.historyValueLabel}>Sugar:</Text>
                      <Text style={styles.historyValueText}>{vital.bloodGlucose} mg/dL</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {vitalSigns.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No health data yet</Text>
            <Text style={styles.emptyText}>
              Start tracking your vital signs to monitor your health and identify trends over time
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddModal(true)}
              accessibilityRole="button"
              accessibilityLabel="Add your first reading"
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.emptyButtonText}>Add Reading</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <AddVitalSignsModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddVitalSigns}
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
  scoreCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: 'Inter-Bold',
    color: '#2563eb',
  },
  scoreMax: {
    fontSize: 24,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginLeft: 4,
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  scoreDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
  alertsCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#dc2626',
    marginLeft: 8,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dc2626',
    marginRight: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#dc2626',
  },
  contactDoctorButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  contactDoctorText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  lastReadingContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  lastReadingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastReadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginLeft: 6,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginTop: 8,
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  insightMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  insightMetric: {
    alignItems: 'center',
  },
  insightMetricValue: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  insightMetricLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  historyItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDateText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginLeft: 6,
  },
  historyValues: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  historyValue: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  historyValueLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginRight: 4,
  },
  historyValueText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#374151',
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