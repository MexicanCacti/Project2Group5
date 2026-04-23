import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx'
import Characters from './pages/Characters.jsx'
import CreateStory from './pages/CreateStory.jsx'
import Storybooks from './pages/Storybooks.jsx'

function App() {
  return (
      <Router>
          <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/characters" element={<Characters />} />
              <Route path="/create" element={<CreateStory/>} />
              <Route path="/stories" element={<Storybooks/>} />
          </Routes>
      </Router>
  )
}

export default App;