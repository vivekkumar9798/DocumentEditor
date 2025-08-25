import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

export type DocumentWebViewHandle = {
  executeCommand: (command: string, value?: string) => void;
};

type Props = {
  onMessage?: (event: any) => void;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
  html?: string;
};

const htmlContent = () => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; padding: 12px; font-family: Arial, sans-serif; background: #ffffff; }
      #editor {
        min-height: 100vh;
        outline: none;
        -webkit-user-select: text;
        user-select: text;
        caret-color: transparent;
        color: #111827;
        line-height: 1.6;
        max-width: 760px;
        margin: 0 auto;
      }
      h1, h2, h3 { margin: 0.8em 0 0.4em; font-weight: 700; color: #0f172a; }
      h1 { font-size: 28px; }
      h2 { font-size: 22px; }
      h3 { font-size: 18px; }
      p { margin: 0.6em 0; color: #334155; }
      ul, ol { margin: 0.6em 0 0.6em 1.25em; }
      li { margin: 0.3em 0; }
      a { color: #2563eb; text-decoration: underline; }
      blockquote { margin: 0.8em 0; padding: 0.6em 1em; border-left: 4px solid #e5e7eb; color: #475569; background: #f8fafc; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; background: #f1f5f9; padding: 0 4px; border-radius: 4px; }
      /* Prevent long-tap callout menu on iOS except for text selection */
      * { -webkit-touch-callout: none; }
      /* Allow text selection */
      #editor, #editor * { -webkit-touch-callout: default; }
    </style>
  </head>
  <body>
    <div id="editor" contenteditable="false">
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
        “Good writing is clear thinking made visible.” — Bill Wheeler
      </blockquote>
      <h3>Another Section</h3>
      <p>
        Try selecting across sentence boundaries, within lists, or inside quotes. The selection should remain
        intact when using the toolbar, and the caret should remain hidden.
      </p>
      <p>
        End of sample content. Feel free to add more text programmatically if required.
      </p>
    </div>
    <script>
      (function() {
        function post(type, payload) {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...payload }));
        }

        var lastRange = null; // may be collapsed
        var stableRange = null; // only updated when selection is non-collapsed
        var editor = document.getElementById('editor');

        try { editor.setAttribute('inputmode', 'none'); } catch(e) {}

        // Block navigation and clickable behavior while allowing selection
        document.addEventListener('click', function(e) {
          var target = e.target;
          if (target && (target.closest && target.closest('a'))) {
            e.preventDefault();
            e.stopPropagation();
          }
        }, true);

        document.addEventListener('mousedown', function(e) {
          var target = e.target;
          if (target && (target.closest && target.closest('a'))) {
            e.preventDefault();
          }
        }, true);

        document.addEventListener('touchstart', function(e) {
          var target = e.target;
          if (target && (target.closest && target.closest('a'))) {
            e.preventDefault();
          }
        }, { passive: false, capture: true });

        document.addEventListener('selectionchange', function() {
          var selection = window.getSelection();
          var text = selection ? selection.toString() : '';
          if (selection && selection.rangeCount > 0) {
            var r = selection.getRangeAt(0);
            lastRange = r;
            // Only persist stableRange when the selection is non-collapsed
            if (r && !r.collapsed && text && text.length > 0) {
              try { stableRange = r.cloneRange(); } catch (e) {}
            }
          }
          post('textSelected', { text: text });
        });

        // Prevent typing/editing, allow selection. Allow formatting via execCommand
        editor.addEventListener('beforeinput', function(e) {
          var t = e.inputType || '';
          if (t.indexOf('insert') === 0 || t.indexOf('delete') === 0) {
            e.preventDefault();
          }
        });

        editor.addEventListener('paste', function(e) { e.preventDefault(); });
        editor.addEventListener('drop', function(e) { e.preventDefault(); });
        editor.addEventListener('keydown', function(e) {
          var allowedKeys = [
            'Shift','Control','Meta','Alt','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown','Escape','Tab'
          ];
          var isAllowed = allowedKeys.indexOf(e.key) !== -1;
          if (!isAllowed) {
            e.preventDefault();
          }
        });

        window.__restoreSelection = function() {
          try {
            editor && editor.focus();
            var targetRange = stableRange || lastRange;
            if (targetRange) {
              var sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(targetRange);
            }
          } catch (e) {}
        }

        window.__execCommand = function(command, value) {
          try {
            // Temporarily enable editing to apply the command, then disable again
            editor && editor.setAttribute('contenteditable', 'true');
            window.__restoreSelection();
            try { document.execCommand('styleWithCSS', false, true); } catch(e) {}
            // If user tapped a color immediately after selection, ensure we use the last stable non-collapsed range
            if (command === 'changeTextColor' || command === 'changeFontFamily' || command === 'changeFontSize') {
              try {
                var selNow = window.getSelection();
                if (selNow && selNow.rangeCount > 0) {
                  var currentRange = selNow.getRangeAt(0);
                  if (currentRange && currentRange.collapsed && stableRange) {
                    selNow.removeAllRanges();
                    selNow.addRange(stableRange);
                  }
                } else if (stableRange) {
                  var sel2 = window.getSelection();
                  sel2.removeAllRanges();
                  sel2.addRange(stableRange);
                }
              } catch(_e) {}
            }
            if (command === 'changeFontFamily') {
              var applied = false;
              try {
                applied = document.execCommand('fontName', false, value);
              } catch(e1) { applied = false; }
              // Fallback: wrap selection in a span with font-family style
              if (!applied) {
                try {
                  var sel = window.getSelection();
                  if (sel && sel.rangeCount > 0) {
                    for (var i = 0; i < sel.rangeCount; i++) {
                      var range = sel.getRangeAt(i);
                      if (range && !range.collapsed) {
                        var span = document.createElement('span');
                        span.style.fontFamily = String(value || 'inherit');
                        var contents = range.extractContents();
                        span.appendChild(contents);
                        range.insertNode(span);
                        // Move caret after inserted span and update lastRange
                        range.setStartAfter(span);
                        range.setEndAfter(span);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        lastRange = range.cloneRange();
                      }
                    }
                  }
                } catch(e2) {
                  post('error', { message: 'Font apply failed: ' + String(e2) });
                }
              }
            } else if (command === 'changeFontSize') {
              document.execCommand('fontSize', false, value);
            } else if (command === 'changeTextColor') {
              document.execCommand('foreColor', false, value);
            } else if (command === 'toggleBold') {
              document.execCommand('bold', false, null);
            } else if (command === 'toggleItalic') {
              document.execCommand('italic', false, null);
            } else if (command === 'toggleUnderline') {
              document.execCommand('underline', false, null);
            }
          } catch (e) {
            post('error', { message: String(e) });
          } finally {
            try {
              editor && editor.setAttribute('contenteditable', 'false');
              editor && editor.blur();
            } catch(ee) {}
          }
        }
      })();
    </script>
  </body>
  </html>
`;


const DocumentWebView = forwardRef<DocumentWebViewHandle, Props>(function DocumentWebView(
  { onMessage, editable: _editable = false, style, html },
  ref
) {
  const webRef = useRef<WebView>(null);

  useImperativeHandle(ref, () => ({
    executeCommand(command: string, value?: string) {
      const js = `window.__execCommand(${JSON.stringify(command)}, ${value !== undefined ? JSON.stringify(value) : 'undefined'}); true;`;
      webRef.current?.injectJavaScript(js);
    },
  }));

  return (
    <WebView
      ref={webRef}
      originWhitelist={["*"]}
      onMessage={onMessage}
      source={{ html: html ?? htmlContent() }}
      style={style}
      androidLayerType="software"
      onShouldStartLoadWithRequest={() => false}
      onContentProcessDidTerminate={() => {}}
    />
  );
});

export default DocumentWebView;


