# Phase 2: Character Wave Animation & UX Polish

## Overview

This final phase implements the signature "character wave" animation effect and adds UI polish to create a delightful user experience. As corrected text streams in, each character will animate with a cascading wave effect, replacing the original paragraph smoothly.

**Estimated Time**: 2-3 hours  
**Prerequisites**: Completed Phase 0 and Phase 1

---

## What's New in Phase 2

- Character-by-character wave animation effect
- Smooth paragraph replacement transitions
- Enhanced visual polish and micro-interactions
- Improved error handling and user feedback
- Final UX refinements

---

## Step 1: Create Character Wave Component

### 1.1 Build Animated Character Component

Create `src/components/AnimatedText.tsx`:

```typescript
import React, { useMemo } from 'react';
import './AnimatedText.css';

interface AnimatedTextProps {
  text: string;
  isStreaming: boolean;
  animationDelay?: number; // Delay between characters in ms
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  isStreaming,
  animationDelay = 20,
}) => {
  // Split text into characters while preserving spaces
  const characters = useMemo(() => {
    return text.split('');
  }, [text]);

  return (
    <span className="animated-text">
      {characters.map((char, index) => (
        <span
          key={`${index}-${char}`}
          className={`animated-char ${isStreaming ? 'wave-in' : ''}`}
          style={{
            animationDelay: isStreaming ? `${index * animationDelay}ms` : '0ms',
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};
```

Create `src/components/AnimatedText.css`:

```css
.animated-text {
  display: inline;
}

.animated-char {
  display: inline-block;
  opacity: 1;
}

.animated-char.wave-in {
  animation: waveIn 0.3s ease-out forwards;
  opacity: 0;
}

@keyframes waveIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  50% {
    opacity: 0.5;
    transform: translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Ensure spaces don't collapse */
.animated-char:empty::before {
  content: '\00A0';
}
```

---

## Step 2: Enhanced Paragraph Display with Transition

### 2.1 Update Paragraph Display Component

Replace `src/components/ParagraphDisplay.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { Paragraph, ParagraphStatus } from '../types';
import { AnimatedText } from './AnimatedText';
import './ParagraphDisplay.css';

interface ParagraphDisplayProps {
  paragraph: Paragraph;
}

export const ParagraphDisplay: React.FC<ParagraphDisplayProps> = ({ paragraph }) => {
  const [showOriginal, setShowOriginal] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Start transition when streaming begins
    if (paragraph.status === ParagraphStatus.STREAMING && showOriginal) {
      setIsTransitioning(true);
      // Fade out original text
      setTimeout(() => {
        setShowOriginal(false);
        setIsTransitioning(false);
      }, 300);
    }
  }, [paragraph.status, showOriginal]);

  const getStatusClass = () => {
    switch (paragraph.status) {
      case ParagraphStatus.WRITING:
        return 'status-writing';
      case ParagraphStatus.QUEUED:
        return 'status-queued';
      case ParagraphStatus.PROCESSING:
        return 'status-processing';
      case ParagraphStatus.STREAMING:
        return 'status-streaming';
      case ParagraphStatus.COMPLETED:
        return 'status-completed';
      case ParagraphStatus.ERROR:
        return 'status-error';
      default:
        return '';
    }
  };

  const getStatusLabel = () => {
    switch (paragraph.status) {
      case ParagraphStatus.QUEUED:
        return 'Queued...';
      case ParagraphStatus.PROCESSING:
        return 'Processing...';
      case ParagraphStatus.STREAMING:
        return 'Streaming...';
      case ParagraphStatus.COMPLETED:
        return '✓ Completed';
      case ParagraphStatus.ERROR:
        return '✗ Error';
      default:
        return '';
    }
  };

  const shouldAnimate = paragraph.status === ParagraphStatus.STREAMING;
  const displayText = showOriginal ? paragraph.originalText : paragraph.correctedText;

  return (
    <div className={`paragraph ${getStatusClass()}`} data-paragraph-id={paragraph.id}>
      <div className={`paragraph-content ${isTransitioning ? 'fading-out' : ''}`}>
        {!showOriginal && shouldAnimate ? (
          <AnimatedText 
            text={displayText} 
            isStreaming={true}
            animationDelay={20}
          />
        ) : (
          displayText
        )}
      </div>
      
      {paragraph.status !== ParagraphStatus.COMPLETED && 
       paragraph.status !== ParagraphStatus.ERROR && (
        <div className="paragraph-status-badge">
          {getStatusLabel()}
        </div>
      )}
      
      {paragraph.status === ParagraphStatus.COMPLETED && (
        <div className="paragraph-status-badge completed-badge">
          {getStatusLabel()}
        </div>
      )}
      
      {paragraph.status === ParagraphStatus.ERROR && paragraph.error && (
        <div className="paragraph-error">
          <strong>Error:</strong> {paragraph.error}
        </div>
      )}
    </div>
  );
};
```

