import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const getStatusStyle = (status) => {
  if (status === 'overdue') {
    return {
      accent: '#EF4444',
      badgeBg: '#FEE2E2',
      badgeText: '#EF4444'
    };
  }
  return {
    accent: '#10B981',
    badgeBg: '#DCFCE7',
    badgeText: '#10B981'
  };
};

const PetVaccinesScreen = ({ navigation }) => {
  const { vaccinationTabs, vaccinations } = useAppData();
  const tabs = vaccinationTabs || [];
  const vaccineItems = vaccinations || [];

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch tiêm của Luna</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab, index) => (
          <TouchableOpacity key={tab} style={[styles.tab, index === 0 && styles.tabActive]}>
            <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {vaccineItems.map((item) => {
        const status = getStatusStyle(item.status);
        return (
          <Card key={item.id} style={styles.card}>
            <View style={[styles.accentBar, { backgroundColor: status.accent }]} />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <View style={[styles.dot, { backgroundColor: status.accent }]} />
                  <Text style={styles.cardTitle}>{item.name}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: status.badgeBg }]}>
                  <Text style={[styles.badgeText, { color: status.badgeText }]}>{item.statusLabel}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Ngày tiêm</Text>
                <Text style={styles.value}>{item.doneDate}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, item.status === 'overdue' && styles.labelDanger]}>Lần kế tiếp</Text>
                <Text style={[styles.value, item.status === 'overdue' && styles.valueDanger]}>{item.nextDate}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Phòng khám</Text>
                <Text style={styles.value}>{item.clinic}</Text>
              </View>
              {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 120
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
    ...theme.typography.h3
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    padding: 4,
    marginBottom: theme.spacing.lg
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12
  },
  tabActive: {
    backgroundColor: '#FFFFFF'
  },
  tabText: {
    ...theme.typography.caption,
    color: theme.colors.textLight
  },
  tabTextActive: {
    color: theme.colors.text,
    fontWeight: '600'
  },
  card: {
    padding: 0,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden'
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4
  },
  cardContent: {
    padding: theme.spacing.lg
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10
  },
  cardTitle: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999
  },
  badgeText: {
    fontWeight: '600',
    fontSize: 12
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  value: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600'
  },
  labelDanger: {
    color: theme.colors.danger
  },
  valueDanger: {
    color: theme.colors.danger
  },
  note: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 12
  }
});

export default PetVaccinesScreen;




