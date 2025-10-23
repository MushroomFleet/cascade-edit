# Cascade-Edit ✨

> Real-time text enhancement with beautiful wave animations

A Windows desktop application that leverages AI to improve your writing with live grammar, capitalization, and punctuation corrections. Watch as your text transforms with stunning character-by-character wave animations.

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey.svg)

---

## ✨ Features

- 🌊 **Character Wave Animations** - Watch corrected text cascade in with beautiful wave effects
- ⚡ **Real-Time Streaming** - See corrections appear character-by-character as the AI processes
- 🔄 **Parallel Processing** - Process up to 3 paragraphs simultaneously without blocking
- 📝 **Smart Paragraph Detection** - Automatic detection via double line breaks
- 🎨 **Beautiful UI** - Gradient headers, custom scrollbar, smooth transitions
- 💾 **Desktop Native** - Lightweight Tauri-based Windows application
- 🔒 **Privacy Focused** - Processes via OpenRouter API with secure configuration

---

## 🎬 How It Works

1. **Write** - Type your text in the editor
2. **Complete** - Press `Enter` twice to finish a paragraph
3. **Watch** - See your paragraph transform with wave animations
4. **Continue** - Keep writing while previous paragraphs process

The app maintains your original text while streaming corrections in real-time, creating a delightful writing experience.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **pnpm** package manager
- **Rust** toolchain (for Tauri)
- **Windows** 10/11
- **OpenRouter API Key** ([Get one here](https://openrouter.ai/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MushroomFleet/cascade-edit.git
   cd cascade-edit
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure API Key**
   
   Create a `.env` file in the project root:
   ```env
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
   VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   ```
   
   Replace `sk-or-v1-your-key-here` with your actual OpenRouter API key.

4. **Run the application**
   
   **Development mode (browser):**
   ```bash
   pnpm run dev
   ```
   Visit http://localhost:5173
   
   **Desktop application:**
   ```bash
   pnpm tauri dev
   ```

5. **Build for distribution**
   ```bash
   pnpm tauri build
   ```
   Find the installer in `src-tauri/target/release/bundle/`

---

## 📖 Usage

1. **Start typing** in the main text editor
2. **Press Enter twice** when you finish a paragraph
3. **Watch the magic** as your text is corrected with wave animations
4. **Keep writing** - the app processes multiple paragraphs in parallel

### Status Indicators

- 🔵 **Blue (Queued)** - Paragraph waiting to be processed
- 🟡 **Yellow (Streaming)** - Actively receiving corrections
- 🟢 **Green (Completed)** - Processing finished successfully
- 🔴 **Red (Error)** - Something went wrong

### Queue System

The app can process up to 3 paragraphs simultaneously. Additional paragraphs wait in queue and are processed as slots become available.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite 7
- **Desktop Framework:** Tauri 2.9
- **AI Processing:** OpenRouter API
- **Package Manager:** pnpm
- **Styling:** CSS Modules with animations

---

## 📁 Project Structure

```
cascade-edit/
├── src/
│   ├── components/      # React components
│   │   ├── AnimatedText     # Character wave animation
│   │   ├── EmptyState       # Welcome screen
│   │   ├── ParagraphDisplay # Paragraph with status
│   │   ├── QueueStatus      # Queue indicator
│   │   └── TextEditor       # Main input
│   ├── services/        # API & queue management
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Helper functions
│   └── App.tsx         # Main application
├── src-tauri/          # Tauri configuration
├── docs/               # Documentation
└── .env                # API configuration (create this)
```

---

## 🎯 Development Roadmap

### Completed ✅
- [x] Phase 0: MVP Foundation
- [x] Phase 1: Streaming & Queue System
- [x] Phase 2: Animation & UX Polish

### Future Enhancements 🔮
- [ ] Settings panel (model selection, animation speed)
- [ ] Export functionality (save corrected text)
- [ ] Undo/redo support
- [ ] Custom system prompts
- [ ] Multiple correction modes
- [ ] Analytics dashboard

---

## 🐛 Troubleshooting

**API key errors?**
- Ensure `.env` file exists with valid `VITE_OPENROUTER_API_KEY`
- Restart dev server after adding key

**Build fails?**
- Install Rust: https://www.rust-lang.org/tools/install
- Run: `rustup update`

**Animations not smooth?**
- Check CPU usage
- Reduce concurrent processing to 2 or 1
- Adjust animation delay in `AnimatedText.tsx`

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **OpenRouter** - For providing the AI text processing API
- **Tauri** - For the amazing desktop application framework
- **Vite** - For blazing fast development experience
- **React** - For the powerful UI framework

---

## 📚 Documentation

- [Phase 0: Setup & MVP](docs/phase-0-setup-mvp.md) - Initial setup guide
- [Phase 1: Streaming & Queue](docs/phase-1-streaming-queue.md) - Advanced features
- [Phase 2: Animation & UX](docs/phase-2-animation-ux.md) - Polish and animations

---

## 📧 Contact & Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/cascade-edit/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/cascade-edit/discussions)

---

<div align="center">

**Built with ❤️ using React, TypeScript, and Tauri**

*Cascade-Edit - Making writing beautiful, one wave at a time* 🌊

---

## 📚 Citation

### Academic Citation

If you use this codebase in your research or project, please cite:

```bibtex
@software{cascade_edit,
  title = {Cascade edit: Real-time text enhancement},
  author = {[Drift Johnson]},
  year = {2025},
  url = {https://github.com/MushroomFleet/cascade-edit},
  version = {1.0.0}
}
```

</div>

### Donate:


[![Ko-Fi](https://cdn.ko-fi.com/cdn/kofi3.png?v=3)](https://ko-fi.com/driftjohnson)
