import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import theme from '../theme';
import { communityTabs } from '../data/community';
import { useAppData } from '../context/AppDataContext';

const CommunityScreen = ({ navigation }) => {
  const { communityPosts } = useAppData();
  const tabs = communityTabs;
  const [activeTab, setActiveTab] = useState('Hỏi đáp');
  const [keyword, setKeyword] = useState('');

  const posts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return communityPosts.filter((post) => {
      const passTab = post.category === activeTab;

      if (!passTab) return false;
      if (!normalizedKeyword) return true;

      const haystack = [post.title, post.content, post.location, (post.tags || []).join(' ')].join(' ').toLowerCase();
      return haystack.includes(normalizedKeyword);
    });
  }, [activeTab, keyword, communityPosts]);

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cộng đồng</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CommunityNew')}>
          <Ionicons name="add" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={theme.colors.textLight} />
        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder="Lọc theo tiêu đề, nội dung hoặc tag"
          placeholderTextColor={theme.colors.textLight}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab === 'review' ? 'Review' : tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.resultText}>{posts.length} kết quả</Text>

      {posts.map((post) => (
        <Card key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.postIcon}>
              <Ionicons name={post.category === 'review' ? 'star' : 'help-circle'} size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.postTitleBlock}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postMeta}>{post.author} • {post.time}</Text>
            </View>
            {post.category === 'review' && post.reviewScore ? (
              <View style={styles.reviewBadge}>
                <Ionicons name="star" size={12} color={theme.colors.warning} />
                <Text style={styles.reviewBadgeText}>{post.reviewScore}/5</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          {post.imageUrl ? (
            <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
          ) : null}

          <View style={styles.tagRow}>
            {post.tags.map((tag) => (
              <Chip key={tag} label={tag} />
            ))}
          </View>

          <View style={styles.postFooter}>
            {post.category !== 'Mạng xã hội' ? (
              <View style={styles.footerRow}>
                <Ionicons name="location" size={14} color={theme.colors.textLight} />
                <Text style={styles.footerText}>{post.location}</Text>
              </View>
            ) : (
              <View />
            )}
            <Text style={styles.footerText}>{post.likes} thích • {post.comments} bình luận</Text>
          </View>
        </Card>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    ...theme.shadow.card
  },
  headerTitle: {
    ...theme.typography.h3,
    flex: 1,
    textAlign: 'center',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.sm
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    minHeight: 46,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    color: theme.colors.text
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    padding: 4,
    marginBottom: theme.spacing.lg
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center'
  },
  tabActive: {
    backgroundColor: '#FFFFFF'
  },
  tabText: {
    ...theme.typography.caption,
    color: theme.colors.textLight
  },
  tabTextActive: {
    color: theme.colors.text,
    fontWeight: '600'
  },
  resultText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md
  },
  postCard: {
    marginBottom: theme.spacing.lg
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  postIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  postTitleBlock: {
    marginLeft: 12,
    flex: 1
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999
  },
  reviewBadgeText: {
    marginLeft: 4,
    color: '#B45309',
    fontWeight: '700',
    fontSize: 12
  },
  postTitle: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  postMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4
  },
  postContent: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: theme.spacing.md
  },
  postImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginTop: theme.spacing.md
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.md
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  footerText: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginLeft: 6
  },
  loading: {
    ...theme.typography.body,
    color: theme.colors.textMuted
  }
});

export default CommunityScreen;




