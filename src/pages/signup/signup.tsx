import React, { useState } from 'react';

interface CreateUserProps {
  onReturnToLogin: () => void;
  onUserCreated?: (userData: { username: string; email: string }) => void;
}

export const CreateUser: React.FC<CreateUserProps> = ({
  onReturnToLogin,
  onUserCreated,
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'username':
        return value.trim().length === 0
          ? 'El nombre de usuario es requerido'
          : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Ingresa un correo válido' : '';
      case 'password':
        return value.length < 8
          ? 'La contraseña debe tener al menos 8 caracteres'
          : '';
      case 'confirmPassword':
        return value !== formData.password
          ? 'Las contraseñas no coinciden'
          : '';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validar en tiempo real
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos los campos
    const newErrors = {
      username: validateField('username', formData.username),
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
      confirmPassword: validateField(
        'confirmPassword',
        formData.confirmPassword
      ),
    };

    setErrors(newErrors);

    // Verificar si hay errores
    const hasErrors = Object.values(newErrors).some((error) => error !== '');
    if (hasErrors) return;

    setIsSubmitting(true);

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Notificar éxito
      if (onUserCreated) {
        onUserCreated({
          username: formData.username,
          email: formData.email,
        });
      }

      // Mostrar éxito por un momento antes de redirigir
      setTimeout(() => {
        onReturnToLogin();
      }, 2000);
    } catch (error) {
      console.error('Error al crear usuario:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (fieldName: string) => {
    let className = 'input-group';
    if (errors[fieldName]) className += ' error';
    if (formData[fieldName].length > 0 && !errors[fieldName])
      className += ' success';
    return className;
  };

  return (
    <div
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        background: 'linear-gradient(135deg, #667eea 50%, #764ba2 100%)',
        // minHeight: '100vh',
        display: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0rem',
      }}
    >
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: '2.5rem',
          borderRadius: '20px',
          color: '#333',
          width: '100%',
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow:
            '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          animation: 'slideIn 0.6s ease-out',
        }}
      >
        <div
          style={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '2px',
            background:
              'linear-gradient(90deg, transparent, #1e90ff, transparent)',
            animation: 'loading 2s infinite',
          }}
        />

        <h2
          style={{
            textAlign: 'center',
            marginBottom: '1rem',
            fontSize: '2rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #1e90ff, #9345e2ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Crear Cuenta
        </h2>

        <p
          style={{
            textAlign: 'center',
            color: '#111',
            marginBottom: '1.5rem',
            fontSize: '1rem',
          }}
        >
          Completa los datos para empezar
        </p>

        <div
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div className={getInputClassName('username')}>
            <label
              htmlFor="username"
              style={{
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#333',
                fontSize: '1rem',
                display: 'block',
              }}
            >
              Nombre de Usuario
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                style={{
                  padding: '1rem 3rem 1rem 1rem',
                  border: `2px solid ${
                    errors.username
                      ? '#ff0019ff'
                      : formData.username.length > 0 && !errors.username
                      ? '#28a745'
                      : '#a5a5a5ff'
                  }`,
                  borderRadius: '12px',
                  backgroundColor: errors.username
                    ? '#fff5f5'
                    : formData.username.length > 0 && !errors.username
                    ? '#f8fff8'
                    : '#f8f9fa',
                  color: '#333',
                  fontSize: '1rem',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1e90ff';
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(30, 144, 255, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.username
                    ? '#dc3545'
                    : formData.username.length > 0 && !errors.username
                    ? '#28a745'
                    : '#d1d1d1ff';
                  e.target.style.backgroundColor = errors.username
                    ? '#fff5f5'
                    : formData.username.length > 0 && !errors.username
                    ? '#f8fff8'
                    : '#f8f9fa';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                  fontSize: '1.1rem',
                }}
              >
                👤
              </span>
            </div>
            {errors.username && (
              <div
                style={{
                  color: '#dc3545',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                }}
              >
                {errors.username}
              </div>
            )}
          </div>

          <div className={getInputClassName('email')}>
            <label
              htmlFor="email"
              style={{
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#555',
                fontSize: '0.9rem',
                display: 'block',
              }}
            >
              Correo Electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                style={{
                  padding: '1rem 3rem 1rem 1rem',
                  border: `2px solid ${
                    errors.email
                      ? '#dc3545'
                      : formData.email.length > 0 && !errors.email
                      ? '#28a745'
                      : '#a5a5a5ff'
                  }`,
                  borderRadius: '12px',
                  backgroundColor: errors.email
                    ? '#fff5f5'
                    : formData.email.length > 0 && !errors.email
                    ? '#f8fff8'
                    : '#f8f9fa',
                  color: '#333',
                  fontSize: '1rem',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1e90ff';
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(30, 144, 255, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.email
                    ? '#dc3545'
                    : formData.email.length > 0 && !errors.email
                    ? '#28a745'
                    : '#a5a5a5ff';
                  e.target.style.backgroundColor = errors.email
                    ? '#fff5f5'
                    : formData.email.length > 0 && !errors.email
                    ? '#f8fff8'
                    : '#f8f9fa';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                  fontSize: '1.1rem',
                }}
              >
                📧
              </span>
            </div>
            {errors.email && (
              <div
                style={{
                  color: '#dc3545',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                }}
              >
                {errors.email}
              </div>
            )}
          </div>

          <div className={getInputClassName('password')}>
            <label
              htmlFor="password"
              style={{
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#555',
                fontSize: '0.9rem',
                display: 'block',
              }}
            >
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                style={{
                  padding: '1rem 3rem 1rem 1rem',
                  border: `2px solid ${
                    errors.password
                      ? '#dc3545'
                      : formData.password.length > 0 && !errors.password
                      ? '#28a745'
                      : '#a5a5a5ff'
                  }`,
                  borderRadius: '12px',
                  backgroundColor: errors.password
                    ? '#fff5f5'
                    : formData.password.length > 0 && !errors.password
                    ? '#f8fff8'
                    : '#f8f9fa',
                  color: '#333',
                  fontSize: '1rem',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1e90ff';
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(30, 144, 255, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.password
                    ? '#dc3545'
                    : formData.password.length > 0 && !errors.password
                    ? '#28a745'
                    : '#a5a5a5ff';
                  e.target.style.backgroundColor = errors.password
                    ? '#fff5f5'
                    : formData.password.length > 0 && !errors.password
                    ? '#f8fff8'
                    : '#f8f9fa';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                  fontSize: '1.1rem',
                }}
              >
                🔒
              </span>
            </div>
            {errors.password && (
              <div
                style={{
                  color: '#dc3545',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                }}
              >
                {errors.password}
              </div>
            )}
          </div>

          <div className={getInputClassName('confirmPassword')}>
            <label
              htmlFor="confirmPassword"
              style={{
                fontWeight: '600',
                marginBottom: '0.5rem',
                color: '#555',
                fontSize: '0.9rem',
                display: 'block',
              }}
            >
              Confirmar Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                style={{
                  padding: '1rem 3rem 1rem 1rem',
                  border: `2px solid ${
                    errors.confirmPassword
                      ? '#dc3545'
                      : formData.confirmPassword.length > 0 &&
                        !errors.confirmPassword
                      ? '#28a745'
                      : '#a5a5a5ff'
                  }`,
                  borderRadius: '12px',
                  backgroundColor: errors.confirmPassword
                    ? '#fff5f5'
                    : formData.confirmPassword.length > 0 &&
                      !errors.confirmPassword
                    ? '#f8fff8'
                    : '#f8f9fa',
                  color: '#333',
                  fontSize: '1rem',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1e90ff';
                  e.target.style.backgroundColor = '#fff';
                  e.target.style.boxShadow =
                    '0 0 0 3px rgba(30, 144, 255, 0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.confirmPassword
                    ? '#dc3545'
                    : formData.confirmPassword.length > 0 &&
                      !errors.confirmPassword
                    ? '#28a745'
                    : '#a5a5a5ff';
                  e.target.style.backgroundColor = errors.confirmPassword
                    ? '#fff5f5'
                    : formData.confirmPassword.length > 0 &&
                      !errors.confirmPassword
                    ? '#f8fff8'
                    : '#f8f9fa';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                  fontSize: '1.1rem',
                }}
              >
                🔒
              </span>
            </div>
            {errors.confirmPassword && (
              <div
                style={{
                  color: '#dc3545',
                  fontSize: '0.8rem',
                  marginTop: '0.5rem',
                }}
              >
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              marginTop: '1rem',
            }}
          >
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: '1rem',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                width: '100%',
                transition: 'all 0.3s ease',
                background: 'linear-gradient(135deg, #1e90ff, #1c7ed6)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(30, 144, 255, 0.3)',
                opacity: isSubmitting ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow =
                    '0 6px 20px rgba(30, 144, 255, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow =
                    '0 4px 15px rgba(30, 144, 255, 0.3)';
                }
              }}
            >
              {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>

            <div
              style={{
                textAlign: 'center',
                margin: '1rem 0',
                position: 'relative',
                color: '#999',
                fontSize: '0.9rem',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background:
                    'linear-gradient(90deg, transparent, #ddd, transparent)',
                }}
              />
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '0 1rem',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                o
              </span>
            </div>

            <button
              type="button"
              onClick={onReturnToLogin}
              style={{
                padding: '1rem',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1rem',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.3s ease',
                background: 'linear-gradient(135deg, #28a745, #20c997)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
              }}
            >
              Volver al Login
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loading {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }

        @media (max-width: 480px) {
          .container-createUser-form {
            padding: 2rem 1.5rem !important;
            margin: 1rem !important;
          }

          .container-createUser-form h2 {
            font-size: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};
