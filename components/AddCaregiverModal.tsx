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
import { X, User, Phone, Mail, Shield, Users, Stethoscope } from 'lucide-react-native';
import { Caregiver } from '@/types/medication';

interface AddCaregiverModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (caregiver: Omit<Caregiver, 'id'>) => void;
}

export default function AddCaregiverModal({
  visible,
  onClose,
  onSave,
}: AddCaregiverModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    email: '',
    phone: '',
    role: 'secondary' as 'primary' | 'secondary' | 'medical',
    permissions: [] as string[],
  });

  const relationshipOptions = [
    'Son', 'Daughter', 'Spouse', 'Brother', 'Sister', 'Father', 'Mother',
    'Grandson', 'Granddaughter', 'Friend', 'Neighbor', 'Family Doctor',
    'Cardiologist', 'Diabetologist', 'Neurologist', 'Orthopedist', 'Nurse'
  ];

  const roleOptions = [
    { value: 'primary', label: 'Primary Caregiver', icon: Users, color: '#2563eb' },
    { value: 'secondary', label: 'Secondary Caregiver', icon: User, color: '#6b7280' },
    { value: 'medical', label: 'Medical Professional', icon: Stethoscope, color: '#16a34a' },
  ];

  const permissionOptions = [
    { value: 'view_medications', label: 'View Medications' },
    { value: 'view_health', label: 'View Health Data' },
    { value: 'modify_medications', label: 'Modify Medications' },
    { value: 'emergency_contact', label: 'Emergency Contact' },
    { value: 'receive_alerts', label: 'Receive Health Alerts' },
  ];

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format as Indian phone number
    if (digits.length <= 10) {
      if (digits.length > 5) {
        return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
      } else {
        return `+91 ${digits}`;
      }
    }
    
    // If already has country code
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    
    return phone;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setFormData({ ...formData, phone: formatted });
  };

  const togglePermission = (permission: string) => {
    const newPermissions = formData.permissions.includes(permission)
      ? formData.permissions.filter(p => p !== permission)
      : [...formData.permissions, permission];
    
    setFormData({ ...formData, permissions: newPermissions });
  };

  const handleRoleChange = (role: 'primary' | 'secondary' | 'medical') => {
    let defaultPermissions: string[] = [];
    
    switch (role) {
      case 'primary':
        defaultPermissions = ['view_medications', 'view_health', 'emergency_contact', 'receive_alerts'];
        break;
      case 'medical':
        defaultPermissions = ['view_medications', 'view_health', 'modify_medications'];
        break;
      case 'secondary':
        defaultPermissions = ['view_medications', 'emergency_contact'];
        break;
    }
    
    setFormData({ ...formData, role, permissions: defaultPermissions });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (!formData.relationship.trim()) {
      Alert.alert('Error', 'Relationship is required');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Error', 'Email is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Validate phone number (should have at least 10 digits)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    const caregiver: Omit<Caregiver, 'id'> = {
      name: formData.name.trim(),
      relationship: formData.relationship.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      role: formData.role,
      permissions: formData.permissions,
      isActive: true,
      lastActive: new Date().toISOString(),
    };

    onSave(caregiver);
    
    // Reset form
    setFormData({
      name: '',
      relationship: '',
      email: '',
      phone: '',
      role: 'secondary',
      permissions: [],
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
          <Text style={styles.title}>Add Caregiver</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <User size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="e.g., Dr. Rajesh Kumar"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Relationship *</Text>
              <TextInput
                style={styles.input}
                value={formData.relationship}
                onChangeText={(text) => setFormData({ ...formData, relationship: text })}
                placeholder="e.g., Son, Family Doctor"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
              />
              <View style={styles.suggestionContainer}>
                <Text style={styles.suggestionLabel}>Common relationships:</Text>
                <View style={styles.suggestionTags}>
                  {relationshipOptions.slice(0, 8).map((relationship) => (
                    <TouchableOpacity
                      key={relationship}
                      style={styles.suggestionTag}
                      onPress={() => setFormData({ ...formData, relationship })}
                    >
                      <Text style={styles.suggestionTagText}>{relationship}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <View style={styles.inputContainer}>
                <Phone size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={handlePhoneChange}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  placeholder="example@gmail.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Role & Permissions</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleContainer}>
                {roleOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.roleOption,
                        formData.role === option.value && styles.roleOptionSelected,
                      ]}
                      onPress={() => handleRoleChange(option.value as any)}
                    >
                      <IconComponent 
                        size={20} 
                        color={formData.role === option.value ? '#ffffff' : option.color} 
                      />
                      <Text
                        style={[
                          styles.roleText,
                          formData.role === option.value && styles.roleTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Permissions</Text>
              <View style={styles.permissionsContainer}>
                {permissionOptions.map((permission) => (
                  <TouchableOpacity
                    key={permission.value}
                    style={[
                      styles.permissionOption,
                      formData.permissions.includes(permission.value) && styles.permissionOptionSelected,
                    ]}
                    onPress={() => togglePermission(permission.value)}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.permissions.includes(permission.value) && styles.checkboxSelected,
                    ]}>
                      {formData.permissions.includes(permission.value) && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.permissionText}>{permission.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.infoSection}>
            <Shield size={20} color="#2563eb" />
            <Text style={styles.infoText}>
              Caregivers will receive an invitation to join your care network. They can only access the information you've permitted.
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
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827',
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
  roleContainer: {
    gap: 8,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  roleOptionSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  roleText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 8,
  },
  roleTextSelected: {
    color: '#ffffff',
  },
  permissionsContainer: {
    gap: 8,
  },
  permissionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  permissionOptionSelected: {
    // No additional styling needed
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
  },
  permissionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  infoSection: {
    flexDirection: 'row',
    margin: 20,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1e40af',
    lineHeight: 20,
    marginLeft: 12,
  },
});