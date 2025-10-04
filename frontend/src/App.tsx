import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import NavBar from './components/NavBar'
import Home from './pages/Home'
import Publications from './pages/Publications'

function App() {

  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <BrowserRouter>
          <div className='bg-background min-h-screen'>
            <NavBar></NavBar>
            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/publications' element={<Publications />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
