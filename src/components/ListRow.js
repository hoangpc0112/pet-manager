import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import theme from '../theme';

const ListRow = ({ title, subtitle, right, style }) => {
  return (
    <View style={[styles.row, style]}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border
  },
  textBlock: {
    flex: 1
  },
  title: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600'
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4
  }
});

export default ListRow;
