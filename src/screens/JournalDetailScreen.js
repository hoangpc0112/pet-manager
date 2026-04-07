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
  const entrySource = entry.source
    ? entry.source
    : entry.symptomSnapshot || entry.aiRawResponse
      ? 'symptom'
      : 'manual';
  const entrySourceLabel = entrySource === 'symptom' ? 'Phân tích triệu chứng' : 'Nhật ký thủ công';

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết nhật ký</Text>
      </View>

      <Card style={styles.card}>
        <View style={styles.infoHeader}>
          <Text style={styles.infoTitle}>{entry.title}</Text>
          <View style={styles.sourcePill}>
            <Text style={styles.sourcePillText}>{entrySourceLabel}</Text>
          </View>
        </View>
        <Text style={styles.metaText}>{entry.pet} • {entry.date}</Text>
        <Text style={styles.metaText}>Danh mục: {entry.category || 'Khác'}</Text>
      </Card>

      {entrySource === 'manual' ? (
        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>Ghi chú</Text>
          <Text style={styles.note}>{entry.note || 'Chưa có ghi chú.'}</Text>
        </Card>
      ) : (
        <>
          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>Triệu chứng đã nhập</Text>
            <Text style={styles.note}>
              {symptoms.length > 0 ? symptoms.join(', ') : 'Chưa có dữ liệu triệu chứng.'}
            </Text>
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionLabel}>Phản hồi từ AI</Text>
            <Text style={styles.note}>{aiRawResponse || 'Chưa có phản hồi từ AI.'}</Text>
          </Card>
        </>
      )}
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
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  infoTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm
  },
  sourcePill: {
    borderRadius: 999,
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6
  },
  sourcePillText: {
    ...theme.typography.small,
    color: theme.colors.primary,
    fontWeight: '700'
  },
  metaText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 8
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
