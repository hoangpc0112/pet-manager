import React, { useMemo, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { getAuthErrorMessage } from '../services/auth';

const isRemoteUrl = (value) => /^https?:\/\//i.test(String(value || '').trim());

const EditProfileScreen = ({ navigation }) => {
  const { profileOverview, updateProfileOverview } = useAppData();
  const { user, updateUserProfile } = useAuth();

  const overview = profileOverview || {};
  const existingAvatar = user?.photoURL || overview.avatarUrl || '';

  const [name, setName] = useState(user?.displayName || overview.name || '');
  const [phone, setPhone] = useState(overview.phone || user?.phoneNumber || '');
  const [avatarPreview, setAvatarPreview] = useState(existingAvatar);
  const [avatarUploadValue, setAvatarUploadValue] = useState('');
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileEmail = useMemo(() => user?.email || overview.email || '', [overview.email, user?.email]);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Can quyen truy cap', 'Vui long cap quyen thu vien anh de chon anh dai dien.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.8
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      const nextValue = asset.base64
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri || '';
      setAvatarPreview(asset.uri || nextValue);
      setAvatarUploadValue(nextValue);
      setRemoveAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setAvatarUploadValue('');
    setRemoveAvatar(true);
  };

  const handleSave = async () => {
    const nextName = name.trim();
    if (!nextName) {
      Alert.alert('Thieu thong tin', 'Vui long nhap ten hien thi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const nextAvatarUrl = removeAvatar ? '' : avatarUploadValue || existingAvatar;
      const authPhotoURL = removeAvatar
        ? null
        : isRemoteUrl(nextAvatarUrl)
          ? nextAvatarUrl
          : undefined;

      await updateUserProfile({
        displayName: nextName,
        photoURL: authPhotoURL
      });

      updateProfileOverview({
        name: nextName,
        email: profileEmail,
        phone: phone.trim(),
        avatarUrl: nextAvatarUrl
      });

      Alert.alert('Thanh cong', 'Da cap nhat thong tin ho so.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Khong the cap nhat', getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sua ho so</Text>
        <TouchableOpacity onPress={handleSave} disabled={isSubmitting}>
          <Text style={styles.save}>{isSubmitting ? 'Dang luu...' : 'Luu'}</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.card}>
        <TouchableOpacity style={styles.avatarBox} onPress={handlePickImage} activeOpacity={0.9}>
          {avatarPreview ? (
            <Image source={{ uri: avatarPreview }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <>
              <Ionicons name="person-circle" size={46} color={theme.colors.textLight} />
              <Text style={styles.avatarHint}>Them anh dai dien</Text>
            </>
          )}
        </TouchableOpacity>

        {avatarPreview ? (
          <TouchableOpacity style={styles.removeRow} onPress={handleRemoveAvatar}>
            <Ionicons name="close-circle" size={18} color={theme.colors.danger} />
            <Text style={styles.removeText}>Xoa anh</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Ten hien thi</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nhap ten hien thi"
            placeholderTextColor={theme.colors.textLight}
            style={styles.fieldInput}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput value={profileEmail} editable={false} style={[styles.fieldInput, styles.disabledInput]} />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>So dien thoai</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhap so dien thoai"
            placeholderTextColor={theme.colors.textLight}
            keyboardType="phone-pad"
            style={styles.fieldInput}
          />
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
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text
  },
  save: {
    color: theme.colors.primary,
    fontWeight: '600'
  },
  card: {
    marginTop: theme.spacing.lg
  },
  avatarBox: {
    height: 160,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7FB',
    marginBottom: theme.spacing.md,
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%'
  },
  avatarHint: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginTop: 8
  },
  removeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.md
  },
  removeText: {
    ...theme.typography.small,
    color: theme.colors.danger,
    marginLeft: 4,
    fontWeight: '600'
  },
  fieldBlock: {
    marginBottom: theme.spacing.lg
  },
  fieldLabel: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600',
    marginBottom: 8
  },
  fieldInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 14,
    color: theme.colors.text
  },
  disabledInput: {
    color: theme.colors.textMuted
  }
});

export default EditProfileScreen;
