import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import ProgressSteps from '../components/ProgressSteps';
import PrimaryButton from '../components/PrimaryButton';
import theme from '../theme';
import { symptoms, symptomMeta } from '../data/assistant';

const SymptomStep2Screen = ({ navigation }) => {
  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra triệu chứng</Text>
      </View>

      <Text style={styles.stepLabel}>Bước 2/4</Text>
      <Text style={styles.stepTitle}>Nhập triệu chứng chi tiết</Text>
      <ProgressSteps total={4} current={2} />

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Triệu chứng đang gặp</Text>
        <View style={styles.chipsRow}>
          {symptoms.map((item, index) => (
            <Chip key={item} label={item} active={[0, 2, 4].includes(index)} />
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.metaLabel}>Thời gian kéo dài</Text>
        <View style={styles.segmentRow}>
          {symptomMeta.duration.map((item, index) => (
            <TouchableOpacity key={item} style={[styles.segment, index === 1 && styles.segmentActive]}>
              <Text style={[styles.segmentText, index === 1 && styles.segmentTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.metaLabel}>Mức năng lượng</Text>
        <View style={styles.segmentRow}>
          {symptomMeta.energy.map((item, index) => (
            <TouchableOpacity key={item} style={[styles.segment, index === 1 && styles.segmentActive]}>
              <Text style={[styles.segmentText, index === 1 && styles.segmentTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.metaLabel}>Khẩu vị</Text>
        <View style={styles.segmentRow}>
          {symptomMeta.appetite.map((item, index) => (
            <TouchableOpacity key={item} style={[styles.segment, index === 0 && styles.segmentActive]}>
              <Text style={[styles.segmentText, index === 0 && styles.segmentTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.metaLabel}>Mức độ nghiêm trọng: 3/5</Text>
        <View style={styles.sliderTrack}>
          <View style={styles.sliderFill} />
          <View style={styles.sliderThumb} />
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Ảnh mô tả (tuỳ chọn)</Text>
        <View style={styles.uploadBox}>
          <Text style={styles.uploadText}>Chưa chọn ảnh</Text>
        </View>
      </Card>

      <View style={styles.noteCard}>
        <Text style={styles.note}>Gợi ý tham khảo, không thay thế tư vấn thú y.</Text>
      </View>

      <PrimaryButton
        label="Xem lại thông tin"
        onPress={() => navigation.navigate('SymptomReview')}
        style={styles.primaryButton}
      />
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
  sectionTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    marginBottom: theme.spacing.md
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  metaLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
    marginBottom: 10
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 6
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12
  },
  segmentActive: {
    backgroundColor: '#FFFFFF'
  },
  segmentText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  segmentTextActive: {
    color: theme.colors.text,
    fontWeight: '600'
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    marginTop: 12,
    position: 'relative'
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    width: '70%',
    height: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.primary
  },
  sliderThumb: {
    position: 'absolute',
    left: '66%',
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: '#FFFFFF'
  },
  uploadBox: {
    height: 90,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  uploadText: {
    color: theme.colors.textLight
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
  },
  primaryButton: {
    marginTop: theme.spacing.lg
  }
});

export default SymptomStep2Screen;
