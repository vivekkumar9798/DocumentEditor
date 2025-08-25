import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ToolbarButton from './ToolbarButton';
import { StyleControlsProps } from '../types';

export const StyleControls: React.FC<StyleControlsProps> = ({
  isBold,
  isItalic,
  isUnderline,
  onBold,
  onItalic,
  onUnderline,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <ToolbarButton 
          onPress={onBold} 
          isActive={isBold}
          style={styles.button}
          activeStyle={styles.activeButton}
        >
          <Text style={[styles.buttonText, isBold && styles.activeButtonText]}>B</Text>
        </ToolbarButton>
        
        <View style={styles.separator} />
        
        <ToolbarButton 
          onPress={onItalic} 
          isActive={isItalic}
          style={styles.button}
          activeStyle={styles.activeButton}
        >
          <Text style={[styles.buttonText, styles.italicText, isItalic && styles.activeButtonText]}>I</Text>
        </ToolbarButton>
        
        <View style={styles.separator} />
        
        <ToolbarButton 
          onPress={onUnderline} 
          isActive={isUnderline}
          style={styles.button}
          activeStyle={styles.activeButton}
        >
          <Text style={[styles.buttonText, isUnderline && styles.activeButtonText, styles.underlineText]}>
            U
          </Text>
        </ToolbarButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 4,
    height: 40,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  buttonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  button: {
    paddingHorizontal: 10,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 38,
  },
  activeButton: {
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    opacity: 0.9,
  },
  activeButtonText: {
    color: '#2563eb',
    opacity: 1,
  },
  italicText: {
    fontStyle: 'italic',
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
});

export default StyleControls;
