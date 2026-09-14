import React, { useEffect, useId, useRef, useState } from 'react';
import './global.css';

interface Props {
  value?: string;
  handleChange: (value: string) => void;
  handlePaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  handleKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  rows: number;
  maxLength: number;
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
  const { value,handleChange,handlePaste, handleKeyDown,onBlur,onFocus,placeholder,rows,maxLength,name,disabled,readOnly,autoFocus,required,spellCheck } = props;
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = useId();
  const isControlled = value !== undefined;
  const displayValue = isControlled ? value : text;
  const pendingSelection = useRef<{ start: number; end: number } | null>(null);

  useEffect(() => {
    if (pendingSelection.current && textareaRef.current) {
      const { start, end } = pendingSelection.current;
      textareaRef.current.setSelectionRange(start, end);
      pendingSelection.current = null;
    }
  }, [displayValue]);

  const formatText = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
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
    const newCursorPos = selectionStart + formattedText.length;
    // In controlled mode the new value only reaches the textarea after it
    // round-trips through the parent, so the selection is restored by the
    // effect above once `displayValue` reflects it, rather than set here.
    pendingSelection.current = { start: newCursorPos, end: newCursorPos };
    if (!isControlled) {
      setText(newText);
    }
    handleChange(newText);
  };

  return (
    <div className="markdown-editor">
      <div className="toolbar">
        <button className='toolbar-button' onClick={() => formatText('bold')}><i className="bi bi-type-bold"></i></button>
        <button className='toolbar-button' onClick={() => formatText('italic')}><i className="bi bi-type-italic"></i></button>
        <button className='toolbar-button' onClick={() => formatText('strikethrough')}><i className="bi bi-type-strikethrough"></i></button>
        <button className='toolbar-button' onClick={() => formatText('ul')}><i className="bi bi-list-ul"></i></button>
      </div>
      <textarea
        id={textareaId}
        ref={textareaRef}
        value={displayValue}
        maxLength={maxLength || 1000}
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
        rows={rows || 5}
        placeholder={placeholder || "Enter your text here"}
        name={name || "editor"}
        disabled={disabled || false}
        readOnly={readOnly || false}
        autoFocus={autoFocus || false}
        required={required || false}
        spellCheck={spellCheck || true}
      />
    </div>
  );
};

export default MarkdownEditor;
