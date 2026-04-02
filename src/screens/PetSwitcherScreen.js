import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import theme from '../theme';
import { useAppData } from '../context/AppDataContext';

const PetSwitcherScreen = ({ navigation }) => {
  const { pets, petSwitcher } = useAppData();
  const fallbackSwitcher = (pets || []).map((pet, index) => ({
    ...pet,
    selected: index === 0
  }));
  const switcherList = (petSwitcher && petSwitcher.length > 0 ? petSwitcher : fallbackSwitcher) || [];

  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đổi thú cưng</Text>
      </View>

      <Card style={styles.card}>
        {switcherList.map((pet, index) => (
          <View key={pet.id} style={[styles.row, index === switcherList.length - 1 && styles.lastRow]}>
            <View style={styles.iconBox}>
              <Ionicons name="paw" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.textBlock}>
              <Text style={styles.name}>{pet.name}</Text>
              <Text style={styles.meta}>{pet.breed} • {pet.weight}</Text>
            </View>
            {pet.selected ? (
              <View style={styles.selectedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.primary} />
                <Text style={styles.selectedText}>Đang chọn</Text>
              </View>
            ) : null}
          </View>
        ))}
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
    marginBottom: theme.spacing.lg
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
  card: {
    padding: 0
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  lastRow: {
    borderBottomWidth: 0
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center'
  },
  textBlock: {
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
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  selectedText: {
    marginLeft: 6,
    color: theme.colors.primary,
    fontWeight: '600'
  }
});

export default PetSwitcherScreen;




