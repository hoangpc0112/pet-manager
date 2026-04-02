import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Screen from '../components/Screen';
import Card from '../components/Card';
import PaginationControls from '../components/PaginationControls';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const PAGE_SIZE = 5;

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

const formatDate = (date) =>
  `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

const parseDate = (value) => {
  if (!value || typeof value !== 'string') return null;
  const parts = value.split('/').map((item) => Number.parseInt(item, 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [day, month, year] = parts;
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDaysInMonth = (month, year) => new Date(year, month, 0).getDate();

const DATE_PICKER_FIELDS = {
  DONE: 'doneDate',
  NEXT: 'nextDate'
};

const PetVaccinesScreen = ({ navigation, route }) => {
  const {
    vaccinationTabs,
    vaccinations,
    pets,
    getPetById,
    addPetVaccination,
    updatePetVaccination,
    deletePetVaccination
  } = useAppData();

  const tabs = vaccinationTabs || [];
  const scrollRef = useRef(null);
  const [activeTab, setActiveTab] = useState(tabs[0] || 'Tất cả');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [doneDate, setDoneDate] = useState(formatDate(new Date()));
  const [nextDate, setNextDate] = useState('');
  const [clinic, setClinic] = useState('');
  const [note, setNote] = useState('');
  const [pickerField, setPickerField] = useState(null);
  const [iosDay, setIosDay] = useState(new Date().getDate());
  const [iosMonth, setIosMonth] = useState(new Date().getMonth() + 1);
  const [iosYear, setIosYear] = useState(new Date().getFullYear());
  const [currentPage, setCurrentPage] = useState(1);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 16 }, (_, index) => currentYear - 5 + index);
  }, []);

  useEffect(() => {
    const maxDay = getDaysInMonth(iosMonth, iosYear);
    if (iosDay > maxDay) {
      setIosDay(maxDay);
    }
  }, [iosMonth, iosYear, iosDay]);

  const selectedPet = getPetById(route?.params?.petId) || pets[0] || null;

  const vaccineItems = useMemo(() => {
    if (!selectedPet) return [];
    const petItems = Array.isArray(selectedPet.vaccinations) ? selectedPet.vaccinations : [];
    const sourceItems = petItems.length > 0 ? petItems : vaccinations || [];

    if (activeTab === 'Đến hạn') return sourceItems.filter((item) => item.status === 'overdue');
    if (activeTab === 'Hoàn tất') return sourceItems.filter((item) => item.status === 'done');
    return sourceItems;
  }, [selectedPet, vaccinations, activeTab]);

  const totalPages = Math.max(1, Math.ceil(vaccineItems.length / PAGE_SIZE));
  const visibleVaccinations = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return vaccineItems.slice(start, start + PAGE_SIZE);
  }, [vaccineItems, currentPage]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [activeTab, selectedPet?.id, vaccineItems.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentPage]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDoneDate(formatDate(new Date()));
    setNextDate('');
    setClinic('');
    setNote('');
    setPickerField(null);
  };

  const openPicker = (field) => {
    const sourceDate = field === DATE_PICKER_FIELDS.NEXT ? parseDate(nextDate) : parseDate(doneDate);
    const baseDate = sourceDate || new Date();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: baseDate,
        mode: 'date',
        is24Hour: true,
        onChange: (_event, selectedDate) => {
          if (!selectedDate) return;
          const value = formatDate(selectedDate);
          if (field === DATE_PICKER_FIELDS.DONE) setDoneDate(value);
          if (field === DATE_PICKER_FIELDS.NEXT) setNextDate(value);
        }
      });
      return;
    }

    setIosDay(baseDate.getDate());
    setIosMonth(baseDate.getMonth() + 1);
    setIosYear(baseDate.getFullYear());
    setPickerField(field);
  };

  const confirmIosDate = () => {
    const value = `${String(iosDay).padStart(2, '0')}/${String(iosMonth).padStart(2, '0')}/${iosYear}`;
    if (pickerField === DATE_PICKER_FIELDS.DONE) setDoneDate(value);
    if (pickerField === DATE_PICKER_FIELDS.NEXT) setNextDate(value);
    setPickerField(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || '');
    setDoneDate(item.doneDate || formatDate(new Date()));
    setNextDate(item.nextDate || '');
    setClinic(item.clinic || '');
    setNote(item.note || '');
    setIsAdding(true);
  };

  const handleDelete = (item) => {
    if (!selectedPet) return;
    Alert.alert('Xóa mũi tiêm', `Bạn có chắc muốn xóa "${item.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => deletePetVaccination(selectedPet.id, item.id)
      }
    ]);
  };

  const handleSave = () => {
    if (!selectedPet) {
      Alert.alert('Thiếu dữ liệu', 'Chưa chọn được thú cưng để thao tác.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên mũi tiêm.');
      return;
    }

    const payload = {
      name: name.trim(),
      doneDate: doneDate.trim(),
      nextDate: nextDate.trim(),
      clinic: clinic.trim(),
      note: note.trim()
    };

    if (editingId) {
      updatePetVaccination(selectedPet.id, editingId, payload);
      Alert.alert('Thành công', 'Đã cập nhật mũi tiêm.');
    } else {
      addPetVaccination(selectedPet.id, {
        ...payload,
        status: 'pending',
        doneDate: ''
      });
      Alert.alert('Thành công', 'Đã thêm mũi tiêm cho thú cưng.');
    }

    resetForm();
    setIsAdding(false);
  };

  return (
    <Screen contentContainerStyle={styles.container} scrollViewRef={scrollRef}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch tiêm của {selectedPet?.name || 'thú cưng'}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setIsAdding((prev) => !prev)}>
          <Ionicons name="add" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {isAdding ? (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>{editingId ? 'Sửa mũi tiêm' : 'Thêm mũi tiêm mới'}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tên mũi tiêm"
            placeholderTextColor={theme.colors.textLight}
            style={styles.input}
          />

          <TouchableOpacity style={styles.inputButton} onPress={() => openPicker(DATE_PICKER_FIELDS.DONE)}>
            <View>
              <Text style={styles.inputButtonLabel}>Ngày tiêm</Text>
              <Text style={styles.inputButtonValue}>{doneDate}</Text>
            </View>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.inputButton} onPress={() => openPicker(DATE_PICKER_FIELDS.NEXT)}>
            <View>
              <Text style={styles.inputButtonLabel}>Lần kế tiếp</Text>
              <Text style={styles.inputButtonValue}>{nextDate || 'Chọn ngày'}</Text>
            </View>
            <View style={styles.dateActions}>
              {nextDate ? (
                <TouchableOpacity onPress={() => setNextDate('')}>
                  <Ionicons name="close-circle" size={18} color={theme.colors.textLight} />
                </TouchableOpacity>
              ) : null}
              <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} />
            </View>
          </TouchableOpacity>

          <TextInput
            value={clinic}
            onChangeText={setClinic}
            placeholder="Phòng khám"
            placeholderTextColor={theme.colors.textLight}
            style={styles.input}
          />
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Ghi chú"
            placeholderTextColor={theme.colors.textLight}
            style={[styles.input, styles.textArea]}
            multiline
          />

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => {
                resetForm();
                setIsAdding(false);
              }}
            >
              <Text style={styles.secondaryActionText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryAction} onPress={handleSave}>
              <Text style={styles.primaryActionText}>{editingId ? 'Lưu thay đổi' : 'Lưu mũi tiêm'}</Text>
            </TouchableOpacity>
          </View>
        </Card>
      ) : null}

      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {vaccineItems.length > 0 ? (
        visibleVaccinations.map((item) => {
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
                  <View style={styles.cardHeaderActions}>
                    <View style={[styles.badge, { backgroundColor: status.badgeBg }]}>
                      <Text style={[styles.badgeText, { color: status.badgeText }]}>{item.statusLabel}</Text>
                    </View>
                    <TouchableOpacity style={styles.smallIconButton} onPress={() => handleEdit(item)}>
                      <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.smallIconButton} onPress={() => handleDelete(item)}>
                      <Ionicons name="trash-outline" size={16} color={theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Ngày tiêm</Text>
                  <Text style={styles.value}>{item.doneDate || '-'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.label, item.status === 'overdue' && styles.labelDanger]}>Lần kế tiếp</Text>
                  <Text style={[styles.value, item.status === 'overdue' && styles.valueDanger]}>{item.nextDate || '-'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Phòng khám</Text>
                  <Text style={styles.value}>{item.clinic || '-'}</Text>
                </View>
                {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
              </View>
            </Card>
          );
        })
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>Chưa có mũi tiêm nào ở danh mục này.</Text>
        </Card>
      )}

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      {Platform.OS === 'ios' ? (
        <Modal visible={Boolean(pickerField)} transparent animationType="fade" onRequestClose={() => setPickerField(null)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setPickerField(null)}>
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setPickerField(null)}>
                  <Text style={styles.modalActionText}>Hủy</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Chọn ngày</Text>
                <TouchableOpacity onPress={confirmIosDate}>
                  <Text style={styles.modalActionText}>Xong</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateColumns}>
                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnTitle}>Ngày</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {Array.from({ length: getDaysInMonth(iosMonth, iosYear) }, (_, i) => i + 1).map((day) => (
                      <TouchableOpacity
                        key={`day-${day}`}
                        style={[styles.dateOption, iosDay === day && styles.dateOptionActive]}
                        onPress={() => setIosDay(day)}
                      >
                        <Text style={[styles.dateOptionText, iosDay === day && styles.dateOptionTextActive]}>
                          {String(day).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnTitle}>Tháng</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <TouchableOpacity
                        key={`month-${month}`}
                        style={[styles.dateOption, iosMonth === month && styles.dateOptionActive]}
                        onPress={() => setIosMonth(month)}
                      >
                        <Text style={[styles.dateOptionText, iosMonth === month && styles.dateOptionTextActive]}>
                          {String(month).padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnTitle}>Năm</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {yearOptions.map((year) => (
                      <TouchableOpacity
                        key={`year-${year}`}
                        style={[styles.dateOption, iosYear === year && styles.dateOptionActive]}
                        onPress={() => setIosYear(year)}
                      >
                        <Text style={[styles.dateOptionText, iosYear === year && styles.dateOptionTextActive]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
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
  formCard: {
    marginBottom: theme.spacing.md
  },
  formTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    marginBottom: theme.spacing.sm
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: theme.colors.text
  },
  inputButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  inputButtonLabel: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginBottom: 2
  },
  inputButtonValue: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600'
  },
  dateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  textArea: {
    minHeight: 72,
    textAlignVertical: 'top'
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4
  },
  secondaryAction: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8
  },
  secondaryActionText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: '600'
  },
  primaryAction: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  primaryActionText: {
    ...theme.typography.caption,
    color: '#FFFFFF',
    fontWeight: '700'
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
  cardHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center'
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
  smallIconButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4
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
  },
  emptyCard: {
    marginTop: theme.spacing.sm
  },
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xs
  },
  modalTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text
  },
  modalActionText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700'
  },
  dateColumns: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    maxHeight: 300
  },
  dateColumn: {
    flex: 1,
    marginHorizontal: 6
  },
  dateColumnTitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600'
  },
  dateOption: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: '#F3F4F6'
  },
  dateOptionActive: {
    backgroundColor: theme.colors.primarySoft,
    borderWidth: 1,
    borderColor: theme.colors.primary
  },
  dateOptionText: {
    ...theme.typography.body,
    color: theme.colors.text
  },
  dateOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '700'
  },
  
});

export default PetVaccinesScreen;
