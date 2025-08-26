import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DocumentHeaderProps } from '../types';

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  onBackPress,
  title,
}) => {
  return (
    <View style={styles.header}>
      {onBackPress ? (
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSide} />
      )}
      <Text style={[styles.headerTitle, !onBackPress && styles.headerTitleCentered]}>{title}</Text>
      <View style={styles.headerSide} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 0,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
  },
  backButtonText: {
    fontSize: 18,
    color: '#2563eb',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
    letterSpacing: 0.2,
  },
  headerTitleCentered: {
    marginLeft: 0,
  },
  headerSide: {
    width: 40,
  },
  privacyButton: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  privacyText: {
    color: '#4f46e5',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default DocumentHeader;
