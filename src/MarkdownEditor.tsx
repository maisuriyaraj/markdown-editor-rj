import React, { useState } from 'react';
import './global.css';

interface Props {
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
  const { handleChange,handlePaste, handleKeyDown,onBlur,onFocus,placeholder,rows,maxLength,name,disabled,readOnly,autoFocus,required,spellCheck } = props;
  const [text, setText] = useState('');

  const formatText = (format: string) => {
    const textarea = document.getElementById('editor') as HTMLTextAreaElement;
    const { selectionStart, selectionEnd } = textarea;
    const selectedText = text.slice(selectionStart, selectionEnd);
  
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
  
    const newText = `${text.slice(0, selectionStart)}${formattedText}${text.slice(selectionEnd)}`;
    setText(newText);
    handleChange(newText);
  
    // Optional: Update cursor position after formatting
    const newCursorPos = selectionStart + formattedText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
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
        id="editor"
        value={text}
        maxLength={maxLength || 1000}
        onChange={(e) => { setText(e.target.value); handleChange(e.target.value); }}
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
