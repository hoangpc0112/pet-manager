import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import ProgressSteps from '../components/ProgressSteps';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import theme from '../theme';

const SymptomReviewScreen = ({ navigation, route }) => {
  const review = {
    petName: route?.params?.selectedPetName || 'Chưa chọn',
    group: route?.params?.selectedGroupLabel || 'Chưa chọn',
    symptoms: route?.params?.symptoms || [],
    duration: route?.params?.duration || 'Chưa chọn',
    severity: route?.params?.severity || 1,
    appetite: route?.params?.appetite || 'Chưa chọn',
    energy: route?.params?.energy || 'Chưa chọn'
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra triệu chứng</Text>
      </View>

      <Text style={styles.stepLabel}>Bước 3/4</Text>
      <Text style={styles.stepTitle}>Xem lại trước khi phân tích</Text>
      <ProgressSteps total={4} current={3} />

      <Card style={styles.card}>
        <Text style={styles.itemLabel}>Thú cưng</Text>
        <Text style={styles.itemValue}>{review.petName}</Text>

        <Text style={styles.itemLabel}>Nhóm vấn đề</Text>
        <Text style={styles.itemValue}>{review.group}</Text>

        <Text style={styles.itemLabel}>Triệu chứng</Text>
        <Text style={styles.itemValue}>{(review.symptoms || []).join(', ')}</Text>

        <Text style={styles.itemLabel}>Thời gian kéo dài</Text>
        <Text style={styles.itemValue}>{review.duration}</Text>

        <Text style={styles.itemLabel}>Mức độ nghiêm trọng</Text>
        <Text style={styles.itemValue}>{review.severity}/5</Text>

        <Text style={styles.itemLabel}>Khẩu vị</Text>
        <Text style={styles.itemValue}>{review.appetite}</Text>

        <Text style={styles.itemLabel}>Năng lượng</Text>
        <Text style={styles.itemValue}>{review.energy}</Text>
      </Card>

      <GhostButton label="Chỉnh sửa thông tin" onPress={() => navigation.goBack()} style={styles.ghost} />
      <PrimaryButton label="Xem kết quả" onPress={() => navigation.navigate('SymptomResult', route?.params)} />
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
  loading: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md
  }
});

export default SymptomReviewScreen;




