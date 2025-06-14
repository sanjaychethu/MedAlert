import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Pill, AlertCircle, CheckCircle } from 'lucide-react-native';
import { Medication } from '@/types/medication';

interface MedicationCardProps {
  medication: Medication;
  onPress?: () => void;
  onTake?: () => void;
  nextDose?: string;
}

export default function MedicationCard({ 
  medication, 
  onPress, 
  onTake, 
  nextDose 
}: MedicationCardProps) {
  const isLowStock = medication.pillsRemaining <= 5;
  const adherenceColor = medication.adherenceRate >= 90 ? '#16a34a' : 
                        medication.adherenceRate >= 75 ? '#ea580c' : '#dc2626';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${medication.name} medication details`}
    >
      <View style={styles.header}>
        <View style={styles.medicationInfo}>
          <Text style={styles.name}>{medication.name}</Text>
          <Text style={styles.dosage}>{medication.dosage} • {medication.frequency}</Text>
        </View>
        <View style={styles.statusContainer}>
          {isLowStock && (
            <AlertCircle size={20} color="#ea580c" />
          )}
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Clock size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            Next dose: {nextDose || medication.times[0]}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Pill size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {medication.pillsRemaining} pills remaining
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.adherenceContainer}>
          <Text style={styles.adherenceLabel}>Adherence</Text>
          <View style={styles.adherenceBar}>
            <View 
              style={[
                styles.adherenceProgress, 
                { 
                  width: `${medication.adherenceRate}%`,
                  backgroundColor: adherenceColor 
                }
              ]} 
            />
          </View>
          <Text style={[styles.adherencePercent, { color: adherenceColor }]}>
            {medication.adherenceRate}%
          </Text>
        </View>

        {onTake && (
          <TouchableOpacity
            style={styles.takeButton}
            onPress={onTake}
            accessibilityRole="button"
            accessibilityLabel={`Mark ${medication.name} as taken`}
          >
            <CheckCircle size={18} color="#ffffff" />
            <Text style={styles.takeButtonText}>Take</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLowStock && (
        <View style={styles.lowStockWarning}>
          <AlertCircle size={16} color="#ea580c" />
          <Text style={styles.lowStockText}>Low stock - refill needed</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  medicationInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 4,
  },
  dosage: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  statusContainer: {
    marginLeft: 12,
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adherenceContainer: {
    flex: 1,
    marginRight: 16,
  },
  adherenceLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginBottom: 4,
  },
  adherenceBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  adherenceProgress: {
    height: '100%',
    borderRadius: 3,
  },
  adherencePercent: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  takeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  takeButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 6,
  },
  lowStockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#fef3c7',
    backgroundColor: '#fffbeb',
    marginHorizontal: -16,
    marginBottom: -16,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  lowStockText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#ea580c',
    marginLeft: 6,
  },
});