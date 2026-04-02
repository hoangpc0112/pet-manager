import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const ShopScreen = ({ navigation }) => {
  const { shopTabs, shopItems } = useAppData();
  const tabs = shopTabs || [];
  const items = shopItems || [];

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cửa hàng</Text>
      </View>

      <View style={styles.banner}>
        <Ionicons name="lock-closed" size={16} color={theme.colors.primary} />
        <Text style={styles.bannerText}>Mua hàng bên ngoài ứng dụng.</Text>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab, index) => (
          <Chip key={tab} label={tab} active={index === 0} style={styles.tabChip} />
        ))}
      </View>

      {items.map((item) => (
        <Card key={item.id} style={styles.itemCard}>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
          <View style={styles.itemFooter}>
            <Text style={styles.itemPrice}>{item.price}</Text>
            <TouchableOpacity style={styles.itemButton}>
              <Text style={styles.itemButtonText}>Xem sản phẩm</Text>
              <Ionicons name="open" size={14} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>
        </Card>
      ))}
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F1FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: theme.spacing.md
  },
  bannerText: {
    marginLeft: 8,
    color: theme.colors.textMuted
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: theme.spacing.md
  },
  tabChip: {
    marginRight: 8
  },
  itemCard: {
    marginBottom: theme.spacing.lg
  },
  itemCategory: {
    ...theme.typography.caption,
    color: theme.colors.textLight
  },
  itemTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    marginTop: 6
  },
  itemSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md
  },
  itemPrice: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  itemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  itemButtonText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginRight: 6
  },
  loading: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md
  }
});

export default ShopScreen;




