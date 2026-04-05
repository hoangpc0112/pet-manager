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
const DEFAULT_SHOPEE_ITEMS = [
  {
    id: 'shopee-basic-food-1',
    category: 'Dinh dưỡng',
    title: 'Hạt cho chó trưởng thành',
    subtitle: 'Từ khóa Shopee: hạt cho chó',
    price: 'Giá trên Shopee',
    link: 'https://shopee.vn/search?keyword=hat%20cho%20cho',
    source: 'Shopee'
  },
  {
    id: 'shopee-basic-food-2',
    category: 'Dinh dưỡng',
    title: 'Pate cho mèo đóng hộp',
    subtitle: 'Từ khóa Shopee: pate mèo',
    price: 'Giá trên Shopee',
    link: 'https://shopee.vn/search?keyword=pate%20meo',
    source: 'Shopee'
  },
  {
    id: 'shopee-basic-health-1',
    category: 'Sức khoẻ',
    title: 'Men tiêu hóa cho chó mèo',
    subtitle: 'Từ khóa Shopee: men tiêu hóa pet',
    price: 'Giá trên Shopee',
    link: 'https://shopee.vn/search?keyword=men%20tieu%20hoa%20cho%20meo',
    source: 'Shopee'
  },
  {
    id: 'shopee-basic-accessory-1',
    category: 'Phụ kiện',
    title: 'Dây dắt và vòng cổ cho chó',
    subtitle: 'Từ khóa Shopee: dây dắt cho chó',
    price: 'Giá trên Shopee',
    link: 'https://shopee.vn/search?keyword=day%20dat%20cho%20cho',
    source: 'Shopee'
  },
  {
    id: 'shopee-basic-clean-1',
    category: 'Vệ sinh',
    title: 'Sữa tắm cho mèo và chó',
    subtitle: 'Từ khóa Shopee: sữa tắm thú cưng',
    price: 'Giá trên Shopee',
    link: 'https://shopee.vn/search?keyword=sua%20tam%20thu%20cung',
    source: 'Shopee'
  },
  {
    id: 'shopee-basic-clean-2',
    category: 'Vệ sinh',
    title: 'Cát vệ sinh vón cục',
    subtitle: 'Từ khóa Shopee: cát vệ sinh mèo',
    price: 'Giá trên Shopee',
    link: 'https://shopee.vn/search?keyword=cat%20ve%20sinh%20meo',
    source: 'Shopee'
  }
];

const ShopScreen = ({ navigation }) => {
  const { shopTabs, shopItems } = useAppData();
  const items = Array.isArray(shopItems) && shopItems.length > 0 ? shopItems : DEFAULT_SHOPEE_ITEMS;
  const fallbackTabs = [ALL_TAB, ...new Set(items.map((item) => item.category).filter(Boolean))];
  const tabs = Array.isArray(shopTabs) && shopTabs.length > 1 ? shopTabs : fallbackTabs;
  const isUsingFallbackItems = !Array.isArray(shopItems) || shopItems.length === 0;
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

      {isUsingFallbackItems ? <Text style={styles.sourceText}>Đang hiển thị các món đồ cơ bản từ Shopee.</Text> : null}

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
          {item.source ? <Text style={styles.itemSource}>Nguồn: {item.source}</Text> : null}
          <View style={styles.itemFooter}>
            <Text style={styles.itemPrice}>{item.price}</Text>
            <TouchableOpacity style={styles.itemButton} onPress={() => handleOpenShopee(item)}>
              <Text style={styles.itemButtonText}>Xem sản phẩm</Text>
              <Ionicons name="open" size={14} color={theme.colors.textLight} />
            </TouchableOpacity>
          </View>
        </Card>
      ))}

      {visibleItems.length === 0 ? (
        <Card style={styles.itemCard}>
          <Text style={styles.emptyText}>Chưa có sản phẩm trong nhóm này. Hãy chọn nhóm khác.</Text>
        </Card>
      ) : null}

      {filteredItems.length > 0 ? (
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      ) : null}
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
  sourceText: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm
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
  itemSource: {
    ...theme.typography.small,
    color: theme.colors.textLight,
    marginTop: 6
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
  emptyText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  loading: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md
  }
});

export default ShopScreen;




