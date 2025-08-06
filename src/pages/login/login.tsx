import { useUser } from '../../context/usercontext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useState } from 'react';
import './login.css';

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [email, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [authError, setAuthError] = useState('');

  const validateFormMail = (email: string) => {
    let isValid = true;
    let emailError = '';

    if (email.trim() === '') {
      isValid = false;
      emailError = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      isValid = false;
      emailError = 'El email no es válido';
    }

    return { isValid, emailError };
  };

  const validateFormPass = (password: string) => {
    let isValid = true;
    let passError = '';

    if (password.trim() === '') {
      isValid = false;
      passError = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      isValid = false;
      passError = 'Debe tener más de 6 caracteres';
    } else {
      const tieneMayuscula = /[A-Z]/.test(password);
      const tieneNumero = /[0-9]/.test(password);

      if (!tieneMayuscula || !tieneNumero) {
        isValid = false;
        passError = 'Debe incluir mayúscula y un número';
      }
    }

    return { isValid, passError };
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        'http://localhost:3000/api/cliente/login',
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      const cliente = response.data;

      login({
        email: cliente.email,
        id: cliente.id,
        username: cliente.username,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
      });

      navigate('/');
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data.message;

        if (status === 400 && message === 'Contraseña incorrecta') {
          setAuthError('La contraseña es incorrecta.');
        } else if (status === 404) {
          setAuthError('El usuario no existe.');
        } else if (
          status === 400 &&
          message === 'Email y contraseña son requeridos'
        ) {
          setAuthError('Por favor completá ambos campos.');
        } else {
          setAuthError('Ocurrió un error al iniciar sesión.');
        }
      } else {
        setAuthError('No se pudo conectar con el servidor.');
      }
    }
  };

  return (
    <div className="menu-body">
      <div className="container-login-form">
        <h2>Iniciar Sesión</h2>
        <form onSubmit={handleLogin}>
          <label htmlFor="usuario">Usuario</label>
          <input
            type="email"
            id="usuario"
            value={email}
            onChange={(e) => {
              const val = e.target.value;
              setMail(val);
              const { isValid, emailError } = validateFormMail(val);
              setEmailError(isValid ? '' : emailError);
              setAuthError('');
            }}
            placeholder="Ingrese su correo"
          />
          {emailError && <div className="error-text">{emailError}</div>}

          <label htmlFor="clave">Contraseña</label>
          <input
            type="password"
            id="clave"
            value={password}
            onChange={(e) => {
              const val = e.target.value;
              setPassword(val);
              const { isValid, passError } = validateFormPass(val);
              setPassError(isValid ? '' : passError);
              setAuthError('');
            }}
            placeholder="Ingrese su contraseña"
          />
          {passError && <div className="error-text">{passError}</div>}
          {authError && <div className="error-text">{authError}</div>}

          <button type="submit">Ingresar</button>
          <button
            type="button"
            className="create-user-button"
            onClick={() => navigate('/signup')}
          >
            Crear usuario
          </button>
        </form>
      </div>
    </div>
  );
};

export { Login };
