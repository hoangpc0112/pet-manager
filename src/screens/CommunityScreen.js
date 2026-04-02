import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import PaginationControls from '../components/PaginationControls';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';

const PAGE_SIZE = 5;

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  const parsed = Date.parse(String(value));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const formatFixedPostTime = (post) => {
  const postedAt = toMillis(post.createdAt);
  if (!postedAt) return post.time || '';

  return new Date(postedAt).toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const CommunityScreen = ({ navigation }) => {
  const { communityPosts, communityTabs, profileOverview, toggleCommunityPostLike, addCommunityPostComment } =
    useAppData();
  const { user } = useAuth();
  const tabs = communityTabs || [];
  const [activeTab, setActiveTab] = useState('Hỏi đáp');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewAspectRatio, setPreviewAspectRatio] = useState(1);
  const scrollRef = useRef(null);
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const actorId = user?.uid || user?.email || '';
  const actorName = user?.displayName || profileOverview?.name || 'Bạn';
  const actorAvatar = user?.photoURL || profileOverview?.avatarUrl || '';

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

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const visiblePosts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return posts.slice(start, start + PAGE_SIZE);
  }, [posts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, keyword]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [posts.length, totalPages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  }, [currentPage]);

  const toggleCommentPanel = (postId) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleSubmitComment = (postId) => {
    const content = (commentDrafts[postId] || '').trim();
    if (!content) return;

    addCommunityPostComment(postId, {
      author: actorName,
      authorAvatarUrl: actorAvatar,
      content
    });

    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
  };

  const openImagePreview = (imageUrl) => {
    if (!imageUrl) return;
    Image.prefetch(imageUrl).catch(() => {});
    Image.getSize(
      imageUrl,
      (imgWidth, imgHeight) => {
        if (imgWidth > 0 && imgHeight > 0) {
          setPreviewAspectRatio(imgWidth / imgHeight);
        }
      },
      () => setPreviewAspectRatio(1)
    );
    setPreviewImageUrl(imageUrl);
  };

  const closeImagePreview = () => {
    setPreviewImageUrl('');
  };

  const previewBox = useMemo(() => {
    const maxWidth = Math.max(120, screenWidth - theme.spacing.lg * 2);
    const maxHeight = Math.max(120, screenHeight * 0.72);

    let width = maxWidth;
    let height = width / Math.max(0.1, previewAspectRatio);

    if (height > maxHeight) {
      height = maxHeight;
      width = height * Math.max(0.1, previewAspectRatio);
    }

    return {
      width,
      height
    };
  }, [previewAspectRatio, screenWidth, screenHeight]);

  return (
    <Screen contentContainerStyle={styles.container} scrollViewRef={scrollRef}>
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
          placeholder="Lọc theo tiêu đề, nội dung"
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

      {visiblePosts.map((post) => (
        <Card key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <View style={styles.authorAvatarWrap}>
              {post.authorAvatarUrl ? (
                <Image source={{ uri: post.authorAvatarUrl }} style={styles.authorAvatar} resizeMode="cover" />
              ) : (
                <View style={styles.postIcon}>
                  <Ionicons
                    name={post.category === 'review' ? 'star' : 'person'}
                    size={18}
                    color={theme.colors.primary}
                  />
                </View>
              )}
            </View>
            <View style={styles.postTitleBlock}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postMeta}>{post.author} • {formatFixedPostTime(post)}</Text>
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
            <TouchableOpacity activeOpacity={0.9} onPress={() => openImagePreview(post.imageUrl)}>
              <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
            </TouchableOpacity>
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
            ) : (null)  
            }
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleCommunityPostLike(post.id, actorId)}
              disabled={!actorId}
            >
              <Ionicons
                name={(post.likedBy || []).includes(actorId) ? 'heart' : 'heart-outline'}
                size={18}
                color={(post.likedBy || []).includes(actorId) ? theme.colors.danger : theme.colors.textMuted}
              />
              <Text style={styles.actionText}>{post.likes} lượt thích</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => toggleCommentPanel(post.id)}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color={theme.colors.textMuted} />
              <Text style={styles.actionText}>{post.comments} bình luận</Text>
            </TouchableOpacity>
          </View>

          {expandedComments[post.id] ? (
            <View style={styles.commentPanel}>
              {(post.commentItems || []).map((item) => (
                <View key={item.id} style={styles.commentItem}>
                  {item.authorAvatarUrl ? (
                    <Image source={{ uri: item.authorAvatarUrl }} style={styles.commentAvatar} resizeMode="cover" />
                  ) : (
                    <View style={styles.commentAvatarFallback}>
                      <Ionicons name="person" size={12} color={theme.colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.commentBody}>
                    <Text style={styles.commentAuthor}>{item.author}</Text>
                    <Text style={styles.commentText}>{item.content}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.commentComposer}>
                <TextInput
                  value={commentDrafts[post.id] || ''}
                  onChangeText={(value) =>
                    setCommentDrafts((prev) => ({
                      ...prev,
                      [post.id]: value
                    }))
                  }
                  placeholder="Viết bình luận..."
                  placeholderTextColor={theme.colors.textLight}
                  style={styles.commentInput}
                />
                <TouchableOpacity style={styles.sendButton} onPress={() => handleSubmitComment(post.id)}>
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </Card>
      ))}

      <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <Modal
        visible={Boolean(previewImageUrl)}
        transparent
        animationType="none"
        onRequestClose={closeImagePreview}
      >
        <Pressable style={styles.previewBackdrop} onPressIn={closeImagePreview}>
          <View style={styles.previewSheet} pointerEvents="box-none">
            <TouchableOpacity style={styles.previewClose} onPressIn={closeImagePreview}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <Pressable style={[styles.previewImageWrap, previewBox]} onPress={() => {}}>
              <Image source={{ uri: previewImageUrl }} style={styles.previewImage} resizeMode="contain" />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  authorAvatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    overflow: 'hidden'
  },
  authorAvatar: {
    width: '100%',
    height: '100%'
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
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.88)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md
  },
  previewSheet: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.xl
  },
  previewClose: {
    alignSelf: 'flex-end',
    marginRight: theme.spacing.md,
    marginBottom: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    zIndex: 2
  },
  previewImageWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden'
  },
  previewImage: {
    width: '100%',
    height: '100%'
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
    marginTop: theme.spacing.xxs
  },
  actionRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
    gap: 8
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F9FAFB'
  },
  actionText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginLeft: 6,
    fontWeight: '600'
  },
  commentPanel: {
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  commentAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13
  },
  commentAvatarFallback: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  commentBody: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  commentAuthor: {
    ...theme.typography.small,
    color: theme.colors.text,
    fontWeight: '700'
  },
  commentText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginTop: 2
  },
  commentComposer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
    marginRight: 8
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary
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




