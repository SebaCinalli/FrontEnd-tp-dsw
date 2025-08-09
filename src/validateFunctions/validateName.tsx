const validateName = (name: string) =>{
    let isValid = true;
    let nameError = '';
    if(name.trim() === ''){
        isValid = false
        nameError = 'el nombre es obligatorio'
    }

    return {isValid, nameError}
}

export {validateName}