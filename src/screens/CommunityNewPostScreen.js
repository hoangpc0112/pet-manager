import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const categories = ['Hỏi đáp', 'review', 'Mạng xã hội'];

const Field = ({ label, children }) => {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label} <Text style={styles.required}>*</Text></Text>
      {children}
    </View>
  );
};

const CommunityNewPostScreen = ({ navigation }) => {
  const { addCommunityPost, newPostDefaults, nearbyServices } = useAppData();
  const servicePlaces = Array.from(new Set((nearbyServices || []).map((item) => item.name)));
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(newPostDefaults?.category || 'Hỏi đáp');
  const [content, setContent] = useState('');
  const [servicePlace, setServicePlace] = useState('');
  const [reviewScore, setReviewScore] = useState(5);
  const [imageUri, setImageUri] = useState('');
  const [imageDataUri, setImageDataUri] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền thư viện ảnh để chọn ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      base64: true,
      quality: 0.8
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      setImageUri(asset.uri || '');
      setImageDataUri(asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : '');
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tiêu đề và nội dung.');
      return;
    }

    if (category !== 'Mạng xã hội' && !servicePlace) {
      Alert.alert('Thiếu thông tin', 'Bài viết cần chọn 1 địa điểm dịch vụ.');
      return;
    }

    setIsPublishing(true);

    addCommunityPost({
      title: title.trim(),
      category,
      content: content.trim(),
      imageUrl: imageDataUri || null,
      tags: [],
      location: category === 'Mạng xã hội' ? '' : servicePlace,
      reviewScore
    });

    setIsPublishing(false);
    Alert.alert('Đã đăng', 'Bài viết đã được đăng lên cộng đồng.');
    navigation.goBack();
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo bài viết</Text>
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish} disabled={isPublishing}>
          <Text style={styles.publish}>{isPublishing ? 'Đang đăng...' : 'Đăng'}</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        <Field label="Tiêu đề">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Nhập tiêu đề bài viết"
            placeholderTextColor={theme.colors.textLight}
            style={styles.fieldInput}
          />
        </Field>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Danh mục <Text style={styles.required}>*</Text></Text>
          <View style={styles.choiceRow}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.choiceChip, category === item && styles.choiceChipActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.choiceText, category === item && styles.choiceTextActive]}>{item === 'review' ? 'Review' : item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {category !== 'Mạng xã hội' ? (
          <>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Địa điểm dịch vụ <Text style={styles.required}>*</Text></Text>
              <View style={styles.choiceRow}>
                {servicePlaces.map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={[styles.choiceChip, servicePlace === item && styles.choiceChipActive]}
                    onPress={() => setServicePlace(item)}
                  >
                    <Text style={[styles.choiceText, servicePlace === item && styles.choiceTextActive]}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {category === 'review' ? (
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Điểm đánh giá <Text style={styles.required}>*</Text></Text>
                <View style={styles.choiceRow}>
                  {[1, 2, 3, 4, 5].map((score) => (
                    <TouchableOpacity
                      key={score}
                      style={[styles.scoreChip, reviewScore === score && styles.scoreChipActive]}
                      onPress={() => setReviewScore(score)}
                    >
                      <Text style={[styles.choiceText, reviewScore === score && styles.choiceTextActive]}>{score}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}
          </>
        ) : null}

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Nội dung <Text style={styles.required}>*</Text></Text>
          <TextInput
            value={content}
            onChangeText={setContent}
            placeholder="Mô tả chi tiết để cộng đồng hỗ trợ tốt hơn"
            placeholderTextColor={theme.colors.textLight}
            multiline
            style={[styles.fieldInput, styles.textArea]}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Ảnh đính kèm</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            <Ionicons name="image" size={18} color={theme.colors.primary} />
            <Text style={styles.imagePickerText}>{imageUri ? 'Đổi ảnh' : 'Chọn ảnh từ thư viện'}</Text>
          </TouchableOpacity>

          {imageUri ? (
            <View style={styles.previewWrap}>
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  setImageUri('');
                  setImageDataUri('');
                }}
              >
                <Ionicons name="close-circle" size={18} color={theme.colors.danger} />
                <Text style={styles.removeImageText}>Xoá ảnh</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </Card>
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
    justifyContent: 'space-between'
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerTitle: {
    ...theme.typography.h3,
    flex: 1,
    textAlign: 'center',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.sm
  },
  publishButton: {
    minWidth: 48,
    alignItems: 'flex-end'
  },
  backText: {
    color: theme.colors.primary,
    marginLeft: 6,
    fontWeight: '600'
  },
  publish: {
    color: theme.colors.primary,
    fontWeight: '600'
  },
  card: {
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md
  },
  fieldBlock: {
    marginBottom: theme.spacing.lg
  },
  fieldLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600'
  },
  required: {
    color: theme.colors.danger
  },
  fieldInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    color: theme.colors.text
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8
  },
  choiceChip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF'
  },
  choiceChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  scoreChip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  scoreChipActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  choiceText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  choiceTextActive: {
    color: theme.colors.primary,
    fontWeight: '700'
  },
  textArea: {
    height: 140
  },
  imagePicker: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center'
  },
  imagePickerText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    marginLeft: 8
  },
  previewWrap: {
    marginTop: 10
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 14
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
  loading: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md
  }
});

export default CommunityNewPostScreen;



