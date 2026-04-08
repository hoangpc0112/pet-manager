import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PaginationControls from '../components/PaginationControls';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';
import { getCollectionPage } from '../services/firestore';

const PAGE_SIZE = 5;
const ALL_PETS_FILTER = 'ALL';
const SUMMARY_MAX_CHARS = 120;

const getEntryTimestamp = (entry) => {
  if (typeof entry?.createdAt === 'number') return entry.createdAt;

  const rawDate = `${entry?.date || ''}`.trim();
  const dateMatch = rawDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dateMatch) {
    const day = Number(dateMatch[1]);
    const month = Number(dateMatch[2]) - 1;
    const year = Number(dateMatch[3]);
    return new Date(year, month, day).getTime();
  }

  const parsed = Date.parse(rawDate);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sortEntriesClosestToNow = (entries = []) => {
  const now = Date.now();
  return [...entries].sort((a, b) => {
    const distanceA = Math.abs(now - getEntryTimestamp(a));
    const distanceB = Math.abs(now - getEntryTimestamp(b));
    return distanceA - distanceB;
  });
};

const summarizeEntry = (entry) => {
  const source = `${entry?.note || ''}`.replace(/\s+/g, ' ').trim();
  if (!source) return '...';
  if (source.length <= SUMMARY_MAX_CHARS) return `${source}...`;
  return `${source.slice(0, SUMMARY_MAX_CHARS).trim()}...`;
};

const getEntrySourceLabel = (entry) => {
  if (entry?.source === 'manual') return 'Nhập tay';
  if (entry?.source === 'symptom') return 'Phân tích triệu chứng';
  if (entry?.symptomSnapshot || entry?.aiRawResponse) return 'Phân tích triệu chứng';
  return 'Nhập tay';
};

