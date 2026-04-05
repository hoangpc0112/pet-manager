import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';
import { fetchNearbyServicesByLocation, getSeedNearbyServicesByLocation } from '../services/nearbyServices';

const MAX_VISIBLE_DISTANCE_METERS = 100000;
const BLOCKED_SERVICE_KEYWORDS = ['petrolimex'];

const toDistanceMeters = (place) => {
  if (Number.isFinite(place?.distanceMeters)) {
    return place.distanceMeters;
  }

  const distanceText = String(place?.distance || '').trim().toLowerCase();
  const distanceValue = Number.parseFloat(distanceText.replace(',', '.'));
  if (!Number.isFinite(distanceValue)) return Number.POSITIVE_INFINITY;

  if (distanceText.includes('km')) return distanceValue * 1000;
  if (distanceText.includes('m')) return distanceValue;

  return Number.POSITIVE_INFINITY;
};

const isBlockedService = (place) => {
  const haystack = [place?.name, place?.operator, place?.address]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return BLOCKED_SERVICE_KEYWORDS.some((keyword) => haystack.includes(keyword));
};

const filterVisibleServices = (places) =>
  (Array.isArray(places) ? places : []).filter(
    (place) => toDistanceMeters(place) < MAX_VISIBLE_DISTANCE_METERS && !isBlockedService(place)
  );

const getCoordinatesWithTimeout = async (timeoutMs = 12000) => {
  const timeoutPromise = new Promise((_, reject) => {
    const timeoutHandle = setTimeout(() => {
      clearTimeout(timeoutHandle);
      reject(new Error('Location timeout'));
    }, timeoutMs);
  });

  const locationPromise = (async () => {
    const lastKnown = await Location.getLastKnownPositionAsync();
    if (lastKnown?.coords?.latitude && lastKnown?.coords?.longitude) {
      return {
        latitude: lastKnown.coords.latitude,
        longitude: lastKnown.coords.longitude
      };
    }

    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced
    });

    return {
      latitude: current?.coords?.latitude,
      longitude: current?.coords?.longitude
    };
  })();

  return Promise.race([locationPromise, timeoutPromise]);
};

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

const buildSourceSummary = (places) => {
  const sources = Array.from(new Set((places || []).map((item) => item?.source).filter(Boolean)));
  if (sources.length === 0) return 'Theo vị trí GPS của bạn';
  return `Nguồn miễn phí: ${sources.join(', ')}`;
};

const NearbyServicesScreen = ({ navigation }) => {
  const { nearbyServices } = useAppData();
  const appConfigServices = useMemo(() => (Array.isArray(nearbyServices) ? nearbyServices : []), [nearbyServices]);

  const [services, setServices] = useState([]);
  const [isLocating, setIsLocating] = useState(true);
  const [locationError, setLocationError] = useState('');
  const [sourceLabel, setSourceLabel] = useState('');

  const loadNearbyServices = useCallback(async () => {
    setIsLocating(true);
    setLocationError('');
    let fallbackLocation = null;

    try {
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      if (!serviceEnabled) {
        setLocationError('Dịch vụ vị trí trên iPhone đang tắt. Hiển thị dữ liệu gợi ý gần bạn.');

        if (appConfigServices.length > 0) {
          setServices(filterVisibleServices(appConfigServices));
          setSourceLabel('Dữ liệu cấu hình ứng dụng');
        } else {
          setServices(filterVisibleServices(getSeedNearbyServicesByLocation(null)));
          setSourceLabel('Dữ liệu mặc định');
        }
        return;
      }

      let permission = await Location.getForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        permission = await Location.requestForegroundPermissionsAsync();
      }

      if (permission.status !== 'granted') {
        setLocationError('Chưa được cấp quyền vị trí. Vào Cài đặt để cấp quyền khi dùng ứng dụng.');

        if (appConfigServices.length > 0) {
          setServices(filterVisibleServices(appConfigServices));
          setSourceLabel('Dữ liệu cấu hình ứng dụng');
        } else {
          setServices(filterVisibleServices(getSeedNearbyServicesByLocation(null)));
          setSourceLabel('Dữ liệu mặc định');
        }
        return;
      }

      const coords = await getCoordinatesWithTimeout(12000);
      const latitude = coords?.latitude;
      const longitude = coords?.longitude;

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('Invalid GPS coordinates');
      }

      fallbackLocation = { latitude, longitude };

      const remoteServices = await fetchNearbyServicesByLocation({
        latitude,
        longitude,
        radiusMeters: 5000,
        maxResults: 15
      });
      const filteredRemoteServices = filterVisibleServices(remoteServices);

      if (filteredRemoteServices.length > 0) {
        setServices(filteredRemoteServices);
        setSourceLabel(buildSourceSummary(filteredRemoteServices));
        return;
      }

      setServices(filterVisibleServices(getSeedNearbyServicesByLocation({ latitude, longitude })));
      setSourceLabel('Dữ liệu mặc định theo vị trí hiện tại');
    } catch (_error) {
      setLocationError('Không lấy được vị trí hoặc dữ liệu mạng lúc này. Đã chuyển sang dữ liệu dự phòng.');

      if (appConfigServices.length > 0) {
        setServices(filterVisibleServices(appConfigServices));
        setSourceLabel('Dữ liệu cấu hình ứng dụng');
      } else {
        setServices(filterVisibleServices(getSeedNearbyServicesByLocation(fallbackLocation)));
        setSourceLabel(fallbackLocation ? 'Dữ liệu mặc định theo vị trí hiện tại' : 'Dữ liệu mặc định');
      }
    } finally {
      setIsLocating(false);
    }
  }, [appConfigServices]);

  useEffect(() => {
    loadNearbyServices();
  }, [loadNearbyServices]);

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
          <TouchableOpacity style={styles.retryButton} onPress={loadNearbyServices}>
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
          <TouchableOpacity style={styles.retryButton} onPress={loadNearbyServices}>
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
