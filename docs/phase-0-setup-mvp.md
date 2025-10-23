# Phase 0: Initial Setup & MVP Foundation

## Overview

This phase establishes the foundational Cascade-Edit application: a Windows desktop app built with React, Vite, TypeScript, and Tauri. By the end of this phase, you'll have a working application where users can type text, complete paragraphs (via double line breaks), send them to OpenRouter API, and see basic corrections.

**Estimated Time**: 4-6 hours  
**Prerequisites**: Node.js (v18+), npm/pnpm, Rust toolchain, Windows 10/11

---

## Step 1: Project Initialization

### 1.1 Create Vite + React + TypeScript Project

Open PowerShell and navigate to your projects directory:

```powershell
# Create new Vite project
npm create vite@latest cascade-edit -- --template react-ts
cd cascade-edit
npm install
```

### 1.2 Verify Basic React App

Test that the basic React app works:

```powershell
npm run dev
```

Visit `http://localhost:5173` to confirm the default Vite + React page loads. Press `Ctrl+C` to stop the dev server.

### 1.3 Install Tauri CLI and Dependencies

```powershell
# Install Tauri CLI
npm install -D @tauri-apps/cli

# Initialize Tauri
npm run tauri init
```

When prompted, use these values:
- App name: `Cascade-Edit`
- Window title: `Cascade-Edit`
- Web assets location: `../dist`
- Dev server URL: `http://localhost:5173`
- Dev server command: `npm run dev`
- Build command: `npm run build`

### 1.4 Install Tauri API Package

```powershell
npm install @tauri-apps/api
```

### 1.5 Project Structure Setup

Create the following directory structure:

```powershell
mkdir src\components
mkdir src\services
mkdir src\types
mkdir src\hooks
mkdir src\utils
```

Your project structure should now look like:

```
cascade-edit/
├── src/
│   ├── components/
│   ├── services/
│   ├── types/
│   ├── hooks/
│   ├── utils/
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── src-tauri/
│   ├── src/
│   ├── icons/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── vite.config.ts
```

---

## Step 2: Configure Tauri and Environment

### 2.1 Update Tauri Configuration

Edit `src-tauri/tauri.conf.json`:

```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist",
    "withGlobalTauri": false
  },
  "package": {
    "productName": "Cascade-Edit",
    "version": "0.1.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": false
      },
      "http": {
        "all": true,
        "request": true,
        "scope": ["https://openrouter.ai/**"]
      }
    },
    "bundle": {
      "active": true,
      "targets": "all",
      "identifier": "com.cascadeedit.app",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": null
    },
    "windows": [
      {
        "fullscreen": false,
        "resizable": true,
        "title": "Cascade-Edit",
        "width": 1000,
        "height": 700,
        "minWidth": 800,
        "minHeight": 600
      }
    ]
  }
}
```

### 2.2 Environment Variables Setup

Create `.env` in the project root:

```env
VITE_OPENROUTER_API_KEY=your_api_key_here
VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

Create `.env.example` for documentation:

```env
VITE_OPENROUTER_API_KEY=sk-or-v1-...
VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

Add `.env` to `.gitignore`:

```gitignore
# Add to existing .gitignore
.env
.env.local
```

### 2.3 Update vite.config.ts for Environment Variables

Edit `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Prevent vite from obscuring rust errors
  clearScreen: false,
  
  // Tauri expects a fixed port, fail if that port is not available
  server: {
    port: 5173,
    strictPort: true,
  },
  
  // Use environment prefix for Vite env vars
  envPrefix: ['VITE_'],
  
  // Build options
  build: {
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target: process.env.TAURI_PLATFORM == 'windows' ? 'chrome105' : 'safari13',
    // Don't minify for debug builds
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    // Produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_DEBUG,
  },
})
```

---

## Step 3: Type Definitions

### 3.1 Create Core Type Definitions

Create `src/types/index.ts`:

```typescript
// Paragraph status enum
export enum ParagraphStatus {
  WRITING = 'writing',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

// Paragraph data structure
export interface Paragraph {
  id: string;
  originalText: string;
  correctedText: string;
  status: ParagraphStatus;
  timestamp: number;
  error?: string;
}

// OpenRouter API types
export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterStreamChunk {
  id: string;
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason?: string | null;
  }>;
}

// App state
export interface AppState {
  paragraphs: Paragraph[];
  currentText: string;
  isProcessing: boolean;
}
```

---

## Step 4: OpenRouter API Service

### 4.1 Create API Configuration

