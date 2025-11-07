import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import LoadingScreen from './components/LoadingScreen';

const Home = lazy(() => import('./pages/Home'));
const MLCalculator = lazy(() => import('./projects/MLCalculator'));

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ml-calculator" element={<MLCalculator />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
