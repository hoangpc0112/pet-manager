import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import PaginationControls from '../components/PaginationControls';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const PAGE_SIZE = 6;
const ALL_TAB = 'Tất cả';
const DEFAULT_SHOPEE_URL = 'https://shopee.vn/search?keyword=pet';

const ShopScreen = ({ navigation }) => {
  const { shopTabs, shopItems } = useAppData();
  const tabs = shopTabs || [];
  const items = shopItems || [];
  const scrollRef = useRef(null);
  const [selectedTab, setSelectedTab] = useState(tabs[0] || ALL_TAB);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!tabs.includes(selectedTab)) {
      setSelectedTab(tabs[0] || ALL_TAB);
      setCurrentPage(1);
    }
  }, [tabs, selectedTab]);

  const filteredItems = useMemo(() => {
    if (selectedTab === ALL_TAB) return items;
    return items.filter((item) => item.category === selectedTab);
  }, [items, selectedTab]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
  const visibleItems = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [filteredItems.length, totalPages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentPage]);

  const handleOpenShopee = async (item) => {
    const itemKeyword = encodeURIComponent(String(item?.title || 'phu kien thu cung'));
    const targetUrl = item?.link || item?.url || `https://shopee.vn/search?keyword=${itemKeyword}`;

    try {
      const canOpen = await Linking.canOpenURL(targetUrl);
      if (!canOpen) {
        await Linking.openURL(DEFAULT_SHOPEE_URL);
        return;
      }
      await Linking.openURL(targetUrl);
    } catch (_error) {
      Alert.alert('Không thể mở liên kết', 'Không mở được Shopee. Vui lòng thử lại sau.');
    }
  };

  return (
    <Screen contentContainerStyle={styles.container} scrollViewRef={scrollRef}>
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
        {tabs.map((tab) => (
          <Chip key={tab} label={tab} active={tab === selectedTab} onPress={() => setSelectedTab(tab)} style={styles.tabChip} />
        ))}
      </View>

      {visibleItems.map((item) => (
        <Card key={item.id} style={styles.itemCard}>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
          <View style={styles.itemFooter}>
            <Text style={styles.itemPrice}>{item.price}</Text>
            <TouchableOpacity style={styles.itemButton} onPress={() => handleOpenShopee(item)}>
              <Text style={styles.itemButtonText}>Xem sản phẩm</Text>
              <Ionicons name="open" size={14} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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




