import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import { FormattingToolbarProps } from '../types';

const FONT_OPTIONS = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Courier New', value: 'Courier New' },
  { label: 'Impact', value: 'Impact' },
  { label: 'Comic Sans MS', value: 'Comic Sans MS' },
  { label: 'Tahoma', value: 'Tahoma' },
  { label: 'Trebuchet MS', value: 'Trebuchet MS' },
  { label: 'Lucida Console', value: 'Lucida Console' },
  { label: 'Palatino', value: 'Palatino' },
  { label: 'Garamond', value: 'Garamond' },
  { label: 'Bookman', value: 'Bookman' },
  { label: 'Century Gothic', value: 'Century Gothic' },
];

const SIZE_OPTIONS = [
  { label: 'Small', value: 2 },
  { label: 'Normal', value: 3 },
  { label: 'Large', value: 4 },
  { label: 'Huge', value: 5 },
];

const COLOR_OPTIONS = [
  '#000000', '#111827', '#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#FFFFFF',
  '#EF4444', '#F59E0B', '#FBBF24', '#FDE68A', '#10B981', '#22C55E', '#34D399',
  '#3B82F6', '#60A5FA', '#93C5FD', '#8B5CF6', '#A78BFA', '#EC4899', '#F472B6',
  '#14B8A6', '#06B6D4', '#67E8F9', '#F97316', '#FB923C', '#E11D48', '#7C3AED'
];

interface ConsolidatedToolbarProps extends FormattingToolbarProps {
  showColorPicker?: boolean;
  onClose?: () => void;
}

