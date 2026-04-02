import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { petDetail, petQuickActions } from '../data/pets';
import { useAppData } from '../context/AppDataContext';

const PetDetailScreen = ({ navigation, route }) => {
  const { getPetById, journalEntries } = useAppData();
  const selectedPet = getPetById(route?.params?.petId) || petDetail;
  const petLogs = journalEntries.filter((entry) => entry.pet === selectedPet.name);
  const analysisLogs = petLogs.filter(
    (entry) => entry.category === 'Sức khỏe' || entry.title.toLowerCase().includes('triệu chứng')
  );

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedPet.name}</Text>
      </View>

      <Card style={styles.profileCard}>
        <Image source={{ uri: selectedPet.imageUrl }} style={styles.petImage} resizeMode="cover" />
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{selectedPet.name}</Text>
          <Text style={styles.petMeta}>{selectedPet.breed}</Text>
          <Text style={styles.petMeta}>{selectedPet.gender} • {selectedPet.age}</Text>
          <Text style={styles.petMeta}>Cân nặng: {selectedPet.weight}</Text>
        </View>
      </Card>

      <Text style={styles.sectionLabel}>THAO TÁC NHANH</Text>
      <Card style={styles.card}>
        {petQuickActions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            onPress={() => {
              if (action.id === 'log') navigation.navigate('PetNewLog', { preselectedPetId: selectedPet.id });
              if (action.id === 'reminder') navigation.navigate('Tabs', { screen: 'Reminders' });
              if (action.id === 'vaccine') navigation.navigate('PetVaccines');
            }}
            style={[styles.actionRow, index === petQuickActions.length - 1 && styles.lastRow]}
          >
            <View style={styles.actionIcon}>
              <Ionicons name={action.icon} size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />
          </TouchableOpacity>
        ))}
      </Card>

      <Text style={styles.sectionLabel}>NHẬT KÝ LIÊN QUAN</Text>
      <Card style={styles.card}>
        {analysisLogs.length > 0 ? (
          <View style={styles.logGroup}>
            <Text style={styles.logGroupTitle}>Kết quả phân tích gần đây</Text>
            {analysisLogs.slice(0, 2).map((entry, index) => (
              <View key={entry.id} style={[styles.logRow, index === analysisLogs.slice(0, 2).length - 1 && styles.lastRow]}>
                <Text style={styles.logTitle}>{entry.title}</Text>
                <Text style={styles.logMeta}>{entry.date}</Text>
                <Text style={styles.logNote}>{entry.note}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {petLogs.length > 0 ? (
          <View style={styles.logGroup}>
            <Text style={styles.logGroupTitle}>Nhật ký của {selectedPet.name}</Text>
            {petLogs.slice(0, 4).map((entry, index) => (
              <View key={`pet-${entry.id}`} style={[styles.logRow, index === petLogs.slice(0, 4).length - 1 && styles.lastRow]}>
                <Text style={styles.logTitle}>{entry.title}</Text>
                <Text style={styles.logMeta}>{entry.date}</Text>
                <Text style={styles.logNote}>{entry.note}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyLogWrap}>
            <Text style={styles.emptyLogText}>Chưa có nhật ký cho thú cưng này.</Text>
          </View>
        )}

        <TouchableOpacity style={[styles.actionRow, styles.logAction]} onPress={() => navigation.navigate('Tabs', { screen: 'Journal' })}>
          <View style={styles.actionIcon}>
            <Ionicons name="document-text" size={18} color={theme.colors.primary} />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionTitle}>Xem tất cả nhật ký</Text>
            <Text style={styles.actionSubtitle}>Mở danh sách nhật ký chi tiết</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />
        </TouchableOpacity>
      </Card>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  petImage: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginRight: 16
  },
  petInfo: {
    flex: 1
  },
  petName: {
    ...theme.typography.h2,
    color: theme.colors.text
  },
  petMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 6
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    letterSpacing: 1.4,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    fontWeight: '600'
  },
  card: {
    padding: 0
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionText: {
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
  lastRow: {
    borderBottomWidth: 0
  },
  logGroup: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg
  },
  logGroupTitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: 10,
    fontWeight: '600'
  },
  logRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 10,
    marginBottom: 10
  },
  logTitle: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  logMeta: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    marginTop: 4
  },
  logNote: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: 6
  },
  emptyLogWrap: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg
  },
  emptyLogText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  logAction: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    borderBottomWidth: 0
  }
});

export default PetDetailScreen;




