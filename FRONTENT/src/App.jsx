import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css'
import LandingPage from './pages/landing.jsx';
import Authentication from './pages/authentication.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import VedioMeetComponent from './pages/vedioMeet.jsx';
import HomeComponent from './pages/home.jsx';
import History from './pages/history.jsx';

function App() {
  return (
    <>
      <Router>


        <AuthProvider>
          <Routes>
            <Route path='/' element={<LandingPage />} />
            <Route path='/home' element={<HomeComponent />} />
            <Route path='/auth' element={<Authentication />} />
            <Route path='/history' element={<History />} />
            <Route path='/:url' element={<VedioMeetComponent />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  )
}

export default App
