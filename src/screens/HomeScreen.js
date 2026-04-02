import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const HomeScreen = ({ navigation }) => {
  const { pets, journalEntries, communityPosts } = useAppData();
  const reviewCount = communityPosts.filter((post) => post.category === 'Review').length;

  return (
    <Screen contentContainerStyle={styles.container}>
      <Text style={styles.title}>Trang chủ</Text>
      <Text style={styles.subtitle}>Tổng quan chăm sóc thú cưng của bạn hôm nay.</Text>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{pets.length}</Text>
          <Text style={styles.statLabel}>Thú cưng</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{journalEntries.length}</Text>
          <Text style={styles.statLabel}>Nhật ký</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{reviewCount}</Text>
          <Text style={styles.statLabel}>Bài review</Text>
        </Card>
      </View>

      <Text style={styles.sectionLabel}>THAO TÁC NHANH</Text>
      <Card style={styles.actionCard}>
        <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('PetNew')}>
          <View style={styles.actionIcon}>
            <Ionicons name="paw" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Thêm thú cưng</Text>
            <Text style={styles.actionSubtitle}>Tạo hồ sơ thú cưng mới</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionRow, styles.actionDivider]}
          onPress={() => navigation.navigate('SymptomStep1')}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="medkit" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Kiểm tra triệu chứng</Text>
            <Text style={styles.actionSubtitle}>Ghi nhận triệu chứng và lưu nhật ký</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionRow, styles.actionDivider]}
          onPress={() => navigation.navigate('Tabs', { screen: 'Journal' })}
        >
          <View style={styles.actionIcon}>
            <Ionicons name="document-text" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.actionTextWrap}>
            <Text style={styles.actionTitle}>Xem nhật ký</Text>
            <Text style={styles.actionSubtitle}>Theo dõi các bản ghi gần đây</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />
        </TouchableOpacity>
      </Card>

      <Text style={styles.sectionLabel}>CỘNG ĐỒNG</Text>
      <Card>
        <Text style={styles.communityText}>Bạn có {communityPosts.length} bài trong cộng đồng, trong đó {reviewCount} bài review.</Text>
        <TouchableOpacity style={styles.communityButton} onPress={() => navigation.navigate('Community')}>
          <Text style={styles.communityButtonText}>Đến Cộng đồng</Text>
        </TouchableOpacity>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 8
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.lg
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginRight: 8
  },
  statValue: {
    ...theme.typography.h2,
    color: theme.colors.text
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    letterSpacing: 1.4,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    fontWeight: '600'
  },
  actionCard: {
    padding: 0
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg
  },
  actionDivider: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionTextWrap: {
    flex: 1,
    marginLeft: 12
  },
  actionTitle: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  actionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4
  },
  communityText: {
    ...theme.typography.bodyRegular,
    color: theme.colors.text
  },
  communityButton: {
    marginTop: theme.spacing.md,
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  communityButtonText: {
    color: theme.colors.primary,
    fontWeight: '700'
  }
});

export default HomeScreen;
