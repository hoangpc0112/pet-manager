import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import IconBadge from '../components/IconBadge';
import PrimaryButton from '../components/PrimaryButton';
import SectionTitle from '../components/SectionTitle';
import theme from '../theme';
import { assistantTools } from '../data/assistant';

const AssistantHomeScreen = ({ navigation }) => {
  return (
    <Screen contentContainerStyle={styles.container}>
      <Text style={styles.header}>Trợ lý</Text>

      <View style={styles.grid}>
        {assistantTools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={styles.toolCard}
            activeOpacity={0.9}
            onPress={() => {
              if (tool.id === 'symptom') {
                navigation.navigate('SymptomStep1');
              }
            }}
          >
            <IconBadge>
              <Ionicons name={tool.icon} size={22} color={theme.colors.primary} />
            </IconBadge>
            <Text style={styles.toolTitle}>{tool.title}</Text>
            <Text style={styles.toolSubtitle}>{tool.subtitle}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>KẾT QUẢ GẦN ĐÂY</Text>
      <Card style={styles.emptyCard}>
        <View style={styles.sparkle}>
          <Ionicons name="sparkles" size={26} color={theme.colors.textLight} />
        </View>
        <SectionTitle style={styles.emptyTitle}>Chưa có lịch sử trợ lý</SectionTitle>
        <Text style={styles.emptySubtitle}>
          Kết quả AI sẽ hiển thị tại đây sau khi bạn sử dụng các công cụ.
        </Text>
        <PrimaryButton
          label="Bắt đầu kiểm tra triệu chứng"
          onPress={() => navigation.navigate('SymptomStep1')}
          style={styles.primaryButton}
        />
      </Card>

      <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
        <Ionicons name="sparkles" size={18} color="#FFFFFF" />
        <Text style={styles.fabLabel}>Trợ lý AI</Text>
      </TouchableOpacity>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 100
  },
  header: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  toolCard: {
    width: '48%',
    backgroundColor: theme.colors.card,
    borderRadius: 18,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow.card
  },
  toolTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md
  },
  toolSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 6
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    letterSpacing: 1.5,
    marginBottom: theme.spacing.md,
    fontWeight: '600'
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl
  },
  sparkle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    marginBottom: theme.spacing.lg
  },
  emptyTitle: {
    textAlign: 'center'
  },
  emptySubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: theme.spacing.lg
  },
  primaryButton: {
    alignSelf: 'stretch'
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: 30,
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

export default AssistantHomeScreen;
