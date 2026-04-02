import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { nearbyServices } from '../data/place';

const getServiceIcon = (type) => {
  if (type === 'Thú y') return 'medkit';
  if (type === 'Grooming') return 'cut';
  if (type === 'Pet shop') return 'storefront';
  if (type === 'Lưu trú') return 'bed';
  return 'location';
};

const NearbyServicesScreen = ({ navigation }) => {
  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dịch vụ gần tôi</Text>
      </View>

      <Text style={styles.resultText}>{nearbyServices.length} dịch vụ quanh bạn</Text>

      {nearbyServices.map((place) => (
        <TouchableOpacity
          key={place.id}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('PlaceDetail', { place })}
        >
          <Card style={styles.serviceCard}>
            <View style={styles.serviceIcon}>
              <Ionicons name={getServiceIcon(place.type)} size={18} color={theme.colors.primary} />
            </View>

            <View style={styles.serviceContent}>
              <Text style={styles.serviceName}>{place.name}</Text>
              <Text style={styles.serviceMeta}>{place.type} • {place.distance}</Text>
              <Text style={styles.serviceAddress}>{place.address}</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={13} color={theme.colors.warning} />
                <Text style={styles.ratingText}>{place.rating} ({place.reviewsCount} đánh giá)</Text>
                <View style={[styles.statusChip, place.status !== 'Đang mở' && styles.statusChipWarning]}>
                  <Text style={[styles.statusText, place.status !== 'Đang mở' && styles.statusTextWarning]}>{place.status}</Text>
                </View>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />
          </Card>
        </TouchableOpacity>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...theme.typography.h3,
    marginRight: 28
  },
  resultText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md
  },
  serviceCard: {
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center'
  },
  serviceIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  serviceContent: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8
  },
  serviceName: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text
  },
  serviceMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  serviceAddress: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    marginTop: 4
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  ratingText: {
    ...theme.typography.small,
    color: theme.colors.text,
    marginLeft: 4,
    marginRight: 8
  },
  statusChip: {
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  statusChipWarning: {
    backgroundColor: '#FEF3C7'
  },
  statusText: {
    ...theme.typography.small,
    color: theme.colors.success,
    fontWeight: '600'
  },
  statusTextWarning: {
    color: '#B45309'
  }
});

export default NearbyServicesScreen;
