import { useUser } from "../../context/usercontext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./login.css";

const Login = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [email, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");
  const [authError, setAuthError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid: validEmail, emailError } = validateFormMail(email);
    const { isValid: validPassword, passError } = validateFormPass(password);

    setEmailError(validEmail ? "" : emailError);
    setPassError(validPassword ? "" : passError);

    if (validEmail && validPassword) {
      if (email === "abc@gmail.com" && password === "Abc123#") {
        login(email);
        navigate("/");
      } else {
        setAuthError("Email o contraseña incorrectos");
      }
    }
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
      passError = "Debe tener más de 6 caracteres";
    } else {
      const tieneMayuscula = /[A-Z]/.test(password);
      const tieneNumero = /[0-9]/.test(password);
      const tieneEspecial = /[^A-Za-z0-9]/.test(password);

      if (!tieneMayuscula || !tieneNumero || !tieneEspecial) {
        isValid = false;
        passError = "Debe incluir mayúscula, número y caracter especial";
      }
    }

    return { isValid, passError };
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
            onChange={(e) => setMail(e.target.value)}
            placeholder="Ingrese su correo"
          />
          {emailError && <div className="error-text">{emailError}</div>}

          <label htmlFor="clave">Contraseña</label>
          <input
            type="password"
            id="clave"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese su contraseña"
          />
          {passError && <div className="error-text">{passError}</div>}
          {authError && <div className="error-text">{authError}</div>}

          <button type="submit">Ingresar</button>
          <button
            type="button"
            className="create-user-button"
            onClick={() => navigate("/signup")}
          >
            Crear usuario
          </button>
        </form>
      </div>
    </div>
  );
};

export { Login };
