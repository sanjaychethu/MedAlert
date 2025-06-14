import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { User, Phone, Mail, Shield, Clock } from 'lucide-react-native';
import { Caregiver } from '@/types/medication';

interface CaregiverCardProps {
  caregiver: Caregiver;
  onCall?: () => void;
  onMessage?: () => void;
}

export default function CaregiverCard({ 
  caregiver, 
  onCall, 
  onMessage 
}: CaregiverCardProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'primary':
        return '#2563eb';
      case 'medical':
        return '#16a34a';
      case 'secondary':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'primary':
        return 'Primary Caregiver';
      case 'medical':
        return 'Medical Professional';
      case 'secondary':
        return 'Secondary Caregiver';
      default:
        return 'Caregiver';
    }
  };

  const formatLastActive = (lastActive?: string) => {
    if (!lastActive) return 'Never';
    
    const now = new Date();
    const activeDate = new Date(lastActive);
    const diffMs = now.getTime() - activeDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return activeDate.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <User size={32} color="#6b7280" />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{caregiver.name}</Text>
          <Text style={styles.relationship}>{caregiver.relationship}</Text>
          <View style={styles.roleContainer}>
            <Shield size={12} color={getRoleColor(caregiver.role)} />
            <Text style={[styles.role, { color: getRoleColor(caregiver.role) }]}>
              {getRoleLabel(caregiver.role)}
            </Text>
          </View>
        </View>
        <View style={[styles.statusIndicator, { 
          backgroundColor: caregiver.isActive ? '#16a34a' : '#6b7280' 
        }]} />
      </View>

      <View style={styles.contact}>
        <View style={styles.contactInfo}>
          <Phone size={14} color="#6b7280" />
          <Text style={styles.contactText}>{caregiver.phone}</Text>
        </View>
        <View style={styles.contactInfo}>
          <Mail size={14} color="#6b7280" />
          <Text style={styles.contactText}>{caregiver.email}</Text>
        </View>
        <View style={styles.contactInfo}>
          <Clock size={14} color="#6b7280" />
          <Text style={styles.contactText}>
            Active {formatLastActive(caregiver.lastActive)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {onCall && (
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={onCall}
            accessibilityRole="button"
            accessibilityLabel={`Call ${caregiver.name}`}
          >
            <Phone size={16} color="#ffffff" />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
        )}
        
        {onMessage && (
          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={onMessage}
            accessibilityRole="button"
            accessibilityLabel={`Message ${caregiver.name}`}
          >
            <Mail size={16} color="#2563eb" />
            <Text style={[styles.actionButtonText, { color: '#2563eb' }]}>Message</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.permissions}>
        <Text style={styles.permissionsTitle}>Permissions:</Text>
        <View style={styles.permissionsContainer}>
          {caregiver.permissions.map((permission, index) => (
            <View key={index} style={styles.permissionTag}>
              <Text style={styles.permissionText}>
                {permission.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  relationship: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 4,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  role: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    marginLeft: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  contact: {
    marginBottom: 16,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  callButton: {
    backgroundColor: '#2563eb',
  },
  messageButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 6,
  },
  permissions: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
  },
  permissionsTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginBottom: 8,
  },
  permissionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  permissionTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  permissionText: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
});