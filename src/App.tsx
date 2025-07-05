import { useState } from 'react'
import './App.css'
import { Login } from './pages/login/login.tsx'

function App() {

  const handleLogin = (mail: string, password: string) =>{
    console.log(mail, password)
  }

  return (
    <Login OnLogin={handleLogin} />
  )
}

export default App
