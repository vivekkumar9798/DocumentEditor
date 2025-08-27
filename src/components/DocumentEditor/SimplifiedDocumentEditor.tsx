import React, { useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DocumentHeader from './components/DocumentHeader';
import ConsolidatedToolbar from './components/ConsolidatedToolbar';
import DocumentWebView, {
  DocumentWebViewHandle,
} from './components/DocumentWebView';
import { DocumentEditorProps, DocumentEditorState } from './types';

const defaultContent = `
  <h1>Sample Document</h1>
  <p>
    Select any portion of this text to try the toolbar actions. You can change
    the <strong>font</strong>, <em>size</em>, <u>style</u>, and <span style="color:#ef4444">color</span> of the selection.
  </p>
  <h2>Introduction</h2>
  <p>
    This is a longer paragraph intended to provide more content inside the WebView.
    The goal is to ensure selection works consistently across multiple lines and
    different elements such as <code>inline code</code>, links like
    <a href="https://example.com">example.com</a>, and nested inline spans.
  </p>
  <p>
    Formatting commands are applied programmatically and do not allow free typing.
    This means you can highlight words or sentences and apply bold, italic, underline,
    font family, size, or color changes from the toolbar above.
  </p>
  <h2>List of Topics</h2>
  <ul>
    <li>Headings and paragraphs for realistic structure</li>
    <li>Inline elements such as <em>emphasis</em> and <strong>strong</strong></li>
    <li>Links (navigation blocked)</li>
    <li>Lists and quotes</li>
  </ul>
  <blockquote>
    "Good writing is clear thinking made visible." — Bill Wheeler
  </blockquote>
  <h3>Another Section</h3>
  <p>
    Try selecting across sentence boundaries, within lists, or inside quotes. The selection should remain
    intact when using the toolbar, and the caret should remain hidden.
  </p>
  <p>
    End of sample content. Feel free to add more text programmatically if required.
  </p>
`;

const SimplifiedDocumentEditor: React.FC<DocumentEditorProps> = () => {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<DocumentWebViewHandle>(null);

  const [state, setState] = useState<DocumentEditorState>({
    selectedText: '',
    currentFont: 'Arial',
    currentColor: '#000000',
    currentSize: 3,
    isBold: false,
    isItalic: false,
    isUnderline: false,
  });
  const [selectionRect, setSelectionRect] = useState<{
    left: number;
    top: number;
    right?: number;
    bottom?: number;
    width: number;
    height: number;
  } | null>(null);
  const [webViewLayout, setWebViewLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const [toolbarSize, setToolbarSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'currentHTML') {
        console.log('=== FORMATTED HTML CONTENT ===');
        console.log(data.html);
        console.log('=== END HTML CONTENT ===');
      }

      if (data.type === 'textSelected') {
        if (data.text) {
          setIsToolbarVisible(true);
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 140,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 8,
              tension: 80,
              useNativeDriver: true,
            }),
          ]).start();
        }

        setState(prev => ({
          ...prev,
          selectedText: data.text,
          isBold: data.formatState ? !!data.formatState.bold : prev.isBold,
          isItalic: data.formatState
            ? !!data.formatState.italic
            : prev.isItalic,
          isUnderline: data.formatState
            ? !!data.formatState.underline
            : prev.isUnderline,
          currentFont:
            data.formatState && data.formatState.fontFamily
              ? String(data.formatState.fontFamily)
                  .split(',')[0]
                  .replace(/"/g, '')
                  .trim()
              : prev.currentFont,
          currentSize:
            data.formatState && data.formatState.fontSizePx
              ? fontPxToExecSize(Number(data.formatState.fontSizePx))
              : prev.currentSize,
        }));
        if (data.rect && typeof data.rect.top === 'number') {
          setSelectionRect({
            left: data.rect.left,
            top: data.rect.top,
            right: data.rect.right,
            bottom: data.rect.bottom,
            width: data.rect.width,
            height: data.rect.height,
          });
        } else if (!data.text) {
          setIsToolbarVisible(false);
          setSelectionRect(null);
        }
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  const handleFontChange = (font: string) => {
    setState(prev => ({ ...prev, currentFont: font }));
    webViewRef.current?.executeCommand('changeFontFamily', font);
  };

  const handleSizeChange = (size: number) => {
    setState(prev => ({ ...prev, currentSize: size }));
    webViewRef.current?.executeCommand('changeFontSize', size.toString());
  };

  const handleColorChange = (color: string) => {
    performAction(() => {
      setState(prev => ({ ...prev, currentColor: color }));
      webViewRef.current?.executeCommand('changeTextColor', color);
    });
  };

  const performAction = (action: () => void) => {
    action();
    setTimeout(() => {
      webViewRef.current?.executeCommand('reportSelection');
    }, 100);
  };

  const handleBold = () => {
    performAction(() => {
      webViewRef.current?.executeCommand('toggleBold');
      setState(prev => ({ ...prev, isBold: !prev.isBold }));
    });
  };

  const handleItalic = () => {
    performAction(() => {
      webViewRef.current?.executeCommand('toggleItalic');
      setState(prev => ({ ...prev, isItalic: !prev.isItalic }));
    });
  };

  const handleUnderline = () => {
    performAction(() => {
      webViewRef.current?.executeCommand('toggleUnderline');
      setState(prev => ({ ...prev, isUnderline: !prev.isUnderline }));
    });
  };

  const { currentFont, currentSize, isBold, isItalic, isUnderline } = state;

  function fontPxToExecSize(px: number): number {
    if (!px || !Number.isFinite(px)) return 3;
    if (px < 12) return 1;
    if (px < 14) return 2;
    if (px < 18) return 3;
    if (px < 24) return 4;
    if (px < 32) return 5;
    if (px < 40) return 6;
    return 7;
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.bgDecorOne} pointerEvents="none" />
      <View style={styles.bgDecorTwo} pointerEvents="none" />

      <DocumentHeader onBackPress={undefined} title="Document Editor" />

      <View style={styles.headerDivider} />

      <View style={styles.editorCard}>
        <DocumentWebView
          content={defaultContent}
          ref={webViewRef}
          onMessage={handleMessage}
          editable={true}
          style={styles.webView}
          onLayout={(e: any) => {
            const { x, y, width, height } = e.nativeEvent.layout;
            setWebViewLayout({ x, y, width, height });
          }}
        />
        {isToolbarVisible && selectionRect && webViewLayout && (
          <View pointerEvents="box-none" style={styles.overlayFill}>
            <Animated.View
              style={[
                styles.popupToolbar,
                (() => {
                  const estimatedWidth = toolbarSize?.width ?? 360;
                  const estimatedHeight = toolbarSize?.height ?? 100;
                  const selectionCenterX =
                    selectionRect.left + selectionRect.width / 2;
                  const margin = 8;
                  let top = selectionRect.top - estimatedHeight - margin;
                  const placeBelow =
                    top < margin && selectionRect.bottom !== undefined;
                  if (placeBelow && selectionRect.bottom !== undefined) {
                    top = selectionRect.bottom + margin;
                  }
                  let left = selectionCenterX - estimatedWidth / 2;
                  const minLeft = margin;
                  const maxLeft = Math.max(
                    minLeft,
                    webViewLayout.width - estimatedWidth - margin,
                  );
                  if (left < minLeft) left = minLeft;
                  if (left > maxLeft) left = maxLeft;
                  return {
                    top,
                    left,
                    maxWidth: webViewLayout.width - margin * 2,
                  } as const;
                })(),
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
              ]}
              onLayout={(e: any) => {
                const { width, height } = e.nativeEvent.layout;
                if (
                  !toolbarSize ||
                  toolbarSize.width !== width ||
                  toolbarSize.height !== height
                ) {
                  setToolbarSize({ width, height });
                }
              }}
            >
              <View
                pointerEvents="none"
                style={[
                  styles.popupArrow,
                  (() => {
                    const estimatedWidth = toolbarSize?.width ?? 360;
                    const estimatedHeight = toolbarSize?.height ?? 100;
                    const selectionCenterX =
                      selectionRect.left + selectionRect.width / 2;
                    const margin = 8;
                    let top = selectionRect.top - estimatedHeight - margin;
                    const placeBelow =
                      top < margin && selectionRect.bottom !== undefined;
                    let left = selectionCenterX - estimatedWidth / 2;
                    const minLeft = margin;
                    const maxLeft = Math.max(
                      minLeft,
                      webViewLayout.width - estimatedWidth - margin,
                    );
                    if (left < minLeft) left = minLeft;
                    if (left > maxLeft) left = maxLeft;
                    const arrowLeftWithin = selectionCenterX - left - 7;
                    return placeBelow
                      ? {
                          top: -7,
                          left: Math.max(
                            12,
                            Math.min(estimatedWidth - 26, arrowLeftWithin),
                          ),
                        }
                      : {
                          bottom: -7,
                          left: Math.max(
                            12,
                            Math.min(estimatedWidth - 26, arrowLeftWithin),
                          ),
                        };
                  })(),
                ]}
              />
              <ConsolidatedToolbar
                currentFont={currentFont}
                currentSize={currentSize}
                isBold={isBold}
                isItalic={isItalic}
                isUnderline={isUnderline}
                onFontChange={handleFontChange}
                onSizeChange={handleSizeChange}
                onColorChange={handleColorChange}
                onBold={handleBold}
                onItalic={handleItalic}
                onUnderline={handleUnderline}
                onClose={() => {
                  setIsToolbarVisible(false);
                  setSelectionRect(null); // Clear the selection rectangle to ensure it's gone.
                  webViewRef.current?.executeCommand('unselect');
                  webViewRef.current?.getCurrentHTML();
                }}
              />
            </Animated.View>
          </View>
        )}
      </View>
    </View>
  );
};

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
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 1,
    overflow: 'hidden',
  },
  webView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  popupToolbar: {
    position: 'absolute',
    borderRadius: 14,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  popupArrow: {
    position: 'absolute',
    width: 14,
    height: 14,
    backgroundColor: '#ffffff',
    transform: [{ rotate: '45deg' }],
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  overlayFill: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
});

export default SimplifiedDocumentEditor;
