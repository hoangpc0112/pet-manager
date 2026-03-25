import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import Card from '../components/Card';
import Chip from '../components/Chip';
import ProgressSteps from '../components/ProgressSteps';
import PrimaryButton from '../components/PrimaryButton';
import theme from '../theme';
import { pets, symptomGroups } from '../data/assistant';

const SymptomStep1Screen = ({ navigation }) => {
  return (
    <Screen contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={theme.colors.primary} />
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kiểm tra triệu chứng</Text>
      </View>

      <Text style={styles.stepLabel}>Bước 1/4</Text>
      <Text style={styles.stepTitle}>Chọn thú cưng và nhóm vấn đề</Text>
      <ProgressSteps total={4} current={1} />

      <Card style={styles.card}>
        {pets.map((pet) => (
          <View key={pet.id} style={styles.petRow}>
            <View style={styles.petIcon}>
              <Ionicons name="paw" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{pet.name}</Text>
              <Text style={styles.petBreed}>{pet.breed}</Text>
            </View>
            {pet.selected ? <Text style={styles.petSelected}>Đã chọn</Text> : null}
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Nhóm triệu chứng</Text>
        <View style={styles.chipsRow}>
          {symptomGroups.map((group, index) => (
            <Chip key={group} label={group} active={index === 0} />
          ))}
        </View>
      </Card>

      <Text style={styles.note}>Gợi ý tham khảo, không thay thế tư vấn thú y.</Text>

      <PrimaryButton
        label="Tiếp tục"
        onPress={() => navigation.navigate('SymptomStep2')}
        style={styles.primaryButton}
      />
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
  stepLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  stepTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginTop: 6
  },
  card: {
    marginTop: theme.spacing.lg
  },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  petIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center'
  },
  petInfo: {
    flex: 1,
    marginLeft: 12
  },
  petName: {
    ...theme.typography.body,
    fontWeight: '700'
  },
  petBreed: {
    ...theme.typography.caption,
    color: theme.colors.textMuted
  },
  petSelected: {
    color: theme.colors.primary,
    fontWeight: '600'
  },
  sectionTitle: {
    ...theme.typography.body,
    fontWeight: '700',
    marginBottom: theme.spacing.md
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  note: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.xl
  },
  primaryButton: {
    marginTop: theme.spacing.xl
  }
});

export default SymptomStep1Screen;
