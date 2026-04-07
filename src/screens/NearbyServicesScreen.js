import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const getServiceIcon = (type) => {
  if (type === 'Thú y') return 'medkit';
  if (type === 'Grooming') return 'cut';
  if (type === 'Pet shop') return 'storefront';
  if (type === 'Lưu trú') return 'bed';
  return 'location';
};

const formatRatingText = (place) => {
  if (!place?.rating) return '';
  if (Number.isFinite(place?.reviewsCount)) {
    return `${place.rating} (${place.reviewsCount} đánh giá)`;
  }
  return String(place.rating);
};

const NearbyServicesScreen = ({ navigation }) => {
  const { nearbyServices, nearbyServicesMeta, refreshNearbyServices } = useAppData();
  const services = Array.isArray(nearbyServices) ? nearbyServices : [];
  const isLocating = nearbyServicesMeta?.isLoading;
  const locationError = nearbyServicesMeta?.error || '';
  const sourceLabel = nearbyServicesMeta?.sourceLabel || '';

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dịch vụ gần tôi</Text>
      </View>

      <Text style={styles.resultText}>{services.length} dịch vụ quanh bạn</Text>
      {sourceLabel ? <Text style={styles.sourceText}>{sourceLabel}</Text> : null}

      {locationError ? (
        <Card style={styles.noticeCard}>
          <Text style={styles.noticeText}>{locationError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refreshNearbyServices({ force: true })}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </Card>
      ) : null}

      {isLocating ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Đang lấy vị trí và tìm địa điểm gần bạn...</Text>
        </View>
      ) : null}

      {!isLocating && services.map((place) => (
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
              <Text style={styles.serviceMeta}>{[place.type, place.distance].filter(Boolean).join(' • ')}</Text>
              {place.address ? <Text style={styles.serviceAddress}>{place.address}</Text> : null}
              {place.hours ? <Text style={styles.serviceAddress}>Giờ mở cửa: {place.hours}</Text> : null}
              {place.phone ? <Text style={styles.serviceAddress}>Liên hệ: {place.phone}</Text> : null}
              {place.operator ? <Text style={styles.serviceAddress}>Đơn vị: {place.operator}</Text> : null}

              {(place.rating || place.status) ? (
                <View style={styles.ratingRow}>
                  {place.rating ? (
                    <>
                      <Ionicons name="star" size={13} color={theme.colors.warning} />
                      <Text style={styles.ratingText}>{formatRatingText(place)}</Text>
                    </>
                  ) : null}
                  {place.status ? (
                    <View style={[styles.statusChip, place.status !== 'Đang mở' && styles.statusChipWarning]}>
                      <Text style={[styles.statusText, place.status !== 'Đang mở' && styles.statusTextWarning]}>{place.status}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>

            <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />
          </Card>
        </TouchableOpacity>
      ))}

      {!isLocating && services.length === 0 ? (
        <Card style={styles.noticeCard}>
          <Text style={styles.noticeText}>Chưa tìm thấy địa điểm phù hợp gần vị trí hiện tại.</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refreshNearbyServices({ force: true })}
          >
            <Text style={styles.retryButtonText}>Tìm lại</Text>
          </TouchableOpacity>
        </Card>
      ) : null}
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
    marginBottom: 4
  },
  sourceText: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.md
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  loadingText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginLeft: 8
  },
  noticeCard: {
    marginBottom: theme.spacing.md
  },
  noticeText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF'
  },
  retryButtonText: {
    ...theme.typography.caption,
    color: theme.colors.text
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
