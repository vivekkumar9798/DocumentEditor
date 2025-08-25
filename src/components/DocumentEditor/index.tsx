import React, { Component } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import DocumentHeader from './components/DocumentHeader';
import FormattingToolbar from './components/FormattingToolbar';
import SelectedTextDisplay from './components/SelectedTextDisplay';
import DocumentWebView, { DocumentWebViewHandle } from './components/DocumentWebView';
import { DocumentEditorProps, DocumentEditorState } from './types';

class DocumentEditor extends Component<DocumentEditorProps, DocumentEditorState> {
  private webViewRef = React.createRef<DocumentWebViewHandle>();

  constructor(props: DocumentEditorProps) {
    super(props);
    
    this.state = {
      selectedText: '',
      currentFont: 'Arial',
      currentColor: '#000000',
      currentSize: 3, // Default size index
      isBold: false,
      isItalic: false,
      isUnderline: false,
    };
  }

  

  handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'textSelected') {
        this.setState({ selectedText: data.text });
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  handleFontChange = (font: string) => {
    this.setState({ currentFont: font });
    this.webViewRef.current?.executeCommand('changeFontFamily', font);
  };

  handleSizeChange = (size: number) => {
    // Map the size to the actual font size values used by document.execCommand
    // 2 = small, 3 = normal, 4 = large, 5 = huge
    this.setState({ currentSize: size });
    this.webViewRef.current?.executeCommand('changeFontSize', size.toString());
  };

  handleColorChange = (color: string) => {
    this.setState({ currentColor: color });
    this.webViewRef.current?.executeCommand('changeTextColor', color);
  };

  handleBold = () => {
    this.setState(prevState => {
      this.webViewRef.current?.executeCommand('toggleBold');
      return { isBold: !prevState.isBold };
    });
  };

  handleItalic = () => {
    this.setState(prevState => {
      this.webViewRef.current?.executeCommand('toggleItalic');
      return { isItalic: !prevState.isItalic };
    });
  };

  handleUnderline = () => {
    this.setState(prevState => {
      this.webViewRef.current?.executeCommand('toggleUnderline');
      return { isUnderline: !prevState.isUnderline };
    });
  };

  render() {
    const { onShowPrivacy } = this.props;
    const {
      selectedText,
      currentFont,
      currentSize,
      isBold,
      isItalic,
      isUnderline,
    } = this.state;
    
    // Ensure currentSize is a number for the dropdown
    const dropdownSize = typeof currentSize === 'string' ? parseInt(currentSize, 10) : currentSize;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.bgDecorOne} pointerEvents="none" />
        <View style={styles.bgDecorTwo} pointerEvents="none" />
        <DocumentHeader 
          onBackPress={undefined}
          title="Document Viewer" 
          onPrivacyPress={onShowPrivacy}
        />
        <View style={styles.headerDivider} />

        <FormattingToolbar
          currentFont={currentFont}
          currentSize={dropdownSize}
          isBold={isBold}
          isItalic={isItalic}
          isUnderline={isUnderline}
          onFontChange={this.handleFontChange}
          onSizeChange={this.handleSizeChange}
          onColorChange={this.handleColorChange}
          onBold={this.handleBold}
          onItalic={this.handleItalic}
          onUnderline={this.handleUnderline}
        />
        
        <View style={styles.editorCard}>
          <DocumentWebView 
            ref={this.webViewRef}
            onMessage={this.handleMessage} 
            editable={true}
            style={styles.webView}
          />
        </View>
        
        <SelectedTextDisplay selectedText={selectedText} />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    width: '100%',
    height: '100%',
  },
  bgDecorOne: {
    position: 'absolute',
    top: -120,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: '#dbeafe',
    opacity: 0.5,
  },
  bgDecorTwo: {
    position: 'absolute',
    bottom: -140,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: '#fde68a',
    opacity: 0.35,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
  },
  editorCard: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  selectedTextContainer: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
  },
  selectedText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});

export default DocumentEditor;
