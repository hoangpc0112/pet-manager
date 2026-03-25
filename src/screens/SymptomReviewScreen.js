import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import ProgressSteps from '../components/ProgressSteps';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import theme from '../theme';

const SymptomReviewScreen = ({ navigation }) => {
  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra triệu chứng</Text>
      </View>

      <Text style={styles.stepLabel}>Bước 3/4</Text>
      <Text style={styles.stepTitle}>Xem lại trước khi phân tích</Text>
      <ProgressSteps total={4} current={3} />

      <Card style={styles.card}>
        <Text style={styles.itemLabel}>Thú cưng</Text>
        <Text style={styles.itemValue}>Luna</Text>

        <Text style={styles.itemLabel}>Nhóm vấn đề</Text>
        <Text style={styles.itemValue}>Tiêu hóa</Text>

        <Text style={styles.itemLabel}>Triệu chứng</Text>
        <Text style={styles.itemValue}>Nôn, Chán ăn</Text>

        <Text style={styles.itemLabel}>Thời gian kéo dài</Text>
        <Text style={styles.itemValue}>1-3 ngày</Text>

        <Text style={styles.itemLabel}>Mức độ nghiêm trọng</Text>
        <Text style={styles.itemValue}>3/5</Text>
      </Card>

      <GhostButton label="Chỉnh sửa thông tin" onPress={() => navigation.goBack()} style={styles.ghost} />
      <View style={styles.noteCard}>
        <Text style={styles.note}>Gợi ý tham khảo, không thay thế tư vấn thú y.</Text>
      </View>

      <PrimaryButton label="Phân tích ngay" onPress={() => navigation.navigate('SymptomResult')} />
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
  itemLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 10
  },
  itemValue: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 4
  },
  ghost: {
    marginTop: theme.spacing.lg
  },
  noteCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg
  },
  note: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center'
  }
});

export default SymptomReviewScreen;
