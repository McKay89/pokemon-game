import { useState } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom';
import Main from './components/Main';
import Info from './components/Info';
import './App.css'

function App() {
  const [user, setUser] = useState("")
  return ( 
    <Routes>
      <Route path='/' element={<Main />}>
        <Route path='/info' element={<Info />} />
      </Route>
    </Routes>
  );
}

export default App
