import React, { useState } from 'react';
import './global.css';

// Define the shape of the props
interface Props {
    handleChange: (value: string) => void; // Specify the type of the function
    handlePaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
    rows: number;
}

const MarkdownEditor: React.FC<Props> = (props) => {
  const { handleChange,handlePaste, handleKeyDown,placeholder,rows } = props;
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
        onChange={(e) => { setText(e.target.value); handleChange(e.target.value); }}
        onPaste={(e) => { handlePaste(e); }}
        onKeyDown={(e) => { handleKeyDown(e); }}
        rows={rows}
        placeholder={placeholder}
      />
    </div>
  );
};

export default MarkdownEditor;