### 2.2 Update Paragraph Display Styles

Replace `src/components/ParagraphDisplay.css`:

```css
.paragraph {
  padding: 16px 20px;
  margin-bottom: 12px;
  border-radius: 8px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  line-height: 1.7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.paragraph:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.paragraph-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  transition: opacity 0.3s ease;
}

.paragraph-content.fading-out {
  opacity: 0.3;
}

.status-writing {
  background-color: #f8f9fa;
  border-left: 4px solid #6c757d;
}

.status-queued {
  background-color: #e7f3ff;
  border-left: 4px solid #0066cc;
  animation: slideIn 0.3s ease-out;
}

.status-processing {
  background-color: #fff8e1;
  border-left: 4px solid #ff9800;
  animation: pulse 2s ease-in-out infinite;
}

.status-streaming {
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  animation: streamPulse 1.5s ease-in-out infinite;
}

.status-completed {
  background-color: #d4edda;
  border-left: 4px solid #28a745;
  animation: completeBounce 0.5s ease-out;
}

.status-error {
  background-color: #f8d7da;
  border-left: 4px solid #dc3545;
  animation: shake 0.5s ease-in-out;
}

.paragraph-status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  font-style: normal;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-queued .paragraph-status-badge {
  background-color: #cce5ff;
  color: #004085;
}

.status-processing .paragraph-status-badge {
  background-color: #fff3cd;
  color: #856404;
}

.status-streaming .paragraph-status-badge {
  background-color: #ffc107;
  color: #856404;
}

.completed-badge {
  background-color: #28a745;
  color: white;
}

.paragraph-error {
  margin-top: 12px;
  padding: 10px 12px;
  background-color: #f5c6cb;
  border-radius: 6px;
  font-size: 14px;
  color: #721c24;
  border-left: 3px solid #dc3545;
}

.paragraph-error strong {
  font-weight: 600;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.85;
    transform: scale(0.995);
  }
}

@keyframes streamPulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }
  50% {
    opacity: 0.9;
    box-shadow: 0 2px 6px rgba(255, 193, 7, 0.2);
  }
}

@keyframes completeBounce {
  0% {
    transform: scale(0.95);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}
```

---

## Step 3: Enhanced UI Polish

### 3.1 Update App Styles

Replace `src/App.css`:

```css
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%);
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.app-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: headerGlow 10s ease-in-out infinite;
}

.app-header h1 {
  margin: 0;
  font-size: 42px;
  font-weight: 800;
  position: relative;
  z-index: 1;
  letter-spacing: -0.5px;
}

.app-subtitle {
  margin: 10px 0 0;
  font-size: 18px;
  opacity: 0.95;
  position: relative;
  z-index: 1;
  font-weight: 400;
}

.app-main {
  flex: 1;
  padding: 32px 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.editor-section {
  margin-bottom: 40px;
  animation: fadeInUp 0.5s ease-out;
}

.editor-section h2 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #2c3e50;
  font-weight: 700;
}

.editor-hint {
  margin-top: 12px;
  font-size: 14px;
  color: #6c757d;
  display: flex;
  align-items: center;
  gap: 8px;
}

.editor-hint::before {
  content: '💡';
  font-size: 16px;
}

.editor-hint kbd {
  display: inline-block;
  padding: 3px 8px;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.paragraphs-section {
  margin-top: 40px;
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.paragraphs-section h2 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #2c3e50;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12px;
}

.paragraphs-section h2::before {
  content: '📝';
  font-size: 28px;
}

.paragraphs-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes headerGlow {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-10%, -10%);
  }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5568d3 0%, #653a8b 100%);
}
```

### 3.2 Enhanced Text Editor Styles

Replace `src/components/TextEditor.css`:

```css
.text-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.text-editor-textarea {
  width: 100%;
  min-height: 140px;
  padding: 20px;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  font-size: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  line-height: 1.7;
  resize: none;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.text-editor-textarea:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1), 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.text-editor-textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.text-editor-textarea::placeholder {
  color: #6c757d;
  opacity: 0.6;
}

/* Focus animation */
.text-editor-textarea:focus::placeholder {
  opacity: 0.4;
}
```

---

## Step 4: Add Smooth Scrolling and Auto-scroll

### 4.1 Create Scroll Utility

Create `src/utils/scrollUtils.ts`:

