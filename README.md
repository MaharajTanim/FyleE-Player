# 🎬 FileE Video Player

A professional-grade React video player supporting **50+ video formats** with advanced codec detection, intelligent error handling, and beautiful dark/light theme modes.

![FileE Video Player](https://img.shields.io/badge/React-18.0+-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
![Vite](https://img.shields.io/badge/Vite-5.0+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ✨ Features

### 🎥 Comprehensive Format Support
- **50+ Video Formats**: MP4, MOV, AVI, MKV, WebM, FLV, WMV, M4V, MPG, 3GP, OGV, TS, MXF, R3D, GXF, DV, HDV, YUV, AMV, SWF, VOB, and many more
- **Advanced Codec Detection**: Real-time browser compatibility assessment for H.264, H.265/HEVC, VP8, VP9, AV1
- **Format Filtering**: Filter videos by specific formats with dropdown selection
- **Smart Processing**: Format-specific timeout handling and optimization

### 🎨 Modern User Interface
- **Dark/Light Theme**: Seamless theme switching with beautiful animations
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices
- **Professional Styling**: Modern UI with smooth micro-interactions
- **Format Showcase**: Interactive modal displaying all supported formats and capabilities

### 🧠 Intelligent Features
- **Smart Error Handling**: MediaError-specific messages with codec recommendations
- **Browser Compatibility**: Real-time codec support detection and warnings
- **Video Information**: Live metadata display (format, resolution, bitrate, compatibility)
- **Search & Sort**: Advanced filtering and sorting capabilities

### ⚡ Performance Optimized
- **Batch Processing**: Efficient handling of large video collections
- **Memory Management**: Optimized for performance with large files
- **CORS Support**: Enhanced cross-origin resource handling
- **Thumbnail Generation**: Automatic video preview generation

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fileE-video-player.git
   cd fileE-video-player
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Main navigation with theme toggle
│   ├── VideoPlayer.tsx # Core video player component
│   ├── Library.tsx     # Video library grid/list view
│   └── FeatureShowcase.tsx # Feature demonstration modal
├── context/            # React context providers
│   └── VideoContext.tsx # Video state management
├── hooks/              # Custom React hooks
│   ├── useVideos.ts    # Video processing logic
│   └── useSettings.ts  # Theme and UI settings
├── utils/              # Utility functions
│   ├── codecSupport.ts # Browser codec detection
│   └── videoProcessor.ts # Video file processing
└── styles/             # CSS styling files
    ├── app.css         # Global styles and theme variables
    └── *.css           # Component-specific styles
```

## 🎯 Supported Video Formats

### Standard Formats
- **MP4** - MPEG-4 Video Container
- **MOV** - QuickTime Movie
- **AVI** - Audio Video Interleave
- **MKV** - Matroska Video
- **WebM** - Web Media
- **FLV** - Flash Video
- **WMV** - Windows Media Video

### Professional Formats
- **R3D** - RED Digital Cinema
- **MXF** - Material Exchange Format
- **GXF** - General Exchange Format
- **DV** - Digital Video
- **HDV** - High Definition Video

### Legacy & Specialized
- **YUV** - Raw Video Format
- **AMV** - MTV Video Format
- **SWF** - Shockwave Flash
- **VOB** - Video Object
- **3GP** - 3rd Generation Partnership

*...and 35+ more formats!*

## 🛠️ Technical Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite 5.0+
- **Styling**: Tailwind CSS + Custom CSS
- **State Management**: React Context + Custom Hooks
- **Video Processing**: Native HTML5 Video API
- **Browser Detection**: Custom codec support detection

## 🎨 Theme System

The application features a comprehensive theme system with:

- **Light Mode**: Clean, bright interface with excellent contrast
- **Dark Mode**: Modern dark interface with proper color schemes
- **Auto Mode**: Follows system preference automatically
- **Smooth Transitions**: All theme changes animate beautifully

### Theme Variables
```css
/* Light Theme */
--primary: #4F46E5;
--background: #F9FAFB;
--card-bg: #FFFFFF;
--text: #1F2937;

/* Dark Theme */
--primary: #6366F1;
--background: #111827;
--card-bg: #1F2937;
--text: #F9FAFB;
```

## 🧪 Browser Compatibility

| Browser | Video Formats | Codec Support | Theme Mode |
|---------|---------------|---------------|------------|
| Chrome 90+ | ✅ Full | ✅ H.264, VP8, VP9, AV1 | ✅ Complete |
| Firefox 88+ | ✅ Full | ✅ H.264, VP8, VP9 | ✅ Complete |
| Safari 14+ | ✅ Most | ✅ H.264, Limited HEVC | ✅ Complete |
| Edge 90+ | ✅ Full | ✅ H.264, VP8, VP9, AV1 | ✅ Complete |

## 📖 Usage Examples

### Basic Video Loading
```typescript
// Drag & drop video files or click "Select Folder"
// Videos are automatically processed and displayed in the library
```

### Format Filtering
```typescript
// Use the format dropdown in the header
// Filter by specific formats: MP4, MKV, WebM, etc.
```

### Theme Switching
```typescript
// Click the sun/moon icon in header to toggle themes
// Supports: Light, Dark, Auto (system preference)
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Adding New Formats
1. Add format extension to `validExtensions` array in `VideoContext.tsx`
2. Update format display in `Header.tsx` dropdown
3. Add format-specific processing if needed in `videoProcessor.ts`

### Customizing Themes
1. Modify CSS variables in `src/styles/app.css`
2. Update theme switching logic in `useSettings.ts`
3. Add new theme variants as needed

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite for lightning-fast development experience
- Tailwind CSS for utility-first styling
- Video codec standards organizations

## 📊 Project Stats

- **50+ Video Formats** supported
- **Comprehensive Codec Detection** for modern browsers
- **Professional UI/UX** with dark mode support
- **Responsive Design** for all screen sizes
- **TypeScript** for type safety
- **Modern React** patterns and hooks

---

<p align="center">
  Made with ❤️ for video enthusiasts everywhere
</p>
