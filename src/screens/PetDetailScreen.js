import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const parseVnDateToMs = (value) => {
  if (!value || typeof value !== 'string') return Number.MAX_SAFE_INTEGER;
  const parts = value.split('/').map((item) => Number.parseInt(item, 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) return Number.MAX_SAFE_INTEGER;
  const [day, month, year] = parts;
  const parsed = new Date(year, month - 1, day).getTime();
  return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
};

const PetDetailScreen = ({ navigation, route }) => {
  const { getPetById, journalEntries, pets, petQuickActions, deletePet } = useAppData();
  const quickActions = petQuickActions || [];
  const selectedPet = getPetById(route?.params?.petId) || pets[0] || null;
  const speciesDetail = selectedPet?.species === 'other' ? selectedPet?.speciesDetail : '';

  if (!selectedPet) {
    return (
      <Screen contentContainerStyle={styles.container}>
        <Text style={styles.sectionLabel}>Chưa có thú cưng nào.</Text>
      </Screen>
    );
  }

  const petLogs = journalEntries.filter((entry) => entry.pet === selectedPet.name);
  const analysisLogs = petLogs.filter(
    (entry) => entry.category === 'Sức khỏe' || entry.title.toLowerCase().includes('triệu chứng')
  );

  const petVaccinations = Array.isArray(selectedPet.vaccinations) ? selectedPet.vaccinations : [];
  const upcomingVaccinations = petVaccinations
    .filter((item) => item.status === 'pending' || item.status === 'overdue' || Boolean(item.nextDate))
    .sort((a, b) => parseVnDateToMs(a.nextDate) - parseVnDateToMs(b.nextDate))
    .slice(0, 4);

  const recentAnalysisLogs = analysisLogs.slice(0, 2);
  const recentPetLogs = petLogs.slice(0, 4);
  const analysisIds = new Set(recentAnalysisLogs.map((entry) => entry.id));
  const recentGeneralLogs = recentPetLogs.filter((entry) => !analysisIds.has(entry.id));
  const journalPreview = [
    ...recentAnalysisLogs.map((entry) => ({ ...entry, source: 'analysis' })),
    ...recentGeneralLogs.map((entry) => ({ ...entry, source: 'journal' }))
  ].slice(0, 4);

  const handleQuickActionPress = (actionId) => {
    if (actionId === 'log') navigation.navigate('PetNewLog', { preselectedPetId: selectedPet.id });
    if (actionId === 'reminder') {
      navigation.navigate('ReminderNew', { preselectedPetId: selectedPet.id });
    }
    if (actionId === 'vaccine') navigation.navigate('PetVaccines', { petId: selectedPet.id });
  };

  const handleDelete = () => {
    Alert.alert('Xóa thú cưng', 'Bạn có chắc muốn xóa thú cưng này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          const removed = deletePet(selectedPet.id);
          if (!removed) {
            Alert.alert('Không thể xóa', 'Không tìm thấy thú cưng cần xóa.');
            return;
          }
          navigation.navigate('Tabs', { screen: 'Pets' });
        }
      }
    ]);
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết thú cưng</Text>
        <TouchableOpacity
          style={styles.iconCircle}
          onPress={() => navigation.navigate('PetEdit', { petId: selectedPet.id })}
        >
          <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <Card style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <Image source={{ uri: selectedPet.imageUrl }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{selectedPet.name}</Text>
            <Text style={styles.heroBreed}>{selectedPet.breed}</Text>
            <Text style={styles.heroHint}>Thông tin chăm sóc mới nhất</Text>
          </View>
        </View>

        <View style={styles.metaChipRow}>
          <View style={styles.metaChip}>
            <Ionicons name="male-female-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.metaChipText}>{selectedPet.gender}</Text>
          </View>
          {speciesDetail ? (
            <View style={styles.metaChip}>
              <Ionicons name="paw-outline" size={14} color={theme.colors.primary} />
              <Text style={styles.metaChipText}>{speciesDetail}</Text>
            </View>
          ) : null}
          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.metaChipText}>{selectedPet.age}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="barbell-outline" size={14} color={theme.colors.primary} />
            <Text style={styles.metaChipText}>{selectedPet.weight}</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionLabel}>THAO TÁC NHANH</Text>
      <View style={styles.quickGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => handleQuickActionPress(action.id)}
            style={styles.quickTile}
            activeOpacity={0.9}
          >
            <View style={styles.quickTileIcon}>
              <Ionicons name={action.icon} size={18} color={theme.colors.primary} />
            </View>
            <Text style={styles.quickTileTitle}>{action.title}</Text>
            <Text style={styles.quickTileSubtitle} numberOfLines={2}>{action.subtitle}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => navigation.navigate('SymptomStep1', { preselectedPetId: selectedPet.id })}
          style={styles.quickTile}
          activeOpacity={0.9}
        >
          <View style={styles.quickTileIcon}>
            <Ionicons name="medkit-outline" size={18} color={theme.colors.primary} />
          </View>
          <Text style={styles.quickTileTitle}>Kiểm tra triệu chứng</Text>
          <Text style={styles.quickTileSubtitle} numberOfLines={2}>Đánh giá nhanh sức khỏe thú cưng</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>NHẬT KÝ LIÊN QUAN</Text>
      <View style={styles.sectionBlock}>
        {journalPreview.length > 0 ? (
          journalPreview.map((entry) => (
            <View key={`journal-${entry.id}`} style={styles.streamCard}>
              <View style={[styles.streamAccent, entry.source === 'analysis' ? styles.streamAccentAlert : styles.streamAccentInfo]} />
              <View style={styles.streamBody}>
                <View style={styles.streamTopRow}>
                  <Text style={styles.streamTitle} numberOfLines={1}>{entry.title}</Text>
                  <Text style={styles.streamMeta}>{entry.date}</Text>
                </View>
                <Text style={styles.streamNote} numberOfLines={2}>{entry.note}</Text>
                <View style={[styles.streamTag, entry.source === 'analysis' ? styles.streamTagAlert : styles.streamTagNormal]}>
                  <Text style={[styles.streamTagText, entry.source === 'analysis' ? styles.streamTagTextAlert : styles.streamTagTextNormal]}>
                    {entry.source === 'analysis' ? 'Phân tích' : 'Nhật ký'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Chưa có nhật ký cho thú cưng này.</Text>
          </View>
        )}

        <TouchableOpacity style={styles.sectionActionButton} onPress={() => navigation.navigate('Tabs', { screen: 'Journal' })}>
          <Text style={styles.sectionActionText}>Xem tất cả nhật ký</Text>
          <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>MŨI TIÊM SẮP TỚI</Text>
      <View style={styles.sectionBlock}>
        {upcomingVaccinations.length > 0 ? (
          upcomingVaccinations.map((item) => (
            <View key={`vac-${item.id}`} style={styles.streamCard}>
              <View
                style={[
                  styles.streamAccent,
                  item.status === 'overdue' ? styles.streamAccentDanger : styles.streamAccentHealthy
                ]}
              />
              <View style={styles.streamBody}>
                <View style={styles.streamTopRow}>
                  <Text style={styles.streamTitle}>{item.name}</Text>
                  <View
                    style={[
                      styles.vaccineStatusBadge,
                      item.status === 'pending' && styles.vaccineStatusPending,
                      item.status === 'overdue' && styles.vaccineStatusOverdue,
                      item.status === 'done' && styles.vaccineStatusDone
                    ]}
                  >
                    <Text style={styles.vaccineStatusText}>{item.statusLabel || 'Chưa tiêm'}</Text>
                  </View>
                </View>
                <Text style={styles.streamMeta}>Lịch tiêm: {item.nextDate || 'Chưa đặt lịch'}</Text>
                <Text style={styles.streamMeta}>Ngày đã tiêm: {item.doneDate || 'Chưa tiêm'}</Text>
                {item.note ? <Text style={styles.streamNote} numberOfLines={2}>{item.note}</Text> : null}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Chưa có mũi tiêm sắp tới.</Text>
          </View>
        )}

        <TouchableOpacity style={styles.sectionActionButton} onPress={() => navigation.navigate('PetVaccines', { petId: selectedPet.id })}>
          <Text style={styles.sectionActionText}>Xem tất cả mũi tiêm</Text>
          <Ionicons name="arrow-forward" size={14} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
        <Text style={styles.deleteButtonText}>Xóa thú cưng</Text>
      </TouchableOpacity>
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
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.card
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text
  },
  heroCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  heroImage: {
    width: 96,
    height: 96,
    borderRadius: 24,
    marginRight: 14
  },
  heroInfo: {
    flex: 1
  },
  heroName: {
    ...theme.typography.h2,
    color: theme.colors.text
  },
  heroBreed: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginTop: 2
  },
  heroHint: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 6
  },
  metaChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: '#EEF4FF',
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  metaChipText: {
    ...theme.typography.small,
    color: theme.colors.text,
    marginLeft: 6,
    fontWeight: '600'
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    letterSpacing: 1.4,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    fontWeight: '600'
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10
  },
  quickTile: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card
  },
  quickTileIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  quickTileTitle: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '700'
  },
  quickTileSubtitle: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginTop: 4
  },
  sectionBlock: {
    marginBottom: theme.spacing.md
  },
  streamCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card
  },
  streamAccent: {
    width: 6
  },
  streamAccentAlert: {
    backgroundColor: '#F59E0B'
  },
  streamAccentInfo: {
    backgroundColor: '#1677FF'
  },
  streamAccentHealthy: {
    backgroundColor: '#22C55E'
  },
  streamAccentDanger: {
    backgroundColor: '#EF4444'
  },
  streamBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  streamTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  streamTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1
  },
  streamMeta: {
    ...theme.typography.small,
    color: theme.colors.textLight
  },
  streamNote: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 6
  },
  streamTag: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 8
  },
  streamTagNormal: {
    backgroundColor: '#EEF4FF'
  },
  streamTagAlert: {
    backgroundColor: '#FEF3C7'
  },
  streamTagText: {
    ...theme.typography.small,
    fontWeight: '700'
  },
  streamTagTextNormal: {
    color: '#0F4AA1'
  },
  streamTagTextAlert: {
    color: '#92400E'
  },
  deleteButton: {
    marginTop: theme.spacing.lg,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteButtonText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    fontWeight: '700',
    marginLeft: 6
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  sectionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 4
  },
  sectionActionText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
    marginRight: 4
  },
  vaccineStatusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  vaccineStatusPending: {
    backgroundColor: '#FEF3C7'
  },
  vaccineStatusOverdue: {
    backgroundColor: '#FEE2E2'
  },
  vaccineStatusDone: {
    backgroundColor: '#DCFCE7'
  },
  vaccineStatusText: {
    ...theme.typography.small,
    color: theme.colors.text,
    fontWeight: '700'
  }
});

export default PetDetailScreen;




