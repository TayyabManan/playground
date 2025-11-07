# Playground - Interactive ML & Data Visualization Projects

A collection of interactive machine learning and data visualization projects built with React, TypeScript, and D3.js.

**Live Site:** [playground.tayyabmanan.com](https://playground.tayyabmanan.com)
**Main Portfolio:** [tayyabmanan.com](https://tayyabmanan.com)

---

## 🚀 Current Projects

### 1. Backpropagation Visualizer (In Progress)
Interactive visualization of neural network backpropagation. Watch gradients flow through layers in real-time.

**Features (Planned):**
- Forward pass visualization
- Backward pass gradient flow animation
- Interactive network architecture controls
- Real-time loss and accuracy metrics
- Step-by-step computation display

**Status:** 🟡 In Development

### 2. ML Matrix Calculator (Coming Soon)
Interactive matrix operations with neural network context and exact arithmetic.

**Features (Planned):**
- Core matrix operations (add, multiply, transpose)
- Neural network layer implementation
- Exact arithmetic using fraction.js
- Multi-framework code export (PyTorch, TensorFlow, NumPy)

**Status:** 🔴 Not Started

### 3. Neural Network Visualizer (Coming Soon)
Real-time visualization of neural network training and inference.

**Status:** 🔴 Not Started

---

## 🛠️ Tech Stack

### Core
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing

### Styling
- **Tailwind CSS** - Utility-first CSS
- **Bricolage Grotesque** - Custom font (matching main portfolio)
- Dark/Light theme system

### Visualization (Planned)
- **D3.js** - Data visualization
- **fraction.js** - Exact arithmetic
- **Framer Motion** - Animations

### Deployment
- **Vercel** - Hosting & auto-deployment
- **GitHub** - Version control

---

## ⚙️ Features

### ✅ Implemented
- 🎨 **Theme System** - Light/Dark mode toggle with localStorage persistence
- 📱 **Fully Responsive** - Mobile, tablet, and desktop layouts
- 🔤 **Custom Typography** - Bricolage Grotesque font
- ⚡ **Fast Loading** - Lazy-loaded routes with Suspense
- 🎯 **Clean UI** - Left-aligned text, modern card-based layout
- 🔄 **Auto-Deploy** - Push to main = instant deployment

### 🚧 In Progress
- Backpropagation visualizer core implementation
- D3.js neural network graph
- Interactive controls

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/tayyabmanan/playground.git
cd playground
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
```

---

## 📁 Project Structure

```
playground/
├── src/
│   ├── components/          # Shared UI components
│   │   ├── Layout.tsx       # App layout wrapper
│   │   ├── ThemeToggle.tsx  # Theme switcher button
│   │   └── LoadingScreen.tsx
│   ├── context/             # React Context providers
│   │   └── ThemeContext.tsx # Theme state management
│   ├── pages/               # Route pages
│   │   └── Home.tsx         # Landing page
│   ├── projects/            # Individual projects
│   │   ├── BackpropVisualizer/
│   │   │   ├── components/  # Project-specific components
│   │   │   ├── core/        # Core logic & algorithms
│   │   │   └── index.tsx    # Project entry point
│   │   └── MLCalculator/
│   ├── App.tsx              # App root with routing
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── index.html               # HTML template
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript config
└── vite.config.ts           # Vite configuration
```

---

## 🎨 Theme System

The playground uses a custom theme system with:
- **Light/Dark modes** with smooth transitions
- **localStorage persistence** - remembers your preference
- **System preference detection** - defaults to your OS theme
- **Dynamic Tailwind classes** - `dark:` prefix for dark mode styles

### Color Palette

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Background | `#ffffff` | `#0a0f1e` |
| Text Primary | `#111827` | `#f8fafc` |
| Text Secondary | `#6b7280` | `#6b7280` |
| Primary Accent | `#2563eb` | `#60a5fa` |
| Borders | `#e5e7eb` | `#2d3748` |

---

## 🌐 Deployment

This project auto-deploys to Vercel on every push to `main`.

### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

### Custom Domain Setup
The playground is hosted at `playground.tayyabmanan.com` as a subdomain of the main portfolio.

---

## 🧪 Development Workflow

### Adding a New Project

1. **Create project structure**
```bash
mkdir -p src/projects/YourProject/components
mkdir -p src/projects/YourProject/core
```

2. **Create index.tsx**
```tsx
// src/projects/YourProject/index.tsx
import { Link } from 'react-router-dom';

export default function YourProject() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="text-[#2563eb] dark:text-[#60a5fa]">
          ← Back to Home
        </Link>
        {/* Your project content */}
      </div>
    </div>
  );
}
```

3. **Add route in App.tsx**
```tsx
const YourProject = lazy(() => import('./projects/YourProject'));

// In Routes:
<Route path="/your-project" element={<YourProject />} />
```

4. **Add to home page**
```tsx
// In src/pages/Home.tsx
{
  id: 'your-project',
  title: 'Your Project',
  description: 'Description here',
  route: '/your-project',
  status: 'in-progress',
  tags: ['Tag1', 'Tag2']
}
```

### Theme Usage

All components automatically have access to the theme:

```tsx
import { useTheme } from '../context/ThemeContext';

function YourComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="bg-white dark:bg-gray-900 text-black dark:text-white">
      Current theme: {theme}
    </div>
  );
}
```

---

## 🗺️ Roadmap

### Phase 1: Backpropagation Visualizer (Current)
- [ ] Neural network graph with D3.js
- [ ] Forward pass animation
- [ ] Backward pass gradient flow
- [ ] Interactive controls (learning rate, architecture)
- [ ] Real-time metrics display

### Phase 2: ML Matrix Calculator
- [ ] Core Matrix class implementation
- [ ] Neural network layer support
- [ ] Exact arithmetic with fraction.js
- [ ] Interactive calculator UI
- [ ] Code export (PyTorch, TensorFlow, NumPy)

### Phase 3: Neural Network Visualizer
- [ ] Real-time training visualization
- [ ] Multiple architecture support
- [ ] Dataset integration
- [ ] Training metrics dashboard

### Phase 4: Additional Projects
- Data explorer with interactive charts
- Gradient descent visualizer
- Activation function playground
- Loss landscape visualization

---

## 📚 Reference Documents

- **Implementation Guide:** `IMPLEMENTATION_GUIDE.md`
- **Quick Start:** `QUICK_START.md`
- **ML Calculator Spec:** `ML_MATRIX_CALCULATOR_IMPLEMENTATION.pdf`

---

## 🤝 Contributing

This is a personal portfolio project, but feedback and suggestions are welcome!

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is part of Tayyab Manan's personal portfolio.

---

## 👤 Author

**Tayyab Manan**
AI Engineering Masters Student

- Portfolio: [tayyabmanan.com](https://tayyabmanan.com)
- Playground: [playground.tayyabmanan.com](https://playground.tayyabmanan.com)
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)

---

## 🙏 Acknowledgments

- Inspiration from interactive ML visualizations
- Design principles from [main portfolio](https://tayyabmanan.com)
- Built with modern web technologies and best practices

---

**Last Updated:** November 2024
