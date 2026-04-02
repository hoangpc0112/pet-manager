import React, { useEffect, useState } from 'react';
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
import { analyzeSymptomsWithFirebase } from '../services/symptomAnalysis';

const SymptomResultScreen = ({ navigation, route }) => {
  const { saveJournalEntry } = useAppData();
  const payload = route?.params || {};
  const [analysisText, setAnalysisText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisError, setAnalysisError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const runAnalysis = async () => {
      setIsAnalyzing(true);
      setAnalysisError('');
      try {
        const rawText = await analyzeSymptomsWithFirebase(payload);
        if (isMounted) {
          setAnalysisText(rawText);
        }
      } catch (error) {
        if (isMounted) {
          setAnalysisText('');
          setAnalysisError('Không thể lấy kết quả từ AI. Vui lòng thử lại.');
        }
      } finally {
        if (isMounted) {
          setIsAnalyzing(false);
        }
      }
    };

    runAnalysis();

    return () => {
      isMounted = false;
    };
  }, [payload]);

  const handleSaveToJournal = () => {
    if (!analysisText.trim()) {
      Alert.alert('Chưa có kết quả AI', 'Không thể lưu nhật ký khi chưa nhận được phân tích từ AI.');
      return;
    }

    saveJournalEntry({
      title: `Theo dõi triệu chứng - ${payload.selectedGroupLabel || 'Khác'}`,
      pet: payload.selectedPetName || 'Chưa chọn',
      date: new Date().toLocaleDateString('vi-VN'),
      note: analysisText,
      category: 'Sức khỏe',
      imageUrl: payload?.symptomImageDataUri || null,
      aiRawResponse: analysisText,
      symptomSnapshot: {
        group: payload.selectedGroupLabel || 'Khác',
        duration: payload.duration || '',
        energy: payload.energy || '',
        appetite: payload.appetite || '',
        severity: payload.severity || 1,
        symptoms: payload.symptoms || []
      }
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
        <Text style={styles.cardLabel}>Phản hồi từ AI</Text>
        {isAnalyzing ? <Text style={styles.loading}>Đang phân tích ...</Text> : null}
        {analysisError ? <Text style={styles.errorText}>{analysisError}</Text> : null}
        {analysisText ? <Text style={styles.rawText}>{analysisText}</Text> : null}
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
  rawText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: 10,
    lineHeight: 20
  },
  primaryButton: {
    marginTop: theme.spacing.lg
  },
  ghostButton: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg
  },
  loading: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.danger,
    marginTop: 8
  }
});

export default SymptomResultScreen;




