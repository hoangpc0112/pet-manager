import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import Screen from '../components/Screen';
import Card from '../components/Card';
import GhostButton from '../components/GhostButton';
import PrimaryButton from '../components/PrimaryButton';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

const getNotificationsModule = async () => {
  if (isExpoGo) return null;

  try {
    return await import('expo-notifications');
  } catch (_error) {
    return null;
  }
};

const ProfileScreen = ({ navigation, onLogout }) => {
  const { profileOverview, profileStats } = useAppData();
  const { user } = useAuth();
  const overview = profileOverview || {};
  const stats = profileStats || [];
  const profileName = user?.displayName || overview.name || 'Người dùng';
  const profileEmail = user?.email || overview.email || 'Chưa cập nhật email';
  const profilePhone = user?.phoneNumber || overview.phone || 'Chưa cập nhật số điện thoại';
  const profileAvatar = user?.photoURL || overview.avatarUrl || '';
  const [notificationStatus, setNotificationStatus] = useState('Đang kiểm tra quyền thông báo...');
  const [isRequestingNotificationPermission, setIsRequestingNotificationPermission] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      if (isExpoGo) {
        setNotificationStatus('Expo Go không hỗ trợ đầy đủ thông báo. Dùng Development Build để bật báo thức nhắc nhở.');
        return;
      }

      try {
        const Notifications = await getNotificationsModule();
        if (!Notifications) {
          setNotificationStatus('Không tải được dịch vụ thông báo lúc này.');
          return;
        }

        const permission = await Notifications.getPermissionsAsync();
        if (permission.granted) {
          setNotificationStatus('Thông báo đã được bật.');
          return;
        }

        if (permission.canAskAgain === false) {
          setNotificationStatus('Thông báo đang tắt. Hãy mở trong Cài đặt iPhone.');
          return;
        }

        setNotificationStatus('Thông báo đang tắt. Bạn có thể bật ngay bên dưới.');
      } catch (_error) {
        setNotificationStatus('Không kiểm tra được quyền thông báo lúc này.');
      }
    };

    checkPermission();
  }, []);

  const handleRequestNotifications = async () => {
    if (isRequestingNotificationPermission) return;

    if (isExpoGo) {
      Alert.alert(
        'Giới hạn của Expo Go',
        'Tính năng thông báo/báo thức đầy đủ cần chạy bằng Development Build thay vì Expo Go.'
      );
      return;
    }

    setIsRequestingNotificationPermission(true);
    try {
      const Notifications = await getNotificationsModule();
      if (!Notifications) {
        Alert.alert('Không thể bật thông báo', 'Không tải được dịch vụ thông báo lúc này.');
        return;
      }

      const current = await Notifications.getPermissionsAsync();
      let permission = current;

      if (!current.granted && current.canAskAgain !== false) {
        permission = await Notifications.requestPermissionsAsync();
      }

      if (permission.granted) {
        setNotificationStatus('Thông báo đã được bật.');
        Alert.alert('Thành công', 'Ứng dụng đã được cấp quyền thông báo.');
        return;
      }

      setNotificationStatus('Thông báo đang tắt. Hãy mở trong Cài đặt iPhone.');
      Alert.alert('Cần bật thông báo', 'Bạn hãy mở Cài đặt để cấp quyền thông báo cho ứng dụng.', [
        { text: 'Để sau', style: 'cancel' },
        {
          text: 'Mở Cài đặt',
          onPress: () => {
            Linking.openSettings();
          }
        }
      ]);
    } catch (_error) {
      Alert.alert('Không thể bật thông báo', 'Vui lòng thử lại sau.');
    } finally {
      setIsRequestingNotificationPermission(false);
    }
  };

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Hồ sơ</Text>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          {profileAvatar ? (
            <Image source={{ uri: profileAvatar }} style={styles.avatarImage} resizeMode="cover" />
          ) : (
            <Ionicons name="person" size={26} color={theme.colors.primary} />
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{profileName}</Text>
          <Text style={styles.meta}>{profileEmail}</Text>
          <Text style={styles.meta}>{profilePhone}</Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('ProfileEdit')}>
          <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
          {/* <Text style={styles.editButtonText}>Sửa</Text> */}
        </TouchableOpacity>
      </Card>

      <View style={styles.statsRow}>
        {stats.map((stat) => (
          <Card key={stat.id} style={styles.statCard}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Card>
        ))}
      </View>

      <Text style={styles.sectionLabel}>THÔNG BÁO</Text>
      <Card style={styles.notificationCard}>
        <View style={styles.notificationHeader}>
          <Ionicons name="notifications-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.notificationTitle}>Nhận thông báo nhắc lịch</Text>
        </View>
        <Text style={styles.notificationStatus}>{notificationStatus}</Text>
        <PrimaryButton
          label={isRequestingNotificationPermission ? 'Đang yêu cầu quyền...' : 'Bật thông báo'}
          onPress={handleRequestNotifications}
          style={styles.notificationButton}
        />
      </Card>

      <GhostButton
        label="Đăng xuất"
        onPress={onLogout}
        style={styles.logoutButton}
        textStyle={styles.logoutText}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    // marginLeft: 8
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18
  },
  profileInfo: {
    flex: 1,
    marginLeft: 8,
    marginRight: 12
  },
  name: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 2
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  editButtonText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginLeft: 4,
    fontWeight: '700'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4
  },
  statValue: {
    ...theme.typography.h3,
    color: theme.colors.text
  },
  statLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 6
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    letterSpacing: 1.4,
    marginTop: theme.spacing.xxs,
    marginBottom: theme.spacing.md,
    fontWeight: '600'
  },
  notificationCard: {
    marginBottom: theme.spacing.md
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  notificationTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    marginLeft: 8
  },
  notificationStatus: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 8
  },
  notificationButton: {
    marginTop: theme.spacing.md,
    paddingVertical: 12
  },
  logoutButton: {
    marginTop: theme.spacing.md,
    borderColor: theme.colors.danger,
    backgroundColor: theme.colors.dangerSoft
  },
  logoutText: {
    color: theme.colors.danger
  }
});

export default ProfileScreen;
