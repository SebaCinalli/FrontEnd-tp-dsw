import { useState } from "react";
import "./login.css";

type LoginProps = {
  OnLogin: (mail: string, password: string) => void;
  authError ?: string
  OnCreateUser ?: () => void
};

const Login = ({ OnLogin, authError, OnCreateUser }: LoginProps) => {
  const [email, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");

  const handleChangeMail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMail(value);
    const { isValid, emailError } = validateFormMail(value);
    setEmailError(isValid ? "" : emailError);
  };

  const handleChangePass = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    const { isValid, passError } = validateFormPass(value);
    setPassError(isValid ? "" : passError);
  };

const validateFormMail = (email: string) => {
  let isValid = true;
  let emailError = "";

  if (email.trim() === "") {
    isValid = false;
    emailError = "El email es obligatorio";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    isValid = false;
    emailError = "El email no es válido";
  }

  return { isValid, emailError };
};

const validateFormPass = (password: string) => {
  let isValid = true;
  let passError = "";

  if (password.trim() === "") {
    isValid = false;
    passError = "La contraseña es obligatoria";
  } else if (password.length < 6) {
    isValid = false;
    passError = "La contraseña debe tener más de 6 caracteres";
  } else {
    const tieneMayuscula = /[A-Z]/.test(password);
    const tieneNumero = /[0-9]/.test(password);
    const tieneEspecial = /[^A-Za-z0-9]/.test(password);

    if (!tieneMayuscula || !tieneNumero || !tieneEspecial) {
      isValid = false;
      passError = "Debe incluir al menos una mayúscula, número y caracter especial";
    }
  }

  return { isValid, passError };
};

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid: validEmail, emailError } = validateFormMail(email);
    const { isValid: validPassword, passError } = validateFormPass(password);

    setEmailError(validEmail ? "" : emailError);
    setPassError(validPassword ? "" : passError);

    if (validEmail && validPassword) {
      OnLogin(email, password);
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
            onChange={handleChangeMail}
            className=""
            placeholder="Ingrese su correo"
          />
          {emailError && <div className="error-text">{emailError}</div>}


          <label htmlFor="clave">Contraseña</label>
          <input
            type="password"
            id="clave"
            value={password}
            onChange={handleChangePass}
            className=""
            placeholder="Ingrese su contraseña"
          />
          {passError && <div className="error-text">{passError}</div>}
          { authError &&
          <div className="error-text">{authError}</div>  
          }
          <button type="submit">Ingresar</button>
          <button className="create-user-button" onClick={OnCreateUser}>Crear usuario</button>
        </form> 
      </div>
    </div>
  );
};

export { Login };
