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
        passError = 'Debe incluir al menos una mayúscula y un número ';
      }
    }

    return { isValid, passError };
  };

export {validateFormPass};