import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, View } from 'react-native';

interface ToolbarButtonProps {
  onPress: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  activeStyle?: ViewStyle;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  onPress,
  isActive = false,
  children,
  style,
  activeStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        style,
        isActive && [styles.activeButton, activeStyle],
      ]}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeButton: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  toolbarButtonText: {
    fontSize: 16,
    color: '#111827',
  },
});

export default ToolbarButton;
