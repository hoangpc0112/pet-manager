import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { reminderItems, reminderSummary } from '../data/reminders';

const RemindersScreen = () => {
  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Nhắc nhở</Text>
      </View>

      <Card style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>{reminderSummary.today}</Text>
          <Text style={styles.summaryValue}>
            {`${reminderSummary.count} lịch sắp tới`}
          </Text>
        </View>
        <Ionicons name="notifications" size={22} color={theme.colors.primary} />
      </Card>

      <Text style={styles.sectionLabel}>LỊCH HÀNG NGÀY</Text>
      {reminderItems.map((item) => (
        <Card key={item.id} style={styles.reminderCard}>
          <View style={styles.row}>
            <View>
              <Text style={styles.reminderTitle}>{item.title}</Text>
              <Text style={styles.reminderMeta}>{item.pet} • {item.repeat}</Text>
            </View>
            <View style={styles.toggle}>
              <View style={[styles.toggleKnob, item.enabled && styles.toggleOn]} />
            </View>
          </View>
          <Text style={styles.reminderTime}>{item.time}</Text>
        </Card>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginLeft: 8
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg
  },
  summaryLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight
  },
  summaryValue: {
    ...theme.typography.h3,
    color: theme.colors.text,
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
  reminderCard: {
    marginBottom: theme.spacing.md
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  reminderTitle: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  reminderMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 6
  },
  reminderTime: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: 10
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E5E7EB',
    padding: 4,
    alignItems: 'flex-start'
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF'
  },
  toggleOn: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.primary
  }
});

export default RemindersScreen;
