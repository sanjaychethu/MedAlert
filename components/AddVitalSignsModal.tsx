import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { X, Heart, Thermometer, Activity, Droplets } from 'lucide-react-native';
import { VitalSigns } from '@/types/medication';

interface AddVitalSignsModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (vitalSigns: Omit<VitalSigns, 'id'>) => void;
}

export default function AddVitalSignsModal({
  visible,
  onClose,
  onSave,
}: AddVitalSignsModalProps) {
  const [formData, setFormData] = useState({
    systolic: '',
    diastolic: '',
    heartRate: '',
    temperature: '',
    oxygenSaturation: '',
    weight: '',
    bloodGlucose: '',
    notes: '',
  });

  const handleSave = () => {
    const systolic = parseInt(formData.systolic);
    const diastolic = parseInt(formData.diastolic);
    const heartRate = parseInt(formData.heartRate);
    const temperature = parseFloat(formData.temperature);
    const oxygenSaturation = parseInt(formData.oxygenSaturation);
    const weight = parseFloat(formData.weight);
    const bloodGlucose = parseInt(formData.bloodGlucose);

    // Validate at least one vital sign is entered
    if (!systolic && !diastolic && !heartRate && !temperature && !oxygenSaturation && !weight && !bloodGlucose) {
      Alert.alert('Error', 'Please enter at least one vital sign measurement');
      return;
    }

    const vitalSigns: Omit<VitalSigns, 'id'> = {
      timestamp: new Date().toISOString(),
      notes: formData.notes.trim() || undefined,
    };

    if (systolic && diastolic) {
      vitalSigns.bloodPressure = { systolic, diastolic };
    }

    if (heartRate) {
      vitalSigns.heartRate = heartRate;
    }

    if (temperature) {
      vitalSigns.temperature = temperature;
    }

    if (oxygenSaturation) {
      vitalSigns.oxygenSaturation = oxygenSaturation;
    }

    if (weight) {
      vitalSigns.weight = weight;
    }

    if (bloodGlucose) {
      vitalSigns.bloodGlucose = bloodGlucose;
    }

    onSave(vitalSigns);
    
    // Reset form
    setFormData({
      systolic: '',
      diastolic: '',
      heartRate: '',
      temperature: '',
      oxygenSaturation: '',
      weight: '',
      bloodGlucose: '',
      notes: '',
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.title}>Add Health Reading</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Blood Pressure</Text>
            <View style={styles.bpContainer}>
              <View style={styles.bpInputContainer}>
                <Heart size={20} color="#dc2626" />
                <Text style={styles.bpLabel}>Systolic</Text>
                <TextInput
                  style={styles.bpInput}
                  value={formData.systolic}
                  onChangeText={(text) => setFormData({ ...formData, systolic: text })}
                  placeholder="120"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.unit}>mmHg</Text>
              </View>
              
              <View style={styles.bpInputContainer}>
                <Heart size={20} color="#dc2626" />
                <Text style={styles.bpLabel}>Diastolic</Text>
                <TextInput
                  style={styles.bpInput}
                  value={formData.diastolic}
                  onChangeText={(text) => setFormData({ ...formData, diastolic: text })}
                  placeholder="80"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.unit}>mmHg</Text>
              </View>
            </View>
            <Text style={styles.normalRange}>Normal: 120/80 mmHg or below</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other Vitals</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Activity size={20} color="#2563eb" />
                <Text style={styles.label}>Heart Rate</Text>
              </View>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={styles.input}
                  value={formData.heartRate}
                  onChangeText={(text) => setFormData({ ...formData, heartRate: text })}
                  placeholder="72"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.unit}>bpm</Text>
              </View>
              <Text style={styles.normalRange}>Normal: 60-100 bpm</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Thermometer size={20} color="#ea580c" />
                <Text style={styles.label}>Temperature</Text>
              </View>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={styles.input}
                  value={formData.temperature}
                  onChangeText={(text) => setFormData({ ...formData, temperature: text })}
                  placeholder="98.6"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.unit}>°F</Text>
              </View>
              <Text style={styles.normalRange}>Normal: 97-99°F (36.1-37.2°C)</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Droplets size={20} color="#0ea5e9" />
                <Text style={styles.label}>Oxygen Saturation</Text>
              </View>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={styles.input}
                  value={formData.oxygenSaturation}
                  onChangeText={(text) => setFormData({ ...formData, oxygenSaturation: text })}
                  placeholder="98"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.unit}>%</Text>
              </View>
              <Text style={styles.normalRange}>Normal: 95-100%</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Text style={styles.weightIcon}>⚖️</Text>
                <Text style={styles.label}>Weight</Text>
              </View>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={styles.input}
                  value={formData.weight}
                  onChangeText={(text) => setFormData({ ...formData, weight: text })}
                  placeholder="65.5"
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.unit}>kg</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputHeader}>
                <Text style={styles.glucoseIcon}>🩸</Text>
                <Text style={styles.label}>Blood Sugar</Text>
              </View>
              <View style={styles.inputWithUnit}>
                <TextInput
                  style={styles.input}
                  value={formData.bloodGlucose}
                  onChangeText={(text) => setFormData({ ...formData, bloodGlucose: text })}
                  placeholder="100"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
                <Text style={styles.unit}>mg/dL</Text>
              </View>
              <Text style={styles.normalRange}>Fasting: 70-100 mg/dL, Post-meal: &lt;140 mg/dL</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Additional Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Any symptoms, medications taken, or other observations..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.tipSection}>
            <Text style={styles.tipTitle}>💡 Tips for Accurate Readings</Text>
            <Text style={styles.tipText}>
              • Take BP after sitting quietly for 5 minutes{'\n'}
              • Measure weight at the same time daily{'\n'}
              • Check blood sugar as per doctor's advice{'\n'}
              • Record any symptoms or unusual circumstances
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2563eb',
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  bpContainer: {
    gap: 16,
  },
  bpInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bpLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  bpInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#ffffff',
    width: 80,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 8,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  unit: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginLeft: 12,
    minWidth: 40,
  },
  normalRange: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#16a34a',
    marginTop: 4,
    fontStyle: 'italic',
  },
  weightIcon: {
    fontSize: 20,
  },
  glucoseIcon: {
    fontSize: 20,
  },
  tipSection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  tipTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#92400e',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#92400e',
    lineHeight: 18,
  },
});