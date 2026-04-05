import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import ListRow from '../components/ListRow';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const openExternalUrl = async (url) => {
  if (!url) return;

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) return;

  await Linking.openURL(url);
};

const buildGoogleMapsDirectionUrl = (detail) => {
  const hasCoordinates = Number.isFinite(detail?.latitude) && Number.isFinite(detail?.longitude);
  if (hasCoordinates) {
    return `https://www.google.com/maps/dir/?api=1&destination=${detail.latitude},${detail.longitude}`;
  }

  const destinationText = encodeURIComponent(detail?.address || detail?.name || 'pet service');
  return `https://www.google.com/maps/dir/?api=1&destination=${destinationText}`;
};

const ActionButton = ({ icon, label, primary, onPress, disabled }) => {
  return (
    <TouchableOpacity
      style={[styles.actionButton, primary && styles.actionPrimary, disabled && styles.actionDisabled]}
      disabled={disabled}
      onPress={onPress}
    >
      <Ionicons name={icon} size={18} color={primary ? '#FFFFFF' : theme.colors.text} />
      <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{label}</Text>
    </TouchableOpacity>
  );
};

const PlaceDetailScreen = ({ navigation, route }) => {
  const { placeDetail } = useAppData();
  const detail = route?.params?.place || placeDetail;

  if (!detail) {
    return (
      <Screen contentContainerStyle={styles.container}>
        <Text style={styles.sectionLabel}>Chưa có dữ liệu địa điểm.</Text>
      </Screen>
    );
  }

  const services = Array.isArray(detail.services) ? detail.services : [];
  const reviews = Array.isArray(detail.reviews) ? detail.reviews : [];

  const overviewRows = [
    detail.address ? { key: 'address', title: 'Địa chỉ', value: detail.address } : null,
    detail.hours ? { key: 'hours', title: 'Giờ mở cửa', value: detail.hours } : null,
    detail.operator ? { key: 'operator', title: 'Đơn vị vận hành', value: detail.operator } : null,
    detail.description ? { key: 'description', title: 'Mô tả', value: detail.description } : null
  ].filter(Boolean);

  const locationRows = [
    detail.distance ? { key: 'distance', title: 'Khoảng cách', value: detail.distance } : null,
    Number.isFinite(detail.latitude) && Number.isFinite(detail.longitude)
      ? { key: 'coords', title: 'Tọa độ', value: `${detail.latitude.toFixed(6)}, ${detail.longitude.toFixed(6)}` }
      : null,
    detail.city ? { key: 'city', title: 'Thành phố', value: detail.city } : null,
    detail.province ? { key: 'province', title: 'Tỉnh/tiểu bang', value: detail.province } : null,
    detail.country ? { key: 'country', title: 'Quốc gia', value: detail.country } : null,
    detail.postcode ? { key: 'postcode', title: 'Mã bưu chính', value: detail.postcode } : null
  ].filter(Boolean);

  const sourceRows = [
    detail.source ? { key: 'source', title: 'Nguồn dữ liệu', value: detail.source } : null,
    detail.sourceType ? { key: 'sourceType', title: 'Loại nguồn', value: detail.sourceType } : null,
    detail.sourceId ? { key: 'sourceId', title: 'Mã nguồn', value: detail.sourceId } : null,
    detail.mapUrl ? { key: 'mapUrl', title: 'Liên kết nguồn', value: detail.mapUrl } : null
  ].filter(Boolean);

  const canCall = Boolean(detail.phone);
  const canNavigate = Boolean(detail.address || (detail.latitude && detail.longitude));
  const canOpenWebsite = Boolean(detail.website);
  const canOpenMapSource = Boolean(detail.mapUrl);

  const onPressCall = () => openExternalUrl(`tel:${detail.phone}`);
  const onPressDirections = () => {
    openExternalUrl(buildGoogleMapsDirectionUrl(detail));
  };

  const onPressWebsite = () => {
    const website = String(detail.website || '').trim();
    if (!website) return;

    if (website.startsWith('http://') || website.startsWith('https://')) {
      openExternalUrl(website);
      return;
    }

    openExternalUrl(`https://${website}`);
  };

  const onPressMapSource = () => {
    if (!detail.mapUrl) return;
    openExternalUrl(detail.mapUrl);
  };

  const metrics = [
    detail.type ? { key: 'type', label: 'Loại', value: detail.type } : null,
    detail.distance ? { key: 'distance', label: 'Cách bạn', value: detail.distance } : null,
    detail.rating
      ? {
          key: 'rating',
          label: 'Đánh giá',
          value: Number.isFinite(detail.reviewsCount)
            ? `${detail.rating} (${detail.reviewsCount})`
            : String(detail.rating)
        }
      : null
  ].filter(Boolean);

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết địa điểm</Text>
      </View>

      <Card style={[styles.card, styles.heroCard]}>
        <Text style={styles.heroLabel}>Địa điểm dịch vụ</Text>
        {detail.status ? (
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{detail.status}</Text>
          </View>
        ) : null}
        <Text style={styles.placeName}>{detail.name}</Text>

        {metrics.length > 0 ? (
          <View style={styles.metricsRow}>
            {metrics.map((item) => (
              <View key={item.key} style={styles.metricChip}>
                <Text style={styles.metricLabel}>{item.label}</Text>
                <Text style={styles.metricValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </Card>

      <View style={styles.actionsRow}>
        <ActionButton icon="call" label="Gọi" onPress={onPressCall} disabled={!canCall} />
        <ActionButton icon="navigate" label="Chỉ đường" onPress={onPressDirections} disabled={!canNavigate} />
        <ActionButton icon="globe" label="Website" onPress={onPressWebsite} disabled={!canOpenWebsite} />
        <ActionButton icon="map-outline" label="Nguồn" onPress={onPressMapSource} disabled={!canOpenMapSource} primary />
      </View>

      {overviewRows.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>THÔNG TIN CHÍNH</Text>
          <Card style={styles.card}>
            {overviewRows.map((row, index) => (
              <ListRow
                key={row.key}
                title={row.title}
                subtitle={row.value}
                style={index === overviewRows.length - 1 ? styles.lastRow : null}
              />
            ))}
          </Card>
        </>
      ) : null}

      {(detail.phone || detail.email || detail.website) ? (
        <>
          <Text style={styles.sectionLabel}>LIÊN HỆ</Text>
          <Card style={styles.card}>
            {detail.phone ? <ListRow title="Điện thoại" subtitle={detail.phone} /> : null}
            {detail.email ? <ListRow title="Email" subtitle={detail.email} /> : null}
            {detail.website ? <ListRow title="Website" subtitle={detail.website} style={styles.lastRow} /> : null}
          </Card>
        </>
      ) : null}

      {locationRows.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>VỊ TRÍ</Text>
          <Card style={styles.card}>
            {locationRows.map((row, index) => (
              <ListRow
                key={row.key}
                title={row.title}
                subtitle={row.value}
                style={index === locationRows.length - 1 ? styles.lastRow : null}
              />
            ))}
          </Card>
        </>
      ) : null}

      {sourceRows.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>NGUỒN DỮ LIỆU</Text>
          <Card style={styles.card}>
            {sourceRows.map((row, index) => (
              <ListRow
                key={row.key}
                title={row.title}
                subtitle={row.value}
                style={index === sourceRows.length - 1 ? styles.lastRow : null}
              />
            ))}
          </Card>
        </>
      ) : null}

      {services.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>DỊCH VỤ</Text>
          <Card style={styles.card}>
            {services.map((service, index) => (
              <ListRow
                key={service.id}
                title={service.title}
                subtitle={service.subtitle}
                right={<Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />}
                style={index === services.length - 1 ? styles.lastRow : null}
              />
            ))}
          </Card>
        </>
      ) : null}

      {reviews.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>ĐÁNH GIÁ</Text>
          <Card style={styles.card}>
            {reviews.map((review, index) => (
              <View key={review.id} style={[styles.reviewRow, index === reviews.length - 1 && styles.lastRow]}>
                <Text style={styles.reviewName}>{review.name}</Text>
                <Text style={styles.reviewDate}>{review.date}</Text>
                <View style={styles.stars}>
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Ionicons key={`star-${review.id}-${starIndex}`} name="star" size={14} color={theme.colors.warning} />
                  ))}
                </View>
                <Text style={styles.reviewText}>{review.comment}</Text>
              </View>
            ))}
          </Card>
        </>
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
    alignItems: 'center',
    marginBottom: theme.spacing.md
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backText: {
    color: theme.colors.primary,
    marginLeft: 6,
    fontWeight: '600'
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...theme.typography.h3,
    marginRight: 28
  },
  card: {
    marginTop: theme.spacing.md
  },
  heroCard: {
    backgroundColor: '#F6FAFF'
  },
  heroLabel: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: 8
  },
  statusBadge: {
    position: 'absolute',
    right: 18,
    top: 18,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  statusText: {
    color: theme.colors.success,
    fontWeight: '600'
  },
  placeName: {
    ...theme.typography.h2,
    color: theme.colors.text
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md
  },
  metricChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#FFFFFF'
  },
  metricLabel: {
    ...theme.typography.small,
    color: theme.colors.textLight
  },
  metricValue: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '700',
    marginTop: 2
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md
  },
  actionButton: {
    width: '48.5%',
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  actionDisabled: {
    opacity: 0.45
  },
  actionPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  actionText: {
    marginTop: 6,
    color: theme.colors.text,
    fontWeight: '600'
  },
  actionTextPrimary: {
    color: '#FFFFFF'
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    letterSpacing: 1.4,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    fontWeight: '600'
  },
  lastRow: {
    borderBottomWidth: 0
  },
  reviewRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: 12
  },
  reviewName: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  reviewDate: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    position: 'absolute',
    right: 0,
    top: 12
  },
  stars: {
    flexDirection: 'row',
    marginTop: 6
  },
  reviewText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: 8
  }
});

export default PlaceDetailScreen;



