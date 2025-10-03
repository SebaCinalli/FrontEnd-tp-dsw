import { useState } from 'react';
import './signup.css';
import { validateFormMail } from '../../validateFunctions/validateFormMail';
import { validateFormPass } from '../../validateFunctions/validateFormPass';
import { validateName } from '../../validateFunctions/validateName';
import { validateApellido } from '../../validateFunctions/validateApellido';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    apellido: '',
    telefono: '',
  });

  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [confPassError, setConfPassError] = useState('');
  const [nameError, setNameError] = useState('');
  const [apeError, setApeError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const { isValid: validEmail, emailError } = validateFormMail(
      formData.email
    );
    const { isValid: validPassword, passError } = validateFormPass(
      formData.password
    );

    setEmailError(validEmail ? '' : emailError);
    setPassError(validPassword ? '' : passError);
    if (
      (!validEmail || !validPassword) &&
      formData.password !== formData.confirmPassword
    )
      return;
    const { confirmPassword, ...userdata } = formData;

    console.log('Form submitted:', userdata);
    try {
      await axios.post('http://localhost:3000/api/usuario/register', userdata, {
        withCredentials: true,
      });
      navigate('/login');
    } catch (err: any) {
      console.error('Error registrando usuario:', err?.response || err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">Crear Cuenta</h1>
          <p className="signup-subtitle">Completa los datos para empezar</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">
                Nombre
              </label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className={`form-input ${
                    formData.nombre
                      ? nameError
                        ? 'input-error'
                        : 'input-success'
                      : ''
                  }`}
                  value={formData.nombre}
                  onChange={(e) => {
                    handleChange(e);
                    const val = e.target.value;
                    const { isValid, nameError } = validateName(val);
                    setNameError(isValid ? '' : nameError);
                  }}
                  required
                  placeholder="Ingresa tu nombre"
                />
              </div>
            </div>
            {nameError && <div className="name-text">{nameError}</div>}
          </div>

          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="apellido">
                Apellido
              </label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  className={`form-input ${
                    formData.apellido
                      ? apeError
                        ? 'input-error'
                        : 'input-success'
                      : ''
                  }`}
                  value={formData.apellido}
                  onChange={(e) => {
                    handleChange(e);
                    const val = e.target.value;
                    const { isValid, apeError } = validateApellido(val);
                    setApeError(isValid ? '' : apeError);
                  }}
                  required
                  placeholder="Ingresa tu apellido"
                />
              </div>
            </div>
            {apeError && <div className="ape-text">{apeError}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="telefono">
              Teléfono
            </label>
            <div className="input-wrapper">
              <svg
                className="input-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <input
                type="text"
                inputMode="numeric"
                id="telefono"
                name="telefono"
                className={`form-input ${
                  formData.telefono
                    ? telefonoError
                      ? 'input-error'
                      : 'input-success'
                    : ''
                }`}
                value={formData.telefono}
                onChange={(e) => {
                  // Permitimos solo dígitos, descartamos cualquier otro carácter
                  const raw = e.target.value;
                  const soloDigitos = raw.replace(/\D+/g, '');
                  setFormData((prev) => ({ ...prev, telefono: soloDigitos }));
                  // Validación básica: entre 7 y 15 dígitos
                  if (!soloDigitos) {
                    setTelefonoError('El teléfono es requerido');
                  } else if (soloDigitos.length < 7) {
                    setTelefonoError('Debe tener al menos 7 dígitos');
                  } else if (soloDigitos.length > 15) {
                    setTelefonoError('Máximo 15 dígitos');
                  } else {
                    setTelefonoError('');
                  }
                }}
                required
                placeholder="Ingresa tu teléfono"
              />
            </div>
            {telefonoError && <div className="error-text">{telefonoError}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="nombreUsuario">
              Nombre de Usuario
            </label>
            <div className="input-wrapper">
              <svg
                className="input-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <input
                type="text"
                id="nombreUsuario"
                name="nombreUsuario"
                className={`form-input ${
                  formData.nombreUsuario ? 'input-success' : ''
                }`}
                value={formData.nombreUsuario}
                onChange={handleChange}
                required
                placeholder="Ingresa tu nombre de usuario"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Correo Electrónico
            </label>
            <div>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <input
                  type="text"
                  id="email"
                  name="email"
                  className={`form-input ${
                    formData.email
                      ? emailError
                        ? 'input-error'
                        : 'input-success'
                      : ''
                  }`}
                  value={formData.email}
                  onChange={(e) => {
                    const val = e.target.value;
                    handleChange(e);
                    const { isValid, emailError } = validateFormMail(val);
                    setEmailError(isValid ? '' : emailError);
                  }}
                  required
                  placeholder="tu@email.com"
                />
              </div>
              {emailError && <div className="error-text">{emailError}</div>}
            </div>
          </div>

          <div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Contraseña
              </label>
              <div className="input-wrapper">
                <svg
                  className="input-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className={`form-input ${
                    formData.password
                      ? passError
                        ? 'input-error'
                        : 'input-success'
                      : ''
                  }`}
                  value={formData.password}
                  onChange={(e) => {
                    handleChange(e);
                    const val = e.target.value;
                    const { isValid, passError } = validateFormPass(val);
                    setPassError(isValid ? '' : passError);
                    if (formData.confirmPassword) {
                      setConfPassError(
                        e.target.value === formData.confirmPassword
                          ? ''
                          : 'Las contraseñas no coinciden'
                      );
                    }
                  }}
                  required
                  placeholder="Ingresa tu contraseña"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                  aria-label="Mostrar/Ocultar contraseña"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg
                      className="toggle-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="toggle-icon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {passError && <div className="error-text">{passError}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirmar Contraseña
            </label>
            <div className="input-wrapper">
              <svg
                className="input-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                className={`form-input ${
                  formData.confirmPassword
                    ? confPassError
                      ? 'input-error'
                      : 'input-success'
                    : ''
                }`}
                value={formData.confirmPassword}
                onChange={(e) => {
                  handleChange(e);
                  setConfPassError(
                    e.target.value === formData.password
                      ? ''
                      : 'Las contraseñas no coinciden'
                  );
                }}
                required
                placeholder="Confirma tu contraseña"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={toggleConfirmPasswordVisibility}
                aria-label="Mostrar/Ocultar confirmación de contraseña"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg
                    className="toggle-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                    />
                  </svg>
                ) : (
                  <svg
                    className="toggle-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {confPassError && <div className="error-text">{confPassError}</div>}
          </div>

          <button type="submit" className="submit-button">
            Crear Cuenta
          </button>
        </form>

        <div className="signup-footer">
          <p>
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="login-link">
              Iniciar Sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export { CreateUser };
