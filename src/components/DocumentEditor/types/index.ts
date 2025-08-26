import { ViewStyle, StyleProp } from 'react-native';

export interface DocumentHeaderProps {
  onBackPress?: () => void;
  title: string;
  onPrivacyPress?: () => void;
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
