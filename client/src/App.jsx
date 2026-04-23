import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx'
import Characters from './pages/Characters.jsx'

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/characters" element={<Characters />} />
          </Routes>
      </Router>
  )
}

export default App;