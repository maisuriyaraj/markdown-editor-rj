import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import './global.css';

// React 18's server renderer warns about useLayoutEffect. Effects never run on
// the server, so falling back to useEffect there changes nothing.
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

interface Props {
  value?: string;
  handleChange: (value: string) => void;
  handlePaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  spellCheck?: boolean;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}


const MarkdownEditor: React.FC<Props> = (props) => {
  const {
    value,
    handleChange,
    handlePaste,
    handleKeyDown,
    onBlur,
    onFocus,
    placeholder = 'Enter your text here',
    rows = 5,
    maxLength = 1000,
    name = 'editor',
    disabled = false,
    readOnly = false,
    autoFocus = false,
    required = false,
    spellCheck,
  } = props;
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = useId();
  const isControlled = value !== undefined;
  const displayValue = isControlled ? value : text;
  // Caret position for a toolbar format whose text hasn't reached the textarea
  // yet, together with the text it was computed against.
  const pendingCursor = useRef<{ text: string; position: number } | null>(null);

  // Places the caret after a toolbar format. This has to run after React writes
  // the new value to the textarea: before that, setSelectionRange is clamped to
  // the old text, and the write itself moves the caret to the end. A layout
  // effect runs after the write but before paint, so no jump is visible.
  //
  // It runs only when the displayed text changes, and consumes the pending
  // cursor on the first such change. In controlled mode the parent may ignore
  // or rewrite the value, so the caret is placed only if the textarea holds
  // exactly the formatted text; otherwise it is left alone.
  useIsomorphicLayoutEffect(() => {
    const pending = pendingCursor.current;
    if (!pending) return;
    pendingCursor.current = null;
    const textarea = textareaRef.current;
    if (textarea && textarea.value === pending.text) {
      textarea.setSelectionRange(pending.position, pending.position);
    }
  }, [displayValue]);

  const formatText = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    // A new click supersedes an earlier format whose text never arrived, so that
    // one can't move the caret later, including when this click is skipped below.
    pendingCursor.current = null;
    const { selectionStart, selectionEnd } = textarea;
    const selectedText = displayValue.slice(selectionStart, selectionEnd);

    let formattedText = '';
  
    const toggleFormatting = (format: string, selectedText: string) => {
      switch (format) {
        case 'bold':
          return selectedText.startsWith('**') && selectedText.endsWith('**')
            ? selectedText.slice(2, -2) // Remove the bold markers if already applied
            : `**${selectedText}**`; // Apply bold formatting
        case 'italic':
          return selectedText.startsWith('_') && selectedText.endsWith('_')
            ? selectedText.slice(1, -1) // Remove the italic markers if already applied
            : `_${selectedText}_`; // Apply italic formatting
        case 'strikethrough':
          return selectedText.startsWith('~') && selectedText.endsWith('~')
            ? selectedText.slice(1, -1) // Remove the strikethrough markers if already applied
            : `~${selectedText}~`; // Apply strikethrough formatting
        case 'ul': {
          const lines = selectedText.split('\n'); // Split selected text into lines
          const formattedLines = lines.map(line => `- ${line}`); // Add `- ` to each line
          return formattedLines.join('\n'); // Join the lines back with newlines
        }
        default:
          return selectedText;
      }
    };
  
    formattedText = toggleFormatting(format, selectedText);

    const newText = `${displayValue.slice(0, selectionStart)}${formattedText}${displayValue.slice(selectionEnd)}`;
    // The textarea's `maxLength` only caps typing and pasting, so enforce the
    // same limit here. Skip the edit entirely rather than truncating, which
    // would leave half a marker (e.g. `**bold te`). Edits that shorten the
    // text (removing markers) are still allowed, as the browser allows
    // deletions from an over-limit value.
    if (newText.length > maxLength && newText.length > displayValue.length) {
      return;
    }
    // The caret collapses to just after the inserted text. It can't be set here:
    // the new text isn't in the textarea until React renders it, which in
    // controlled mode is only after the parent passes it back as `value`. The
    // layout effect above places it once that happens.
    const newCursorPos = selectionStart + formattedText.length;
    pendingCursor.current = { text: newText, position: newCursorPos };
    if (!isControlled) {
      setText(newText);
    }
    handleChange(newText);
  };

  return (
    <div className="markdown-editor">
      <div className="toolbar" role="toolbar" aria-label="Formatting">
        {/* type="button": the default type is "submit", which would submit a parent form */}
        <button type="button" className='toolbar-button' aria-label="Bold" onClick={() => formatText('bold')}><i className="bi bi-type-bold" aria-hidden="true"></i></button>
        <button type="button" className='toolbar-button' aria-label="Italic" onClick={() => formatText('italic')}><i className="bi bi-type-italic" aria-hidden="true"></i></button>
        <button type="button" className='toolbar-button' aria-label="Strikethrough" onClick={() => formatText('strikethrough')}><i className="bi bi-type-strikethrough" aria-hidden="true"></i></button>
        <button type="button" className='toolbar-button' aria-label="Bulleted list" onClick={() => formatText('ul')}><i className="bi bi-list-ul" aria-hidden="true"></i></button>
      </div>
      <textarea
        id={textareaId}
        ref={textareaRef}
        value={displayValue}
        maxLength={maxLength}
        onChange={(e) => {
          const newValue = e.target.value;
          if (!isControlled) {
            setText(newValue);
          }
          handleChange(newValue);
        }}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        rows={rows}
        placeholder={placeholder}
        name={name}
        disabled={disabled}
        readOnly={readOnly}
        autoFocus={autoFocus}
        required={required}
        spellCheck={spellCheck || true}
      />
    </div>
  );
};

export default MarkdownEditor;
