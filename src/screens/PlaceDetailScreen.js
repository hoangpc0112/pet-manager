import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import ListRow from '../components/ListRow';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import theme from '../theme';
import { placeDetail } from '../data/place';

const ActionButton = ({ icon, label, primary }) => {
  return (
    <TouchableOpacity style={[styles.actionButton, primary && styles.actionPrimary]}>
      <Ionicons name={icon} size={18} color={primary ? '#FFFFFF' : theme.colors.text} />
      <Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{label}</Text>
    </TouchableOpacity>
  );
};

const PlaceDetailScreen = ({ navigation, route }) => {
  const detail = route?.params?.place || placeDetail;

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết địa điểm</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.tag}>{detail.type}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{detail.status}</Text>
        </View>
        <Text style={styles.placeName}>{detail.name}</Text>
        <View style={styles.infoRow}>
          <Ionicons name="location" size={14} color={theme.colors.textLight} />
          <Text style={styles.infoText}>{detail.address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={14} color={theme.colors.textLight} />
          <Text style={styles.infoText}>{detail.hours}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="star" size={14} color={theme.colors.warning} />
          <Text style={styles.infoText}>{detail.rating} ({detail.reviewsCount} đánh giá)</Text>
        </View>
      </Card>

      <View style={styles.actionsRow}>
        <ActionButton icon="call" label="Gọi" />
        <ActionButton icon="navigate" label="Chỉ đường" />
      </View>
      <View style={styles.actionsRow}>
        <ActionButton icon="bookmark" label="Lưu" />
        <ActionButton icon="calendar" label="Đặt lịch" primary />
      </View>

      <Text style={styles.sectionLabel}>DỊCH VỤ</Text>
      <Card style={styles.card}>
        {detail.services.map((service, index) => (
          <ListRow
            key={service.id}
            title={service.title}
            subtitle={service.subtitle}
            right={<Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />}
            style={index === detail.services.length - 1 ? styles.lastRow : null}
          />
        ))}
      </Card>

      <Text style={styles.sectionLabel}>ĐÁNH GIÁ</Text>
      <Card style={styles.card}>
        {detail.reviews.map((review, index) => (
          <View key={review.id} style={[styles.reviewRow, index === detail.reviews.length - 1 && styles.lastRow]}>
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

      <PrimaryButton label="Đặt lịch" onPress={() => {}} style={styles.primaryButton} />
      <GhostButton label="Gọi" onPress={() => {}} />
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
  tag: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    textTransform: 'uppercase',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginLeft: 8
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.card,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: theme.colors.border
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
  },
  primaryButton: {
    marginTop: theme.spacing.lg
  },
  loading: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md
  }
});

export default PlaceDetailScreen;



