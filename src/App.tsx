import './App.css';
import { useState } from 'react';
import { MenuMain } from './pages/menu/menu.tsx';
import { Login } from './pages/login/login.tsx';
import { CreateUser } from './pages/signup/signup.tsx';
import { useUser } from './context/usercontext.tsx';

function App() {
  const { user, login, logout } = useUser();
  const [authError, setAuthError] = useState('');
  const [isCreatingUser, setCreatingUser] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Manejo de prueba de login exitoso
  const handleLogin = (mail: string, password: string) => {
    if (mail === 'abc@gmail.com' && password === 'Abc123#') {
      setAuthError('');
      setSuccessMessage('');
      login(mail);
    } else {
      setAuthError('Email o contraseña incorrectos');
    }
  };

  // Función para cambiar a vista de crear usuario
  const handleCreateUser = () => {
    setCreatingUser(true);
    setAuthError('');
    setSuccessMessage('');
  };

  // Función para volver al login
  const handleReturnToLogin = () => {
    setCreatingUser(false);
    setAuthError('');
  };

  // Función cuando se crea un usuario exitosamente
  const handleUserCreated = (userData: { username: string; email: string }) => {
    setSuccessMessage(`¡Usuario ${userData.username} creado exitosamente!`);
    // Aquí podrías hacer login automático o mostrar mensaje de éxito
    console.log('Usuario creado:', userData);
  };

  return (
    <>
      {user ? (
        <>
          <MenuMain />
          <button onClick={logout}>Cerrar sesión</button>
        </>
      ) : isCreatingUser ? (
        <CreateUser
          onReturnToLogin={handleReturnToLogin}
          onUserCreated={handleUserCreated}
        />
      ) : (
        <Login
          OnLogin={handleLogin}
          authError={authError}
          OnCreateUser={handleCreateUser}
          successMessage={successMessage}
        />
      )}
    </>
  );
}

export default App;
