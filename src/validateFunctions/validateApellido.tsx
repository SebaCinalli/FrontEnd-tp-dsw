const validateApellido = (ape: string) =>{
    let isValid = true;
    let apeError = '';
    if(ape.trim() === ''){
        isValid = false
        apeError = 'el apellido es obligatorio'
    }

    return {isValid,apeError}
}

export {validateApellido}