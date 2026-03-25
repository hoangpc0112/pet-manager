import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { newPostDefaults } from '../data/community';

const Field = ({ label, placeholder }) => {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label} <Text style={styles.required}>*</Text></Text>
      <View style={styles.fieldInput}>
        <Text style={styles.fieldPlaceholder}>{placeholder}</Text>
      </View>
    </View>
  );
};

const CommunityNewPostScreen = ({ navigation }) => {
  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.publish}>Đăng</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>Tạo bài viết</Text>

      <Card style={styles.card}>
        <Field label="Tiêu đề" placeholder="Nhập tiêu đề bài viết" />
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Danh mục <Text style={styles.required}>*</Text></Text>
          <View style={styles.selectInput}>
            <Text style={styles.fieldPlaceholder}>{newPostDefaults.category}</Text>
            <Ionicons name="chevron-down" size={18} color={theme.colors.textLight} />
          </View>
        </View>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Nội dung <Text style={styles.required}>*</Text></Text>
          <View style={[styles.fieldInput, styles.textArea]}>
            <Text style={styles.fieldPlaceholder}>Mô tả chi tiết để cộng đồng hỗ trợ tốt hơn</Text>
          </View>
        </View>
        <View style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>Tag</Text>
          <View style={styles.fieldInput}>
            <Text style={styles.fieldPlaceholder}>Ví dụ: grooming, tiêm chủng</Text>
          </View>
          <Text style={styles.helper}>Có thể nhập nhiều tag, cách nhau bởi dấu phẩy.</Text>
        </View>
        <Field label="Khu vực" placeholder="Ví dụ: Quận 3, TP.HCM" />
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
  backText: {
    color: theme.colors.primary,
    marginLeft: 6,
    fontWeight: '600'
  },
  publish: {
    color: theme.colors.primary,
    fontWeight: '600'
  },
  header: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg
  },
  card: {
    padding: theme.spacing.lg
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
    marginTop: 8
  },
  selectInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  fieldPlaceholder: {
    color: theme.colors.textLight
  },
  textArea: {
    height: 140
  },
  helper: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    marginTop: 6
  }
});

export default CommunityNewPostScreen;
