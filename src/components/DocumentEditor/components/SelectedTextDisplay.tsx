import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SelectedTextDisplayProps } from '../types';

export const SelectedTextDisplay: React.FC<SelectedTextDisplayProps> = ({
  selectedText,
}) => {
  if (!selectedText) return null;

  return (
    <View style={styles.selectedTextContainer}>
      <Text style={styles.selectedTextLabel}>Selected: </Text>
      <Text style={styles.selectedText} numberOfLines={1}>
        "{selectedText}"
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  selectedTextContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  selectedTextLabel: {
    fontWeight: '600',
    fontSize: 13,
    color: '#64748b',
    marginRight: 6,
  },
  selectedText: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    fontStyle: 'italic',
  },
});

export default SelectedTextDisplay;
