import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import LoadingScreen from './components/LoadingScreen';
import Layout from './components/Layout';

const Home = lazy(() => import('./pages/Home'));
const MLCalculator = lazy(() => import('./projects/MLCalculator'));
const BackpropVisualizer = lazy(() => import('./projects/BackpropVisualizer'));

function App() {
  return (
    <ThemeProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/ml-calculator" element={<MLCalculator />} />
              <Route path="/backprop-visualizer" element={<BackpropVisualizer />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
