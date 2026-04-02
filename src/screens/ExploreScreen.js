import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import IconBadge from '../components/IconBadge';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const ExploreScreen = ({ navigation }) => {
  const { exploreCards, recommendations } = useAppData();
  const cards = exploreCards || [];
  const suggestionItems = recommendations || [];

  return (
    <Screen contentContainerStyle={styles.container}>
      <Text style={styles.header}>Khám phá</Text>

      {cards.map((card) => (
        <TouchableOpacity
          key={card.id}
          activeOpacity={0.9}
          onPress={() => {
            if (card.id === 'community') navigation.navigate('Community');
            if (card.id === 'shop') navigation.navigate('Shop');
            if (card.id === 'nearby') navigation.navigate('NearbyServices');
          }}
        >
          <Card style={styles.card}>
            <IconBadge>
              <Ionicons name={card.icon} size={22} color={theme.colors.primary} />
            </IconBadge>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
          </Card>
        </TouchableOpacity>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 120,
  },
  header: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg
  },
  card: {
    marginBottom: theme.spacing.lg
  },
  cardTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    marginTop: theme.spacing.md
  },
  cardSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 6
  },
  sectionLabel: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    letterSpacing: 1.4,
    marginBottom: theme.spacing.md,
    fontWeight: '600'
  },
  recommendationCard: {
    padding: 0
  },
  recommendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg
  },
  recommendIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  recommendText: {
    flex: 1,
    marginLeft: 12
  },
  recommendTitle: {
    ...theme.typography.body,
    fontWeight: '600'
  },
  recommendMeta: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  ratingText: {
    marginRight: 4,
    fontWeight: '600',
    color: theme.colors.text
  },
  divider: {
    position: 'absolute',
    left: 72,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: theme.colors.border
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF4FF',
    borderRadius: 14,
    padding: 12,
    marginTop: theme.spacing.lg
  },
  tipText: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
    marginLeft: 8,
    flex: 1
  },
  loading: {
    ...theme.typography.body,
    color: theme.colors.textMuted
  }
});

export default ExploreScreen;