const JournalScreen = ({ navigation }) => {
  const { journalEntries, deleteJournalEntry, pets, journalCollectionName } = useAppData();
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPetFilter, setSelectedPetFilter] = useState(ALL_PETS_FILTER);
  const [showPetFilterModal, setShowPetFilterModal] = useState(false);
  const [pageEntries, setPageEntries] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(false);

  const pageDataCacheRef = useRef({});
  const pageStartCursorRef = useRef({ 1: null });

  const petFilterOptions = useMemo(() => {
    const names = Array.from(new Set((pets || []).map((pet) => pet.name).filter(Boolean)));
    return [ALL_PETS_FILTER, ...names];
  }, [pets]);

  useEffect(() => {
    if (selectedPetFilter !== ALL_PETS_FILTER && !petFilterOptions.includes(selectedPetFilter)) {
      setSelectedPetFilter(ALL_PETS_FILTER);
      setCurrentPage(1);
    }
  }, [selectedPetFilter, petFilterOptions]);

  const filteredEntries = useMemo(() => {
    if (selectedPetFilter === ALL_PETS_FILTER) return sortEntriesClosestToNow(journalEntries);
    return sortEntriesClosestToNow(journalEntries.filter((entry) => entry.pet === selectedPetFilter));
  }, [journalEntries, selectedPetFilter]);

  const filteredPageEntries = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEntries.slice(start, start + PAGE_SIZE);
  }, [filteredEntries, currentPage]);

  const visibleEntries = selectedPetFilter === ALL_PETS_FILTER ? pageEntries : filteredPageEntries;

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
    pageDataCacheRef.current = {};
    pageStartCursorRef.current = { 1: null };
  }, [journalEntries, selectedPetFilter, totalPages]);

  const loadPage = async (targetPage) => {
    if (pageDataCacheRef.current[targetPage]) {
      setPageEntries(pageDataCacheRef.current[targetPage]);
      return;
    }

    setIsPageLoading(true);
    try {
      for (let page = 1; page < targetPage; page += 1) {
        if (pageStartCursorRef.current[page + 1] !== undefined) {
          continue;
        }

        const result = await getCollectionPage({
          collectionName: journalCollectionName,
          pageSize: PAGE_SIZE,
          cursor: pageStartCursorRef.current[page],
          orderByField: 'createdAt',
          orderDirection: 'desc'
        });

        pageDataCacheRef.current[page] = result.docs;
        pageStartCursorRef.current[page + 1] = result.nextCursor;
      }

      const result = await getCollectionPage({
        collectionName: journalCollectionName,
        pageSize: PAGE_SIZE,
        cursor: pageStartCursorRef.current[targetPage],
        orderByField: 'createdAt',
        orderDirection: 'desc'
      });

      pageDataCacheRef.current[targetPage] = result.docs;
      pageStartCursorRef.current[targetPage + 1] = result.nextCursor;
      setPageEntries(result.docs);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to load journal page:', error);
      setPageEntries([]);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });

    if (filteredEntries.length === 0) {
      setPageEntries([]);
      return;
    }

    if (selectedPetFilter !== ALL_PETS_FILTER) {
      setPageEntries(filteredPageEntries);
      return;
    }

    if (!journalCollectionName) {
      setPageEntries([]);
      return;
    }

    loadPage(currentPage);
  }, [
    currentPage,
    journalCollectionName,
    journalEntries,
    selectedPetFilter,
    filteredEntries.length,
    filteredPageEntries
  ]);

  const summary = {
    month: selectedPetFilter === ALL_PETS_FILTER ? 'Tháng hiện tại' : `Nhật ký của ${selectedPetFilter}`,
    total: filteredEntries.length,
    highlight: `${filteredEntries.length} bản ghi đã lưu`
  };
  const selectedPetFilterLabel =
    selectedPetFilter === ALL_PETS_FILTER ? 'Tất cả thú cưng' : selectedPetFilter;
  const selectedPet = useMemo(() => {
    if (selectedPetFilter === ALL_PETS_FILTER) return null;
    return (pets || []).find((pet) => pet.name === selectedPetFilter) || null;
  }, [pets, selectedPetFilter]);

  const handleDelete = (entry) => {
    Alert.alert('Xoá nhật ký', `Bạn có chắc chắn muốn xóa "${entry.title}"?`, [
      {
        text: 'Huỷ',
        style: 'cancel'
      },
      {
        text: 'Xoá',
        style: 'destructive',
        onPress: () => deleteJournalEntry(entry.id)
      }
    ]);
  };

  const openDetail = (entry) => {
    navigation.navigate('JournalDetail', {
      entryId: entry.id,
      entry
    });
  };

  return (
    <Screen contentContainerStyle={styles.container} scrollViewRef={scrollRef}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Nhật ký</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            navigation.navigate('PetNewLog', {
              preselectedPetId: selectedPet?.id
            })
          }
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Thêm mới</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>{summary.month}</Text>
          <Text style={styles.summaryValue}>{summary.total} bản ghi</Text>
          <Text style={styles.summaryHint}>{summary.highlight}</Text>
        </View>
        <Ionicons name="bar-chart" size={22} color={theme.colors.primary} />
      </Card>

      <TouchableOpacity style={styles.filterPicker} onPress={() => setShowPetFilterModal(true)}>
        <View>
          <Text style={styles.filterPickerLabel}>Lọc thú cưng</Text>
          <Text style={styles.filterPickerValue}>{selectedPetFilterLabel}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>GẦN ĐÂY</Text>
      {filteredEntries.length > 0 ? (
        visibleEntries.map((entry) => (
          <Card key={entry.id} style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <View style={styles.entryHeaderText}>
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryMeta}>
                  {entry.pet} • {entry.date} • {getEntrySourceLabel(entry)}
                </Text>
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(entry)}>
                <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
            <Text style={styles.entryNote}>{summarizeEntry(entry)}</Text>
            <TouchableOpacity style={styles.detailButton} onPress={() => openDetail(entry)}>
              <Text style={styles.detailButtonText}>Xem chi tiết</Text>
              <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          </Card>
        ))
      ) : (
        <Card style={styles.entryCard}>
          <Text style={styles.emptyText}>Chưa có bản ghi nào. Hãy thêm nhật ký mới cho thú cưng.</Text>
        </Card>
      )}

      {isPageLoading ? <Text style={styles.loadingText}>Đang tải danh sách...</Text> : null}
      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <Modal
        visible={showPetFilterModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPetFilterModal(false)}
      >
        <Pressable style={styles.filterModalBackdrop} onPress={() => setShowPetFilterModal(false)}>
          <Pressable style={styles.filterModalSheet} onPress={() => {}}>
            <Text style={styles.filterModalTitle}>Chọn thú cưng</Text>
            {petFilterOptions.map((option) => {
              const isActive = option === selectedPetFilter;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.filterOption, isActive && styles.filterOptionActive]}
                  onPress={() => {
                    setSelectedPetFilter(option);
                    setCurrentPage(1);
                    setShowPetFilterModal(false);
                  }}
                >
                  <Text style={[styles.filterOptionText, isActive && styles.filterOptionTextActive]}>
                    {option === ALL_PETS_FILTER ? 'Tất cả thú cưng' : option}
                  </Text>
                  {isActive ? <Ionicons name="checkmark" size={18} color={theme.colors.primary} /> : null}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    // marginLeft: 8
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  addButtonText: {
    ...theme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 2
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
  filterPicker: {
    marginTop: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  filterPickerLabel: {
    ...theme.typography.small,
    color: theme.colors.textMuted
  },
  filterPickerValue: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '700',
    marginTop: 2
  },
  filterModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end'
  },
  filterModalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg
  },
  filterModalTitle: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.sm
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8
  },
  filterOptionActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  filterOptionText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600'
  },
  filterOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '700'
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
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  entryHeaderText: {
    flex: 1
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
  },
  detailButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailButtonText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
    marginRight: 2
  },
  deleteButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  loadingText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.sm
  }
});

export default JournalScreen;
