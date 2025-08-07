import { useState } from 'react';
import './login.css';

type LoginProps = {
  OnLogin: (mail: string, password: string) => void;
  authError?: string;
  OnCreateUser?: () => void;
};

const Login = ({ OnLogin, authError, OnCreateUser }: LoginProps) => {
  const [email, setMail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChangeMail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMail(value);
    const { isValid, emailError } = validateFormMail(value);
    setEmailError(isValid ? '' : emailError);
  };

  const handleChangePass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    const { isValid, passError } = validateFormPass(value);
    setPassError(isValid ? '' : passError);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

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
      passError = 'La contraseña debe tener más de 6 caracteres';
    } else {
      const tieneMayuscula = /[A-Z]/.test(password);
      const tieneNumero = /[0-9]/.test(password);
      const tieneEspecial = /[^A-Za-z0-9]/.test(password);

      if (!tieneMayuscula || !tieneNumero || !tieneEspecial) {
        isValid = false;
        passError =
          'Debe incluir al menos una mayúscula, número y caracter especial';
      }
    }

    return { isValid, passError };
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid: validEmail, emailError } = validateFormMail(email);
    const { isValid: validPassword, passError } = validateFormPass(password);

    setEmailError(validEmail ? '' : emailError);
    setPassError(validPassword ? '' : passError);

    if (validEmail && validPassword) {
      OnLogin(email, password);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Iniciar Sesión</h2>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="usuario" className="form-label">
              Usuario
            </label>
            <div className="input-wrapper">
              <span className="input-icon">@</span>
              <input
                type="email"
                id="usuario"
                value={email}
                onChange={handleChangeMail}
                className="form-input"
                placeholder="Ingrese su correo"
              />
            </div>
            {emailError && <div className="error-text">{emailError}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="clave" className="form-label">
              Contraseña
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="clave"
                value={password}
                onChange={handleChangePass}
                className="form-input"
                placeholder="Ingrese su contraseña"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {passError && <div className="error-text">{passError}</div>}
          </div>

          {authError && <div className="error-text">{authError}</div>}

          <div className="button-group">
            <button type="submit" className="login-button">
              Ingresar
            </button>
            {OnCreateUser && (
              <button
                type="button"
                className="create-user-button"
                onClick={OnCreateUser}
              >
                Crear usuario
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export { Login };
