import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PoliViz from './pages/PoliViz';
import Page2 from './pages/Page2';
import Page3 from './pages/Page3';
import Page404 from './pages/Page404';
import Navigation from './components/Navigation';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <div>
            <Navigation />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/poliviz" element={<PoliViz />} />
                <Route path="/page2" element={<Page2 />} />
                <Route path="/page3" element={<Page3 />} />
                <Route path="*" element={<Page404 />} />
                {/* Can add more pages later */}
            </Routes>
        </div>
      </Router>
    </>
  )
}

export default App;