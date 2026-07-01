import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PoliViz from './pages/PoliViz.tsx';
import HistoricalConflicts from './pages/HistoricalConflicts.tsx';
import Page404 from './pages/Page404';
import Navigation from './components/Navigation';

// Lazy-loaded so Papa Parse (and later three.js / D3) ship only in the /satorl
// chunk, not the main bundle.
const Satorl = lazy(() => import('./pages/Satorl.tsx'));

function App() {
  return (
    <>
      <Router>
        <div>
            <Navigation />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/poliviz" element={<PoliViz />} />
                <Route path="/conflicts" element={<HistoricalConflicts />} />
                <Route
                  path="/satorl"
                  element={
                    <Suspense fallback={<div className="p-10 text-center text-sm italic">Loading…</div>}>
                      <Satorl />
                    </Suspense>
                  }
                />
                <Route path="*" element={<Page404 />} />
                {/* Can add more pages later */}
            </Routes>
        </div>
      </Router>
    </>
  )
}

export default App;
