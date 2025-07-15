import './App.css'
import {useState} from 'react'

import { MenuMain } from './pages/menu/menu.tsx'
import { Login } from './pages/login/login.tsx'
import {CreateUser} from './pages/signup/signup.tsx'
import { useUser } from './context/usercontext.tsx'

function App() {
  const { user, login, logout } = useUser();
  const [authError, setAuthError] = useState("");
  const [iscreatingUser, setCreatingUser] = useState(false);

  //manejo de prueba de login exitoso
  const handleLogin = (mail: string, password: string) =>{
    if(mail === "abc@gmail.com" && password === "Abc123#"){
      setAuthError("")
      login(mail)
    }else{
      setAuthError("Email o contraseña incorrectos")
    }
  }

  const handleCreateUser =() =>{
    setCreatingUser(true)
  }

  return (
  <>
    {user ? (
      <>
        <MenuMain />
        <button onClick={logout}>Cerrar sesión</button>
      </>
    ) : iscreatingUser ? (
      <div>
        <CreateUser>
        <button onClick={() => setCreatingUser(false)} className='return-login-button'>Volver</button>
        </CreateUser>
      </div>
    ) : (
      <Login
        OnLogin={handleLogin}
        authError={authError}
        OnCreateUser={handleCreateUser}
      />
    )}
  </>
);

}


export default App
