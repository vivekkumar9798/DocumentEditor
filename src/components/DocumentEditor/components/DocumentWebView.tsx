import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';

export type DocumentWebViewHandle = {
  executeCommand: (command: string, value?: string) => void;
  getCurrentHTML: () => Promise<string>;
};

type Props = {
  onMessage?: (event: any) => void;
  editable?: boolean;
  style?: StyleProp<ViewStyle>;
  content?: string; // Dynamic content for the editor div
  onLayout?: (e: any) => void;
};

const htmlContent = (content?: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { margin: 0; padding: 12px; background: #ffffff; }
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
        font-family: Arial, sans-serif;
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
      /* Disable native copy/paste callout while allowing selection */
      #editor, #editor * { -webkit-touch-callout: none; }
      /* Make font changes more visible */
      .font-changed {
        border: 1px dashed #3b82f6;
        padding: 2px 4px;
        border-radius: 4px;
        background: rgba(59, 130, 246, 0.05);
      }
      /* Keep selection highlight semi-transparent so color/style changes remain visible */
      ::selection { background: rgba(147, 197, 253, 0.35); color: inherit; }
      #editor ::selection { background: rgba(147, 197, 253, 0.35); color: inherit; }
    </style>
  </head>
  <body>
    <div id="editor" contenteditable="false">
      ${content || ''}
    </div>
    <script>
      (function() {
        function post(type, payload) {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type, ...payload }));
        }

        var lastRange = null; // may be collapsed
        var stableRange = null; // only updated when selection is non-collapsed
        var editor = document.getElementById('editor');
        var touchStartTime = 0;
        var touchStartX = 0;
        var touchStartY = 0;
        var touchMoved = false;
        var TAP_MAX_MS = 250;
        var TAP_MOVE_THRESH = 6; // px

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
          try {
            var t = e.touches && e.touches[0];
            touchStartTime = Date.now();
            touchStartX = t ? t.clientX : 0;
            touchStartY = t ? t.clientY : 0;
            touchMoved = false;
          } catch(_ts) {}
        }, { passive: false, capture: true });

        document.addEventListener('touchmove', function(e) {
          try {
            var t = e.touches && e.touches[0];
            if (t) {
              var dx = Math.abs(t.clientX - touchStartX);
              var dy = Math.abs(t.clientY - touchStartY);
              if (dx > TAP_MOVE_THRESH || dy > TAP_MOVE_THRESH) {
                touchMoved = true;
              }
            }
          } catch(_tm) {}
        }, { passive: true, capture: true });

        document.addEventListener('touchend', function() {
          try {
            var dt = Date.now() - touchStartTime;
            if (!touchMoved && dt <= TAP_MAX_MS) {
              // It was a single tap: clear any accidental selection
              var sel = window.getSelection();
              if (sel) { sel.removeAllRanges(); }
              stableRange = null; lastRange = null;
              post('textSelected', { text: '' });
            }
          } catch(_te) {}
        }, true);

        // Desktop mouse: treat quick click without drag as tap
        var mouseDownX = 0, mouseDownY = 0, mouseDownTime = 0, mouseMoved = false;
        document.addEventListener('mousedown', function(e) {
          mouseDownTime = Date.now();
          mouseDownX = e.clientX || 0;
          mouseDownY = e.clientY || 0;
          mouseMoved = false;
        }, true);
        document.addEventListener('mousemove', function(e) {
          var dx = Math.abs((e.clientX||0) - mouseDownX);
          var dy = Math.abs((e.clientY||0) - mouseDownY);
          if (dx > TAP_MOVE_THRESH || dy > TAP_MOVE_THRESH) { mouseMoved = true; }
        }, true);
        document.addEventListener('mouseup', function() {
          var dt = Date.now() - mouseDownTime;
          if (!mouseMoved && dt <= TAP_MAX_MS) {
            try {
              var sel = window.getSelection();
              if (sel) { sel.removeAllRanges(); }
              stableRange = null; lastRange = null;
              post('textSelected', { text: '' });
            } catch(_mu) {}
          }
        }, true);

        // Prevent the default context menu / selection popup
        document.addEventListener('contextmenu', function(e) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }, true);

        function collectFormatState(selection) {
          var bold = false, italic = false, underline = false;
          var activeFontFamily = null; var activeFontSizePx = null;
          try {
            if (selection && selection.rangeCount > 0) {
              var r0 = selection.getRangeAt(0);
              var node = r0.startContainer;
              if (node && node.nodeType === 3) { node = node.parentNode; }
              var el = node;
              while (el && el !== editor && el.nodeType === 1) {
                var tag = (el.tagName || '').toLowerCase();
                var cs = window.getComputedStyle ? window.getComputedStyle(el) : null;
                if (tag === 'b' || tag === 'strong' || (cs && (cs.fontWeight === 'bold' || parseInt(cs.fontWeight, 10) >= 600))) {
                  bold = true;
                }
                if (tag === 'i' || tag === 'em' || (cs && cs.fontStyle === 'italic')) {
                  italic = true;
                }
                var tdl = cs && (cs.textDecorationLine || cs.textDecoration || '');
                if (tag === 'u' || (tdl && String(tdl).indexOf('underline') !== -1)) {
                  underline = true;
                }
                if (cs && !activeFontFamily) {
                  activeFontFamily = cs.fontFamily || null;
                }
                if (cs && !activeFontSizePx) {
                  var fs = cs.fontSize;
                  if (fs) {
                    var m = String(fs).match(/([0-9]+[.]?[0-9]*)px/);
                    if (m) { activeFontSizePx = parseFloat(m[1]); }
                  }
                }
                el = el.parentNode;
              }
            }
          } catch (_e) {}
          return { bold: !!bold, italic: !!italic, underline: !!underline, fontFamily: activeFontFamily, fontSizePx: activeFontSizePx };
        }

        function postSelectionFromRange(range) {
          try {
            if (!range) return;
            var rect = range.getBoundingClientRect();
            var text = String(range.toString() || '');
            var rectPayload = rect ? {
              left: rect.left,
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
              width: rect.width,
              height: rect.height,
              scrollX: window.scrollX || 0,
              scrollY: window.scrollY || 0,
              viewportWidth: window.innerWidth,
              viewportHeight: window.innerHeight,
            } : null;
            var sel = window.getSelection();
            var formatState = collectFormatState(sel);
            post('textSelected', { text: text, rect: rectPayload, formatState: formatState });
          } catch(_ee) {}
        }

        document.addEventListener('selectionchange', function() {
          var selection = window.getSelection();
          var text = selection ? selection.toString() : '';
          var rectPayload = null;
          var formatState = collectFormatState(selection);
          if (selection && selection.rangeCount > 0) {
            var r = selection.getRangeAt(0);
            lastRange = r;
            // Only persist stableRange when the selection is non-collapsed
            if (r && !r.collapsed && text && text.length > 0) {
              try {
                stableRange = r.cloneRange();
                var rect = r.getBoundingClientRect();
                if (rect) {
                  rectPayload = {
                    left: rect.left,
                    top: rect.top,
                    right: rect.right,
                    bottom: rect.bottom,
                    width: rect.width,
                    height: rect.height,
                    scrollX: window.scrollX || 0,
                    scrollY: window.scrollY || 0,
                    viewportWidth: window.innerWidth,
                    viewportHeight: window.innerHeight,
                  };
                }
              } catch (e) {}
            }
          }
          post('textSelected', { text: text, rect: rectPayload, formatState: formatState });
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

            // Debug logging
            // console.log('Executing command:', command, 'with value:', value);

            // Log original HTML before changes
            var originalHTML = editor.innerHTML;
            // console.log('Original HTML:', originalHTML);

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
              // console.log('Changing font to:', value);
              var applied = false;
              try {
                applied = document.execCommand('fontName', false, value);
                // console.log('execCommand fontName result:', applied);
              } catch(e1) {
                console.log('execCommand fontName error:', e1);
                applied = false;
              }

              // Fallback: wrap selection in a span with font-family style
              if (!applied) {
                console.log('Using fallback font method');
                try {
                  var sel = window.getSelection();
                  if (sel && sel.rangeCount > 0) {
                    for (var i = 0; i < sel.rangeCount; i++) {
                      var range = sel.getRangeAt(i);
                      if (range && !range.collapsed) {
                        var span = document.createElement('span');
                        span.style.fontFamily = String(value || 'inherit');
                        span.className = 'font-changed';
                        span.setAttribute('data-font', String(value || 'inherit'));

                        var contents = range.extractContents();
                        span.appendChild(contents);
                        range.insertNode(span);

                        // Move caret after inserted span and update lastRange
                        range.setStartAfter(span);
                        range.setEndAfter(span);
                        sel.removeAllRanges();
                        sel.addRange(range);
                        lastRange = range.cloneRange();

                        // console.log('Font applied via span:', value);
                      }
                    }
                  }
                } catch(e2) {
                  // console.log('Font fallback error:', e2);
                  post('error', { message: 'Font apply failed: ' + String(e2) });
                }
              } else {
                // console.log('Font applied via execCommand');
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
            } else if (command === 'reportSelection') {
              // Report current selection using the last stable non-collapsed range if available
              var toReport = null;
              try {
                var selR = window.getSelection();
                if (selR && selR.rangeCount > 0 && !selR.getRangeAt(0).collapsed) {
                  toReport = selR.getRangeAt(0);
                } else if (stableRange) {
                  toReport = stableRange;
                }
              } catch(_e3) {}
              if (toReport) { postSelectionFromRange(toReport); }
              return; // early exit, no finalization needed
            } else if (command === 'unselect') {
              try {
                var selClr = window.getSelection();
                if (selClr) { selClr.removeAllRanges(); }
                stableRange = null; lastRange = null;
                post('textSelected', { text: '' });
              } catch(_e4) {}
              return;
            }

            // Ensure selection remains visible: if selection collapsed, restore to stableRange
            try {
              var selKeep = window.getSelection();
              var rangeToKeep = null;
              if (selKeep && selKeep.rangeCount > 0 && !selKeep.getRangeAt(0).collapsed) {
                rangeToKeep = selKeep.getRangeAt(0).cloneRange();
              } else if (stableRange) {
                var selRe = window.getSelection();
                selRe.removeAllRanges();
                selRe.addRange(stableRange);
                rangeToKeep = stableRange.cloneRange();
              }
              if (rangeToKeep) {
                try { stableRange = rangeToKeep.cloneRange(); lastRange = rangeToKeep.cloneRange(); } catch(_eKeep) {}
                postSelectionFromRange(rangeToKeep);
              }
            } catch(_eK) {}

            // Log result HTML after changes
            var resultHTML = editor.innerHTML;
            // console.log('Result HTML after', command + ':', resultHTML);

            // Send HTML changes to React Native for debugging
            post('htmlChanged', {
              command: command,
              value: value,
              originalHTML: originalHTML,
              resultHTML: resultHTML,
              hasChanges: originalHTML !== resultHTML
            });

          } catch (e) {
            // console.log('Command execution error:', e);
            post('error', { message: String(e) });
          } finally {
            try {
              // Keep editing enabled so visual selection highlight persists; inputs are blocked elsewhere
              editor && editor.setAttribute('contenteditable', 'true');
              // Do not blur or clear selection so it remains highlighted until user closes
            } catch(ee) {}
          }
        }

        // Function to get current HTML for debugging
        window.__getCurrentHTML = function() {
          var currentHTML = editor ? editor.innerHTML : '';
          post('currentHTML', { html: currentHTML });
          return currentHTML;
        }
      })();
    </script>
  </body>
  </html>
`;

const DocumentWebView = forwardRef<DocumentWebViewHandle, Props>(
  function DocumentWebView(
    { onMessage, editable: _editable = false, style, content, onLayout },
    ref,
  ) {
    const webRef = useRef<WebView>(null);

    // console.log('Rendered HTML:', html ?? htmlContent(content));

    useImperativeHandle(ref, () => ({
      executeCommand(command: string, value?: string) {
        const js = `window.__execCommand(${JSON.stringify(command)}, ${
          value !== undefined ? JSON.stringify(value) : 'undefined'
        }); true;`;
        webRef.current?.injectJavaScript(js);
      },
      getCurrentHTML() {
        return new Promise<string>(resolve => {
          const js = `window.__getCurrentHTML(); true;`;
          webRef.current?.injectJavaScript(js);
          // Note: The actual HTML will be sent via onMessage with type 'currentHTML'
          // This is just for triggering the request
          resolve('');
        });
      },
    }));

    return (
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        onMessage={onMessage}
        source={{ html: htmlContent(content) }}
        style={style}
        androidLayerType="software"
        onShouldStartLoadWithRequest={() => true}
        onContentProcessDidTerminate={() => {}}
        onLayout={onLayout}
      />
    );
  },
);

export default DocumentWebView;
