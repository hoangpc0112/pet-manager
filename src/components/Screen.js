import React, { useCallback, useRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../theme';

const Screen = ({
  children,
  scroll = true,
  contentContainerStyle,
  style,
  scrollViewRef,
  resetScrollOnFocus = true
}) => {
  const internalScrollRef = useRef(null);

  const assignScrollRef = useCallback(
    (node) => {
      internalScrollRef.current = node;

      if (!scrollViewRef) return;
      if (typeof scrollViewRef === 'function') {
        scrollViewRef(node);
        return;
      }

      scrollViewRef.current = node;
    },
    [scrollViewRef]
  );

  useFocusEffect(
    useCallback(() => {
      if (!scroll || !resetScrollOnFocus) return undefined;

      const frameId = requestAnimationFrame(() => {
        internalScrollRef.current?.scrollTo?.({ y: 0, animated: false });
      });

      return () => cancelAnimationFrame(frameId);
    }, [scroll, resetScrollOnFocus])
  );

  if (!scroll) {
    return (
      <SafeAreaView style={[styles.safe, style]}>
        <KeyboardAvoidingView
          style={styles.keyboardWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
        >
          <View style={[styles.fixedContent, contentContainerStyle]}>{children}</View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, style]}>
      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          ref={assignScrollRef}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          automaticallyAdjustKeyboardInsets
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  keyboardWrap: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl
  },
  fixedContent: {
    flex: 1,
    paddingTop: theme.spacing.md
  }
});

export default Screen;
