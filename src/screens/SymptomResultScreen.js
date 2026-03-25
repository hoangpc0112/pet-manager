import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import ProgressSteps from '../components/ProgressSteps';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import theme from '../theme';
import { resultSteps, resultWarnings } from '../data/assistant';

const SymptomResultScreen = ({ navigation }) => {
  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết quả phân tích</Text>
      </View>

      <Text style={styles.stepLabel}>Bước 4/4</Text>
      <Text style={styles.stepTitle}>Đánh giá mức độ và hướng xử lý</Text>
      <ProgressSteps total={4} current={4} />

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>Mức rủi ro hiện tại</Text>
        <View style={styles.riskRow}>
          <Text style={styles.riskText}>Nên theo dõi sát trong 24 giờ</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Rủi ro trung bình</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Bước tiếp theo</Text>
        {resultSteps.map((step) => (
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
        {resultWarnings.map((warn) => (
          <View key={warn} style={styles.listRow}>
            <View style={[styles.dot, styles.dotDanger]} />
            <Text style={styles.listText}>{warn}</Text>
          </View>
        ))}
      </Card>

      <PrimaryButton label="Lưu vào nhật ký" onPress={() => {}} style={styles.primaryButton} />
      <GhostButton label="Tạo nhắc nhở" onPress={() => {}} style={styles.ghostButton} />
      <GhostButton label="Tạo tóm tắt khám thú y" onPress={() => {}} />

      <View style={styles.noteCard}>
        <Text style={styles.note}>Gợi ý tham khảo, không thay thế tư vấn thú y.</Text>
      </View>
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
  noteCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: theme.spacing.lg
  },
  note: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center'
  }
});

export default SymptomResultScreen;
