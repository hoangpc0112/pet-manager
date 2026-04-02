import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme';

const getVisiblePages = (currentPage, totalPages) => {
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, start + 4);
  const normalizedStart = Math.max(1, end - 4);

  return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index);
};

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.navButton, currentPage === 1 && styles.disabledButton]}
        disabled={currentPage === 1}
        onPress={() => onPageChange(currentPage - 1)}
      >
        <Text style={[styles.navText, currentPage === 1 && styles.disabledText]}>Trước</Text>
      </TouchableOpacity>

      <View style={styles.numberRow}>
        {pages[0] > 1 ? <Text style={styles.ellipsis}>...</Text> : null}
        {pages.map((page) => (
          <TouchableOpacity
            key={page}
            style={[styles.pageButton, page === currentPage && styles.pageButtonActive]}
            onPress={() => onPageChange(page)}
          >
            <Text style={[styles.pageText, page === currentPage && styles.pageTextActive]}>{page}</Text>
          </TouchableOpacity>
        ))}
        {pages[pages.length - 1] < totalPages ? <Text style={styles.ellipsis}>...</Text> : null}
      </View>

      <TouchableOpacity
        style={[styles.navButton, currentPage === totalPages && styles.disabledButton]}
        disabled={currentPage === totalPages}
        onPress={() => onPageChange(currentPage + 1)}
      >
        <Text style={[styles.navText, currentPage === totalPages && styles.disabledText]}>Sau</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  navButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF'
  },
  disabledButton: {
    backgroundColor: '#F3F4F6'
  },
  navText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '700'
  },
  disabledText: {
    color: theme.colors.textLight
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10
  },
  pageButton: {
    minWidth: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF'
  },
  pageButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft
  },
  pageText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    fontWeight: '600'
  },
  pageTextActive: {
    color: theme.colors.primary,
    fontWeight: '700'
  },
  ellipsis: {
    ...theme.typography.caption,
    color: theme.colors.textLight,
    marginHorizontal: 3
  }
});

export default PaginationControls;
