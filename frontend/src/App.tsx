import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Clima from './pages/Clima';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/clima/:cidade" element={<Clima />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;