import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PaginationControls from '../components/PaginationControls';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const PAGE_SIZE = 5;
const ALL_PETS_FILTER = 'ALL';

const RemindersScreen = ({ navigation }) => {
  const {
    reminderItems,
    reminderSummary,
    pets,
    toggleReminderEnabled,
    deleteReminder
  } = useAppData();

  const items = reminderItems || [];
  const scrollRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPetFilter, setSelectedPetFilter] = useState(ALL_PETS_FILTER);
  const [showPetFilterModal, setShowPetFilterModal] = useState(false);
  const petFilterOptions = useMemo(() => {
    const petNamesFromPets = (pets || []).map((pet) => pet.name).filter(Boolean);
    const petNamesFromItems = items
      .map((item) => item.pet)
      .filter((name) => Boolean(name) && name !== 'Tất cả');
    const names = Array.from(new Set([...petNamesFromPets, ...petNamesFromItems]));
    return [ALL_PETS_FILTER, ...names];
  }, [pets, items]);

  useEffect(() => {
    if (selectedPetFilter !== ALL_PETS_FILTER && !petFilterOptions.includes(selectedPetFilter)) {
      setSelectedPetFilter(ALL_PETS_FILTER);
      setCurrentPage(1);
    }
  }, [selectedPetFilter, petFilterOptions]);

  const filteredItems = useMemo(() => {
    if (selectedPetFilter === ALL_PETS_FILTER) return items;
    return items.filter((item) => item.pet === selectedPetFilter);
  }, [items, selectedPetFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);
  const summary = reminderSummary || { today: 'Hôm nay', count: 0 };
  const selectedPetFilterLabel =
    selectedPetFilter === ALL_PETS_FILTER ? 'Tất cả thú cưng' : selectedPetFilter;

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [filteredItems.length, totalPages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentPage]);

  const handleDeleteReminder = (item) => {
    Alert.alert('Xóa nhắc nhở', `Bạn có chắc muốn xóa "${item.title}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => deleteReminder(item.id)
      }
    ]);
  };

  return (
    <Screen contentContainerStyle={styles.container} scrollViewRef={scrollRef}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Nhắc nhở</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('ReminderNew')}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Thêm mới</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.summaryCard}>
        <View>
          <Text style={styles.summaryLabel}>{summary.today}</Text>
          <Text style={styles.summaryValue}>{`${filteredItems.length} lịch hiển thị`}</Text>
        </View>
        <Ionicons name="notifications" size={22} color={theme.colors.primary} />
      </Card>

      <TouchableOpacity style={styles.filterPicker} onPress={() => setShowPetFilterModal(true)}>
        <View>
          <Text style={styles.filterPickerLabel}>Lọc thú cưng</Text>
          <Text style={styles.filterPickerValue}>{selectedPetFilterLabel}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={theme.colors.textMuted} />
      </TouchableOpacity>

      <Text style={styles.sectionLabel}>LỊCH HÀNG NGÀY</Text>
      {visibleItems.map((item) => (
        <Card key={item.id} style={styles.reminderCard}>
          <View style={styles.row}>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTitle}>{item.title}</Text>
              <Text style={styles.reminderMeta}>{item.pet} • {item.repeat}</Text>
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.smallAction} onPress={() => handleDeleteReminder(item)}>
                <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.toggle} onPress={() => toggleReminderEnabled(item.id)}>
                <View style={[styles.toggleKnob, item.enabled && styles.toggleOn]} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.reminderTime}>{item.time}</Text>
        </Card>
      ))}

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
    padding: theme.spacing.lg
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
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
  title: {
    ...theme.typography.h1,
    color: theme.colors.text
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
  reminderCard: {
    marginBottom: theme.spacing.md
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  reminderInfo: {
    flex: 1,
    marginRight: 8
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  smallAction: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4
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
  },

});

export default RemindersScreen;
