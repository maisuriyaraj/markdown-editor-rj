# Markdown Message Editor

A lightweight, customizable Markdown editor for ReactJS and NextJS applications. This package provides a simple, intuitive interface for adding basic Markdown formatting to your text inputs, including bold, italic, strikethrough, unordered lists.

## Features

- **Bold**: Wrap text with `**` to make it bold.
- **Italic**: Wrap text with `_` to make it italic.
- **Strikethrough**: Wrap text with `~` to strike through text.
- **Unordered List**: Add `- ` before each line to create an unordered list.
- **Lightweight**: Optimized for performance, with minimal external dependencies.

## Installation

To install the Markdown Editor package in your project, use npm
### Full Example Usage

After installing the package, you can use it as follows:

```jsx
import React, { useState } from 'react';
import MarkdownEditor from 'markdown-editor-rj'; // Import the MarkdownEditor component
import 'markdown-editor-rj/dist/style.css'; // Import the default CSS (if available)

const App = () => {
  const [editorValue, setEditorValue] = useState('');

  // Function to handle change in the editor value
  const handleEditorChange = (newValue) => {
    setEditorValue(newValue);
  };

  return (
    <div>
      <h1>Markdown Editor Example</h1>
      
      {/* Markdown Editor Component */}
      <MarkdownEditor
        handleChange={handleEditorChange} // Pass the handleChange function
        placeholder="Start typing your markdown here..." // Optional: placeholder text
      />
    </div>
  );
};

export default App;

