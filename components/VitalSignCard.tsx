import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart, Thermometer, Activity, Droplets } from 'lucide-react-native';

interface VitalSignCardProps {
  title: string;
  value: string;
  unit?: string;
  icon: 'heart' | 'thermometer' | 'activity' | 'droplets';
  status: 'normal' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

export default function VitalSignCard({ 
  title, 
  value, 
  unit, 
  icon, 
  status, 
  trend 
}: VitalSignCardProps) {
  const getIcon = () => {
    switch (icon) {
      case 'heart':
        return <Heart size={24} color={getStatusColor()} />;
      case 'thermometer':
        return <Thermometer size={24} color={getStatusColor()} />;
      case 'activity':
        return <Activity size={24} color={getStatusColor()} />;
      case 'droplets':
        return <Droplets size={24} color={getStatusColor()} />;
      default:
        return <Heart size={24} color={getStatusColor()} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'normal':
        return '#16a34a';
      case 'warning':
        return '#ea580c';
      case 'critical':
        return '#dc2626';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'warning':
        return 'Attention';
      case 'critical':
        return 'Critical';
      default:
        return '';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return '#dc2626';
      case 'down':
        return '#16a34a';
      case 'stable':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={[styles.container, { borderLeftColor: getStatusColor() }]}>
      <View style={styles.header}>
        {getIcon()}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.status, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {trend && (
        <View style={styles.trendContainer}>
          <View style={[styles.trendIndicator, { backgroundColor: getTrendColor() }]} />
          <Text style={[styles.trendText, { color: getTrendColor() }]}>
            {trend === 'up' ? 'Trending up' : trend === 'down' ? 'Trending down' : 'Stable'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
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
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
  },
  unit: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginLeft: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  trendText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
});