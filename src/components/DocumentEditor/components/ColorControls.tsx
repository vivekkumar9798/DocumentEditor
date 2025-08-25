import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { ColorControlsProps } from '../types';

export const ColorControls: React.FC<ColorControlsProps> = ({ onColorChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [previewColor, setPreviewColor] = useState<string>('#111827');

  const colors = useMemo(
    () => [
      '#000000','#111827','#1f2937','#374151','#4b5563','#6b7280','#9ca3af','#d1d5db','#f3f4f6',
      '#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#14b8a6','#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef',
      '#dc2626','#ea580c','#d97706','#ca8a04','#65a30d','#16a34a','#059669','#0d9488','#0891b2','#0284c7','#2563eb','#4f46e5','#7c3aed','#9333ea','#c026d3',
      '#b91c1c','#c2410c','#b45309','#a16207','#4d7c0f','#15803d','#047857','#0f766e','#0e7490','#0369a1','#1d4ed8','#4338ca','#6d28d9','#7e22ce','#a21caf'
    ],
    []
  );

  const handlePick = (color: string) => {
    setPreviewColor(color);
    // Apply first, then close shortly after to avoid selection loss
    onColorChange(color);
    setTimeout(() => setIsOpen(false), 30);
  };

  return (
    <View style={styles.toolbarSection}>
      <TouchableOpacity style={styles.colorButton} onPress={() => setIsOpen(true)}>
        <View style={[styles.colorDot, { backgroundColor: previewColor }]} />
        <Text style={styles.colorButtonText}>Color</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={() => setIsOpen(true)}>
        <Pressable style={styles.backdrop} onPress={() => setIsOpen(false)}>
          <View pointerEvents="box-none" style={styles.modalWrapper}>
            <View style={styles.paletteCard}>
              <Text style={styles.paletteTitle}>Pick a color</Text>
              <View style={styles.paletteBody}>
                <ScrollView 
                  contentContainerStyle={styles.paletteGrid}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={true}
                >
                  {colors.map((c, idx) => (
                    <TouchableOpacity key={idx} style={[styles.swatch, { backgroundColor: c }]} onPress={() => handlePick(c)} />
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  colorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)'
  },
  colorButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.04)'
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  paletteCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
  paletteBody: {
    flex: 1,
  },
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 24,
    overflow: 'hidden',
  },
  paletteTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    color: '#0f172a'
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
    justifyContent: 'space-between'
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    margin: 5,
  },
});

export default ColorControls;