Create `src/services/config.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  model: 'openai/gpt-3.5-turbo', // Default model
  systemPrompt: `You are a helpful text editing assistant. Your job is to improve the grammar, capitalization, and punctuation of the provided text while maintaining the original meaning and tone. Return only the corrected text without any additional commentary or explanations.`,
};

// Validate API key is present
export function validateApiConfig(): boolean {
  if (!API_CONFIG.apiKey) {
    console.error('OpenRouter API key is missing. Please set VITE_OPENROUTER_API_KEY in .env file');
    return false;
  }
  return true;
}
```

### 4.2 Create API Service

Create `src/services/openRouterService.ts`:

```typescript
import { API_CONFIG } from './config';
import type { OpenRouterRequest, OpenRouterStreamChunk } from '../types';

class OpenRouterService {
  private async makeRequest(
    endpoint: string,
    options: RequestInit
  ): Promise<Response> {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        'HTTP-Referer': 'https://cascade-edit.app',
        'X-Title': 'Cascade-Edit',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`
      );
    }

    return response;
  }

  /**
   * Process text with streaming response
   * @param text - The text to process
   * @param onChunk - Callback for each text chunk received
   * @returns Promise that resolves when streaming is complete
   */
  async processTextStream(
    text: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const requestBody: OpenRouterRequest = {
      model: API_CONFIG.model,
      stream: true,
      messages: [
        {
          role: 'system',
          content: API_CONFIG.systemPrompt,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    };

    const response = await this.makeRequest('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();
          
          // Skip empty lines and comments
          if (!trimmedLine || trimmedLine.startsWith(':')) continue;

          // Parse SSE data
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6);
            
            // Check for stream end
            if (data === '[DONE]') continue;

            try {
              const chunk: OpenRouterStreamChunk = JSON.parse(data);
              const content = chunk.choices[0]?.delta?.content;
              
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              console.warn('Failed to parse chunk:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Process text without streaming (fallback)
   * @param text - The text to process
   * @returns The corrected text
   */
  async processText(text: string): Promise<string> {
    const requestBody: OpenRouterRequest = {
      model: API_CONFIG.model,
      stream: false,
      messages: [
        {
          role: 'system',
          content: API_CONFIG.systemPrompt,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    };

    const response = await this.makeRequest('/chat/completions', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || text;
  }
}

export const openRouterService = new OpenRouterService();
```

---

## Step 5: Basic Text Editor Component

### 5.1 Create Paragraph Component

Create `src/components/ParagraphDisplay.tsx`:

```typescript
import React from 'react';
import { Paragraph, ParagraphStatus } from '../types';
import './ParagraphDisplay.css';

interface ParagraphDisplayProps {
  paragraph: Paragraph;
}

export const ParagraphDisplay: React.FC<ParagraphDisplayProps> = ({ paragraph }) => {
  const getStatusClass = () => {
    switch (paragraph.status) {
      case ParagraphStatus.WRITING:
        return 'status-writing';
      case ParagraphStatus.PROCESSING:
        return 'status-processing';
      case ParagraphStatus.COMPLETED:
        return 'status-completed';
      case ParagraphStatus.ERROR:
        return 'status-error';
      default:
        return '';
    }
  };

  const displayText = paragraph.status === ParagraphStatus.COMPLETED
    ? paragraph.correctedText
    : paragraph.originalText;

  return (
    <div className={`paragraph ${getStatusClass()}`} data-paragraph-id={paragraph.id}>
      <div className="paragraph-content">
        {displayText}
      </div>
      {paragraph.status === ParagraphStatus.PROCESSING && (
        <div className="paragraph-status">Processing...</div>
      )}
      {paragraph.status === ParagraphStatus.ERROR && paragraph.error && (
        <div className="paragraph-error">{paragraph.error}</div>
      )}
    </div>
  );
};
```

Create `src/components/ParagraphDisplay.css`:

```css
.paragraph {
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
  position: relative;
  line-height: 1.6;
}

.paragraph-content {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.status-writing {
  background-color: #f8f9fa;
  border-left: 3px solid #6c757d;
}

.status-processing {
  background-color: #fff3cd;
  border-left: 3px solid #ffc107;
}

.status-completed {
  background-color: #d4edda;
  border-left: 3px solid #28a745;
}

.status-error {
  background-color: #f8d7da;
  border-left: 3px solid #dc3545;
}

.paragraph-status {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 12px;
  color: #856404;
  font-style: italic;
}

.paragraph-error {
  margin-top: 8px;
  padding: 8px;
  background-color: #f5c6cb;
  border-radius: 4px;
  font-size: 14px;
  color: #721c24;
}
```

### 5.2 Create Text Editor Component

Create `src/components/TextEditor.tsx`:

```typescript
import React, { useRef, useEffect } from 'react';
import './TextEditor.css';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onParagraphComplete: () => void;
  disabled?: boolean;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  onParagraphComplete,
  disabled = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previousValueRef = useRef<string>('');

  useEffect(() => {
    // Check for double line break (paragraph completion)
    const currentValue = value;
    const previousValue = previousValueRef.current;

    // Detect if user just added a double newline
    if (currentValue.endsWith('\n\n') && !previousValue.endsWith('\n\n')) {
      onParagraphComplete();
    }

    previousValueRef.current = currentValue;
  }, [value, onParagraphComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="text-editor">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Start typing... Press Enter twice to complete a paragraph and send it for correction."
        className="text-editor-textarea"
      />
    </div>
  );
};
```

Create `src/components/TextEditor.css`:

```css
.text-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.text-editor-textarea {
  width: 100%;
  min-height: 120px;
  padding: 16px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.6;
  resize: none;
  outline: none;
  transition: border-color 0.2s ease;
  overflow-y: hidden;
}

.text-editor-textarea:focus {
  border-color: #007bff;
}

.text-editor-textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.text-editor-textarea::placeholder {
  color: #6c757d;
  opacity: 0.7;
}
```

---

## Step 6: Main Application Logic

### 6.1 Create Custom Hook for App Logic

Create `src/hooks/useTextProcessor.ts`:

```typescript
import { useState, useCallback } from 'react';
import { Paragraph, ParagraphStatus } from '../types';
import { openRouterService } from '../services/openRouterService';

export function useTextProcessor() {
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [currentText, setCurrentText] = useState('');

  const generateId = () => `para-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const processParagraph = useCallback(async (text: string) => {
    const trimmedText = text.trim();
    
    // Don't process empty paragraphs
    if (!trimmedText) return;

    // Create new paragraph
    const newParagraph: Paragraph = {
      id: generateId(),
      originalText: trimmedText,
      correctedText: '',
      status: ParagraphStatus.PROCESSING,
      timestamp: Date.now(),
    };

    // Add to paragraphs list
    setParagraphs(prev => [...prev, newParagraph]);

    try {
      // For Phase 0, we'll use non-streaming (simpler implementation)
      const correctedText = await openRouterService.processText(trimmedText);

      // Update paragraph with corrected text
      setParagraphs(prev =>
        prev.map(p =>
          p.id === newParagraph.id
            ? {
                ...p,
                correctedText,
                status: ParagraphStatus.COMPLETED,
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error processing paragraph:', error);
      
      // Update paragraph with error
      setParagraphs(prev =>
        prev.map(p =>
          p.id === newParagraph.id
            ? {
                ...p,
                status: ParagraphStatus.ERROR,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
              }
            : p
        )
      );
    }
  }, []);

  const handleTextChange = useCallback((text: string) => {
    setCurrentText(text);
  }, []);

  const handleParagraphComplete = useCallback(() => {
    // Extract completed paragraph (everything before the double newline)
    const parts = currentText.split('\n\n');
    
    if (parts.length > 1) {
      // Get the completed paragraph(s)
      const completedParagraphs = parts.slice(0, -1);
      
      // Process each completed paragraph
      completedParagraphs.forEach(para => {
        if (para.trim()) {
          processParagraph(para);
        }
      });

      // Keep only the remaining text after the double newline
      setCurrentText(parts[parts.length - 1]);
    }
  }, [currentText, processParagraph]);

  return {
    paragraphs,
    currentText,
    handleTextChange,
    handleParagraphComplete,
  };
}
```

### 6.2 Update App Component

Replace `src/App.tsx`:

```typescript
import React, { useEffect } from 'react';
import { TextEditor } from './components/TextEditor';
import { ParagraphDisplay } from './components/ParagraphDisplay';
import { useTextProcessor } from './hooks/useTextProcessor';
import { validateApiConfig } from './services/config';
import './App.css';

function App() {
  const {
    paragraphs,
    currentText,
    handleTextChange,
    handleParagraphComplete,
  } = useTextProcessor();

  useEffect(() => {
    // Validate API configuration on mount
    if (!validateApiConfig()) {
      alert('OpenRouter API key is missing. Please check your .env file.');
    }
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Cascade-Edit</h1>
        <p className="app-subtitle">Real-time text enhancement</p>
      </header>

      <main className="app-main">
        <div className="editor-section">
          <h2>Write Your Text</h2>
          <TextEditor
            value={currentText}
            onChange={handleTextChange}
            onParagraphComplete={handleParagraphComplete}
          />
          <div className="editor-hint">
            Press <kbd>Enter</kbd> twice to complete a paragraph
          </div>
        </div>

        {paragraphs.length > 0 && (
          <div className="paragraphs-section">
            <h2>Processed Paragraphs</h2>
            <div className="paragraphs-list">
              {paragraphs.map(paragraph => (
                <ParagraphDisplay key={paragraph.id} paragraph={paragraph} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
```

Replace `src/App.css`:

```css
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0;
  font-size: 36px;
  font-weight: 700;
}

.app-subtitle {
  margin: 8px 0 0;
  font-size: 16px;
  opacity: 0.9;
}

.app-main {
  flex: 1;
  padding: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.editor-section {
  margin-bottom: 32px;
}

.editor-section h2 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
}

.editor-hint {
  margin-top: 8px;
  font-size: 14px;
  color: #6c757d;
}

.editor-hint kbd {
  display: inline-block;
  padding: 2px 6px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
}

.paragraphs-section {
  margin-top: 32px;
}

.paragraphs-section h2 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
}

.paragraphs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
```

Update `src/index.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

#root {
  min-height: 100vh;
}
```

---

## Step 7: Testing the Application

### 7.1 Development Testing

1. **Ensure your `.env` file has a valid OpenRouter API key**

2. **Start the development server:**

```powershell
npm run tauri dev
```

This will:
- Start the Vite dev server
- Launch the Tauri application window
- Enable hot-reload for quick development

3. **Test the basic flow:**
   - Type some text in the editor
   - Press Enter twice to complete a paragraph
   - Watch the paragraph move to the "Processed Paragraphs" section
   - Verify it shows "Processing..." status
   - Verify it updates with corrected text and green background

### 7.2 Test Cases

**Test Case 1: Basic Correction**
```
Input: "this is a test paragraph with no caps and bad grammer"
Expected: Should correct to proper capitalization and fix "grammer" to "grammar"
```

**Test Case 2: Multiple Paragraphs**
```
Input: Type two paragraphs, each followed by double Enter
Expected: Both should be processed and displayed separately
```

**Test Case 3: Error Handling**
```
Input: Remove API key from .env and restart
Expected: Should show error status with red background
```

### 7.3 Build for Windows

When ready to create a distributable Windows executable:

```powershell
npm run tauri build
```

The installer will be created in `src-tauri/target/release/bundle/`.

---

## Step 8: Troubleshooting

### Common Issues

**Issue: "OpenRouter API key is missing"**
- Solution: Ensure `.env` file exists in project root with valid `VITE_OPENROUTER_API_KEY`
- Restart dev server after adding the key

**Issue: Tauri build fails**
- Solution: Ensure Rust toolchain is installed: https://www.rust-lang.org/tools/install
- Run: `rustup update`

**Issue: API requests fail**
- Solution: Check browser console for specific error messages
- Verify API key is valid
- Check internet connection

**Issue: Text doesn't process**
- Solution: Ensure you press Enter twice (double newline)
- Check console for JavaScript errors

**Issue: Port 5173 already in use**
- Solution: Kill the process using that port or change port in `vite.config.ts`

---

## Step 9: Code Verification Checklist

Before moving to Phase 1, verify:

- [ ] Application launches successfully with `npm run tauri dev`
- [ ] Text editor accepts input and displays correctly
- [ ] Double Enter triggers paragraph completion
- [ ] Completed paragraphs show "Processing..." status
- [ ] Paragraphs update with corrected text from OpenRouter API
- [ ] Error states display properly (test by using invalid API key)
- [ ] UI is responsive and styling looks good
- [ ] Console shows no errors during normal operation

---

## Phase 0 Complete!

You now have a working MVP with:
- ✅ Desktop application running on Windows
- ✅ Text editor with paragraph detection
- ✅ OpenRouter API integration
- ✅ Basic text correction flow
- ✅ Status indicators and error handling

**Next Steps**: Proceed to Phase 1 to add streaming responses and queue-based parallel processing.

---

## Additional Resources

- [Tauri Documentation](https://tauri.app/v1/guides/)
- [Vite Documentation](https://vitejs.dev/)
- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [React TypeScript Guide](https://react-typescript-cheatsheet.netlify.app/)
