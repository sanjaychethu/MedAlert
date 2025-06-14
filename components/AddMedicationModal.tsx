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
import { X, Plus, Clock, Calendar, Pill } from 'lucide-react-native';
import { Medication } from '@/types/medication';

interface AddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (medication: Omit<Medication, 'id'>) => void;
}

export default function AddMedicationModal({
  visible,
  onClose,
  onSave,
}: AddMedicationModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: 'Once daily',
    times: ['08:00'],
    instructions: '',
    prescribedBy: '',
    totalPills: '30',
    refillReminder: true,
  });

  const frequencyOptions = [
    { label: 'Once daily', value: 'Once daily', times: ['08:00'] },
    { label: 'Twice daily', value: 'Twice daily', times: ['08:00', '20:00'] },
    { label: 'Three times daily', value: 'Three times daily', times: ['08:00', '14:00', '20:00'] },
    { label: 'Four times daily', value: 'Four times daily', times: ['06:00', '12:00', '18:00', '22:00'] },
    { label: 'As needed', value: 'As needed', times: [] },
  ];

  const commonMedications = [
    'Paracetamol', 'Aspirin', 'Metformin', 'Telmisartan', 'Atorvastatin', 
    'Amlodipine', 'Losartan', 'Glimepiride', 'Pantoprazole', 'Clopidogrel',
    'Rosuvastatin', 'Olmesartan', 'Valsartan', 'Ramipril', 'Enalapril'
  ];

  const commonDosages = [
    '5mg', '10mg', '20mg', '25mg', '40mg', '50mg', '100mg', '250mg', '500mg', '1000mg'
  ];

  const handleFrequencyChange = (frequency: string) => {
    const option = frequencyOptions.find(opt => opt.value === frequency);
    setFormData({
      ...formData,
      frequency,
      times: option?.times || [],
    });
  };

  const handleTimeChange = (index: number, time: string) => {
    const newTimes = [...formData.times];
    newTimes[index] = time;
    setFormData({ ...formData, times: newTimes });
  };

  const addTime = () => {
    setFormData({
      ...formData,
      times: [...formData.times, '12:00'],
    });
  };

  const removeTime = (index: number) => {
    const newTimes = formData.times.filter((_, i) => i !== index);
    setFormData({ ...formData, times: newTimes });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Medication name is required');
      return;
    }

    if (!formData.dosage.trim()) {
      Alert.alert('Error', 'Dosage is required');
      return;
    }

    const totalPills = parseInt(formData.totalPills) || 30;
    
    const medication: Omit<Medication, 'id'> = {
      name: formData.name.trim(),
      dosage: formData.dosage.trim(),
      frequency: formData.frequency,
      times: formData.times,
      startDate: new Date().toISOString(),
      instructions: formData.instructions.trim(),
      prescribedBy: formData.prescribedBy.trim(),
      refillReminder: formData.refillReminder,
      pillsRemaining: totalPills,
      totalPills,
      isActive: true,
      adherenceRate: 100,
      totalDoses: 0,
      missedDoses: 0,
    };

    onSave(medication);
    
    // Reset form
    setFormData({
      name: '',
      dosage: '',
      frequency: 'Once daily',
      times: ['08:00'],
      instructions: '',
      prescribedBy: '',
      totalPills: '30',
      refillReminder: true,
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
          <Text style={styles.title}>Add Medication</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medication Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="e.g., Telmisartan, Metformin"
                placeholderTextColor="#9ca3af"
              />
              <View style={styles.suggestionContainer}>
                <Text style={styles.suggestionLabel}>Common medications:</Text>
                <View style={styles.suggestionTags}>
                  {commonMedications.slice(0, 6).map((med) => (
                    <TouchableOpacity
                      key={med}
                      style={styles.suggestionTag}
                      onPress={() => setFormData({ ...formData, name: med })}
                    >
                      <Text style={styles.suggestionTagText}>{med}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dosage *</Text>
              <TextInput
                style={styles.input}
                value={formData.dosage}
                onChangeText={(text) => setFormData({ ...formData, dosage: text })}
                placeholder="e.g., 40mg, 500mg"
                placeholderTextColor="#9ca3af"
              />
              <View style={styles.suggestionContainer}>
                <Text style={styles.suggestionLabel}>Common dosages:</Text>
                <View style={styles.suggestionTags}>
                  {commonDosages.slice(0, 6).map((dosage) => (
                    <TouchableOpacity
                      key={dosage}
                      style={styles.suggestionTag}
                      onPress={() => setFormData({ ...formData, dosage })}
                    >
                      <Text style={styles.suggestionTagText}>{dosage}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prescribed By</Text>
              <TextInput
                style={styles.input}
                value={formData.prescribedBy}
                onChangeText={(text) => setFormData({ ...formData, prescribedBy: text })}
                placeholder="e.g., Dr. Rajesh Kumar"
                placeholderTextColor="#9ca3af"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Total Pills</Text>
              <TextInput
                style={styles.input}
                value={formData.totalPills}
                onChangeText={(text) => setFormData({ ...formData, totalPills: text })}
                placeholder="30"
                keyboardType="numeric"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Schedule</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Frequency</Text>
              <View style={styles.frequencyContainer}>
                {frequencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.frequencyOption,
                      formData.frequency === option.value && styles.frequencyOptionSelected,
                    ]}
                    onPress={() => handleFrequencyChange(option.value)}
                  >
                    <Text
                      style={[
                        styles.frequencyText,
                        formData.frequency === option.value && styles.frequencyTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {formData.times.length > 0 && (
              <View style={styles.inputGroup}>
                <View style={styles.timesHeader}>
                  <Text style={styles.label}>Times</Text>
                  <TouchableOpacity onPress={addTime} style={styles.addTimeButton}>
                    <Plus size={16} color="#2563eb" />
                    <Text style={styles.addTimeText}>Add Time</Text>
                  </TouchableOpacity>
                </View>
                
                {formData.times.map((time, index) => (
                  <View key={index} style={styles.timeRow}>
                    <Clock size={16} color="#6b7280" />
                    <TextInput
                      style={styles.timeInput}
                      value={time}
                      onChangeText={(text) => handleTimeChange(index, text)}
                      placeholder="HH:MM"
                      placeholderTextColor="#9ca3af"
                    />
                    {formData.times.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeTime(index)}
                        style={styles.removeTimeButton}
                      >
                        <X size={16} color="#dc2626" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Special Instructions</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.instructions}
                onChangeText={(text) => setFormData({ ...formData, instructions: text })}
                placeholder="e.g., Take with food, avoid alcohol"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
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
  suggestionContainer: {
    marginTop: 8,
  },
  suggestionLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginBottom: 6,
  },
  suggestionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  suggestionTagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  frequencyOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    margin: 4,
  },
  frequencyOptionSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  frequencyText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  frequencyTextSelected: {
    color: '#ffffff',
  },
  timesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  addTimeText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#2563eb',
    marginLeft: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#111827',
    backgroundColor: '#ffffff',
    marginLeft: 8,
  },
  removeTimeButton: {
    padding: 4,
    marginLeft: 8,
  },
});