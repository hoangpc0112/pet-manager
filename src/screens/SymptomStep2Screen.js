import React, { useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import ProgressSteps from '../components/ProgressSteps';
import PrimaryButton from '../components/PrimaryButton';
import theme from '../theme';
import { symptomMeta, symptomOptions } from '../data/symptoms';

const SymptomStep2Screen = ({ navigation, route }) => {
  const symptomList = symptomOptions;
  const meta = symptomMeta;
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [duration, setDuration] = useState(meta.duration[1]);
  const [energy, setEnergy] = useState(meta.energy[1]);
  const [appetite, setAppetite] = useState(meta.appetite[0]);
  const [severity, setSeverity] = useState(3);
  const [symptomImageUri, setSymptomImageUri] = useState('');

  const basePayload = useMemo(
    () => ({
      selectedPetId: route?.params?.selectedPetId || '',
      selectedPetName: route?.params?.selectedPetName || '',
      selectedGroupId: route?.params?.selectedGroupId || '',
      selectedGroupLabel: route?.params?.selectedGroupLabel || ''
    }),
    [route?.params]
  );

  const toggleSymptom = (name) => {
    setSelectedSymptoms((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền thư viện ảnh để chọn ảnh mô tả triệu chứng.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8
    });

    if (!result.canceled && result.assets?.length) {
      setSymptomImageUri(result.assets[0].uri || '');
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra triệu chứng</Text>
      </View>

      <Text style={styles.stepLabel}>Bước 2/4</Text>
      <Text style={styles.stepTitle}>Nhập triệu chứng chi tiết</Text>
      <ProgressSteps total={4} current={2} />

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Triệu chứng đang gặp</Text>
        <View style={styles.chipsRow}>
          {symptomList.map((item) => (
            <Chip key={item} label={item} active={selectedSymptoms.includes(item)} onPress={() => toggleSymptom(item)} />
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.metaLabel}>Thời gian kéo dài</Text>
        <View style={styles.segmentRow}>
          {meta.duration.map((item, index) => (
            <TouchableOpacity
              key={`${item}-${index}`}
              style={[styles.segment, duration === item && styles.segmentActive]}
              onPress={() => setDuration(item)}
            >
              <Text style={[styles.segmentText, duration === item && styles.segmentTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.metaLabel}>Mức năng lượng</Text>
        <View style={styles.segmentRow}>
          {meta.energy.map((item, index) => (
            <TouchableOpacity
              key={`${item}-${index}`}
              style={[styles.segment, energy === item && styles.segmentActive]}
              onPress={() => setEnergy(item)}
            >
              <Text style={[styles.segmentText, energy === item && styles.segmentTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.metaLabel}>Khẩu vị</Text>
        <View style={styles.segmentRow}>
          {meta.appetite.map((item, index) => (
            <TouchableOpacity
              key={`${item}-${index}`}
              style={[styles.segment, appetite === item && styles.segmentActive]}
              onPress={() => setAppetite(item)}
            >
              <Text style={[styles.segmentText, appetite === item && styles.segmentTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.metaLabel}>Mức độ nghiêm trọng: {severity}/5</Text>
        <View style={styles.severityRow}>
          {[1, 2, 3, 4, 5].map((value) => (
            <TouchableOpacity
              key={value}
              style={[styles.severityButton, severity === value && styles.severityButtonActive]}
              onPress={() => setSeverity(value)}
            >
              <Text style={[styles.severityButtonText, severity === value && styles.severityButtonTextActive]}>
                {value}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Ảnh mô tả (tuỳ chọn)</Text>
        <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage} activeOpacity={0.85}>
          {symptomImageUri ? (
            <Image source={{ uri: symptomImageUri }} style={styles.uploadPreview} resizeMode="cover" />
          ) : (
            <>
              <Ionicons name="image" size={18} color={theme.colors.textLight} />
              <Text style={styles.uploadText}>Chưa chọn ảnh</Text>
            </>
          )}
        </TouchableOpacity>
        {symptomImageUri ? (
          <TouchableOpacity style={styles.removeImageButton} onPress={() => setSymptomImageUri('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.danger} />
            <Text style={styles.removeImageText}>Xoá ảnh</Text>
          </TouchableOpacity>
        ) : null}
      </Card>

      <PrimaryButton
        label="Xem lại thông tin"
        onPress={() =>
          navigation.navigate('SymptomReview', {
            ...basePayload,
            symptoms: selectedSymptoms,
            duration,
            energy,
            appetite,
            severity,
            symptomImageUri: symptomImageUri || null
          })
        }
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
  severityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  severityButton: {
    width: 44,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  severityButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  severityButtonText: {
    ...theme.typography.bodyRegular,
    color: theme.colors.textMuted
  },
  severityButtonTextActive: {
    color: theme.colors.primary,
    fontWeight: '700'
  },
  uploadBox: {
    height: 90,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  uploadPreview: {
    width: '100%',
    height: '100%'
  },
  uploadText: {
    color: theme.colors.textLight,
    marginTop: 6
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8
  },
  removeImageText: {
    ...theme.typography.small,
    color: theme.colors.danger,
    marginLeft: 4,
    fontWeight: '600'
  },
  primaryButton: {
    marginTop: theme.spacing.lg
  },
  loading: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md
  }
});

export default SymptomStep2Screen;




