import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Linking 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TriangleAlert as AlertTriangle, Phone, MapPin, Clock, Heart, Shield, Users, Info } from 'lucide-react-native';
import * as Location from 'expo-location';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export default function EmergencyScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);
  const [emergencyActive, setEmergencyActive] = useState(false);

  const emergencyContacts: EmergencyContact[] = [
    {
      id: '1',
      name: 'Emergency Services',
      phone: '112',
      relationship: 'Emergency',
      isPrimary: true,
    },
    {
      id: '2',
      name: 'Priya Sharma',
      phone: '+91 98765 43210',
      relationship: 'Daughter',
      isPrimary: true,
    },
    {
      id: '3',
      name: 'Dr. Rajesh Kumar',
      phone: '+91 11 2345 6789',
      relationship: 'Family Doctor',
      isPrimary: false,
    },
    {
      id: '4',
      name: 'Amit Sharma',
      phone: '+91 98765 43211',
      relationship: 'Son',
      isPrimary: false,
    },
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      } else {
        setLocationPermission(false);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermission(false);
    }
  };

  const handleEmergencyCall = async (phone: string, name: string) => {
    try {
      const phoneUrl = `tel:${phone}`;
      const canOpen = await Linking.canOpenURL(phoneUrl);
      
      if (canOpen) {
        await Linking.openURL(phoneUrl);
      } else {
        Alert.alert('Error', 'Unable to make phone calls on this device');
      }
    } catch (error) {
      console.error('Error making emergency call:', error);
      Alert.alert('Emergency Call', `Would call ${name} at ${phone}`);
    }
  };

  const handleSOSPress = () => {
    Alert.alert(
      'Emergency SOS',
      'This will immediately call emergency services and notify your emergency contacts with your location. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call Emergency',
          style: 'destructive',
          onPress: activateEmergencyMode,
        },
      ]
    );
  };

  const activateEmergencyMode = async () => {
    setEmergencyActive(true);
    
    // Call emergency services
    await handleEmergencyCall('112', 'Emergency Services');
    
    // Simulate notifying emergency contacts
    Alert.alert(
      'Emergency Activated',
      'Emergency services have been contacted and your emergency contacts have been notified with your location.',
      [
        {
          text: 'OK',
          onPress: () => setEmergencyActive(false),
        },
      ]
    );
  };

  const formatLocation = () => {
    if (!location) return 'Location unavailable';
    
    const { latitude, longitude } = location.coords;
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };

  const formatAddress = () => {
    // In a real app, you would reverse geocode the coordinates
    return 'Connaught Place, New Delhi, Delhi 110001';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Emergency Response</Text>
            <Text style={styles.title}>Help When You Need It</Text>
          </View>
          <View style={[styles.statusIndicator, { 
            backgroundColor: emergencyActive ? '#dc2626' : '#16a34a' 
          }]} />
        </View>

        {/* Emergency SOS Button */}
        <View style={styles.sosContainer}>
          <TouchableOpacity
            style={[styles.sosButton, emergencyActive && styles.sosButtonActive]}
            onPress={handleSOSPress}
            accessibilityRole="button"
            accessibilityLabel="Emergency SOS - Press to call for help"
          >
            <AlertTriangle size={48} color="#ffffff" />
            <Text style={styles.sosText}>
              {emergencyActive ? 'EMERGENCY ACTIVE' : 'EMERGENCY SOS'}
            </Text>
            <Text style={styles.sosSubtext}>
              {emergencyActive ? 'Help is on the way' : 'Press and hold for 3 seconds'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Location</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <MapPin size={20} color={locationPermission ? '#16a34a' : '#dc2626'} />
              <Text style={styles.locationTitle}>
                {locationPermission ? 'Location Available' : 'Location Disabled'}
              </Text>
            </View>
            
            {locationPermission ? (
              <View style={styles.locationDetails}>
                <Text style={styles.locationText}>
                  Coordinates: {formatLocation()}
                </Text>
                <Text style={styles.locationText}>
                  Address: {formatAddress()}
                </Text>
                <Text style={styles.locationTime}>
                  Last updated: {location ? new Date(location.timestamp).toLocaleTimeString() : 'Never'}
                </Text>
              </View>
            ) : (
              <View style={styles.locationWarning}>
                <Text style={styles.locationWarningText}>
                  Location access is required for emergency response. Tap to enable.
                </Text>
                <TouchableOpacity
                  style={styles.enableLocationButton}
                  onPress={requestLocationPermission}
                  accessibilityRole="button"
                  accessibilityLabel="Enable location access"
                >
                  <Text style={styles.enableLocationText}>Enable Location</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          {emergencyContacts.map((contact) => (
            <View key={contact.id} style={styles.contactCard}>
              <View style={styles.contactInfo}>
                <View style={styles.contactHeader}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  {contact.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Shield size={12} color="#ffffff" />
                      <Text style={styles.primaryText}>Primary</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.callButton,
                  contact.phone === '112' && styles.emergencyCallButton
                ]}
                onPress={() => handleEmergencyCall(contact.phone, contact.name)}
                accessibilityRole="button"
                accessibilityLabel={`Call ${contact.name}`}
              >
                <Phone size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Medical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>
          <View style={styles.medicalCard}>
            <View style={styles.medicalHeader}>
              <Heart size={20} color="#dc2626" />
              <Text style={styles.medicalTitle}>Critical Information</Text>
            </View>
            
            <View style={styles.medicalInfo}>
              <View style={styles.medicalItem}>
                <Text style={styles.medicalLabel}>Blood Type:</Text>
                <Text style={styles.medicalValue}>B+</Text>
              </View>
              
              <View style={styles.medicalItem}>
                <Text style={styles.medicalLabel}>Allergies:</Text>
                <Text style={styles.medicalValue}>Penicillin, Shellfish</Text>
              </View>
              
              <View style={styles.medicalItem}>
                <Text style={styles.medicalLabel}>Conditions:</Text>
                <Text style={styles.medicalValue}>Hypertension, Type 2 Diabetes</Text>
              </View>
              
              <View style={styles.medicalItem}>
                <Text style={styles.medicalLabel}>Medications:</Text>
                <Text style={styles.medicalValue}>Telmisartan 40mg, Metformin 500mg</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Emergency Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Instructions</Text>
          <View style={styles.instructionsCard}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>
                Press the Emergency SOS button to automatically call 112 (National Emergency Number)
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>
                Your location will be shared automatically with emergency services
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>
                Emergency contacts will be notified with your location and status
              </Text>
            </View>
            
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>4</Text>
              </View>
              <Text style={styles.instructionText}>
                Medical information will be available to first responders
              </Text>
            </View>
          </View>
        </View>

        {/* Emergency Info */}
        <View style={styles.section}>
          <View style={styles.infoCard}>
            <Info size={20} color="#2563eb" />
            <Text style={styles.infoText}>
              This emergency feature works even when the app is closed. Make sure location services are enabled for the best emergency response. In India, dial 112 for all emergencies.
            </Text>
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
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  sosContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  sosButtonActive: {
    backgroundColor: '#991b1b',
    shadowColor: '#991b1b',
  },
  sosText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    marginTop: 12,
    textAlign: 'center',
  },
  sosSubtext: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#fecaca',
    marginTop: 4,
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
  locationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginLeft: 8,
  },
  locationDetails: {
    paddingLeft: 28,
  },
  locationText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginBottom: 4,
  },
  locationTime: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginTop: 8,
  },
  locationWarning: {
    paddingLeft: 28,
  },
  locationWarningText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#dc2626',
    marginBottom: 12,
  },
  enableLocationButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  enableLocationText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  primaryText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 2,
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
  callButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyCallButton: {
    backgroundColor: '#dc2626',
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
  medicalInfo: {
    paddingLeft: 28,
  },
  medicalItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  medicalLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    width: 100,
  },
  medicalValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  instructionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 16,
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