```typescript
/**
 * Smooth scroll to an element
 */
export function smoothScrollToElement(elementId: string, offset: number = 100) {
  const element = document.querySelector(`[data-paragraph-id="${elementId}"]`);
  if (element) {
    const y = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

/**
 * Scroll to bottom of page
 */
export function scrollToBottom(smooth: boolean = true) {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
```

### 4.2 Update Text Processor Hook with Auto-scroll

Update the `processParagraph` function in `src/hooks/useTextProcessor.ts` to add auto-scroll:

Add this import at the top:
```typescript
import { scrollToBottom } from '../utils/scrollUtils';
```

Then update the `processParagraph` callback to include scroll behavior after adding paragraph:

```typescript
const processParagraph = useCallback(async (text: string) => {
  const trimmedText = text.trim();
  
  // Don't process empty paragraphs
  if (!trimmedText) return;

  // Create new paragraph
  const newParagraph: Paragraph = {
    id: generateId(),
    originalText: trimmedText,
    correctedText: '',
    status: ParagraphStatus.QUEUED,
    timestamp: Date.now(),
    streamProgress: 0,
  };

  // Add to paragraphs list
  setParagraphs(prev => [...prev, newParagraph]);

  // Auto-scroll to show new paragraph
  setTimeout(() => scrollToBottom(), 100);

  // Create queue item
  const queueItem: QueueItem = {
    paragraphId: newParagraph.id,
    text: trimmedText,
    addedAt: Date.now(),
  };

  // Add to queue for processing
  await queueManager.enqueue(queueItem);
  
  // Update queue stats
  setQueueLength(queueManager.getQueueLength());
  setProcessingCount(queueManager.getProcessingCount());
}, []);
```

---

## Step 5: Add Loading State and Empty State

### 5.1 Create Empty State Component

Create `src/components/EmptyState.tsx`:

```typescript
import React from 'react';
import './EmptyState.css';

export const EmptyState: React.FC = () => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">✍️</div>
      <h3 className="empty-state-title">Ready to enhance your text</h3>
      <p className="empty-state-description">
        Start typing above and press <kbd>Enter</kbd> twice to complete a paragraph.
        We'll automatically improve grammar, capitalization, and punctuation.
      </p>
      <div className="empty-state-features">
        <div className="feature-item">
          <span className="feature-icon">⚡</span>
          <span>Real-time streaming</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🔄</span>
          <span>Parallel processing</span>
        </div>
        <div className="feature-item">
          <span className="feature-icon">🎨</span>
          <span>Wave animations</span>
        </div>
      </div>
    </div>
  );
};
```

Create `src/components/EmptyState.css`:

```css
.empty-state {
  padding: 60px 24px;
  text-align: center;
  animation: fadeIn 0.6s ease-out;
}

.empty-state-icon {
  font-size: 80px;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

.empty-state-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
}

.empty-state-description {
  font-size: 16px;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto 32px;
  line-height: 1.6;
}

.empty-state-description kbd {
  display: inline-block;
  padding: 2px 6px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  font-family: monospace;
  font-size: 13px;
  margin: 0 2px;
}

.empty-state-features {
  display: flex;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

.feature-icon {
  font-size: 20px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

### 5.2 Update App Component with Empty State

Update `src/App.tsx`:

```typescript
import React, { useEffect } from 'react';
import { TextEditor } from './components/TextEditor';
import { ParagraphDisplay } from './components/ParagraphDisplay';
import { QueueStatus } from './components/QueueStatus';
import { EmptyState } from './components/EmptyState';
import { useTextProcessor } from './hooks/useTextProcessor';
import { validateApiConfig } from './services/config';
import './App.css';