const ConsolidatedToolbar: React.FC<ConsolidatedToolbarProps> = ({
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
  showColorPicker = true,
  onClose,
}) => {
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [fontQuery, setFontQuery] = useState('');
  const [recentColors, setRecentColors] = useState<string[]>([]);

  const filteredFonts = useMemo(() => {
    const q = fontQuery.trim().toLowerCase();
    if (!q) return FONT_OPTIONS;
    return FONT_OPTIONS.filter(f => f.label.toLowerCase().includes(q) || f.value.toLowerCase().includes(q));
  }, [fontQuery]);

  const getFontLabel = (font: string) => {
    const option = FONT_OPTIONS.find(opt => opt.value === font);
    return option ? option.label : 'Font';
  };

  const getSizeLabel = (size: number | string) => {
    const sizeNum = typeof size === 'string' ? parseInt(size, 10) : size;
    const option = SIZE_OPTIONS.find(opt => opt.value === sizeNum);
    return option ? option.label : 'Size';
  };

  const handleFontSelect = (font: string) => {
    onFontChange(font);
    setShowFontDropdown(false);
    setFontQuery('');
  };

  const handleSizeSelect = (size: number) => {
    onSizeChange(size);
    setShowSizeDropdown(false);
  };

  const handleColorPick = (color: string) => {
    onColorChange(color);
    setShowColorModal(false);
    setRecentColors(prev => {
      const next = [color, ...prev.filter(c => c !== color)].slice(0, 8);
      return next;
    });
  };

  return (
    <View style={styles.toolbarWrapper}>
      <View style={styles.toolbar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Font Chip */}
          <View style={styles.chipContainer}>
            <TouchableOpacity
              style={styles.chip}
              onPress={() => setShowFontDropdown(true)}
            >
              <Text style={styles.chipLabel}>{getFontLabel(currentFont)}</Text>
              <Text style={styles.chipCaret}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Size Chip */}
          <View style={styles.chipContainer}>
            <TouchableOpacity
              style={styles.chip}
              onPress={() => setShowSizeDropdown(true)}
            >
              <Text style={styles.chipLabel}>{getSizeLabel(currentSize)}</Text>
              <Text style={styles.chipCaret}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Style Buttons */}
          <View style={styles.styleControls}>
            <TouchableOpacity
              style={[styles.styleButton, isBold && styles.styleButtonActive]}
              onPress={onBold}
            >
              <Text style={[styles.styleButtonText, isBold && styles.styleButtonTextActive]}>B</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.styleButton, isItalic && styles.styleButtonActive]}
              onPress={onItalic}
            >
              <Text style={[styles.styleButtonText, styles.italicText, isItalic && styles.styleButtonTextActive]}>I</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.styleButton, isUnderline && styles.styleButtonActive]}
              onPress={onUnderline}
            >
              <Text style={[styles.styleButtonText, isUnderline && styles.styleButtonTextActive, styles.underlineText]}>U</Text>
            </TouchableOpacity>
          </View>

          {/* Color Chip */}
          {showColorPicker && (
            <View style={styles.chipContainer}>
              <TouchableOpacity
                style={styles.colorChip}
                onPress={() => setShowColorModal(true)}
                accessibilityRole="button"
                accessibilityLabel="Open color picker"
              >
                <View style={styles.colorPreviewRow}>
                  <View style={[styles.colorSwatch, styles.colorSwatchBlack]} />
                </View>
                <Text style={styles.chipCaret}>▾</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close toolbar" hitSlop={{top:8,right:8,bottom:8,left:8}}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Font Modal */}
      <Modal
        visible={showFontDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFontDropdown(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFontDropdown(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Font</Text>
            <View style={styles.searchBox}>
              <TextInput
                value={fontQuery}
                onChangeText={setFontQuery}
                placeholder="Search fonts"
                placeholderTextColor="#94a3b8"
                style={styles.searchInput}
              />
            </View>
            <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
              {filteredFonts.map((font) => (
                <TouchableOpacity
                  key={font.value}
                  style={[styles.modalItem, currentFont === font.value && styles.modalItemActive]}
                  onPress={() => handleFontSelect(font.value)}
                >
                  <Text style={[styles.modalItemText, currentFont === font.value && styles.modalItemTextActive]}>
                    {font.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Size Modal */}
      <Modal
        visible={showSizeDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSizeDropdown(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSizeDropdown(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Size</Text>
            <ScrollView style={styles.modalList}>
              {SIZE_OPTIONS.map((size) => (
                <TouchableOpacity
                  key={size.value}
                  style={[
                    styles.modalItem,
                    (typeof currentSize === 'string' ? parseInt(currentSize, 10) : currentSize) === size.value && styles.modalItemActive
                  ]}
                  onPress={() => handleSizeSelect(size.value)}
                >
                  <Text style={[
                    styles.modalItemText,
                    (typeof currentSize === 'string' ? parseInt(currentSize, 10) : currentSize) === size.value && styles.modalItemTextActive
                  ]}>
                    {size.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Color Modal */}
      <Modal
        visible={showColorModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowColorModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowColorModal(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Text color</Text>
            {!!recentColors.length && (
              <View style={styles.recentRow}>
                <Text style={styles.recentLabel}>Recent</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScrollContent}>
                  {recentColors.map(color => (
                    <TouchableOpacity key={color} style={[styles.recentSwatch, { backgroundColor: color }]} onPress={() => handleColorPick(color)} accessibilityRole="button" accessibilityLabel={`Use color ${color}`} />
                  ))}
                </ScrollView>
              </View>
            )}
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorCell, { backgroundColor: color }]}
                  onPress={() => handleColorPick(color)}
                  accessibilityRole="button"
                  accessibilityLabel={`Use color ${color}`}
                >
                  <View style={styles.colorCellInner} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbarWrapper: {
    position: 'relative',
    paddingTop: 4,
  },
  toolbar: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    borderRadius: 10,
    paddingRight: 40,
  },
  scrollContent: {
    alignItems: 'center',
    gap: 5,
    paddingRight: 20,
  },
  chipContainer: {
    height: 40,
    marginHorizontal: 2,
  },
  chip: {
    height: 40,
    minWidth: 50,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  chipCaret: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  styleControls: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingHorizontal: 4,
    height: 40,
    alignItems: 'center',
  },
  styleButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginHorizontal: 4,
  },
  styleButtonActive: {
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    borderColor: '#93c5fd',
  },
  styleButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    opacity: 0.9,
  },
  styleButtonTextActive: {
    color: '#2563eb',
    opacity: 1,
  },
  italicText: {
    fontStyle: 'italic',
  },
  underlineText: {
    textDecorationLine: 'underline',
  },
  colorChip: {
    height: 40,
    minWidth: 40,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f8fafc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)'
  },
  colorSwatchBlack: {
    backgroundColor: '#000000'
  },
  colorSwatchPink: {
    backgroundColor: '#f43f5e'
  },
  colorSwatchBlue: {
    backgroundColor: '#3b82f6'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '92%',
    maxWidth: 520,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 16,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchInput: {
    height: 42,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    color: '#0f172a',
  },
  modalList: {
    paddingHorizontal: 8,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginHorizontal: 8,
    marginVertical: 4,
  },
  modalItemActive: {
    backgroundColor: '#eff6ff',
  },
  modalItemText: {
    fontSize: 14,
    color: '#1f2937',
  },
  modalItemTextActive: {
    color: '#2563eb',
    fontWeight: '700',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  colorCell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    margin: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCellInner: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)'
  },
  recentRow: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  recentLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
    fontWeight: '600'
  },
  recentScrollContent: {
    alignItems: 'center',
    paddingRight: 8,
    gap: 8,
  },
  recentSwatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    marginRight: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    borderWidth: 1,
    elevation: 0,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#475569',
    lineHeight: 20,
  },
});

export default ConsolidatedToolbar;
