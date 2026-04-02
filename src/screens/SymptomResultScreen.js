import React from 'react';
import { Alert } from 'react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import ProgressSteps from '../components/ProgressSteps';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const getRiskSummary = (severity, symptomCount) => {
  if (severity >= 4 || symptomCount >= 4) {
    return {
      riskTitle: 'Nguy cơ cao, nên liên hệ phòng khám sớm',
      riskBadge: 'Cao'
    };
  }
  if (severity === 3 || symptomCount >= 2) {
    return {
      riskTitle: 'Cần theo dõi sát trong 24 giờ tới',
      riskBadge: 'Theo dõi'
    };
  }
  return {
    riskTitle: 'Mức độ nhẹ, tiếp tục theo dõi tại nhà',
    riskBadge: 'Nhẹ'
  };
};

const SymptomResultScreen = ({ navigation, route }) => {
  const { saveJournalEntry, resultSteps, resultWarnings } = useAppData();
  const payload = route?.params || {};
  const summary = getRiskSummary(payload.severity || 1, (payload.symptoms || []).length);
  const steps = resultSteps || [];
  const warnings = resultWarnings || [];

  const handleSaveToJournal = () => {
    saveJournalEntry({
      title: `Theo dõi triệu chứng - ${payload.selectedGroupLabel || 'Khác'}`,
      pet: payload.selectedPetName || 'Chưa chọn',
      date: new Date().toLocaleDateString('vi-VN'),
      note: `Triệu chứng: ${(payload.symptoms || []).join(', ') || 'Chưa có'} | Mức độ: ${payload.severity || 1}/5 | Đánh giá: ${summary.riskBadge}`,
      category: 'Sức khỏe',
      imageUrl: payload?.symptomImageDataUri || null
    });

    Alert.alert('Đã lưu', 'Bản ghi đã được lưu vào Nhật ký.', [
      {
        text: 'Xem Nhật ký',
        onPress: () => navigation.navigate('Tabs', { screen: 'Journal' })
      },
      {
        text: 'Ở lại',
        style: 'cancel'
      }
    ]);
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết quả phân tích</Text>
      </View>

      <Text style={styles.stepLabel}>Bước 4/4</Text>
      <Text style={styles.stepTitle}>Đánh giá tình trạng và hướng xử lý</Text>
      <ProgressSteps total={4} current={4} />

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Mức rủi ro hiện tại</Text>
        <View style={styles.riskRow}>
          <Text style={styles.riskText}>{summary.riskTitle}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{summary.riskBadge}</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Bước tiếp theo</Text>
        {steps.map((step) => (
          <View key={step} style={styles.listRow}>
            <View style={styles.dot} />
            <Text style={styles.listText}>{step}</Text>
          </View>
        ))}
      </Card>

      <Card style={[styles.card, styles.warningCard]}>
        <View style={styles.warningHeader}>
          <Ionicons name="warning" size={18} color={theme.colors.danger} />
          <Text style={styles.warningTitle}>Dấu hiệu cần đi khám ngay</Text>
        </View>
        {warnings.map((warn) => (
          <View key={warn} style={styles.listRow}>
            <View style={[styles.dot, styles.dotDanger]} />
            <Text style={styles.listText}>{warn}</Text>
          </View>
        ))}
      </Card>

      <PrimaryButton label="Lưu vào nhật ký" onPress={handleSaveToJournal} style={styles.primaryButton} />
      <GhostButton
        label="Tạo nhắc nhở"
        onPress={() => navigation.navigate('ReminderNew')}
        style={styles.ghostButton}
      />
      <GhostButton label="Quay về danh sách thú cưng" onPress={() => navigation.navigate('Tabs', { screen: 'Pets' })} />
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
  stepLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  stepTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginTop: 6
  },
  card: {
    marginTop: theme.spacing.lg
  },
  cardLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10
  },
  riskText: {
    ...theme.typography.body,
    fontWeight: '700',
    flex: 1,
    marginRight: 12
  },
  badge: {
    backgroundColor: theme.colors.badge,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12
  },
  badgeText: {
    color: '#F97316',
    fontWeight: '600',
    fontSize: 12
  },
  sectionTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    marginBottom: theme.spacing.md
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  listText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    flex: 1
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.text,
    marginTop: 6,
    marginRight: 8
  },
  warningCard: {
    backgroundColor: theme.colors.dangerSoft,
    borderWidth: 1,
    borderColor: '#FCA5A5'
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  warningTitle: {
    marginLeft: 8,
    fontWeight: '700',
    color: theme.colors.danger
  },
  dotDanger: {
    backgroundColor: theme.colors.danger
  },
  primaryButton: {
    marginTop: theme.spacing.lg
  },
  ghostButton: {
    marginTop: theme.spacing.md
  },
  loading: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md
  }
});

export default SymptomResultScreen;




