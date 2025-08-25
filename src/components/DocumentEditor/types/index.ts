import { ReactNode } from 'react';
import { ViewStyle, TextStyle, StyleProp } from 'react-native';

export interface DocumentHeaderProps {
  onBackPress?: () => void;
  title: string;
  onPrivacyPress?: () => void;
}

export interface ToolbarButtonProps {
  onPress: () => void;
  children: ReactNode;
  isActive?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export interface ColorPickerProps {
  onColorChange: (color: string) => void;
}

export interface FontSelectorProps {
  currentFont: string;
  onFontChange: (font: string) => void;
}

export interface SizeSelectorProps {
  currentSize: number;
  onSizeChange: (size: number) => void;
}

export interface StyleControlsProps {
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
}

export interface ColorControlsProps {
  onColorChange: (color: string) => void;
}

export interface SelectedTextDisplayProps {
  selectedText: string;
}

export interface DocumentWebViewProps {
  onMessage?: (event: any) => void;
  ref?: React.RefObject<any>;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
  html?: string;
}

export interface DocumentEditorState {
  selectedText: string;
  currentFont: string;
  currentColor: string;
  currentSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

export interface FormattingToolbarProps {
  currentFont: string;
  currentSize: number | string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  onFontChange: (font: string) => void;
  onSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
}

export interface DocumentEditorProps {
  onBackPress?: () => void;
  title?: string;
  onShowPrivacy?: () => void;
}

export interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  backButtonText: TextStyle;
  headerTitle: TextStyle;
  headerRight: ViewStyle;
  toolbar: ViewStyle;
  toolbarSection: ViewStyle;
  toolbarLabel: TextStyle;
  toolbarButton: ViewStyle;
  activeButton: ViewStyle;
  toolbarButtonText: TextStyle;
  styleButtons: ViewStyle;
  separator: ViewStyle;
  colorButton: ViewStyle;
  selectedTextContainer: ViewStyle;
  selectedTextLabel: TextStyle;
  selectedText: TextStyle;
  webViewContainer: ViewStyle;
  webView: ViewStyle;
}
