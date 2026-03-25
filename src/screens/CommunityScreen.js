import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import theme from '../theme';
import { communityPosts, communityTabs } from '../data/community';

const CommunityScreen = ({ navigation }) => {
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

      <Text style={styles.header}>Cộng đồng</Text>

      <View style={styles.tabRow}>
        {communityTabs.map((tab, index) => (
          <TouchableOpacity key={tab} style={[styles.tab, index === 0 && styles.tabActive]}>
            <Text style={[styles.tabText, index === 0 && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {communityPosts.map((post) => (
        <Card key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.postIcon}>
              <Ionicons name={post.tags[0] === '#review' ? 'star' : 'help-circle'} size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.postTitleBlock}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postMeta}>{post.author} • {post.time}</Text>
            </View>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          <View style={styles.tagRow}>
            {post.tags.map((tag) => (
              <Chip key={tag} label={tag} />
            ))}
          </View>

          <View style={styles.postFooter}>
            <View style={styles.footerRow}>
              <Ionicons name="location" size={14} color={theme.colors.textLight} />
              <Text style={styles.footerText}>{post.location}</Text>
            </View>
            <Text style={styles.footerText}>{post.likes} thích • {post.comments} bình luận</Text>
          </View>
        </Card>
      ))}

      <TouchableOpacity style={styles.fab} activeOpacity={0.9} onPress={() => navigation.navigate('CommunityNew')}>
        <Ionicons name="pencil" size={18} color="#FFFFFF" />
        <Text style={styles.fabLabel}>Đăng bài</Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 140
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
    ...theme.typography.h1,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    ...theme.shadow.button
  },
  fabLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8
  }
});

export default CommunityScreen;
