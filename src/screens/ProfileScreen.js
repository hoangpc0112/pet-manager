import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import GhostButton from '../components/GhostButton';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation, onLogout }) => {
  const { profileOverview, profileSettings, profileStats } = useAppData();
  const { user } = useAuth();
  const overview = profileOverview || {};
  const settings = profileSettings || [];
  const stats = profileStats || [];
  const profileName = user?.displayName || overview.name || 'Người dùng';
  const profileEmail = user?.email || overview.email || 'Chưa cập nhật email';
  const profilePhone = user?.phoneNumber || overview.phone || 'Chưa cập nhật số điện thoại';
  const profileAvatar = user?.photoURL || overview.avatarUrl || '';

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

      <Text style={styles.sectionLabel}>CÀI ĐẶT</Text>
      {settings.map((setting) => (
        <Card key={setting.id} style={styles.settingCard}>
          <View>
            <Text style={styles.settingLabel}>{setting.label}</Text>
            <Text style={styles.settingValue}>{setting.value}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />
        </Card>
      ))}

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
    marginLeft: 12
  },
  name: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4
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
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    fontWeight: '600'
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md
  },
  settingLabel: {
    ...theme.typography.body,
    fontWeight: '600'
  },
  settingValue: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4
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
