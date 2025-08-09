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
}

export {validateFormMail};