function App() {
  const {
    paragraphs,
    currentText,
    queueLength,
    processingCount,
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
        <p className="app-subtitle">Real-time text enhancement with streaming</p>
      </header>

      <main className="app-main">
        <div className="editor-section">
          <h2>Write Your Text</h2>
          
          <QueueStatus
            queueLength={queueLength}
            processingCount={processingCount}
          />
          
          <TextEditor
            value={currentText}
            onChange={handleTextChange}
            onParagraphComplete={handleParagraphComplete}
          />
          <div className="editor-hint">
            Press <kbd>Enter</kbd> twice to complete a paragraph. 
            Up to 3 paragraphs can be processed simultaneously.
          </div>
        </div>

        {paragraphs.length > 0 ? (
          <div className="paragraphs-section">
            <h2>Processed Paragraphs</h2>
            <div className="paragraphs-list">
              {paragraphs.map(paragraph => (
                <ParagraphDisplay key={paragraph.id} paragraph={paragraph} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

export default App;
```

---

## Step 6: Testing the Complete Experience

### 6.1 Full Feature Test

1. **Start the application:**
```powershell
npm run tauri dev
```

2. **Test the wave animation:**
   - Type a paragraph with errors: "this is a test paragraph. it has bad grammer and no caps."
   - Press Enter twice
   - Watch the wave animation as corrected text appears
   - Verify smooth character-by-character cascade

3. **Test multiple paragraphs:**
   - Type 3-4 paragraphs rapidly
   - Observe queue management
   - Watch wave animations on each
   - Verify no performance issues

4. **Test UI interactions:**
   - Hover over completed paragraphs
   - Check empty state before adding paragraphs
   - Verify auto-scroll behavior
   - Test all status indicators

### 6.2 Visual Quality Checklist

- [ ] Wave animation is smooth and visible
- [ ] Color transitions are pleasing
- [ ] Hover effects work on paragraphs
- [ ] Status badges are clear and readable
- [ ] Queue status displays correctly
- [ ] Empty state looks good
- [ ] Scrollbar is styled
- [ ] Header gradient animates subtly
- [ ] No flickering or jumping
- [ ] Text remains readable during animation

---

## Step 7: Performance Optimization

### 7.1 Optimize Animation Performance

If animations feel slow or janky, adjust timing in `src/components/AnimatedText.tsx`:

```typescript
// Faster animation (less delay between characters)
animationDelay = 15  // Instead of 20

// Slower animation (more delay between characters)
animationDelay = 30  // Instead of 20
```

### 7.2 Reduce Motion for Accessibility

Add to `src/index.css`:

```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Step 8: Build and Package

### 8.1 Production Build

Create production build:

```powershell
npm run tauri build
```

### 8.2 Test Production Build

The installer will be in `src-tauri/target/release/bundle/`:
- `.msi` file for Windows installer
- `.exe` for portable executable

Test the production build to ensure:
- All animations work
- Performance is smooth
- No console errors
- API calls work correctly

---

## Step 9: Final Verification Checklist

### 9.1 Feature Completeness

- [ ] Character wave animation works smoothly
- [ ] Text transitions from original to corrected
- [ ] Multiple paragraphs animate independently
- [ ] Queue system processes up to 3 simultaneously
- [ ] Status indicators update correctly
- [ ] Empty state displays when no paragraphs
- [ ] Auto-scroll works on new paragraphs
- [ ] Error states display properly
- [ ] Hover effects work
- [ ] UI is responsive

### 9.2 Polish Checklist

- [ ] All colors are visually appealing
- [ ] Typography is readable
- [ ] Spacing is consistent
- [ ] Animations are smooth (60fps)
- [ ] Loading states are clear
- [ ] Transitions are seamless
- [ ] Icons and emojis enhance UX
- [ ] Custom scrollbar works

### 9.3 Performance Checklist

- [ ] No lag when typing
- [ ] Smooth animations even with 5+ paragraphs
- [ ] Memory usage is reasonable
- [ ] CPU usage is acceptable
- [ ] Network requests are efficient
- [ ] No memory leaks
- [ ] Fast startup time

---

## Phase 2 Complete!

Congratulations! You now have a fully functional Cascade-Edit application with:

- ✅ Beautiful character wave animations
- ✅ Smooth paragraph transitions
- ✅ Polished UI with micro-interactions
- ✅ Real-time streaming with visual feedback
- ✅ Parallel processing queue system
- ✅ Professional error handling
- ✅ Delightful user experience

---

## Next Steps and Enhancements

### Potential Future Improvements

1. **Settings Panel**
   - Model selection
   - Animation speed control
   - Theme customization
   - Max concurrent setting

2. **Export Functionality**
   - Export corrected text to file
   - Copy all to clipboard
   - Save session history

3. **Advanced Features**
   - Undo/redo support
   - Paragraph edit in place
   - Custom system prompts
   - Multiple correction modes

4. **Accessibility**
   - Keyboard shortcuts
   - Screen reader support
   - High contrast mode
   - Focus indicators

5. **Analytics**
   - Word count
   - Correction stats
   - Processing time metrics
   - Usage history

---

## Troubleshooting

### Animation Issues

**Problem: Animation too fast to see**
- Solution: Increase `animationDelay` in AnimatedText component
- Try values between 25-50ms

**Problem: Animation stutters**
- Solution: Reduce number of concurrent processes
- Check CPU usage in Task Manager
- Ensure GPU acceleration is enabled

**Problem: Text doesn't transition**
- Solution: Check browser console for errors
- Verify React state updates correctly
- Test with shorter paragraphs first

### UI Issues

**Problem: Colors don't match**
- Solution: Check CSS classes are applied
- Verify no conflicting styles
- Clear browser cache

**Problem: Hover effects don't work**
- Solution: Ensure CSS transitions are not disabled
