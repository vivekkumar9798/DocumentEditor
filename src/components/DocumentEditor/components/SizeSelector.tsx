import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ToolbarButton from './ToolbarButton';
import { SizeSelectorProps } from '../types';

const sizes = [12, 14, 16, 18, 20, 24, 28, 32];

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  currentSize,
  onSizeChange,
}) => {
  return (
    <View style={styles.toolbarSection}>
      <Text style={styles.toolbarLabel}>Size</Text>
      <View style={styles.scrollContainer}>
        {sizes.map((size, index) => (
          <ToolbarButton
            key={index}
            onPress={() => onSizeChange(size)}
            isActive={currentSize === size}
          >
            <Text style={styles.toolbarButtonText}>{size}</Text>
          </ToolbarButton>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  toolbarLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
    minWidth: 40,
  },
  scrollContainer: {
    flexDirection: 'row',
  },
  toolbarButtonText: {
    fontSize: 14,
    color: '#333',
  },
});

export default SizeSelector;
