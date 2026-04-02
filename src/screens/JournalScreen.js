import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const JournalScreen = () => {
  const { journalEntries } = useAppData();
  const summary = {
    month: 'Tháng hiện tại',
    total: journalEntries.length,
    highlight: `${journalEntries.length} bản ghi đã lưu`
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Nhật ký</Text>
      </View>

      <Card style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>{summary.month}</Text>
          <Text style={styles.summaryValue}>{summary.total} bản ghi</Text>
          <Text style={styles.summaryHint}>{summary.highlight}</Text>
        </View>
        <Ionicons name="bar-chart" size={22} color={theme.colors.primary} />
      </Card>

      <Text style={styles.sectionLabel}>GẦN ĐÂY</Text>
      {journalEntries.map((entry) => (
        <Card key={entry.id} style={styles.entryCard}>
          <Text style={styles.entryTitle}>{entry.title}</Text>
          <Text style={styles.entryMeta}>{entry.pet} • {entry.date}</Text>
          <Text style={styles.entryNote}>{entry.note}</Text>
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
  summaryHint: {
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
  entryCard: {
    marginBottom: theme.spacing.md
  },
  entryTitle: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  entryMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 6
  },
  entryNote: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: 10
  }
});

export default JournalScreen;
