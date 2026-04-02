import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const JournalDetailScreen = ({ navigation, route }) => {
  const { journalEntries } = useAppData();
  const routeEntry = route?.params?.entry || null;
  const entryId = route?.params?.entryId;

  const entry = useMemo(() => {
    if (routeEntry?.id) {
      return journalEntries.find((item) => item.id === routeEntry.id) || routeEntry;
    }

    if (!entryId) return null;
    return journalEntries.find((item) => item.id === entryId) || null;
  }, [entryId, journalEntries, routeEntry]);

  if (!entry) {
    return (
      <Screen contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết nhật ký</Text>
        </View>
        <Card style={styles.card}>
          <Text style={styles.emptyText}>Không tìm thấy bản ghi nhật ký.</Text>
        </Card>
      </Screen>
    );
  }

  const aiRawResponse =
    typeof entry.aiRawResponse === 'string' && entry.aiRawResponse.trim()
      ? entry.aiRawResponse
      : entry.note || '';
  const symptomSnapshot = entry.symptomSnapshot || null;
  const symptoms = Array.isArray(symptomSnapshot?.symptoms) ? symptomSnapshot.symptoms : [];

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết nhật ký</Text>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>Triệu chứng đã nhập</Text>
        <Text style={styles.note}>{symptoms.length > 0 ? symptoms.join(', ') : 'Chưa có dữ liệu triệu chứng.'}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>Phản hồi từ AI</Text>
        <Text style={styles.note}>{aiRawResponse || 'Chưa có phản hồi từ AI.'}</Text>
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    ...theme.typography.h3,
    marginRight: 28
  },
  card: {
    marginTop: theme.spacing.md
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: 8,
    fontWeight: '700'
  },
  note: {
    ...theme.typography.caption,
    color: theme.colors.text,
    lineHeight: 20
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  }
});

export default JournalDetailScreen;
