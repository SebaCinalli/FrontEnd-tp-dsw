import './App.css'
import { MenuMain } from './pages/menu/menu.tsx'
import { Login } from './pages/login/login.tsx'
import { useUser } from './context/usercontext.tsx'

function App() {
  const { user, login, logout } = useUser();

  //manejo de prueba de login exitoso
  const handleLogin = (mail: string, password: string) =>{
    if(mail === "abc@gmail.com" && password === "Abc123#")
      login(mail)
  }

  return (
    <>
      {user ? (
        <>
          <MenuMain></MenuMain>
          <button onClick={logout}>Cerrar sesión</button>
        </>
      ) : (
        <Login OnLogin={handleLogin} />
      )}
    </>
  );
}


export default App
