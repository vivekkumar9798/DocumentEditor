import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import StyleControls from './StyleControls';
import ColorControls from './ColorControls';
import DropdownMenu from './DropdownMenu';
import { FormattingToolbarProps } from '../types';

const FONT_OPTIONS = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Verdana', value: 'Verdana' },
];

const SIZE_OPTIONS = [
  { label: 'Small', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Large', value: '4' },
  { label: 'Huge', value: '5' },
];

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  currentFont,
  currentSize,
  isBold,
  isItalic,
  isUnderline,
  onFontChange,
  onSizeChange,
  onColorChange,
  onBold,
  onItalic,
  onUnderline,
}) => {
  const getFontLabel = (font: string) => {
    const option = FONT_OPTIONS.find(opt => opt.value === font);
    return option ? option.label : 'Font';
  };

  const getSizeLabel = (size: number | string) => {
    const sizeStr = typeof size === 'number' ? size.toString() : size;
    const option = SIZE_OPTIONS.find(opt => opt.value === sizeStr);
    return option ? option.label : 'Size';
  };

  return (
    <View style={styles.toolbar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <DropdownMenu
          title={getFontLabel(currentFont)}
          items={FONT_OPTIONS.map(font => ({
            label: font.label,
            value: font.value,
            onPress: () => onFontChange(font.value)
          }))}
          style={styles.dropdown}
        />
        
        <View style={styles.separator} />
        
        <DropdownMenu
          title={getSizeLabel(currentSize)}
          items={SIZE_OPTIONS.map(size => ({
            label: size.label,
            value: size.value,
            onPress: () => onSizeChange(parseInt(size.value, 10))
          }))}
          style={styles.dropdown}
        />
        
        <View style={styles.separator} />
        
        <StyleControls
          isBold={isBold}
          isItalic={isItalic}
          isUnderline={isUnderline}
          onBold={onBold}
          onItalic={onItalic}
          onUnderline={onUnderline}
        />
        
        <View style={styles.separator} />
        
        <ColorControls onColorChange={onColorChange} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#ffffff',
    height: 60,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 10,
    zIndex: 2000,
    position: 'relative',
    overflow: 'visible',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
    height: '100%',
    gap: 8,
  },
  dropdown: {
    minWidth: 100,
    marginHorizontal: 6,
    height: 40,
  },
  separator: {
    width: StyleSheet.hairlineWidth,
    height: 30,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 6,
  },
});

export default FormattingToolbar;
